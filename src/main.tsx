
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import { BOApp } from "./app/bo/BOApp.tsx";
  import "./styles/index.css";

  // URL ?bo → 운영 백오피스 콘솔(SVC-004), 그 외 → 서비스 화면
  const isBO = new URLSearchParams(window.location.search).has("bo");

  createRoot(document.getElementById("root")!).render(isBO ? <BOApp /> : <App />);
