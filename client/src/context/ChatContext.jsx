import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from './AuthContext';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState(['General', 'Work', 'Personal', 'Code', 'Ideas']);

  // Fetch all chats for user
  const fetchHistory = async (filters = {}) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.category && filters.category !== 'All') params.category = filters.category;
      if (filters.isFavorite) params.isFavorite = 'true';
      if (filters.isPinned) params.isPinned = 'true';

      const response = await api.get('/chat/history', { params });
      if (response.data.success) {
        setConversations(response.data.conversations);
      }
    } catch (err) {
      console.error('Error fetching chat history', err);
      setError(err.response?.data?.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  // Load chat history when user changes
  useEffect(() => {
    if (user) {
      fetchHistory();
      fetchStats();
    } else {
      setConversations([]);
      setCurrentConversation(null);
      setMessages([]);
      setStats(null);
    }
  }, [user]);

  // Select and load a conversation
  const selectConversation = async (id) => {
    if (!id) {
      setCurrentConversation(null);
      setMessages([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/chat/${id}`);
      if (response.data.success) {
        setCurrentConversation(response.data.conversation);
        setMessages(response.data.messages);
      }
    } catch (err) {
      console.error('Error loading conversation details', err);
      setError(err.response?.data?.message || 'Failed to load chat details');
    } finally {
      setLoading(false);
    }
  };

  // Clear current chat to start a fresh prompt
  const startNewChat = () => {
    setCurrentConversation(null);
    setMessages([]);
    setError(null);
  };

  // Send a user prompt to AI
  const sendMessage = async (content, file = null) => {
    setSending(true);
    setError(null);

    // Optimistic User Message creation for instant feedback (if no file is uploaded)
    // Files are large and require upload progress, so we wait or show placeholder
    let tempUserMsg = null;
    if (content && !file) {
      tempUserMsg = {
        _id: `temp-${Date.now()}`,
        role: 'user',
        content,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, tempUserMsg]);
    }

    try {
      let response;
      if (file) {
        // Send via multipart form data for file attachment
        const formData = new FormData();
        formData.append('content', content || '');
        formData.append('file', file);
        if (currentConversation?._id) {
          formData.append('conversationId', currentConversation._id);
        }

        response = await api.post('/chat', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        // Simple JSON request
        response = await api.post('/chat', {
          content,
          conversationId: currentConversation?._id
        });
      }

      if (response.data.success) {
        const { conversationId, userMessage, assistantMessage } = response.data;

        // If it's a brand new chat, fetch history and set current
        if (!currentConversation) {
          await fetchHistory();
          // Load the freshly created conversation
          await selectConversation(conversationId);
        } else {
          // If we had optimistic message, replace it, otherwise append.
          setMessages(prev => {
            const filtered = prev.filter(m => !m._id.toString().startsWith('temp-'));
            return [...filtered, userMessage, assistantMessage];
          });
          // Update conversation list updated timestamp
          setConversations(prev => 
            prev.map(c => c._id === conversationId ? { ...c, updatedAt: new Date().toISOString() } : c)
              .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0) || new Date(b.updatedAt) - new Date(a.updatedAt))
          );
        }
        // Refresh statistics
        fetchStats();
      }
    } catch (err) {
      console.error('Error sending message', err);
      // Remove optimistic message if sending failed
      if (tempUserMsg) {
        setMessages(prev => prev.filter(m => m._id !== tempUserMsg._id));
      }
      setError(err.response?.data?.message || 'Failed to reach AI assistant. Please check your network.');
    } finally {
      setSending(false);
    }
  };

  // Update conversation properties
  const updateConversationState = async (id, fields) => {
    try {
      const response = await api.put(`/chat/${id}`, fields);
      if (response.data.success) {
        const updated = response.data.conversation;
        
        // Update local conversation list
        setConversations(prev => 
          prev.map(c => c._id === id ? updated : c)
            .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0) || new Date(b.updatedAt) - new Date(a.updatedAt))
        );

        // Update active selection if applicable
        if (currentConversation?._id === id) {
          setCurrentConversation(prev => ({ ...prev, ...updated }));
        }

        fetchStats();
      }
    } catch (err) {
      console.error('Error updating conversation', err);
      setError('Failed to update conversation settings');
    }
  };

  // Delete a conversation
  const deleteConversationState = async (id) => {
    try {
      const response = await api.delete(`/chat/${id}`);
      if (response.data.success) {
        setConversations(prev => prev.filter(c => c._id !== id));
        if (currentConversation?._id === id) {
          startNewChat();
        }
        fetchStats();
      }
    } catch (err) {
      console.error('Error deleting conversation', err);
      setError('Failed to delete conversation');
    }
  };

  // Generate Image
  const generateAIImage = async (prompt) => {
    if (!currentConversation?._id) {
      setError('Please start a chat or send a message first before generating an image in context.');
      return;
    }

    setSending(true);
    setError(null);

    // Save prompt message in UI
    const userMsg = await api.post('/chat', {
      content: `Generate an image: ${prompt}`,
      conversationId: currentConversation._id
    });

    if (userMsg.data.success) {
      setMessages(prev => [...prev, userMsg.data.userMessage]);
    }

    try {
      const response = await api.post('/image/generate', { prompt });
      if (response.data.success) {
        // Image url received!
        // We will append a message from Assistant containing a markdown image tag.
        const markdownImage = `Here is your generated image for prompt: **"${prompt}"**\n\n![Generated Image](${response.data.url})\n\n*(Powered by ${response.data.provider})*`;
        
        const assistantMsg = await api.post('/chat', {
          content: markdownImage,
          conversationId: currentConversation._id
        });

        if (assistantMsg.data.success) {
          setMessages(prev => [...prev, assistantMsg.data.assistantMessage]);
          // Refresh list sorting
          setConversations(prev => 
            prev.map(c => c._id === currentConversation._id ? { ...c, updatedAt: new Date().toISOString() } : c)
          );
        }
      }
    } catch (err) {
      console.error('Error generating image', err);
      setError(err.response?.data?.message || 'Failed to generate image.');
    } finally {
      setSending(false);
    }
  };

  // Fetch Stats dashboard
  const fetchStats = async () => {
    if (!user) return;
    try {
      const response = await api.get('/chat/stats');
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (err) {
      console.error('Error fetching statistics', err);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        currentConversation,
        messages,
        loading,
        sending,
        error,
        stats,
        categories,
        setCategories,
        fetchHistory,
        selectConversation,
        startNewChat,
        sendMessage,
        updateConversation: updateConversationState,
        deleteConversation: deleteConversationState,
        generateImage: generateAIImage,
        fetchStats
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
