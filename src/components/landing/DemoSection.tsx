/**
 * DemoSection Component - Shows offline capability demonstration
 *
 * Visual demonstration of Lokul working with and without WiFi.
 * Shows a mock browser window with chat interface.
 */

import { Button } from "@/components/ui/Button";
import { MessageCircle, Wifi, WifiOff, Zap } from "lucide-react";
import { useEffect, useState } from "react";

interface DemoMessage {
  role: "user" | "ai";
  content: string;
  isStreaming?: boolean;
}

export function DemoSection() {
  const [wifiConnected, setWifiConnected] = useState(true);

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
    <section id="demo" className="bg-gradient-to-b from-[#050505] to-[#0d0d0d] py-20 md:py-32">
      <div className="mx-auto max-w-[860px] px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2
            className="mb-4 text-4xl font-bold text-white md:text-5xl"
            style={{
              fontFamily: '"Instrument Serif", "Iowan Old Style", serif',
              fontStyle: "italic",
            }}
          >
            Don&apos;t Trust Us. Test Us.
          </h2>
          <p
            className="mx-auto max-w-2xl text-xl text-gray-300"
            style={{
              fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif',
              fontWeight: 300,
            }}
          >
            Watch Lokul work. Then disconnect your WiFi and watch it keep working.
          </p>
        </div>

        {/* Demo Browser Window */}
        <div className="mx-auto mb-12 max-w-3xl">
          {/* Browser Chrome */}
          <div className="flex items-center gap-2 rounded-t-xl border border-white/10 bg-[#181818] p-3">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-400" />
              <div className="h-3 w-3 rounded-full bg-yellow-400" />
              <div className="h-3 w-3 rounded-full bg-green-400" />
            </div>
            <div className="mx-4 flex-1">
              <div
                className="rounded-md bg-[#0f0f0f] px-3 py-1 text-center text-sm text-gray-300"
                style={{ fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif' }}
              >
                lokul.app
              </div>
            </div>
          </div>

          {/* Browser Content */}
          <div className="min-h-[300px] rounded-b-xl border-x border-b border-white/10 bg-[#101010] p-6">
            {/* Status Bar */}
            <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-[#FF6B35]" />
                <span
                  className="text-sm font-medium text-gray-200"
                  style={{ fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif' }}
                >
                  Quick Mode
                </span>
              </div>
              <div className="flex items-center gap-2">
                {wifiConnected ? (
                  <>
                    <Wifi className="h-4 w-4 text-green-500" />
                    <span
                      className="text-sm text-green-600"
                      style={{ fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif' }}
                    >
                      WiFi: Connected
                    </span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4 text-red-500" />
                    <span
                      className="text-sm text-red-600"
                      style={{ fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif' }}
                    >
                      WiFi: Disconnected
                    </span>
                    <span
                      className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600"
                      style={{ fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif' }}
                    >
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
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "rounded-br-md bg-[#FF6B35] text-white"
                        : "rounded-bl-md bg-[#1d1d1d] text-gray-100"
                    }`}
                  >
                    {message.role === "ai" && (
                      <div className="mb-1 flex items-center gap-2">
                        <img src="/lokul-logo.png" alt="" className="h-4 w-4" />
                        <span
                          className="text-xs font-medium text-gray-400"
                          style={{ fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif' }}
                        >
                          Lokul
                        </span>
                      </div>
                    )}
                    <p
                      className="text-sm leading-relaxed"
                      style={{ fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif' }}
                    >
                      {message.content}
                      {message.isStreaming && (
                        <span className="ml-1 inline-block h-4 w-2 animate-pulse bg-current" />
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area (Visual Only) */}
            <div className="mt-6 border-t border-white/10 pt-4">
              <div className="flex items-center gap-2 rounded-full bg-[#1a1a1a] px-4 py-2">
                <MessageCircle className="h-4 w-4 text-gray-500" />
                <span
                  className="flex-1 text-sm text-gray-500"
                  style={{ fontFamily: '"DM Sans", "Avenir Next", "Segoe UI", sans-serif' }}
                >
                  Type your message...
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Final Message */}
        <p
          className="mb-10 text-center text-2xl font-bold text-[#FF6B35] md:text-3xl"
          style={{
            fontFamily: '"Instrument Serif", "Iowan Old Style", serif',
            fontStyle: "italic",
          }}
        >
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
