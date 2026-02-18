/**
 * MarkdownMessage Component - Markdown rendering with syntax highlighting
 *
 * Renders AI message content with full Markdown support including:
 * - Headings, paragraphs, lists
 * - Code blocks with syntax highlighting
 * - Tables, blockquotes, links
 * - Bold, italic, strikethrough
 *
 * Uses react-markdown with remark-gfm for GitHub-flavored markdown.
 */

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./CodeBlock";
import { cn } from "@/lib/utils";

/**
 * Props for the MarkdownMessage component
 */
interface MarkdownMessageProps {
  /** Markdown content to render */
  content: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Custom code component for react-markdown
 * Renders inline code or CodeBlock for code blocks
 */
function CodeComponent({
  inline,
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement> & { inline?: boolean }) {
  const code = String(children).replace(/\n$/, "");

  if (inline) {
    return (
      <code
        className={cn(
          "rounded-md bg-gray-100 px-1.5 py-0.5 font-mono text-sm text-gray-800",
          className
        )}
        {...props}
      >
        {children}
      </code>
    );
  }

  // Block code - use CodeBlock component
  return <CodeBlock code={code} className={className} />;
}

/**
 * MarkdownMessage component with full markdown support
 *
 * @example
 * ```tsx
 * <MarkdownMessage content="# Hello\n\nThis is **bold** text." />
 * ```
 */
export function MarkdownMessage({ content, className }: MarkdownMessageProps) {
  return (
    <div
      className={cn(
        "prose prose-sm max-w-none",
        // Headings
        "prose-headings:font-semibold prose-headings:text-gray-900",
        "prose-h1:text-xl prose-h1:mb-4",
        "prose-h2:text-lg prose-h2:mb-3",
        "prose-h3:text-base prose-h3:mb-2",
        "prose-h4:text-sm prose-h4:mb-2",
        // Paragraphs
        "prose-p:mb-4 prose-p:text-gray-700 prose-p:leading-relaxed",
        // Lists
        "prose-ul:mb-4 prose-ul:list-disc prose-ul:pl-5",
        "prose-ol:mb-4 prose-ol:list-decimal prose-ol:pl-5",
        "prose-li:mb-1 prose-li:text-gray-700",
        // Blockquotes
        "prose-blockquote:border-l-4 prose-blockquote:border-gray-300",
        "prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600",
        "prose-blockquote:mb-4",
        // Links
        "prose-a:text-[#FF6B35] prose-a:no-underline hover:prose-a:underline",
        // Strong and emphasis
        "prose-strong:font-bold prose-strong:text-gray-900",
        "prose-em:italic",
        // Horizontal rule
        "prose-hr:my-4 prose-hr:border-gray-200",
        // Tables
        "prose-table:w-full prose-table:border-collapse prose-table:mb-4",
        "prose-th:border prose-th:border-gray-200 prose-th:px-4 prose-th:py-2",
        "prose-th:bg-gray-50 prose-th:font-semibold prose-th:text-left",
        "prose-td:border prose-td:border-gray-200 prose-td:px-4 prose-td:py-2",
        "prose-tr:even:bg-gray-50",
        // Code blocks (pre)
        "prose-pre:my-0 prose-pre:bg-transparent prose-pre:p-0",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Use custom code component for inline/block code
          code: CodeComponent,
          // Render pre as div to avoid nesting issues with CodeBlock
          pre: ({ children }) => <div className="my-4">{children}</div>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
