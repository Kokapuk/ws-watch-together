export interface Room {
  id: string;
  title: string;
  video: string;
}

export interface PlayerState {
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  currentTime: number;
  duration: number;
  isBuffering: boolean;
  isFullscreen: boolean;
}

export interface Toast {
  id: string;
  content: string;
}
