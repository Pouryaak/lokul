/**
 * GPU Detection - WebGPU capability checking
 *
 * Provides utilities for detecting WebGPU support and getting GPU information.
 * Used during first-run setup to verify browser compatibility.
 *
 * No fallbacks or polyfills - WebGPU is strictly required.
 */

import type { GPUInfo, GPUDeviceDetails, RecommendedBrowser, BrowserCompatibility } from "@/types/index";

/**
 * Minimum browser versions for WebGPU support
 */
const MIN_CHROME_VERSION = 120;
const MIN_EDGE_VERSION = 120;
const MIN_FIREFOX_VERSION = 133; // Nightly/early support

/**
 * Check if the browser supports WebGPU.
 *
 * Performs synchronous check for navigator.gpu availability.
 * For detailed GPU information, use getGPUInfo() instead.
 *
 * @returns GPUInfo with support status and basic device info
 *
 * @example
 * ```ts
 * const gpuInfo = checkWebGPUSupport();
 * if (!gpuInfo.supported) {
 *   showError(gpuInfo.error);
 * }
 * ```
 */
export function checkWebGPUSupport(): GPUInfo {
  try {
    // Check if navigator.gpu exists (basic API availability)
    if (typeof navigator === "undefined" || !navigator.gpu) {
      return {
        supported: false,
        deviceName: null,
        error: "Your browser doesn't support WebGPU",
      };
    }

    // Try to get adapter info for more details
    // Note: requestAdapter is async, so we return basic info here
    // Call getGPUInfo() for full detection with adapter details
    return {
      supported: true,
      deviceName: "WebGPU Available",
      error: null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error checking WebGPU";

    return {
      supported: false,
      deviceName: null,
      error: message,
    };
  }
}

/**
 * Get detailed GPU information including adapter details.
 *
 * This is an async function that attempts to request a GPU adapter
 * to get detailed device information.
 *
 * @returns Promise resolving to detailed GPUInfo
 *
 * @example
 * ```ts
 * const gpuInfo = await getGPUInfo();
 * console.log(gpuInfo.deviceName); // "NVIDIA GeForce RTX 4090"
 * console.log(gpuInfo.details?.vendor); // "nvidia"
 * ```
 */
export async function getGPUInfo(): Promise<GPUInfo> {
  try {
    // Check basic availability first
    if (typeof navigator === "undefined" || !navigator.gpu) {
      return {
        supported: false,
        deviceName: null,
        error: "Your browser doesn't support WebGPU",
      };
    }

    // Try to request an adapter with high-performance preference
    const adapter = await navigator.gpu.requestAdapter({
      powerPreference: "high-performance",
    });

    if (!adapter) {
      return {
        supported: true,
        deviceName: null,
        error: "WebGPU adapter not available - GPU may not be supported",
        details: {
          isDiscrete: false,
        },
      };
    }

    // Get adapter info if available
    const adapterInfo = adapter.info;
    const deviceName = adapterInfo?.architecture || adapterInfo?.description || "Unknown GPU";

    const details: GPUDeviceDetails = {
      vendor: adapterInfo?.vendor || undefined,
      architecture: adapterInfo?.architecture || undefined,
      isDiscrete: adapterInfo?.vendor?.toLowerCase().includes("nvidia") ||
                  adapterInfo?.vendor?.toLowerCase().includes("amd") ||
                  adapterInfo?.vendor?.toLowerCase().includes("intel") || false,
    };

    return {
      supported: true,
      deviceName,
      error: null,
      details,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error detecting GPU";

    if (import.meta.env.DEV) {
      console.error("[GPU Detection] Error:", error);
    }

    return {
      supported: false,
      deviceName: null,
      error: message,
    };
  }
}

/**
 * Get list of recommended browsers that support WebGPU.
 *
 * @returns Array of browser recommendations with download URLs
 *
 * @example
 * ```ts
 * const browsers = getRecommendedBrowsers();
 * // [{ name: "Google Chrome", url: "...", minVersion: "120" }, ...]
 * ```
 */
export function getRecommendedBrowsers(): RecommendedBrowser[] {
  const userAgent = typeof navigator !== "undefined" ? navigator.userAgent.toLowerCase() : "";

  return [
    {
      name: "Google Chrome",
      url: "https://www.google.com/chrome/",
      minVersion: String(MIN_CHROME_VERSION),
      likelyInstalled: userAgent.includes("chrome") && !userAgent.includes("edg"),
    },
    {
      name: "Microsoft Edge",
      url: "https://www.microsoft.com/edge",
      minVersion: String(MIN_EDGE_VERSION),
      likelyInstalled: userAgent.includes("edg"),
    },
    {
      name: "Firefox Nightly",
      url: "https://www.mozilla.org/firefox/nightly/",
      minVersion: String(MIN_FIREFOX_VERSION),
      likelyInstalled: userAgent.includes("firefox"),
    },
  ];
}

/**
 * Check if the current browser is supported (Chrome 120+ or Edge 120+).
 *
 * Parses the user agent string to detect browser and version.
 * Note: User agent sniffing is not 100% reliable but sufficient for
 * providing guidance to users.
 *
 * @returns true if browser appears to be supported
 *
 * @example
 * ```ts
 * if (!isBrowserSupported()) {
 *   showBrowserWarning();
 * }
 * ```
 */
export function isBrowserSupported(): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }

  const userAgent = navigator.userAgent.toLowerCase();

  // Check for Chrome (but not Edge, which also includes Chrome in UA)
  const chromeMatch = userAgent.match(/chrome\/(\d+)/);
  if (chromeMatch && !userAgent.includes("edg")) {
    const version = parseInt(chromeMatch[1], 10);
    return version >= MIN_CHROME_VERSION;
  }

  // Check for Edge
  const edgeMatch = userAgent.match(/edg\/(\d+)/);
  if (edgeMatch) {
    const version = parseInt(edgeMatch[1], 10);
    return version >= MIN_EDGE_VERSION;
  }

  // Check for Firefox Nightly (experimental WebGPU support)
  const firefoxMatch = userAgent.match(/firefox\/(\d+)/);
  if (firefoxMatch) {
    const version = parseInt(firefoxMatch[1], 10);
    return version >= MIN_FIREFOX_VERSION;
  }

  // Unknown browser - assume not supported
  return false;
}

/**
 * Get detailed browser compatibility information.
 *
 * @returns BrowserCompatibility with detailed analysis
 *
 * @example
 * ```ts
 * const compat = getBrowserCompatibility();
 * if (!compat.isSupported) {
 *   console.log("Issues:", compat.issues);
 *   console.log("Recommended:", compat.recommendedBrowsers);
 * }
 * ```
 */
export function getBrowserCompatibility(): BrowserCompatibility {
  const userAgent = typeof navigator !== "undefined" ? navigator.userAgent.toLowerCase() : "";
  const issues: string[] = [];

  let currentBrowser: string | null = null;
  let currentVersion: string | null = null;

  // Detect Chrome
  const chromeMatch = userAgent.match(/chrome\/(\d+)/);
  if (chromeMatch && !userAgent.includes("edg")) {
    currentBrowser = "Google Chrome";
    currentVersion = chromeMatch[1];

    const version = parseInt(chromeMatch[1], 10);
    if (version < MIN_CHROME_VERSION) {
      issues.push(`Chrome version ${version} is too old. Version ${MIN_CHROME_VERSION}+ required.`);
    }
  }

  // Detect Edge
  const edgeMatch = userAgent.match(/edg\/(\d+)/);
  if (edgeMatch) {
    currentBrowser = "Microsoft Edge";
    currentVersion = edgeMatch[1];

    const version = parseInt(edgeMatch[1], 10);
    if (version < MIN_EDGE_VERSION) {
      issues.push(`Edge version ${version} is too old. Version ${MIN_EDGE_VERSION}+ required.`);
    }
  }

  // Detect Firefox
  const firefoxMatch = userAgent.match(/firefox\/(\d+)/);
  if (firefoxMatch && !currentBrowser) {
    currentBrowser = "Mozilla Firefox";
    currentVersion = firefoxMatch[1];

    const version = parseInt(firefoxMatch[1], 10);
    if (version < MIN_FIREFOX_VERSION) {
      issues.push(`Firefox version ${version} does not support WebGPU. Nightly ${MIN_FIREFOX_VERSION}+ required.`);
    }
  }

  // Detect Safari (not supported)
  if (userAgent.includes("safari") && !userAgent.includes("chrome")) {
    currentBrowser = "Apple Safari";
    currentVersion = userAgent.match(/version\/(\d+)/)?.[1] || null;
    issues.push("Safari does not support WebGPU. Please use Chrome or Edge.");
  }

  // Unknown browser
  if (!currentBrowser) {
    issues.push("Unable to detect browser. WebGPU requires Chrome 120+ or Edge 120+.");
  }

  // Check WebGPU availability
  if (typeof navigator === "undefined" || !navigator.gpu) {
    issues.push("WebGPU API not available in this browser.");
  }

  return {
    isSupported: issues.length === 0,
    currentBrowser,
    currentVersion,
    recommendedBrowsers: getRecommendedBrowsers(),
    issues,
  };
}

/**
 * Format a user-friendly error message for unsupported browsers.
 *
 * @returns Formatted error message with recommendations
 */
export function getUnsupportedBrowserMessage(): string {
  const compat = getBrowserCompatibility();

  let message = "Lokul requires Chrome 120+ or Edge 120+";

  if (compat.currentBrowser) {
    message = `Your browser (${compat.currentBrowser}${compat.currentVersion ? ` ${compat.currentVersion}` : ""}) doesn't support WebGPU.`;
  }

  const recommended = compat.recommendedBrowsers
    .filter((b) => !b.likelyInstalled)
    .map((b) => b.name)
    .join(" or ");

  if (recommended) {
    message += ` Please install ${recommended} for the best experience.`;
  }

  return message;
}

/**
 * Check if the browser is running on a mobile device.
 * Mobile devices may have limited WebGPU support.
 *
 * @returns true if user agent indicates mobile device
 */
export function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }

  const userAgent = navigator.userAgent.toLowerCase();
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent);
}

/**
 * Get a warning message if running on mobile.
 *
 * @returns Warning message or null if not mobile
 */
export function getMobileWarning(): string | null {
  if (!isMobileDevice()) {
    return null;
  }

  return "Mobile WebGPU support is limited. For best performance, use a desktop browser.";
}
