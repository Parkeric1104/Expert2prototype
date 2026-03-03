import { Scale, FileText, Users, Settings, Home, MessageSquare } from "lucide-react";

interface LaborSidebarProps {
  isCollapsed?: boolean;
  currentView?: string;
  onViewChange?: (view: string) => void;
}

export function LaborSidebar({ isCollapsed = false, currentView = "dashboard", onViewChange }: LaborSidebarProps) {
  const menuItems = [
    { id: "dashboard", icon: Home, label: "Dashboard" },
    { id: "chat", icon: MessageSquare, label: "Chat" },
    { id: "cases", icon: Scale, label: "Cases" },
    { id: "documents", icon: FileText, label: "Documents" },
    { id: "hr", icon: Users, label: "HR" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div 
      className={`bg-primary h-screen flex flex-col ${isCollapsed ? "w-20" : "w-64"} transition-all duration-300`}
    >
      {/* Logo/Title */}
      <div className="p-6 border-b border-white/10">
        {!isCollapsed && (
          <h2 className="text-white font-bold text-lg">Labor Law Assistant</h2>
        )}
        {isCollapsed && (
          <div className="text-white font-bold text-lg text-center">LLA</div>
        )}
      </div>

      {/* Menu Items */}
      <nav className="flex-1 py-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onViewChange?.(item.id)}
              className={`w-full flex items-center gap-3 px-6 py-3 transition-colors ${
                isActive 
                  ? "bg-accent text-white" 
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5" />
              {!isCollapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-6 border-t border-white/10">
          <p className="text-white/50 text-xs">© 2026 Douzone</p>
        </div>
      )}
    </div>
  );
}
