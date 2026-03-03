import { useState, useRef, useEffect } from "react";
import { ChatBubble } from "@/app/components/chat-bubble";
import { ActionChip } from "@/app/components/action-chip";
import { Send, FileDown, Copy } from "lucide-react";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

interface ChatInterfaceProps {
  initialMessage?: string;
  onExport: () => void;
}

export function ChatInterface({ initialMessage, onExport }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Generate AI response
  const generateAIResponse = (userMessage: string): string => {
    const responses = {
      dismissal: `[Legal Opinion Review]

1. Factual Summary
- Employee A joined the company in January 2023 and was employed in the sales department
- In October 2025, received dismissal notice for poor performance
- No prior written warnings or performance improvement plans were documented

2. Legal Standard
- Labor Standards Act Article 23 states that an employer shall not dismiss a worker without just cause
- Supreme Court precedent (2020Da12345) establishes that dismissal for poor performance requires:
  • Objective performance metrics
  • Prior warnings and opportunity to improve
  • Evidence that performance improvement is unlikely

3. Analysis
- The dismissal appears to lack proper procedural safeguards
- No documented evidence of performance metrics or improvement opportunities
- May constitute unfair dismissal under current legal standards

4. Conclusion
- Based on the facts presented, this dismissal likely lacks sufficient legal grounds
- Employee may have valid claim for unfair dismissal
- Recommend seeking reinstatement or compensation through Labor Relations Commission`,

      overtime: `[Overtime Wage Calculation Opinion]

1. Factual Background
- Regular working hours: 40 hours per week (Monday-Friday, 9:00-18:00)
- Overtime work performed: 15 hours in the relevant week
- Hourly wage: ₩15,000

2. Legal Framework
- Labor Standards Act Article 56: Overtime work shall be paid at a rate of 50% or more
- Night work (22:00-06:00) requires additional 50% premium
- Holiday work requires additional premium rates

3. Calculation
- Regular hourly wage: ₩15,000
- Overtime rate (150%): ₩22,500
- Total overtime hours: 15 hours
- Total overtime wage due: ₩337,500

4. Recommendation
- Employer should pay the calculated overtime wages
- Maintain accurate time records for compliance
- Consider implementing overtime management system`,

      default: `[Legal Analysis]

1. Issue Identification
I've reviewed your inquiry regarding labor law matters. To provide a comprehensive opinion, I'll analyze this under the relevant provisions of the Labor Standards Act and applicable case law.

2. Legal Framework
- Labor Standards Act provisions apply
- Supreme Court precedents provide guidance on interpretation
- Labor Relations Commission rulings offer practical application

3. Analysis
Based on the information provided, the key considerations are:
- Compliance with statutory requirements
- Protection of worker rights
- Employer obligations under current law

4. Recommendation
I recommend consulting with the relevant authorities and maintaining detailed documentation of all employment-related matters.

Would you like me to elaborate on any specific aspect?`,
    };

    const lowerMessage = userMessage.toLowerCase();
    if (lowerMessage.includes("dismissal") || lowerMessage.includes("해고")) {
      return responses.dismissal;
    } else if (lowerMessage.includes("overtime") || lowerMessage.includes("연장")) {
      return responses.overtime;
    } else {
      return responses.default;
    }
  };

  // Handle initial message
  useEffect(() => {
    if (initialMessage && messages.length === 0) {
      const userMsg: Message = {
        id: Date.now().toString(),
        text: `Please draft an opinion letter regarding: ${initialMessage}`,
        isUser: true,
      };
      setMessages([userMsg]);

      // Simulate AI response with delay
      setIsTyping(true);
      setTimeout(() => {
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          text: generateAIResponse(initialMessage),
          isUser: false,
        };
        setMessages((prev) => [...prev, aiMsg]);
        setIsTyping(false);
      }, 1500);
    }
  }, [initialMessage]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");

    // Simulate AI response
    setIsTyping(true);
    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: generateAIResponse(inputValue),
        isUser: false,
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const handleCopy = () => {
    const lastAIMessage = [...messages].reverse().find((m) => !m.isUser);
    if (lastAIMessage) {
      navigator.clipboard.writeText(lastAIMessage.text);
      alert("Opinion copied to clipboard!");
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="border-b border-border px-6 py-4 bg-card">
          <h2 className="font-semibold text-lg text-card-foreground">Legal Opinion Assistant</h2>
          <p className="text-sm text-muted-foreground">AI-powered labor law analysis</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground mt-20">
              <p className="text-lg mb-2">Start a conversation</p>
              <p className="text-sm">Ask me anything about labor law or select a scenario from the dashboard</p>
            </div>
          )}

          {messages.map((message) => (
            <ChatBubble
              key={message.id}
              message={message.text}
              isUser={message.isUser}
            />
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="max-w-[600px] rounded-xl px-5 py-3.5 bg-gray-100">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Action Chips */}
        {messages.some((m) => !m.isUser) && (
          <div className="px-6 py-3 border-t border-border bg-gray-50">
            <div className="flex gap-2 flex-wrap">
              <ActionChip label="Labor Act Art.23" icon="⚖️" />
              <ActionChip label="Supreme Court 2020Da12345" icon="🏛️" />
              <ActionChip label="Copy Opinion" icon="📄" onClick={handleCopy} />
              <ActionChip label="Export Document" onClick={onExport} />
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-border px-6 py-4 bg-card">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask a follow-up question..."
              className="flex-1 px-4 py-3 rounded-lg bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-accent text-foreground placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="px-6 py-3 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </form>
        </div>
      </div>

      {/* Document Preview Panel */}
      <div className="w-96 border-l border-border bg-gray-50 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-card-foreground">Document Preview</h3>
            <button
              onClick={onExport}
              className="text-accent hover:text-accent/80 transition-colors"
            >
              <FileDown className="w-4 h-4" />
            </button>
          </div>

          {messages.some((m) => !m.isUser) ? (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-border">
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-1">Opinion Letter</h4>
                  <p className="text-xs text-muted-foreground">Generated on {new Date().toLocaleDateString()}</p>
                </div>
                <div className="pt-4 border-t border-border">
                  <p className="text-muted-foreground leading-relaxed">
                    {messages.find((m) => !m.isUser)?.text.slice(0, 200)}...
                  </p>
                </div>
                <button
                  onClick={onExport}
                  className="w-full py-2 px-4 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Export Full Document
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-border text-center text-muted-foreground">
              <FileDown className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No document to preview yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
