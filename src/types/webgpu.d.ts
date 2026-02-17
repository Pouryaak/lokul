/**
 * WebGPU Type Definitions
 *
 * Type declarations for the WebGPU API.
 * These augment the standard DOM types with WebGPU-specific interfaces.
 */

/**
 * GPU adapter info provided by the browser
 */
interface GPUAdapterInfo {
  /** Vendor name (e.g., "nvidia", "amd", "intel") */
  readonly vendor: string;

  /** Architecture name (e.g., "ampere", "rdna2") */
  readonly architecture: string;

  /** Device description (e.g., "NVIDIA GeForce RTX 4090") */
  readonly description: string;
}

/**
 * GPU adapter - represents a physical GPU device
 */
interface GPUAdapter {
  /** Information about the adapter */
  readonly info: GPUAdapterInfo;

  /**
   * Request a GPU device from this adapter
   */
  requestDevice(descriptor?: GPUDeviceDescriptor): Promise<GPUDevice | null>;
}

/**
 * GPU device descriptor
 */
interface GPUDeviceDescriptor {
  /** Required features */
  requiredFeatures?: GPUFeatureName[];

  /** Required limits */
  requiredLimits?: Record<string, number>;
}

/**
 * GPU device - represents a logical connection to a GPU
 */
interface GPUDevice {
  /** Destroy the device and release resources */
  destroy(): void;
}

/**
 * GPU feature names
 */
type GPUFeatureName =
  | "depth-clip-control"
  | "depth32float-stencil8"
  | "texture-compression-bc"
  | "texture-compression-etc2"
  | "texture-compression-astc"
  | "timestamp-query"
  | "indirect-first-instance"
  | "shader-f16"
  | "rg11b10ufloat-renderable"
  | "bgra8unorm-storage"
  | "float32-filterable";

/**
 * GPU request adapter options
 */
interface GPURequestAdapterOptions {
  /** Power preference for adapter selection */
  powerPreference?: "low-power" | "high-performance";

  /** Force software rendering */
  forceFallbackAdapter?: boolean;
}

/**
 * GPU object - entry point for WebGPU API
 */
interface GPU {
  /**
   * Request a GPU adapter
   */
  requestAdapter(options?: GPURequestAdapterOptions): Promise<GPUAdapter | null>;
}

/**
 * Augment the Navigator interface with WebGPU
 */
declare global {
  interface Navigator {
    /** WebGPU API entry point */
    readonly gpu?: GPU;
  }
}

export {};
