import { create } from 'zustand';
import type { TraceSnapshot } from './types';

interface PlaybackState {
  isPlaying: boolean;
  speed: number;
  currentStep: number;
  totalSteps: number;
  naiveTraces: TraceSnapshot[];
  optimizedTraces: TraceSnapshot[];
  naiveTime: number;
  optimizedTime: number;
  algorithmId: string;
  sceneRunId: number;
  showHelp: boolean;
  helpAlgoId: string;

  setTraces: (naive: TraceSnapshot[], optimized: TraceSnapshot[], naiveTime: number, optimizedTime: number) => void;
  setPlaying: (playing: boolean) => void;
  setSpeed: (speed: number) => void;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
  setAlgorithmId: (id: string) => void;
  setShowHelp: (show: boolean, algoId?: string) => void;
}

export const usePlaybackStore = create<PlaybackState>((set, get) => ({
  isPlaying: false,
  speed: 1,
  currentStep: 0,
  totalSteps: 0,
  naiveTraces: [],
  optimizedTraces: [],
  naiveTime: 0,
  optimizedTime: 0,
  algorithmId: '',
  sceneRunId: 0,
  showHelp: false,
  helpAlgoId: '',

  setTraces: (naive, optimized, naiveTime, optimizedTime) => {
    const totalSteps = Math.max(naive.length, optimized.length);
    set({
      naiveTraces: naive,
      optimizedTraces: optimized,
      naiveTime,
      optimizedTime,
      totalSteps,
      currentStep: 0,
      isPlaying: false,
      sceneRunId: get().sceneRunId + 1,
    });
  },

  setPlaying: (playing) => set({ isPlaying: playing }),
  setSpeed: (speed) => set({ speed }),
  setStep: (step) => set({ currentStep: step, isPlaying: false }),

  nextStep: () => {
    const { currentStep, totalSteps } = get();
    if (currentStep < totalSteps - 1) {
      set({ currentStep: currentStep + 1 });
    } else {
      set({ isPlaying: false });
    }
  },

  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 0) {
      set({ currentStep: currentStep - 1, isPlaying: false });
    }
  },

  reset: () => set({
    isPlaying: false,
    currentStep: 0,
    naiveTraces: [],
    optimizedTraces: [],
    naiveTime: 0,
    optimizedTime: 0,
    totalSteps: 0,
  }),

  setAlgorithmId: (id) => set({ algorithmId: id }),
  setShowHelp: (show, algoId) => set({ showHelp: show, helpAlgoId: algoId ?? '' }),
}));
