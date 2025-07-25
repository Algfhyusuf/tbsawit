
import React, { useRef, useState } from 'react';
import { PaperclipIcon, SendIcon, LoadingSpinner } from './icons';

interface ChatInputProps {
  onSendMessage: (text: string, file?: File) => void;
  isLoading: boolean;
}

export const ImageUploader: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/')) {
        setError('Harap pilih file gambar yang valid.');
        setFile(null);
        return;
      }
      setError(null);
      setFile(selectedFile);
    }
    event.target.value = '';
  };
  
  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (isLoading || (!text.trim() && !file)) {
      return;
    }
    onSendMessage(text, file ?? undefined);
    setText('');
    setFile(null);
    setError(null);
  };

  const handleRemoveFile = () => {
    setFile(null);
  }

  return (
    <div className="flex flex-col items-center w-full">
        {file && (
            <div className="mb-2 px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-full flex items-center gap-2 animate-fade-in-fast">
                <span>{file.name}</span>
                <button onClick={handleRemoveFile} className="w-5 h-5 flex items-center justify-center rounded-full text-blue-600 dark:text-blue-300 hover:bg-black/10 dark:hover:bg-white/20" aria-label="Hapus file">&times;</button>
            </div>
        )}
        <form onSubmit={handleSubmit} className="w-full max-w-2xl flex items-center p-1.5 border border-slate-300 dark:border-slate-600 rounded-full bg-slate-50 dark:bg-slate-700 focus-within:ring-2 focus-within:ring-green-500 transition-shadow">
            <button
                type="button"
                onClick={handleAttachClick}
                disabled={isLoading}
                className="flex-shrink-0 p-2 text-slate-500 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 disabled:text-slate-400 disabled:cursor-not-allowed"
                aria-label="Lampirkan gambar"
            >
                <PaperclipIcon className="h-6 w-6" />
            </button>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
                disabled={isLoading}
            />
            <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Tanya tentang sawit atau unggah gambar TBS..."
                className="w-full px-2 py-2 text-base bg-transparent border-0 focus:outline-none focus:ring-0 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
                disabled={isLoading}
            />
            <button
                type="submit"
                disabled={isLoading || (!text.trim() && !file)}
                className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-green-600 text-white hover:bg-green-700 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                aria-label="Kirim pesan"
            >
                {isLoading ? <LoadingSpinner className="h-6 w-6 animate-spin" /> : <SendIcon className="h-6 w-6" />}
            </button>
        </form>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-2">
            AI dapat membuat kesalahan. Pertimbangkan untuk memeriksa informasi penting.
        </p>
    </div>
  );
};
