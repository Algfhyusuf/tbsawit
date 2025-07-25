
import React from 'react';
import type { AnalysisResult } from '../types';
import { CheckCircleIcon, ClockIcon, ExclamationTriangleIcon, ClipboardDocumentCheckIcon } from './icons';

interface AnalysisResultCardProps {
  result: AnalysisResult;
}

const InfoRow: React.FC<{ icon: React.ReactNode; title: string; content: string }> = ({ icon, title, content }) => (
    <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 text-slate-400 mt-1">{icon}</div>
        <div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-200">{title}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{content}</p>
        </div>
    </div>
);

export const AnalysisResultCard: React.FC<AnalysisResultCardProps> = ({ result }) => {
  // Check if the analysis is a rejection message
  const isRejection = result.quality?.includes('bukan Tandan Buah Segar');

  if (isRejection) {
    return (
       <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-500 rounded-r-lg">
         <div className="flex items-start space-x-3">
           <div className="flex-shrink-0 text-yellow-600 dark:text-yellow-400 mt-0.5">
             <ExclamationTriangleIcon className="h-6 w-6" />
           </div>
           <div>
             <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">Analisis Ditolak</h3>
             <p className="text-sm text-yellow-700 dark:text-yellow-300">{result.quality}</p>
           </div>
         </div>
       </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-800 dark:text-white">Hasil Analisis TBS</h2>
      
      <div className="p-3 bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 rounded-r-lg">
        <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 text-green-600 dark:text-green-400 mt-0.5">
                <ClipboardDocumentCheckIcon className="h-6 w-6" />
            </div>
            <div>
                <h3 className="font-semibold text-green-800 dark:text-green-200">Kesimpulan</h3>
                <p className="text-sm text-green-700 dark:text-green-300">{result.conclusion}</p>
            </div>
        </div>
      </div>
      
      <div className="space-y-4 pt-2">
        <InfoRow 
            icon={<CheckCircleIcon className="h-5 w-5 text-green-500" />}
            title="Kualitas TBS"
            content={result.quality}
        />
        <InfoRow 
            icon={<ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />}
            title="Potensi Busuk Tandan"
            content={result.rot_potential}
        />
        <InfoRow 
            icon={<ClockIcon className="h-5 w-5 text-blue-500" />}
            title="Kematangan & Waktu Panen"
            content={result.harvest_estimation}
        />
      </div>
    </div>
  );
};
