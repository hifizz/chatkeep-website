import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { cn } from "~/lib/utils";

type ShareMarkdownProps = {
  content: string;
  className?: string;
};

const components: Components = {
  pre: ({ children, ...props }) => (
    <pre {...props} className="overflow-x-auto rounded-xl !border-0 !bg-neutral-800/85 p-3">
      {children}
    </pre>
  ),
  code: ({ className, children, ...props }) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code className="rounded bg-neutral-800 px-1.5 py-0.5 text-neutral-100" {...props}>
          {children}
        </code>
      );
    }

    return (
      <code className={cn("block text-sm", className)} {...props}>
        {children}
      </code>
    );
  },
  a: ({ children, ...props }) => (
    <a
      {...props}
      className="text-blue-300 underline underline-offset-2 hover:text-blue-200"
      rel="noopener noreferrer"
      target="_blank"
    >
      {children}
    </a>
  ),
  table: ({ children, ...props }) => (
    <div className="overflow-x-auto">
      <table {...props} className={cn("my-0 w-full text-sm", props.className)}>
        {children}
      </table>
    </div>
  ),
};

export function ShareMarkdown({ content, className }: ShareMarkdownProps) {
  return (
    <div
      className={cn(
        "prose prose-sm prose-invert max-w-none",
        "prose-headings:text-neutral-100 prose-p:text-neutral-100 prose-strong:text-neutral-50",
        "prose-code:text-neutral-100 prose-pre:bg-transparent",
        "prose-th:border prose-th:border-neutral-700 prose-th:bg-neutral-900/70",
        "prose-td:border prose-td:border-neutral-800",
        className,
      )}
    >
      <ReactMarkdown
        components={components}
        rehypePlugins={[rehypeHighlight]}
        remarkPlugins={[remarkGfm]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
