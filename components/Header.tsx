
import React from 'react';
import { LeafIcon } from './icons';

export const Header: React.FC = () => {
  return (
    <header className="bg-white dark:bg-slate-800 shadow-md border-b border-slate-200 dark:border-slate-700">
      <div className="max-w-4xl mx-auto p-4 flex items-center space-x-4">
        <div className="text-green-500">
            <LeafIcon className="h-10 w-10"/>
        </div>
        <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">
            Analisis TBS Kelapa Sawit
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
            Asisten Cerdas untuk Budidaya Sawit
            </p>
        </div>
      </div>
    </header>
  );
};
