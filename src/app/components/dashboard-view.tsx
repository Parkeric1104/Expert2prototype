import { useState } from "react";
import { ScenarioCard } from "@/app/components/scenario-card";
import { FileCheck, Calculator, AlertCircle, FileText, Send } from "lucide-react";

interface DashboardViewProps {
  onStartChat: (scenario: string) => void;
}

export function DashboardView({ onStartChat }: DashboardViewProps) {
  const [activeTab, setActiveTab] = useState("labor-standards");
  const [inputValue, setInputValue] = useState("");

  const tabs = [
    { id: "labor-standards", label: "Labor Standards", subtitle: "근로기준" },
    { id: "industrial-safety", label: "Industrial Safety", subtitle: "산재/안전" },
    { id: "hr-management", label: "HR Management", subtitle: "인사노무" },
  ];

  const scenarios = [
    {
      id: "unfair-dismissal",
      title: "Review of Unfair Dismissal",
      subtitle: "부당해고 검토",
      icon: FileCheck,
    },
    {
      id: "overtime-wage",
      title: "Overtime Wage Calculation",
      subtitle: "연장근로수당 계산",
      icon: Calculator,
    },
    {
      id: "industrial-accident",
      title: "Review of Industrial Accident",
      subtitle: "업무상 재해 판정",
      icon: AlertCircle,
    },
    {
      id: "employment-contract",
      title: "Drafting Employment Contract",
      subtitle: "근로계약서 작성",
      icon: FileText,
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onStartChat(inputValue);
      setInputValue("");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Labor Law Assistant
          </h1>
          <p className="text-muted-foreground">노무도우미</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 mb-8 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-accent text-accent font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label} <span className="text-sm">({tab.subtitle})</span>
            </button>
          ))}
        </div>

        {/* Scenario Cards */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-6 text-foreground">
            Common Scenarios
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {scenarios.map((scenario) => (
              <ScenarioCard
                key={scenario.id}
                title={scenario.title}
                subtitle={scenario.subtitle}
                icon={scenario.icon}
                onClick={() => onStartChat(scenario.title)}
              />
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter facts to draft opinion letter..."
              className="w-full px-6 py-4 pr-14 rounded-full bg-card border border-border focus:outline-none focus:ring-2 focus:ring-accent text-foreground placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
