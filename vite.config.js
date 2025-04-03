import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [
      react(),
      // 添加 PWA 支持
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'logo192.png', 'robots.txt'],
        manifest: {
          name: 'FundGene - 基于AI的基金投资助手',
          short_name: 'FundGene',
          description: '基于AI的基金投资助手，帮助您做出更理性的投资决策',
          theme_color: '#2563eb',
          icons: [
            {
              src: 'logo192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'logo512.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        }
      }),
      // 在分析模式下添加打包分析插件
      mode === 'analyze' ? visualizer({
        open: true,
        filename: 'dist/stats.html',
        gzipSize: true,
        brotliSize: true
      }) : null
    ],
    server: {
      port: 3000,
      open: true
    },
    resolve: {
      alias: {
        '@': '/src'
      }
    },
    // 使用相对路径而不是相对根目录
    base: './',
    build: {
      // 在生产模式下禁用源码映射
      sourcemap: process.env.NODE_ENV !== 'production',
      // 确保生成正确的资源引用路径
      assetsDir: 'assets',
      // 改善大型项目性能
      chunkSizeWarningLimit: 1500,
      // 确保生成HTML文件
      emptyOutDir: true,
      // 将CSS提取到单独文件
      cssCodeSplit: true,
      // 添加manifest
      manifest: true,
      // 优化打包大小
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            charts: ['recharts'],
            ui: ['antd', '@ant-design/icons']
          }
        }
      }
    }
  }
})
