export type ViewState = 'upload' | 'analyzing' | 'result';

export interface AnalysisResult {
  verdict: 'human' | 'spoof';
  confidence: number;
  segments: any[];
  waveform_peaks: number[];
}

export interface HistoryItem {
  id: string;
  filename: string;
  timestamp: number;
  verdict: 'human' | 'spoof';
  confidence: number;
}
