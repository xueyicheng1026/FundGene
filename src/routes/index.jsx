import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import RouteGuard from './RouteGuard';
import Layout from '../components/Layout';
import { ROOT, DASHBOARD, LOGIN, REGISTER, NOT_FOUND } from './constants';

// 导入各模块路由
import cognitiveRoutes from './modules/cognitiveRoutes';
import behaviorRoutes from './modules/behaviorRoutes';
import decisionRoutes from './modules/decisionRoutes';
import informationRoutes from './modules/informationRoutes';
import userRoutes from './modules/userRoutes';

// 使用React.lazy实现组件懒加载
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const NotFound = lazy(() => import('../pages/NotFound'));

// 加载中组件
const LoadingFallback = () => (
  <div className="page-loading">
    <div className="loading-spinner"></div>
    <p>页面加载中...</p>
  </div>
);

// 为懒加载组件添加Suspense包装
const withSuspense = (Component) => (
  <Suspense fallback={<LoadingFallback />}>
    <Component />
  </Suspense>
);

// 为需要认证的路由添加RouteGuard包装
const withAuth = (Component, options = {}) => (
  <RouteGuard requireAuth={options.requireAuth} allowedRoles={options.allowedRoles}>
    <Suspense fallback={<LoadingFallback />}>
      <Component />
    </Suspense>
  </RouteGuard>
);

// 递归处理路由配置，添加Suspense和RouteGuard包装
const processRoutes = (routes) => {
  if (!routes.children) {
    return routes;
  }

  return {
    ...routes,
    children: routes.children.map(route => {
      // 如果是重定向路由，不需要特殊处理
      if (route.element && route.element.type === Navigate) {
        return route;
      }

      // 如果有子路由，递归处理
      if (route.children) {
        return processRoutes(route);
      }

      // 处理路由元数据和认证
      const meta = route.meta || {};
      const requireAuth = meta.requireAuth !== false; // 默认需要认证

      // 应用RouteGuard和Suspense
      return {
        ...route,
        element: withAuth(
          () => route.element,
          { requireAuth, allowedRoles: meta.allowedRoles }
        )
      };
    })
  };
};

// 创建路由配置
const router = createBrowserRouter([
  // 根路径重定向到仪表盘
  {
    path: ROOT,
    element: <Navigate to={DASHBOARD} replace />
  },
  
  // 公共页面 - 不需要认证
  {
    path: LOGIN,
    element: withSuspense(Login)
  },
  {
    path: REGISTER,
    element: withSuspense(Register)
  },
  
  // 应用主布局 - 需要认证
  {
    path: DASHBOARD,
    element: (
      <RouteGuard>
        <Layout />
      </RouteGuard>
    ),
    children: [
      // 仪表盘页面
      {
        index: true,
        element: withSuspense(Dashboard)
      },
      
      // 各模块路由
      processRoutes(cognitiveRoutes),
      processRoutes(behaviorRoutes),
      processRoutes(decisionRoutes),
      processRoutes(informationRoutes),
      processRoutes(userRoutes)
    ]
  },
  
  // 404页面
  {
    path: NOT_FOUND,
    element: withSuspense(NotFound)
  }
]);

export default router;