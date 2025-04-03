# FundGene - 基于AI的基金投资助手

FundGene是一个面向入门级基金投资者的智能助手，旨在帮助用户建立健康的投资行为，提高投资决策质量。

## 项目特点

- **认知诊断与教学**：通过AI聊天和场景模拟，帮助用户理解投资基础知识
- **行为矫正**：分析用户行为模式，识别偏差，并提供改进建议
- **智能决策支持**：提供投资组合分析和再平衡建议
- **信息解读**：对市场资讯和政策进行智能解读

## 快速开始

确保你已安装 Node.js (>= 16.0.0) 和 npm (>= 8.0.0)。

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 部署指南

### 网站部署

项目已配置好用于部署的相关设置，可以轻松部署到各种托管服务：

#### Netlify部署

```bash
# 安装Netlify CLI
npm install -g netlify-cli

# 部署到Netlify
npm run deploy:netlify
```

#### Vercel部署

```bash
# 安装Vercel CLI
npm install -g vercel

# 部署到Vercel
npm run deploy:vercel
```

#### 部署到其他静态托管服务

1. 构建项目：`npm run build`
2. 将`dist`目录的内容上传到托管服务

### 移动应用构建

项目使用Capacitor将Web应用转换为原生移动应用：

#### 初始配置

```bash
# 安装Capacitor
npm install

# 构建项目并同步到Capacitor
npm run prepare-app
```

#### Android应用构建

```bash
# 添加Android平台
npx cap add android

# 打开Android Studio
npx cap open android
```

#### iOS应用构建

```bash
# 添加iOS平台
npx cap add ios

# 打开Xcode
npx cap open ios
```

## 技术栈

- React 18
- TypeScript
- Vite
- React Router
- Recharts (图表库)
- Capacitor (移动应用框架)

## 项目结构

```
src/
├── components/       # 可复用组件
├── contexts/         # React上下文
├── hooks/            # 自定义钩子
├── pages/            # 页面组件
├── services/         # API服务
├── styles/           # 全局样式
└── utils/            # 工具函数
```

## PWA支持

项目已配置为渐进式Web应用(PWA)，支持：
- 离线访问
- 主屏幕安装
- 原生应用体验

## UI设计指南

### 答辩UI设计目标
创建一个视觉吸引力强的UI原型，用于答辩展示FundGene的核心功能和用户体验。原型不需要完整的后端功能，但必须看起来可信，并清晰展示项目的创新点。

### 设计原则
1. **清晰性**：明确展示用户能做什么以及系统如何帮助他们
2. **突出创新**：强调独特功能（AI聊天、行为反馈、场景模拟、决策支持对比）
3. **专业性与信任感**：设计应现代、简洁、可靠，适合金融类应用
4. **以用户为中心**：体现对目标用户（入门级投资者）的理解——保持简单直观
5. **视觉吸引力**：设计要美观，留下积极印象

### 关键页面设计
- **整体框架**：
  - 登录/注册
  - 仪表盘/主页：核心入口
- **认知诊断与教学**：
  - 聊天界面：AI交互（诊断、问答）
  - 学习中心/知识库：主题/概念展示
  - 场景模拟页面：历史场景（如2015年股灾）交互
- **行为矫正**：
  - 行为画像：显示识别的偏差
  - 模拟交易界面：简化版交易视图
  - 反馈/提醒页面：非理性行为提示
- **智能决策支持**：
  - 投资组合概览：可视化持仓和风险指标
  - 再平衡建议页面：AI建议展示
  - 决策对比页面：用户选择 vs AI建议对比
- **信息解读**：
  - 新闻/政策推送：相关新闻列表
  - 交互分析页面：结构化解析展示

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建Pull Request
