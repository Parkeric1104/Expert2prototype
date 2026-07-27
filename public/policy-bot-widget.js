/**
 * 기획 정책 챗봇 — 임베드 위젯 로더 (내부용)
 *
 * 어떤 페이지든 아래 한 줄로 우측 하단 플로팅 챗봇이 붙는다:
 *   <script src="https://parkeric1104.github.io/Expert2prototype/policy-bot-widget.js" defer></script>
 *
 * 옵션 (script 태그의 data- 속성):
 *   data-src   챗봇 페이지 URL 오버라이드 (기본: 이 스크립트와 같은 경로의 policy-bot.html)
 *   data-title 패널 상단에 표시할 제목 (기본: 기획 정책 챗봇)
 *
 * 의존성 없음(바닐라 JS). 호스트 페이지 스타일과 충돌하지 않도록 모든 스타일은 인라인.
 */
(function () {
  if (window.__policyBotWidgetLoaded) return;
  window.__policyBotWidgetLoaded = true;

  var script = document.currentScript;
  var botSrc =
    (script && script.getAttribute("data-src")) ||
    (script && script.src
      ? script.src.replace(/policy-bot-widget\.js.*$/, "policy-bot.html")
      : "./policy-bot.html");
  // 임베드 모드 플래그 (챗봇 쪽에서 헤더 링크 등을 숨김)
  botSrc += (botSrc.indexOf("?") >= 0 ? "&" : "?") + "embed=1";
  var title = (script && script.getAttribute("data-title")) || "기획 정책 챗봇";

  var Z = 2147483000;
  var INDIGO = "#6366F1";

  // ── 플로팅 버튼 ──
  var btn = document.createElement("button");
  btn.setAttribute("aria-label", title + " 열기");
  btn.style.cssText =
    "position:fixed;right:24px;bottom:24px;width:56px;height:56px;border-radius:9999px;" +
    "background:" + INDIGO + ";color:#fff;border:none;cursor:pointer;z-index:" + Z + ";" +
    "box-shadow:0 8px 24px rgba(99,102,241,.4);display:flex;align-items:center;justify-content:center;" +
    "transition:transform .15s ease,opacity .15s ease;";
  btn.onmouseenter = function () { btn.style.transform = "scale(1.06)"; };
  btn.onmouseleave = function () { btn.style.transform = "scale(1)"; };
  // 책+말풍선 아이콘 (inline SVG)
  var iconOpen =
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></svg>';
  var iconClose =
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
  btn.innerHTML = iconOpen;

  // ── 패널(iframe 컨테이너) ──
  var panel = document.createElement("div");
  panel.style.cssText =
    "position:fixed;right:24px;bottom:92px;width:min(400px,calc(100vw - 32px));" +
    "height:min(640px,calc(100vh - 120px));z-index:" + Z + ";display:none;" +
    "border-radius:16px;overflow:hidden;background:#fff;" +
    "box-shadow:0 20px 60px rgba(26,26,30,.28);border:1px solid rgba(229,229,235,.8);";

  var iframe = document.createElement("iframe");
  iframe.title = title;
  iframe.style.cssText = "width:100%;height:100%;border:none;display:block;";
  // 열 때 최초 1회만 로드 (호스트 페이지 초기 로딩에 영향 없음)
  var loaded = false;

  panel.appendChild(iframe);

  var open = false;
  btn.addEventListener("click", function () {
    open = !open;
    if (open && !loaded) {
      iframe.src = botSrc;
      loaded = true;
    }
    panel.style.display = open ? "block" : "none";
    btn.innerHTML = open ? iconClose : iconOpen;
    btn.setAttribute("aria-label", title + (open ? " 닫기" : " 열기"));
  });

  function mount() {
    document.body.appendChild(panel);
    document.body.appendChild(btn);
  }
  if (document.body) mount();
  else document.addEventListener("DOMContentLoaded", mount);
})();
