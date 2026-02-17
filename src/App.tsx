import { useState } from "react";
import { Activity } from "lucide-react";
import { StatusIndicator } from "./components/performance/StatusIndicator";
import { PerformancePanel } from "./components/performance/PerformancePanel";
import { Button } from "./components/ui/button";

/**
 * App component - Main application entry point
 *
 * Layout:
 * - Main content area (centered)
 * - StatusIndicator: Fixed bottom-left (always visible)
 * - PerformancePanel: Toggleable panel in sidebar/corner
 * - Performance toggle button: Top-right corner
 */
export function App() {
  const [showPerformancePanel, setShowPerformancePanel] = useState(false);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative">
      {/* Main Content */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">Lokul</h1>
        <p className="text-muted-foreground">Privacy-first AI chat</p>
      </div>

      {/* Performance Toggle Button - Top Right */}
      <div className="fixed top-4 right-4 z-40">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowPerformancePanel(!showPerformancePanel)}
          aria-label={showPerformancePanel ? "Hide performance panel" : "Show performance panel"}
          aria-pressed={showPerformancePanel}
        >
          <Activity className="h-4 w-4" />
        </Button>
      </div>

      {/* Performance Panel - Right Side */}
      {showPerformancePanel && (
        <div className="fixed top-16 right-4 z-40">
          <PerformancePanel onClose={() => setShowPerformancePanel(false)} />
        </div>
      )}

      {/* Status Indicator - Bottom Left (always visible) */}
      <StatusIndicator />
    </div>
  );
}

export default App;
