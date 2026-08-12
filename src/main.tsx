
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import { BOApp } from "./app/bo/BOApp.tsx";
  import "./styles/index.css";

  // BO 진입 규칙:
  // - 서비스 서버(npm run dev, 배포): URL ?bo 로 진입
  // - BO 전용 서버(npm run dev:bo, 포트 5283, VITE_BO=1): 루트(/)가 바로 BO, ?service 는 서비스 화면
  //   ⚠️ localStorage는 포트(origin)별 분리 — BO 포트에서의 무배포 반영 확인은 같은 포트의 ?service 로 한다.
  const params = new URLSearchParams(window.location.search);
  const boPort = import.meta.env.VITE_BO === "1";
  const isBO = params.has("bo") || (boPort && !params.has("service"));

  createRoot(document.getElementById("root")!).render(isBO ? <BOApp /> : <App />);
