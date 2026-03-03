import { LucideIcon } from "lucide-react";

interface ScenarioCardProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  onClick?: () => void;
}

export function ScenarioCard({ title, subtitle, icon: Icon, onClick }: ScenarioCardProps) {
  return (
    <button
      onClick={onClick}
      className="bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-border flex flex-col items-start text-left w-full max-w-[280px]"
    >
      <div className="bg-accent/10 p-3 rounded-lg mb-4">
        <Icon className="w-6 h-6 text-accent" />
      </div>
      <h3 className="font-semibold text-card-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </button>
  );
}
