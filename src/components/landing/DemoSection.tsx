/**
 * DemoSection Component - Shows offline capability demonstration
 *
 * Visual demonstration of Lokul working with and without WiFi.
 * Shows a mock browser window with chat interface.
 */

import { useState, useEffect } from "react";
import { Wifi, WifiOff, Zap, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

/**
 * Demo message type
 */
interface DemoMessage {
  role: "user" | "ai";
  content: string;
  isStreaming?: boolean;
}

/**
 * Demo section showing offline capability
 */
export function DemoSection() {
  const [wifiConnected, setWifiConnected] = useState(true);

  // Auto-advance through demo frames
  useEffect(() => {
    const timer = setTimeout(() => {
      setWifiConnected(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const scrollToCTA = () => {
    const ctaSection = document.getElementById("final-cta");
    if (ctaSection) {
      ctaSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const messages: DemoMessage[] = wifiConnected
    ? [
        { role: "user", content: "Explain quantum computing" },
        {
          role: "ai",
          content:
            "Quantum computing uses quantum bits (qubits) that can exist in multiple states simultaneously...",
          isStreaming: true,
        },
      ]
    : [
        { role: "user", content: "Explain quantum computing" },
        {
          role: "ai",
          content:
            "Quantum computing uses quantum bits (qubits) that can exist in multiple states simultaneously, unlike classical bits that are either 0 or 1.",
        },
        { role: "user", content: "Now explain it to a 5yo" },
        {
          role: "ai",
          content:
            "Imagine a super fast magic computer that can try many answers at the same time instead of one by one!",
          isStreaming: true,
        },
      ];

  return (
    <section
      id="demo"
      className="py-20 md:py-32 bg-gradient-to-b from-white to-[#FFF8F0]"
    >
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-4">
            Don&apos;t Trust Us. Test Us.
          </h2>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Watch Lokul work. Then disconnect your WiFi and watch it keep
            working.
          </p>
        </div>

        {/* Demo Browser Window */}
        <div className="max-w-3xl mx-auto mb-12">
          {/* Browser Chrome */}
          <div className="bg-gray-100 rounded-t-xl border border-gray-300 p-3 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="flex-1 mx-4">
              <div className="bg-white rounded-md px-3 py-1 text-sm text-gray-500 text-center">
                lokul.app
              </div>
            </div>
          </div>

          {/* Browser Content */}
          <div className="bg-white rounded-b-xl border-x border-b border-gray-300 p-6 min-h-[300px]">
            {/* Status Bar */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#FF6B35]" />
                <span className="text-sm font-medium text-gray-700">
                  Quick Mode
                </span>
              </div>
              <div className="flex items-center gap-2">
                {wifiConnected ? (
                  <>
                    <Wifi className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600">
                      WiFi: Connected
                    </span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-600">
                      WiFi: Disconnected
                    </span>
                    <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full font-medium">
                      WiFi OFF
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Chat Messages */}
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-[#FF6B35] text-white rounded-br-md"
                        : "bg-gray-100 text-gray-800 rounded-bl-md"
                    }`}
                  >
                    {message.role === "ai" && (
                      <div className="flex items-center gap-2 mb-1">
                        <img
                          src="/spark-logo.svg"
                          alt=""
                          className="w-4 h-4"
                        />
                        <span className="text-xs font-medium text-gray-500">
                          Lokul
                        </span>
                      </div>
                    )}
                    <p className="text-sm leading-relaxed">
                      {message.content}
                      {message.isStreaming && (
                        <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse" />
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area (Visual Only) */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2">
                <MessageCircle className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400 flex-1">
                  Type your message...
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Final Message */}
        <p className="text-center text-2xl md:text-3xl font-bold text-[#FF6B35] mb-10">
          That&apos;s the power of local AI.
        </p>

        {/* CTA */}
        <div className="text-center">
          <Button variant="primary" size="lg" onClick={scrollToCTA}>
            Try It Yourself
          </Button>
        </div>
      </div>
    </section>
  );
}
