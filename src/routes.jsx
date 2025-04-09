import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from './components/Layout';

// 页面导入
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

// 认知诊断相关页面
import ChatInterface from './pages/cognitive/ChatInterface';
import ScenarioSimulation from './pages/cognitive/ScenarioSimulation';
// 学习中心组件
import LearningCenter from './pages/cognitive/LearningCenter';
import CourseDetail from './pages/cognitive/CourseDetail';

// 行为矫正相关页面
import BehaviorCorrection from './pages/behavior/BehaviorCorrection';
import BehaviorProfile from './pages/behavior/BehaviorProfile';
import TradingSimulation from './pages/behavior/TradingSimulation';
import BehaviorAlerts from './pages/behavior/BehaviorAlerts';

// 决策支持相关页面
import Portfolio from './pages/decision/Portfolio';
// 引入真实的投资组合再平衡组件替换占位组件
import PortfolioRebalancePage from './pages/decision/PortfolioRebalance';
// 临时工具函数来创建占位组件
const PlaceholderComponent = (name) => () => <div>正在开发中: {name} 组件</div>;
const DecisionComparison = PlaceholderComponent('决策对比');

// 信息解读相关页面
import NewsAnalysis from './pages/information/NewsAnalysis';
import PolicyAnalysis from './pages/information/PolicyAnalysis';

// 用户相关页面
import UserProfile from './pages/user/UserProfile';
import UserSettings from './pages/user/UserSettings';

// 创建路由配置
const router = createBrowserRouter([
  // 将根路径重定向到登录页面
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />
  },
  // 登录、注册等公共页面
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  
  // 应用内部路由，需要登录后访问
  {
    path: '/dashboard',
    element: <Layout />,
    children: [
      // 主页
      { index: true, element: <Dashboard /> },
      
      // 认知诊断与教学
      {
        path: 'cognitive',
        children: [
          { index: true, element: <Navigate to="/dashboard/cognitive/chat" replace /> },
          { path: 'chat', element: <ChatInterface /> },
          { path: 'learning', element: <LearningCenter /> }, // 学习中心路由
          { path: 'learning/course/:courseId', element: <CourseDetail /> }, // 课程详情路由
          { path: 'simulation', element: <ScenarioSimulation /> }
        ]
      },
      
      // 行为矫正 - 修改路由结构，去掉不必要的包装元素
      {
        path: 'behavior',
        children: [
          { index: true, element: <Navigate to="/dashboard/behavior/profile" replace /> },
          { path: 'profile', element: <BehaviorProfile /> },
          { path: 'trading', element: <TradingSimulation /> },
          { path: 'alerts', element: <BehaviorAlerts /> },
          // 添加一个包含所有子路由的BehaviorCorrection路由
          { path: 'correction', element: <BehaviorCorrection /> }
        ]
      },
      
      // 决策支持
      {
        path: 'decision',
        children: [
          { index: true, element: <Navigate to="/dashboard/decision/portfolio" replace /> },
          { path: 'portfolio', element: <Portfolio /> },
          { path: 'rebalance', element: <PortfolioRebalancePage /> },
          { path: 'comparison', element: <DecisionComparison /> }
        ]
      },
      
      // 信息解读
      {
        path: 'information',
        children: [
          { index: true, element: <Navigate to="/dashboard/information/news" replace /> },
          { path: 'news', element: <NewsAnalysis /> },
          { path: 'policy', element: <PolicyAnalysis /> }
        ]
      },
      
      // 用户相关页面
      {
        path: 'user',
        children: [
          { index: true, element: <Navigate to="/dashboard/user/profile" replace /> },
          { path: 'profile', element: <UserProfile /> },
          { path: 'settings', element: <UserSettings /> }
        ]
      }
    ]
  },
  // 其他独立路由
  { path: '*', element: <NotFound /> }
]);

export default router;
