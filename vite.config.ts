import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { policyBotApi } from './server/policy-api.mjs'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig(({ mode }) => ({
  // GitHub Pages는 https://parkeric1104.github.io/Expert2prototype/ 하위 경로로 서빙되므로
  // 프로덕션 빌드에서만 base를 레포명으로 지정 (개발/프리뷰는 루트 유지)
  base: mode === 'production' ? '/Expert2prototype/' : '/',
  plugins: [
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
    // 기획 정책 챗봇 로컬 API (POC) — 개발서버에서만 동작, 데이터는 data/policy-bot.db
    policyBotApi(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        // 멀티 페이지: 프로토타입 본체 + 내부용 기획 정책 챗봇(별도 주소 /policy-bot.html)
        main: path.resolve(__dirname, 'index.html'),
        policyBot: path.resolve(__dirname, 'policy-bot.html'),
      },
    },
  },
  server: {
    // 다른 인스턴스(5173)와 포트 충돌 방지
    port: 5273,
    strictPort: true,
  },
}))
