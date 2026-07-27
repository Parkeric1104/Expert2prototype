// 기획 정책 챗봇 (내부용) — 프로토타입과 분리된 별도 엔트리
// 접속: /policy-bot.html (프로토타입 본체 주소와 분리)
import { createRoot } from "react-dom/client";
import { PolicyBotView } from "./app/components/policy-bot-view";
import "./styles/index.css";

function PolicyBotApp() {
  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 35%, #E9EAFB 75%, #C9CCF4 100%)",
      }}
    >
      <PolicyBotView />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<PolicyBotApp />);
