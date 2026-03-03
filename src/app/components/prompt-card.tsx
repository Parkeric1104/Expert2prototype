interface PromptCardProps {
  text: string;
  icon?: string;
  onClick: () => void;
}

export function PromptCard({ text, icon = "⚡️", onClick }: PromptCardProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-start gap-2 p-4 rounded-xl bg-card border border-border hover:border-primary hover:shadow-md transition-all min-w-[180px]"
    >
      <span className="text-lg">{icon}</span>
      <span className="text-sm font-medium text-foreground text-left">{text}</span>
    </button>
  );
}
