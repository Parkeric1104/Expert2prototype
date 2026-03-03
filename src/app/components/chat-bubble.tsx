import { User, Bot } from "lucide-react";
import { Scale } from "lucide-react";

interface ChatBubbleProps {
  message: string;
  isUser?: boolean;
  showHeader?: boolean;
  lawCategory?: string;
}

export function ChatBubble({ message, isUser = false, showHeader = true, lawCategory }: ChatBubbleProps) {
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-6`}>
      <div className={`max-w-[650px] ${isUser ? "flex flex-col gap-2 items-end" : "flex flex-col gap-2"}`}>
        {/* Message Content */}
        <div
          className={`rounded-2xl px-5 py-3.5 ${
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted/50 text-foreground"
          }`}
        >
          <p className="whitespace-pre-line leading-relaxed">{message}</p>
        </div>
      </div>
    </div>
  );
}