/**
 * CodeBlock Component - Syntax highlighted code blocks with copy button
 *
 * Displays code with syntax highlighting using react-syntax-highlighter
 * and provides a one-click copy button.
 */

import { useState, useCallback } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/**
 * Props for the CodeBlock component
 */
interface CodeBlockProps {
  /** The code content to display */
  code: string;
  /** Programming language for syntax highlighting */
  language?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Extract language from className (e.g., "language-typescript" -> "typescript")
 */
function extractLanguage(className?: string): string {
  if (!className) return "text";

  const match = className.match(/language-(\w+)/);
  return match ? match[1] : "text";
}

/**
 * Format language name for display
 */
function formatLanguageName(language: string): string {
  const languageNames: Record<string, string> = {
    js: "JavaScript",
    ts: "TypeScript",
    jsx: "JSX",
    tsx: "TSX",
    py: "Python",
    rb: "Ruby",
    go: "Go",
    rs: "Rust",
    cpp: "C++",
    c: "C",
    cs: "C#",
    sh: "Shell",
    bash: "Bash",
    zsh: "Zsh",
    ps1: "PowerShell",
    sql: "SQL",
    html: "HTML",
    css: "CSS",
    scss: "SCSS",
    sass: "Sass",
    less: "Less",
    json: "JSON",
    yaml: "YAML",
    yml: "YAML",
    xml: "XML",
    md: "Markdown",
    dockerfile: "Dockerfile",
    terraform: "Terraform",
    hcl: "HCL",
  };

  return languageNames[language] || language.toUpperCase();
}

/**
 * CodeBlock component with syntax highlighting and copy functionality
 *
 * @example
 * ```tsx
 * <CodeBlock code="console.log('Hello')" language="javascript" />
 * ```
 */
export function CodeBlock({ code, language = "text", className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  // Extract language from className if provided
  const detectedLanguage = extractLanguage(className) || language;
  const displayLanguage = formatLanguageName(detectedLanguage);

  // Determine if we should show line numbers (hide for very short code)
  const showLineNumbers = code.split("\n").length > 2;

  /**
   * Handle copying code to clipboard
   */
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Silently fail - clipboard might not be available
      if (import.meta.env.DEV) {
        console.error("Failed to copy code:", err);
      }
    }
  }, [code]);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-gray-200 bg-[#1e1e1e]",
        className
      )}
    >
      {/* Header bar with language and copy button */}
      <div className="flex items-center justify-between border-b border-gray-700/50 bg-[#252526] px-4 py-2">
        {/* Language label */}
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
          {displayLanguage}
        </span>

        {/* Copy button */}
        <Button
          onClick={handleCopy}
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 gap-1.5 px-2 text-xs text-gray-400 hover:bg-gray-700 hover:text-gray-200"
          )}
          aria-label={copied ? "Copied!" : "Copy code"}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-green-400" />
              <span className="text-green-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </Button>
      </div>

      {/* Syntax highlighted code */}
      <div className="overflow-x-auto">
        <SyntaxHighlighter
          language={detectedLanguage}
          style={oneDark}
          showLineNumbers={showLineNumbers}
          wrapLongLines={true}
          customStyle={{
            margin: 0,
            padding: "1rem",
            background: "transparent",
            fontSize: "0.875rem",
            lineHeight: "1.5",
          }}
          lineNumberStyle={{
            color: "#6e7681",
            paddingRight: "1rem",
            minWidth: "2.5rem",
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
