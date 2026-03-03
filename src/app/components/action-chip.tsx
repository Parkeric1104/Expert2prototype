interface ActionChipProps {
  label: string;
  icon?: string;
  onClick?: () => void;
}

export function ActionChip({ label, icon, onClick }: ActionChipProps) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-accent bg-white text-accent text-sm hover:bg-accent/5 transition-colors"
    >
      {icon && <span>{icon}</span>}
      <span>{label}</span>
    </button>
  );
}
