import logger from '../config/logger.js';

// Initialize the Google Gemini API client
// Note: In newer versions of the SDK, GoogleGenAI is sometimes initialized via:
// import { GoogleGenAI } from "@google/generative-ai"; -> GoogleGenAI is actually instantiated with an object, or we can use:
// import { GoogleGenerativeAI } from "@google/generative-ai";
// Let's use GoogleGenerativeAI since it is the most standard, stable, and widely supported export.
import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI;

const initGemini = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    logger.warn('GEMINI_API_KEY environment variable is missing. AI chat will return fallback answers.');
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

export const generateAIResponse = async (prompt, chatHistory = [], fileData = null) => {
  try {
    if (!genAI) {
      genAI = initGemini();
    }

    if (!genAI) {
      throw new Error('Google Gemini API Key is not configured. Please add GEMINI_API_KEY to your backend .env file.');
    }

    // Default model is gemini-1.5-flash which is fast and supports multi-modal context
    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: 'You are AI Chat Assistant, a production-grade, highly intelligent, helpful AI assistant built to answer code, analysis, writing, and general prompts. Be thorough, clear, and make sure code blocks are beautifully written in standard Markdown.'
    });

    // Format chat history into Gemini format
    // Gemini formats history as: { role: 'user' | 'model', parts: [{ text: '...' }] }
    // Note that our backend schema uses 'assistant', but Gemini expects 'model'
    const formattedHistory = chatHistory.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // If there is file attachment data (e.g. an image base64), pass it in the prompt
    let promptParts = [];

    // Add previous message logs if there's any history to build multi-turn session
    // Gemini SDK has a startChat() function which can take history, or we can just send everything in one call.
    // startChat is very clean. Let's use startChat.
    const chat = model.startChat({
      history: formattedHistory
    });

    if (fileData) {
      // If it's an image, pass it as inlineData
      if (fileData.mimeType.startsWith('image/')) {
        const imagePart = {
          inlineData: {
            data: fileData.base64,
            mimeType: fileData.mimeType
          }
        };
        promptParts.push(imagePart);
      }
      
      // If it's a PDF or text file, we append file contents to prompt directly
      if (fileData.text) {
        promptParts.push({ text: `[Attached File: ${fileData.name}]\nContent:\n${fileData.text}\n\n` });
      }
    }

    promptParts.push({ text: prompt });

    logger.info(`Sending prompt request to Gemini: ${prompt.slice(0, 60)}...`);
    const result = await chat.sendMessage(promptParts);
    const response = await result.response;
    const text = response.text();
    
    return text;
  } catch (error) {
    logger.error('Gemini API Integration Error: %O', error);
    throw error;
  }
};
