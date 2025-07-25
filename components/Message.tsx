
import React from 'react';
import type { ChatMessage } from '../types';
import { Sender } from '../types';
import { AnalysisResultCard } from './AnalysisResultCard';
import { LeafIcon, UserIcon, LoadingSpinner } from './icons';

interface MessageProps {
  message: ChatMessage;
}

export const Message: React.FC<MessageProps> = ({ message }) => {
  const isUserModel = message.sender === Sender.MODEL;

  return (
    <div className={`flex items-start gap-4 ${!isUserModel ? 'justify-end' : ''}`}>
      {isUserModel && (
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-500 flex items-center justify-center text-white">
          <LeafIcon className="h-6 w-6" />
        </div>
      )}

      <div className={`max-w-xl w-full ${!isUserModel ? 'order-1' : 'order-2'}`}>
        <div className={`rounded-xl p-4 ${isUserModel ? 'bg-white dark:bg-slate-800' : 'bg-blue-500 text-white'}`}>
          {message.isLoading && (
            <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
                <LoadingSpinner className="h-5 w-5 animate-spin" />
                <span>Menganalisis TBS...</span>
            </div>
          )}
          {message.text && <p className="whitespace-pre-wrap">{message.text}</p>}
          {message.image && (
            <img 
              src={message.image} 
              alt="Unggahan pengguna" 
              className={`rounded-lg max-w-xs max-h-80 object-cover ${message.text ? 'mt-3' : ''}`}
            />
          )}
          {message.analysis && <AnalysisResultCard result={message.analysis} />}
          {message.error && (
            <div className="text-red-400">
                <p className="font-bold">Oops! Terjadi kesalahan.</p>
                <p className="text-sm">{message.error}</p>
            </div>
          )}
        </div>
      </div>

      {!isUserModel && (
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center order-2">
          <UserIcon className="h-6 w-6 text-slate-500 dark:text-slate-400" />
        </div>
      )}
    </div>
  );
};
