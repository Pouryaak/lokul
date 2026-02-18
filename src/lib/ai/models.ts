/**
 * Model configurations for Lokul AI chat
 *
 * Defines three model tiers:
 * - Quick Mode: Fast responses, small download (Phi-2 2.7B)
 * - Smart Mode: Balanced quality and speed (Llama 3.2 3B)
 * - Genius Mode: Highest quality, large download (Mistral 7B)
 */

/**
 * Configuration interface for AI models
 */
export interface ModelConfig {
  /** Unique model identifier */
  id: string;
  /** Display name for the model */
  name: string;
  /** Description of model capabilities */
  description: string;
  /** Approximate download size in MB */
  sizeMB: number;
  /** HuggingFace model ID or CDN URL */
  modelUrl: string;
  /** Required VRAM in MB */
  requiredVRAM: number;
}

/**
 * Quick Mode: Phi-2 2.7B
 * Fast responses, good for everyday chat
 * ~80MB download, minimal VRAM requirement
 */
export const QUICK_MODEL: ModelConfig = {
  id: "phi-2-q4f16_1-MLC",
  name: "Quick Mode",
  description: "Fast responses, good for everyday chat (Phi-2 2.7B)",
  sizeMB: 80,
  modelUrl: "https://huggingface.co/mlc-ai/phi-2-q4f16_1-MLC",
  requiredVRAM: 512,
};

/**
 * Smart Mode: Llama 3.2 3B
 * Balanced quality and speed
 * ~2.8GB download, moderate VRAM requirement
 */
export const SMART_MODEL: ModelConfig = {
  id: "Llama-3.2-3B-Instruct-q4f16_1-MLC",
  name: "Smart Mode",
  description: "Balanced quality and speed (Llama 3.2 3B)",
  sizeMB: 2800,
  modelUrl: "https://huggingface.co/mlc-ai/Llama-3.2-3B-Instruct-q4f16_1-MLC",
  requiredVRAM: 4096,
};

/**
 * Genius Mode: Mistral 7B
 * Highest quality responses
 * ~6.4GB download, high VRAM requirement
 */
export const GENIUS_MODEL: ModelConfig = {
  id: "Mistral-7B-Instruct-v0.3-q4f16_1-MLC",
  name: "Genius Mode",
  description: "Highest quality responses (Mistral 7B)",
  sizeMB: 6400,
  modelUrl: "https://huggingface.co/mlc-ai/Mistral-7B-Instruct-v0.3-q4f16_1-MLC",
  requiredVRAM: 8192,
};

/**
 * All available models in order of capability
 */
export const MODELS: ModelConfig[] = [QUICK_MODEL, SMART_MODEL, GENIUS_MODEL];

/**
 * Get a model configuration by its ID
 * @param id - The model identifier
 * @returns The model config or undefined if not found
 */
export function getModelById(id: string): ModelConfig | undefined {
  return MODELS.find((model) => model.id === id);
}

/**
 * Get the default model (Quick Mode for fast first load)
 * @returns The default model configuration
 */
export function getDefaultModel(): ModelConfig {
  return QUICK_MODEL;
}

/**
 * Get estimated download time in seconds based on connection speed
 * @param model - The model configuration
 * @param speedMbps - Estimated download speed in Mbps (default: 10)
 * @returns Estimated time in seconds
 */
export function getEstimatedDownloadTime(model: ModelConfig, speedMbps: number = 10): number {
  // Convert MB to Mb and divide by speed
  const sizeMb = model.sizeMB * 8;
  return Math.ceil(sizeMb / speedMbps);
}

/**
 * Format download time for display
 * @param seconds - Time in seconds
 * @returns Human-readable time string
 */
export function formatDownloadTime(seconds: number): string {
  if (seconds < 60) {
    return `About ${seconds} seconds`;
  }
  if (seconds < 300) {
    const minutes = Math.ceil(seconds / 60);
    return `About ${minutes} minutes`;
  }
  return "Several minutes";
}
