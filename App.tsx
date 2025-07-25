
import React, { useState, useCallback, useEffect } from 'react';
import { ChatWindow } from './components/ChatWindow';
import { ImageUploader } from './components/ImageUploader';
import { Header } from './components/Header';
import { analyzeFruitImage, generateChatResponse } from './services/geminiService';
import type { ChatMessage, AnalysisResult } from './types';
import { Sender } from './types';

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const addMessage = (message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  };

  const handleSendMessage = useCallback(async (text: string, file?: File) => {
    setError(null);

    if (!text.trim() && !file) {
      return; // Do nothing if there is no text and no file
    }
    
    setIsLoading(true);

    if (file) {
      // Image analysis flow
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        if (!dataUrl) {
            setError('Gagal membaca file gambar.');
            setIsLoading(false);
            return;
        }

        const userMessage: ChatMessage = {
          id: Date.now(),
          sender: Sender.USER,
          image: dataUrl,
          text: text,
        };
        addMessage(userMessage);

        const botMessageId = Date.now() + 1;
        const placeholderMessage: ChatMessage = { id: botMessageId, sender: Sender.MODEL, isLoading: true };
        addMessage(placeholderMessage);
        
        try {
            const base64Image = dataUrl.split(',')[1];
            if (!base64Image) throw new Error('Data gambar tidak valid.');

            const analysis: AnalysisResult = await analyzeFruitImage(base64Image, text);
            const botResponse: ChatMessage = { id: botMessageId, sender: Sender.MODEL, analysis };
            setMessages(prev => prev.map(msg => msg.id === botMessageId ? botResponse : msg));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan yang tidak diketahui.';
            const errorResponse: ChatMessage = { id: botMessageId, sender: Sender.MODEL, error: errorMessage };
            setMessages(prev => prev.map(msg => msg.id === botMessageId ? errorResponse : msg));
        } finally {
            setIsLoading(false);
        }
      };
      reader.onerror = () => {
          setError('Gagal membaca file gambar.');
          setIsLoading(false);
      }
      reader.readAsDataURL(file);

    } else if (text.trim()) {
      // Text-only chat flow
      const userMessage: ChatMessage = { id: Date.now(), sender: Sender.USER, text };
      const historyForAPI = [...messages];
      addMessage(userMessage);
      
      const botMessageId = Date.now() + 1;
      const placeholderMessage: ChatMessage = { id: botMessageId, sender: Sender.MODEL, isLoading: true };
      addMessage(placeholderMessage);

      try {
        const responseText = await generateChatResponse(historyForAPI, text);
        const botResponse: ChatMessage = { id: botMessageId, sender: Sender.MODEL, text: responseText };
        setMessages(prev => prev.map(msg => msg.id === botMessageId ? botResponse : msg));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan yang tidak diketahui.';
        const errorResponse: ChatMessage = { id: botMessageId, sender: Sender.MODEL, error: errorMessage };
        setMessages(prev => prev.map(msg => msg.id === botMessageId ? errorResponse : msg));
      } finally {
        setIsLoading(false);
      }
    } else {
        setIsLoading(false); // Should not happen due to the initial check, but as a safeguard.
    }
  }, [messages]);

  useEffect(() => {
     if (messages.length === 0) {
        const welcomeMessage: ChatMessage = {
            id: Date.now(),
            sender: Sender.MODEL,
            text: 'Selamat datang! Unggah gambar Tandan Buah Segar (TBS) kelapa sawit untuk dianalisis, atau ajukan pertanyaan seputar budidaya kelapa sawit.',
        };
        setMessages([welcomeMessage]);
     }
  }, [messages.length]);

  return (
    <div className="flex flex-col h-screen font-sans bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      <Header />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto h-full">
            <ChatWindow messages={messages} />
        </div>
      </main>
      <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4 shrink-0">
        <div className="max-w-4xl mx-auto">
          {error && <p className="text-red-500 text-sm text-center mb-2">{error}</p>}
          <ImageUploader onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </footer>
    </div>
  );
};

export default App;
