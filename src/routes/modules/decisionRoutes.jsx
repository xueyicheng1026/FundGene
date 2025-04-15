import React, { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { DECISION, DECISION_PORTFOLIO } from '../constants';

// 使用React.lazy实现组件懒加载
const Portfolio = lazy(() => import('../../pages/decision/Portfolio'));
const PortfolioRebalancePage = lazy(() => import('../../pages/decision/PortfolioRebalance'));
const DecisionComparison = lazy(() => import('../../pages/decision/DecisionComparison'));

// 决策支持模块路由配置
const decisionRoutes = {
  path: 'decision',
  children: [
    {
      index: true,
      element: <Navigate to={DECISION_PORTFOLIO} replace />
    },
    {
      path: 'portfolio',
      element: <Portfolio />,
      meta: {
        title: '投资组合分析',
        icon: 'portfolio',
        requireAuth: true
      }
    },
    {
      path: 'rebalance',
      element: <PortfolioRebalancePage />,
      meta: {
        title: '再平衡建议',
        icon: 'rebalance',
        requireAuth: true
      }
    },
    {
      path: 'comparison',
      element: <DecisionComparison />,
      meta: {
        title: '决策对比',
        icon: 'comparison',
        requireAuth: true,
        developmentStage: 'inProgress' // 标记开发状态
      }
    }
  ]
};

export default decisionRoutes;