import React, { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { INFORMATION, INFORMATION_NEWS } from '../constants';

// 使用React.lazy实现组件懒加载
const NewsAnalysis = lazy(() => import('../../pages/information/NewsAnalysis'));
const PolicyAnalysis = lazy(() => import('../../pages/information/PolicyAnalysis'));

// 信息解读模块路由配置
const informationRoutes = {
  path: 'information',
  children: [
    {
      index: true,
      element: <Navigate to={INFORMATION_NEWS} replace />
    },
    {
      path: 'news',
      element: <NewsAnalysis />,
      meta: {
        title: '新闻解读',
        icon: 'news',
        requireAuth: true
      }
    },
    {
      path: 'policy',
      element: <PolicyAnalysis />,
      meta: {
        title: '政策解读',
        icon: 'policy',
        requireAuth: true
      }
    }
  ]
};

export default informationRoutes;