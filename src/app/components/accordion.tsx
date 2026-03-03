import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface AccordionItemProps {
  title: string;
  content: string;
  defaultExpanded?: boolean;
}

export function AccordionItem({ title, content, defaultExpanded = false }: AccordionItemProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="border-x border-b border-border bg-card first:border-t first:rounded-t-xl last:rounded-b-xl">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors"
      >
        <h3 className="text-sm font-semibold text-foreground text-left">{title}</h3>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        )}
      </button>
      {isExpanded && (
        <div className="px-6 pb-6">
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
            {content}
          </p>
        </div>
      )}
    </div>
  );
}

interface AccordionProps {
  items: Array<{
    title: string;
    content: string;
    defaultExpanded?: boolean;
  }>;
}

export function Accordion({ items }: AccordionProps) {
  return (
    <div className="w-full">
      {items.map((item, index) => (
        <AccordionItem
          key={index}
          title={item.title}
          content={item.content}
          defaultExpanded={item.defaultExpanded}
        />
      ))}
    </div>
  );
}
