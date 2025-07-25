export enum Sender {
  USER = 'user',
  MODEL = 'model',
}

export interface AnalysisResult {
  quality: string;
  rot_potential: string;
  harvest_estimation: string;
  conclusion: string;
}

export interface ChatMessage {
  id: number;
  sender: Sender;
  text?: string;
  image?: string;
  analysis?: AnalysisResult;
  isLoading?: boolean;
  error?: string;
}