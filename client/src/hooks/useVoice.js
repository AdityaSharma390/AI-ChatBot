import { useState, useEffect, useRef } from 'react';

export const useVoice = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [browserSupportsSpeech, setBrowserSupportsSpeech] = useState(false);
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setBrowserSupportsSpeech(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
      };

      recognition.onerror = (event) => {
        console.error('Speech Recognition Error', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Start Listening
  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Failed to start speech recognition', err);
      }
    }
  };

  // Stop Listening
  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Text-To-Speech Playback
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      // Cancel ongoing synthesis
      window.speechSynthesis.cancel();
      
      // Clean up markdown syntax for cleaner audio reading
      const cleanText = text
        .replace(/[*#`_\-]/g, '') // remove markdown indicators
        .replace(/\[.*?\]\(.*?\)/g, '') // remove markdown links
        .slice(0, 500); // Limit to first 500 chars to avoid lengthy reads
        
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn('Browser does not support Speech Synthesis');
    }
  };

  // Cancel Speech Synthesis
  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  return {
    isListening,
    transcript,
    setTranscript,
    browserSupportsSpeech,
    startListening,
    stopListening,
    speakText,
    stopSpeaking
  };
};
