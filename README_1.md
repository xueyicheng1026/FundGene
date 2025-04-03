# FundGene 项目文件结构与说明

本文档介绍 FundGene 项目的文件结构、各文件用途及其关系。

## 项目概述

FundGene 是一个基于 AI 的基金投资助手，旨在帮助入门级投资者建立健康的投资行为，提高投资决策质量。项目使用 React、Vite、Ant Design 和 Recharts 等技术栈构建。

## 项目根目录文件

| 文件                    | 用途                                                    |
|------------------------|----------------------------------------------------------|
| `.env`                 | 环境变量配置文件，存储API密钥、服务URL等敏感或环境特定配置  |
| `.gitignore`           | Git版本控制忽略文件列表，防止敏感信息、构建文件等提交到仓库 |
| `capacitor.config.json`| Capacitor配置文件，用于移动应用构建的配置信息            |
| `index.html`           | 应用入口HTML文件，是SPA应用的容器和初始加载页面          |
| `netlify.toml`         | Netlify部署配置文件，定义构建命令和网站发布设置          |
| `package-lock.json`    | NPM依赖锁定文件，确保团队成员使用相同的依赖版本          |
| `package.json`         | 项目配置文件，包含依赖列表、脚本命令和项目元数据          |
| `tsconfig.json`        | TypeScript配置文件，定义编译选项和类型检查规则           |
| `vite.config.js`       | Vite构建工具配置文件，定义开发服务器、构建选项和插件设置  |

### 主要配置文件详情

#### package.json

包含了项目的所有依赖项和脚本命令：

- **依赖项**：React、Ant Design、Axios、Recharts等前端库
- **开发依赖**：Vite、ESLint、Capacitor（移动开发工具）等
- **脚本命令**：
  - `dev`: 启动开发服务器
  - `build`: 构建生产版本
  - `deploy:netlify/vercel`: 部署到相应服务
  - `prepare-app`: 准备移动应用构建

#### vite.config.js

Vite构建工具配置，包含：

- PWA (Progressive Web App) 支持配置
- 开发服务器设置
- 构建优化选项，如代码分割、资源管理
- 打包分析工具集成
- 路径别名配置（`@`指向`src`目录）

#### tsconfig.json

TypeScript编译器配置：

- 设定目标ECMAScript版本为ES2018
- 启用严格类型检查
- 配置模块解析和JSX支持
- 定义包含的源代码文件和排除的目录

## 公共资源目录 (`public/`)

包含静态资源文件：

| 文件                | 用途                                                      |
|--------------------|----------------------------------------------------------|
| `favicon.svg`      | 网站图标                                                   |
| `logo192.png`      | PWA 和移动应用小尺寸图标                                    |
| `logo512.png`      | PWA 和移动应用大尺寸图标                                    |
| `manifest.json`    | PWA 配置文件，定义应用名称、图标和主题颜色                      |
| `robots.txt`       | 搜索引擎爬虫指令文件                                         |
| `serviceWorker.js` | 服务工作线程脚本，实现 PWA 离线功能和缓存策略                   |
| `_redirects`       | Netlify 重定向规则，确保 SPA 路由正常工作                     |
| `assets/`          | 静态资源目录，包含图片、图标等资源文件                           |

## 源代码目录 (`src/`)

### 核心文件

| 文件                 | 用途                                                      |
|---------------------|----------------------------------------------------------|
| `App.jsx`           | 应用根组件                                                 |
| `App.css`           | 应用根组件样式                                              |
| `index.jsx`         | 应用入口点，渲染根组件到 DOM                                 |
| `index.css`         | 全局样式                                                   |
| `routes.jsx`        | 路由配置，定义应用的页面结构和导航                             |
| `main.jsx`          | 应用主入口文件，配置providers和路由                           |

### 样式文件 (`src/styles/`)

| 文件                     | 用途                                                 |
|-------------------------|----------------------------------------------------|
| `variables.css`         | CSS 变量定义，包含颜色、字体等基础变量                   |
| `globals.css`           | 全局样式规则                                          |
| `responsive-variables.css` | 响应式布局变量，定义断点和相关尺寸                    |

### 上下文管理 (`src/contexts/`)

提供全局状态管理：

| 文件                        | 用途                                                 |
|----------------------------|-----------------------------------------------------|
| `AuthContext.jsx`          | 认证上下文，管理用户登录状态和认证信息                    |
| `ThemeContext.jsx`         | 主题上下文，管理应用主题设置（深色/浅色模式）              |


### 服务层 (`src/services/`)

提供数据和 API 交互功能：

| 文件                   | 用途                                                    |
|-----------------------|--------------------------------------------------------|
| `tradingService.js`   | 交易和市场数据服务，提供市场概览等数据                      |
| `portfolioService.js` | 投资组合服务，提供投资组合数据和分析功能                     |
| `mockData.js`         | 模拟数据，提供开发和演示用的测试数据                        |
| `mockApi.js`          | 模拟 API 服务，提供政策解读和新闻分析等数据                 |
| `learningService.js`  | 学习资源服务，提供课程和学习进度数据                        |
| `behaviorService.js`  | 行为分析服务，提供用户行为模式和偏差分析                     |
| `policyService.js`    | 政策分析服务，提供政策解读和影响评估                        |
| `newsService.js`      | 新闻分析服务，提供财经新闻解读和市场影响评估                  |
| `chatService.js`      | 聊天服务，处理AI助手对话和反馈                             |
| `baseService.js`      | 基础服务层模块，提供通用API调用方法和错误处理                |

### 组件 (`src/components/`)

#### 布局组件

| 文件                      | 用途                                              |
|--------------------------|--------------------------------------------------|
| `Layout.jsx`             | 主布局组件，包含侧边栏、头部和内容区                   |
| `Layout.css`             | 布局组件样式                                        |
| `layout/Header.jsx`      | 顶部导航栏组件                                      |
| `layout/Header.css`      | 顶部导航栏样式                                      |
| `layout/Sidebar.jsx`     | 侧边导航栏组件                                      |
| `layout/Sidebar.css`     | 侧边导航栏样式                                      |
| `layout/Footer.jsx`      | 页脚组件                                           |
| `layout/Footer.css`      | 页脚样式                                           |

#### 通用组件

| 文件                        | 用途                                             |
|----------------------------|-------------------------------------------------|
| `common/Card.jsx`          | 卡片容器组件，用于内容展示                          |
| `common/Button.jsx`        | 按钮组件                                          |
| `common/Loading.jsx`       | 加载状态组件                                      |
| `common/Input.jsx`         | 输入框组件                                        |
| `common/Modal.jsx`         | 模态框组件                                        |
| `common/Tabs.jsx`          | 标签页组件                                        |

#### 图表组件

| 文件                          | 用途                                           |
|------------------------------|-----------------------------------------------|
| `charts/PortfolioChart.jsx`  | 投资组合饼图组件，展示资产配置                    |
| `charts/BehaviorRadar.jsx`   | 行为雷达图，展示用户各项行为特征的强弱程度         |
| `charts/PerformanceChart.jsx`| 表现趋势图，展示投资组合历史表现                 |

#### 交易组件

| 文件                           | 用途                                          |
|-------------------------------|----------------------------------------------|
| `trading/TradeForm.jsx`       | 交易表单组件，用于买卖操作                      |
| `trading/PortfolioSummary.jsx`| 投资组合概览组件，展示总资产和收益               |
| `trading/MarketOverview.jsx`  | 市场概览组件，展示指数和热门基金                 |
| `trading/Trading.css`         | 交易相关组件的共享样式                          |
| `trading/TradingHistory.jsx`  | 交易历史记录组件                                |


#### 行为分析组件

| 文件                              | 用途                                        |
|----------------------------------|---------------------------------------------|
| `behavior/BehaviorFeedback.jsx`  | 行为反馈组件，提供基于交易行为的反馈和建议      |
| `behavior/Behavior.css`          | 行为组件共享样式                              |

#### 聊天和交互组件

| 文件                               | 用途                                         |
|-----------------------------------|----------------------------------------------|
| `chat/ChatWindow.jsx`            | 聊天窗口组件，用于与AI顾问交互                 |
| `chat/MessageBubble.jsx`         | 消息气泡组件，展示聊天对话中的单条消息         |
| `chat/ChatSuggestions.jsx`       | 聊天建议组件，提供预设问题和快速回复选项       |
| `chat/Chat.css`                  | 聊天相关组件的共享样式                        |

### 页面 (`src/pages/`)

#### 仪表盘

| 文件                 | 用途                                                     |
|---------------------|----------------------------------------------------------|
| `Dashboard.jsx`     | 仪表盘/主页，提供整体概览和功能入口                         |
| `Dashboard.css`     | 仪表盘页面样式                                             |

#### 认知诊断与教学

| 文件                                 | 用途                                       |
|-------------------------------------|-------------------------------------------|
| `cognitive/ChatInterface.jsx`       | AI 聊天界面，用于知识问答和诊断              |
| `cognitive/ChatInterface.css`       | 聊天界面样式                                |
| `cognitive/LearningCenter.jsx`      | 学习中心，提供学习资源和课程                 |
| `cognitive/LearningCenter.css`      | 学习中心样式                                |
| `cognitive/CourseDetail.jsx`        | 课程详情页面，展示特定课程内容               |
| `cognitive/CourseDetail.css`        | 课程详情页面样式                            |
| `cognitive/ScenarioSimulation.jsx`  | 场景模拟页面，提供投资场景练习               |
| `cognitive/ScenarioSimulation.css`  | 场景模拟页面样式                            |

#### 行为矫正

| 文件                              | 用途                                         |
|----------------------------------|---------------------------------------------|
| `behavior/BehaviorCorrection.jsx`| 行为矫正页面，整合行为分析和建议               |
| `behavior/BehaviorCorrection.css`| 行为矫正页面样式                              |
| `behavior/BehaviorProfile.jsx`   | 行为画像页面，展示用户行为特征和偏差           |
| `behavior/BehaviorProfile.css`   | 行为画像页面样式                              |
| `behavior/TradingSimulation.jsx` | 交易模拟页面，提供练习环境                     |
| `behavior/TradingSimulation.css` | 交易模拟页面样式                              |
| `behavior/TradingSimulator.jsx`  | 交易模拟器组件，为模拟交易提供核心功能         |
| `behavior/BehaviorAlerts.jsx`    | 行为提醒页面，展示行为警告和建议               |
| `behavior/BehaviorAlerts.css`    | 行为提醒页面样式                              |

#### 决策支持

| 文件                                | 用途                                    |
|------------------------------------|----------------------------------------|
| `decision/Portfolio.jsx`           | 投资组合分析页面，展示资产配置和风险指标   |
| `decision/Portfolio.css`           | 投资组合页面样式                         |
| `decision/PortfolioRebalance.jsx`  | 投资组合再平衡页面                       |
| `decision/DecisionComparison.jsx`  | 决策对比页面，比较不同投资策略            |

#### 信息解读

| 文件                            | 用途                                         |
|--------------------------------|---------------------------------------------|
| `information/NewsAnalysis.jsx` | 新闻分析页面，展示解读后的新闻影响             |
| `information/NewsAnalysis.css` | 新闻分析页面样式                              |
| `information/PolicyAnalysis.jsx`| 政策解读页面，展示政策变化对投资的影响        |
| `information/PolicyAnalysis.css`| 政策解读页面样式                             |

### 其他页面

| 文件               | 用途                                                |
|-------------------|------------------------------------------------------|
| `Login.jsx`       | 登录页面                                             |
| `Register.jsx`    | 注册页面                                             |
| `NotFound.jsx`    | 404 错误页面                                         |
| `NotFound.css`    | 404 错误页面样式                                     |

### 工具和辅助 (`src/utils/`)

| 文件                      | 用途                                             |
|--------------------------|--------------------------------------------------|
| `formatter.js`           | 数据格式化工具，处理货币、日期等格式               |


### 钩子 (`src/hooks/`)

| 文件                      | 用途                                              |
|--------------------------|---------------------------------------------------|
| `useBehaviorData.js`         | 行为数据钩子                                |

### 资源文件 (`src/assets/`)

| 文件                      | 用途                                             |
|--------------------------|--------------------------------------------------|
| `icons/`                 | 图标资源目录，包含应用使用的SVG图标               |
| `images/`                | 图像资源目录，包含应用使用的各种图片资源          |
| `fonts/`                 | 字体资源目录，包含应用使用的自定义字体文件        |

## 文件关系梳理

1. **入口链路**：
   - `index.html` → `index.jsx`/`main.jsx` → `App.jsx` → `routes.jsx` → 各页面组件

2. **样式继承关系**：
   - `variables.css` 被 `globals.css` 和 `responsive-variables.css` 使用
   - 各组件样式文件（如 `BehaviorCorrection.css`）继承全局样式并定义特定样式

3. **组件与服务关系**：
   - 页面组件（如 `Portfolio.jsx`）调用对应服务（如 `portfolioService.js`）获取数据
   - 页面组件使用通用组件（如 `Card.jsx`）和图表组件（如 `PortfolioChart.jsx`）构建界面
   - 服务层组件与上下文（contexts）交互，管理全局状态

4. **布局与页面关系**：
   - `Layout.jsx` 作为容器包裹所有页面内容，提供一致的导航和结构
   - 各页面组件在 `routes.jsx` 中注册，并在 `Layout` 内部的 `Outlet` 位置渲染
   - `Header.jsx`、`Sidebar.jsx` 和 `Footer.jsx` 提供统一的导航和页面结构

5. **模拟数据流**：
   - 开发环境中，服务层组件（如 `tradingService.js`）使用 `mockData.js` 和 `mockApi.js` 提供数据
   - 这些模拟数据可以无缝替换为实际的API调用，保持应用结构不变

6. **上下文与钩子协作**：
   - 上下文组件（如 `AuthContext.jsx`）提供全局状态
   - 自定义钩子（如 `useAuth.js`）封装上下文使用，简化组件中的状态管理

7. **服务层分层关系**：
   - `baseService.js` 作为基础服务层，提供通用的API请求方法和错误处理
   - 其他服务如 `tradingService.js`、`portfolioService.js` 等基于 `baseService.js` 构建特定功能的API调用
   - 开发环境中的模拟API (`mockApi.js`) 实现相同接口，使得服务层可以无缝切换真实和模拟数据源

这些文件共同构成了一个完整的前端应用架构，实现了 FundGene 作为基金投资助手的各项功能。
