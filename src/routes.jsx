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
// 临时工具函数来创建占位组件
const PlaceholderComponent = (name) => () => <div>正在开发中: {name} 组件</div>;
const PortfolioRebalance = PlaceholderComponent('投资组合再平衡');
const DecisionComparison = PlaceholderComponent('决策对比');

// 信息解读相关页面
import NewsAnalysis from './pages/information/NewsAnalysis';
import PolicyAnalysis from './pages/information/PolicyAnalysis';

// 创建路由配置
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      // 主页
      { index: true, element: <Dashboard /> },
      
      // 认知诊断与教学
      {
        path: 'cognitive',
        children: [
          { index: true, element: <Navigate to="/cognitive/chat" replace /> },
          { path: 'chat', element: <ChatInterface /> },
          { path: 'learning', element: <LearningCenter /> }, // 学习中心路由
          { path: 'learning/course/:courseId', element: <CourseDetail /> }, // 课程详情路由
          { path: 'simulation', element: <ScenarioSimulation /> }
        ]
      },
      
      // 行为矫正
      {
        path: 'behavior',
        element: <BehaviorCorrection />,
        children: [
          { index: true, element: <Navigate to="/behavior/profile" replace /> },
          { path: 'profile', element: <BehaviorProfile /> },
          { path: 'trading', element: <TradingSimulation /> },
          { path: 'alerts', element: <BehaviorAlerts /> }
        ]
      },
      
      // 决策支持
      {
        path: 'decision',
        children: [
          { index: true, element: <Navigate to="/decision/portfolio" replace /> },
          { path: 'portfolio', element: <Portfolio /> },
          { path: 'rebalance', element: <PortfolioRebalance /> },
          { path: 'comparison', element: <DecisionComparison /> }
        ]
      },
      
      // 信息解读
      {
        path: 'information',
        children: [
          { index: true, element: <Navigate to="/information/news" replace /> },
          { path: 'news', element: <NewsAnalysis /> },
          { path: 'policy', element: <PolicyAnalysis /> }
        ]
      }
    ]
  },
  // 其他独立路由
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '*', element: <NotFound /> }
]);

export default router;
