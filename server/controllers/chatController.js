import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import { generateAIResponse } from '../services/geminiService.js';
import pdfParse from 'pdf-parse';
import logger from '../config/logger.js';
import fs from 'fs';

// Helper to extract text from files
const extractTextFromFile = async (file) => {
  if (file.mimetype === 'application/pdf') {
    const dataBuffer = fs.readFileSync(file.path);
    const pdfData = await pdfParse(dataBuffer);
    return pdfData.text;
  } else if (file.mimetype.startsWith('text/')) {
    const fileContent = fs.readFileSync(file.path, 'utf-8');
    return fileContent;
  }
  return '';
};

// Helper to convert file to base64 for Gemini
const fileToBase64 = (filePath) => {
  const fileBuffer = fs.readFileSync(filePath);
  return fileBuffer.toString('base64');
};

// @desc    Initialize a new conversation
// @route   POST /api/chat/new
// @access  Private
export const createConversation = async (req, res, next) => {
  try {
    const { title, category } = req.body;
    const conversation = await Conversation.create({
      userId: req.user._id,
      title: title || 'New Chat',
      category: category || 'General'
    });

    res.status(201).json({
      success: true,
      conversation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send a message & generate AI response
// @route   POST /api/chat
// @access  Private
export const sendMessage = async (req, res, next) => {
  try {
    const { conversationId, content } = req.body;
    const file = req.file;

    if (!content && !file) {
      res.status(400);
      throw new Error('Please enter a prompt or attach a file');
    }

    let activeConversationId = conversationId;
    let conversation;

    // 1. Resolve or Create Conversation
    if (!activeConversationId) {
      const defaultTitle = content 
        ? content.split(' ').slice(0, 5).join(' ') + (content.split(' ').length > 5 ? '...' : '')
        : (file ? `File: ${file.originalname}` : 'New Chat');
        
      conversation = await Conversation.create({
        userId: req.user._id,
        title: defaultTitle,
        category: 'General'
      });
      activeConversationId = conversation._id;
    } else {
      conversation = await Conversation.findById(activeConversationId);
      if (!conversation) {
        res.status(404);
        throw new Error('Conversation not found');
      }
      
      // Update updatedAt timestamp of the conversation
      conversation.updatedAt = Date.now();
      await conversation.save();
    }

    // 2. Parse file attachments if present
    let fileInfo = null;
    if (file) {
      fileInfo = {
        name: file.originalname,
        mimeType: file.mimetype,
        path: `/uploads/${file.filename}` // Web URL path
      };

      if (file.mimetype.startsWith('image/')) {
        fileInfo.base64 = fileToBase64(file.path);
      } else {
        try {
          fileInfo.text = await extractTextFromFile(file);
        } catch (err) {
          logger.error('Failed to parse document text: %O', err);
          fileInfo.text = '[Failed to parse text from this document file]';
        }
      }
    }

    // 3. Save User Message
    const userMessage = await Message.create({
      conversationId: activeConversationId,
      role: 'user',
      content: content || `Uploaded file: ${file.originalname}`,
      fileUrl: fileInfo ? fileInfo.path : '',
      fileName: fileInfo ? fileInfo.name : '',
      fileType: fileInfo ? fileInfo.mimeType : ''
    });

    // 4. Retrieve message history (limit to last 20 messages for context efficiency)
    const dbHistory = await Message.find({ conversationId: activeConversationId })
      .sort({ timestamp: 1 })
      .limit(20);

    // Filter out the newly created message for historical query, only send messages before it
    const historyForAI = dbHistory.filter(msg => msg._id.toString() !== userMessage._id.toString());

    // 5. Query Gemini API
    let aiTextResponse;
    try {
      aiTextResponse = await generateAIResponse(
        content || `Process the attached document: ${file.originalname}`,
        historyForAI,
        fileInfo
      );
    } catch (apiError) {
      logger.error('API Error details: %O', apiError);
      // Delete user message if we fail? No, keep it, but throw error so frontend handles it.
      res.status(500);
      throw new Error(`AI Service Error: ${apiError.message}`);
    }

    // 6. Save Assistant Message
    const assistantMessage = await Message.create({
      conversationId: activeConversationId,
      role: 'assistant',
      content: aiTextResponse
    });

    // 7. Clean up local uploaded file (optional, but let's keep it so user can see/access files if static folder)
    // If we want to keep it, we don't delete. Let's keep files in `server/uploads` so they are fully viewable.

    res.status(200).json({
      success: true,
      conversationId: activeConversationId,
      userMessage,
      assistantMessage
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user conversation history list
// @route   GET /api/chat/history
// @access  Private
export const getHistory = async (req, res, next) => {
  try {
    const { search, category, isFavorite, isPinned } = req.query;
    
    // Base query filter
    const query = { userId: req.user._id };

    // Add optional query filters
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    if (category) {
      query.category = category;
    }
    if (isFavorite !== undefined) {
      query.isFavorite = isFavorite === 'true';
    }
    if (isPinned !== undefined) {
      query.isPinned = isPinned === 'true';
    }

    // Get conversations, sort by pinned first, then by updatedAt descending
    const conversations = await Conversation.find(query)
      .sort({ isPinned: -1, updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: conversations.length,
      conversations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get specific conversation details and messages
// @route   GET /api/chat/:id
// @access  Private
export const getConversation = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!conversation) {
      res.status(404);
      throw new Error('Conversation not found');
    }

    const messages = await Message.find({ conversationId: conversation._id })
      .sort({ timestamp: 1 });

    res.status(200).json({
      success: true,
      conversation,
      messages
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update conversation (rename, favorite, pin, category)
// @route   PUT /api/chat/:id
// @access  Private
export const updateConversation = async (req, res, next) => {
  try {
    const { title, category, isPinned, isFavorite } = req.body;
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!conversation) {
      res.status(404);
      throw new Error('Conversation not found');
    }

    if (title !== undefined) conversation.title = title;
    if (category !== undefined) conversation.category = category;
    if (isPinned !== undefined) conversation.isPinned = isPinned;
    if (isFavorite !== undefined) conversation.isFavorite = isFavorite;

    await conversation.save();

    res.status(200).json({
      success: true,
      conversation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a conversation
// @route   DELETE /api/chat/:id
// @access  Private
export const deleteConversation = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!conversation) {
      res.status(404);
      throw new Error('Conversation not found');
    }

    // Delete all messages associated with the conversation
    await Message.deleteMany({ conversationId: conversation._id });
    
    // Delete conversation
    await Conversation.deleteOne({ _id: conversation._id });

    res.status(200).json({
      success: true,
      message: 'Conversation and all messages deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user conversation statistics
// @route   GET /api/chat/stats
// @access  Private
export const getStats = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({ userId: req.user._id });
    const conversationIds = conversations.map(c => c._id);

    const totalConversations = conversations.length;
    const totalMessages = await Message.countDocuments({ conversationId: { $in: conversationIds } });
    const pinnedCount = conversations.filter(c => c.isPinned).length;
    const favoriteCount = conversations.filter(c => c.isFavorite).length;

    // Category breakdown
    const categoryBreakdown = {};
    conversations.forEach(c => {
      categoryBreakdown[c.category] = (categoryBreakdown[c.category] || 0) + 1;
    });

    // Message frequency stats (grouped by date)
    const messageStats = await Message.aggregate([
      { $match: { conversationId: { $in: conversationIds } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 7 } // Last 7 active days
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalConversations,
        totalMessages,
        pinnedCount,
        favoriteCount,
        categoryBreakdown,
        messageStats
      }
    });
  } catch (error) {
    next(error);
  }
};
