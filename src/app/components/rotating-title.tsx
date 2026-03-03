import { useState, useEffect } from "react";

const TITLE_MESSAGES = [
  "복잡한 노무 고민, AI 노무도우미가 해결해드려요.",
  "질문과 관련된 모든 정보를 바탕으로 의견을 드릴 수 있습니다.",
  "노무 기준과 실제 사례를 함께 고려해 안내해드립니다.",
  "상황에 맞는 노무 판단을 AI가 도와드립니다.",
  "하나의 질문으로 노무 전반을 확인해보세요.",
];

export function RotatingTitle() {
  return (
    <div className="w-full max-w-4xl mx-auto h-32 flex items-center justify-center relative">
      {/* 타이틀 텍스트 */}
      <div className="relative z-10 text-center">
        <h1 className="text-5xl font-bold text-foreground leading-tight">
          노무 고민이 있으신가요?
          <br />
          지금 바로 물어보세요.
        </h1>
      </div>
    </div>
  );
}