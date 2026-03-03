import { X } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  icon?: React.ReactNode;
  color?: string;
  sources?: Array<{
    type: "법령" | "해석례" | "사규";
    title: string;
    url: string;
  }>;
}

export function DetailModal({
  isOpen,
  onClose,
  title,
  content,
  icon,
  color = "text-primary",
  sources,
}: DetailModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[85vh] mx-4 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className={`px-6 py-4 border-b border-border bg-gradient-to-r from-primary/5 to-transparent`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {icon && <div className={color}>{icon}</div>}
              <h2 className="text-xl font-bold text-foreground">{title}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 overflow-y-auto max-h-[calc(85vh-180px)]">
          {sources ? (
            // Sources layout
            <div className="space-y-3">
              {sources.map((source, idx) => (
                <a
                  key={idx}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 bg-muted/50 border border-border rounded-lg hover:bg-primary/5 hover:border-primary/50 transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    <Badge
                      variant="outline"
                      className={`text-xs px-2 py-0.5 ${
                        source.type === "법령"
                          ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800"
                          : source.type === "해석례"
                          ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-800"
                          : "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800"
                      }`}
                    >
                      {source.type}
                    </Badge>
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {source.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {source.url}
                      </p>
                    </div>
                    <svg
                      className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            // Text content layout
            <div className="prose prose-sm max-w-none">
              <p className="text-foreground leading-relaxed whitespace-pre-line">
                {content}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-muted/30">
          <Button onClick={onClose} className="w-full" size="lg">
            닫기
          </Button>
        </div>
      </div>
    </div>
  );
}
