import React, { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { BEHAVIOR, BEHAVIOR_PROFILE } from '../constants';

// 使用React.lazy实现组件懒加载
const BehaviorProfile = lazy(() => import('../../pages/behavior/BehaviorProfile'));
const TradingSimulation = lazy(() => import('../../pages/behavior/TradingSimulation'));
const BehaviorAlerts = lazy(() => import('../../pages/behavior/BehaviorAlerts'));
const BehaviorCorrection = lazy(() => import('../../pages/behavior/BehaviorCorrection'));

// 行为矫正模块路由配置
const behaviorRoutes = {
  path: 'behavior',
  children: [
    {
      index: true,
      element: <Navigate to={BEHAVIOR_PROFILE} replace />
    },
    {
      path: 'profile',
      element: <BehaviorProfile />,
      meta: {
        title: '行为画像',
        icon: 'profile',
        requireAuth: true
      }
    },
    {
      path: 'trading',
      element: <TradingSimulation />,
      meta: {
        title: '模拟交易',
        icon: 'trading',
        requireAuth: true
      }
    },
    {
      path: 'alerts',
      element: <BehaviorAlerts />,
      meta: {
        title: '行为提醒',
        icon: 'alert',
        requireAuth: true,
        badge: true // 表示可能显示提醒数量
      }
    },
    {
      path: 'correction',
      element: <BehaviorCorrection />,
      meta: {
        title: '行为矫正',
        icon: 'correction',
        requireAuth: true
      }
    }
  ]
};

export default behaviorRoutes;