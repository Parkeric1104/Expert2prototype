import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


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
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // 프리뷰 하니스가 할당하는 PORT를 우선 사용, 없으면 로컬 개발 기본값 5273
    // (다른 챗/인스턴스와 포트 충돌 시 자동 포트로 안전하게 회피)
    port: process.env.PORT ? Number(process.env.PORT) : 5273,
    strictPort: false,
  },
}))
