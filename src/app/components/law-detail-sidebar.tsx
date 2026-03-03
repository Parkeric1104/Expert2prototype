import { X, Scale, ExternalLink } from "lucide-react";
import { Button } from "@/app/components/ui/button";

interface LawDetailSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  lawData: {
    title: string;
    type: "법령" | "해석례" | "판례";
    content: string;
    url?: string;
  } | null;
}

export function LawDetailSidebar({
  isOpen,
  onClose,
  lawData,
}: LawDetailSidebarProps) {
  if (!isOpen || !lawData) return null;

  const getTypeStyles = () => {
    switch (lawData.type) {
      case "법령":
        return {
          bg: "bg-indigo-50 dark:bg-indigo-950/20",
          iconBg: "bg-indigo-500",
          textColor: "text-indigo-600 dark:text-indigo-400",
        };
      case "해석례":
        return {
          bg: "bg-green-50 dark:bg-green-950/20",
          iconBg: "bg-green-500",
          textColor: "text-green-600 dark:text-green-400",
        };
      case "판례":
        return {
          bg: "bg-purple-50 dark:bg-purple-950/20",
          iconBg: "bg-purple-500",
          textColor: "text-purple-600 dark:text-purple-400",
        };
      default:
        return {
          bg: "bg-gray-50 dark:bg-gray-950/20",
          iconBg: "bg-gray-500",
          textColor: "text-gray-600 dark:text-gray-400",
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed top-0 right-0 h-full w-full max-w-2xl bg-background border-l border-border shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className={`p-6 border-b border-border ${styles.bg}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className={`w-10 h-10 rounded-full ${styles.iconBg} flex items-center justify-center flex-shrink-0`}>
                <Scale className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className={`text-xs font-medium ${styles.textColor} mb-1`}>
                  {lawData.type}
                </div>
                <h2 className="text-lg font-bold text-foreground leading-tight">
                  {lawData.title}
                </h2>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {lawData.url && (
            <a
              href={lawData.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>외부에서 보기</span>
            </a>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <div className="text-sm leading-relaxed text-foreground whitespace-pre-line">
              {lawData.content}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/30">
          <Button
            onClick={onClose}
            className="w-full"
            variant="outline"
          >
            닫기
          </Button>
        </div>
      </div>
    </>
  );
}