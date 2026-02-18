import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface PromptVersion {
  id: string;
  timestamp: number;
  systemPrompt: string;
  label?: string;
}

export interface RunHistoryItem {
  id: string;
  timestamp: number;
  systemPrompt: string;
  model: string;
  output?: string;
  reasoning?: string;
  tokenUsage?: {
    prompt: number;
    response: number;
    total: number;
  };
}

export type ContextViewMode = 'stack' | 'json' | 'token_map';

export type GeminiModel = 
  | 'gemini-3-flash-preview'
  | 'gemini-3-pro-preview'
  | 'gemini-2.5-flash-lite-latest'
  | 'gemini-2.5-flash-image'
  | 'gemini-3-pro-image-preview';

export interface ModelConfig {
  temperature: number;
  topK: number;
  topP: number;
  thinkingLevel?: 'LOW' | 'HIGH'; // Only for Gemini 3
  tools: {
    googleSearch: boolean;
    codeExecution: boolean;
  };
}

interface AppState {
  // Core Data
  systemPrompt: string;
  promptVersions: PromptVersion[];
  runHistory: RunHistoryItem[];
  apiKey: string;
  
  // Configuration
  selectedModel: GeminiModel;
  modelConfig: ModelConfig;
  
  // Execution State
  isGenerating: boolean;
  currentOutput: string;
  currentReasoning: string;
  currentUsage: { prompt: number; response: number; total: number } | null;
  
  // Settings
  contextViewMode: ContextViewMode;
  
  // Actions
  setSystemPrompt: (prompt: string) => void;
  savePromptVersion: (label?: string) => void;
  addToHistory: (item: Omit<RunHistoryItem, 'id' | 'timestamp'>) => void;
  loadVersion: (versionId: string) => void;
  loadFromHistory: (historyId: string) => void;
  
  setApiKey: (key: string) => void;
  setSelectedModel: (model: GeminiModel) => void;
  setModelConfig: (config: Partial<ModelConfig>) => void;
  
  setContextViewMode: (mode: ContextViewMode) => void;
  
  // Execution Actions
  setIsGenerating: (isGenerating: boolean) => void;
  setCurrentOutput: (output: string) => void;
  setCurrentReasoning: (reasoning: string) => void;
  setCurrentUsage: (usage: { prompt: number; response: number; total: number } | null) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      systemPrompt: 'You are a helpful AI assistant.',
      promptVersions: [],
      runHistory: [],
      apiKey: '',
      
      selectedModel: 'gemini-3-flash-preview',
      modelConfig: {
        temperature: 0.7,
        topK: 64,
        topP: 0.95,
        tools: {
          googleSearch: false,
          codeExecution: false,
        },
      },
      
      isGenerating: false,
      currentOutput: '',
      currentReasoning: '',
      currentUsage: null,
      
      contextViewMode: 'stack',

      setSystemPrompt: (prompt) => set({ systemPrompt: prompt }),

      savePromptVersion: (label) => {
        const { systemPrompt, promptVersions } = get();
        const newVersion: PromptVersion = {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          systemPrompt,
          label: label || `Version ${promptVersions.length + 1}`,
        };
        set({ promptVersions: [newVersion, ...promptVersions] });
      },
      
      addToHistory: (item) => {
        const { runHistory } = get();
        const newItem: RunHistoryItem = {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          ...item,
        };
        set({ runHistory: [newItem, ...runHistory] });
      },

      setApiKey: (key) => set({ apiKey: key }),
      
      setSelectedModel: (model) => set({ selectedModel: model }),
      
      setModelConfig: (config) => set((state) => ({
        modelConfig: { ...state.modelConfig, ...config }
      })),

      setContextViewMode: (mode) => set({ contextViewMode: mode }),

      loadVersion: (versionId) => {
        const { promptVersions } = get();
        const version = promptVersions.find((v) => v.id === versionId);
        if (version) {
          set({ systemPrompt: version.systemPrompt });
        }
      },
      
      loadFromHistory: (historyId) => {
        const { runHistory } = get();
        const item = runHistory.find((h) => h.id === historyId);
        if (item) {
          set({ systemPrompt: item.systemPrompt });
        }
      },
      
      setIsGenerating: (isGenerating) => set({ isGenerating }),
      setCurrentOutput: (output) => set({ currentOutput: output }),
      setCurrentReasoning: (reasoning) => set({ currentReasoning: reasoning }),
      setCurrentUsage: (usage) => set({ currentUsage: usage }),
    }),
    {
      name: 'prompt-ide-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        systemPrompt: state.systemPrompt,
        promptVersions: state.promptVersions,
        runHistory: state.runHistory,
        apiKey: state.apiKey,
        selectedModel: state.selectedModel,
        modelConfig: state.modelConfig,
        contextViewMode: state.contextViewMode,
      }),
    }
  )
);
