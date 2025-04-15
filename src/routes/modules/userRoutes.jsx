import React, { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { USER, USER_PROFILE } from '../constants';

// 使用React.lazy实现组件懒加载
const UserProfile = lazy(() => import('../../pages/user/UserProfile'));
const UserSettings = lazy(() => import('../../pages/user/UserSettings'));

// 用户模块路由配置
const userRoutes = {
  path: 'user',
  children: [
    {
      index: true,
      element: <Navigate to={USER_PROFILE} replace />
    },
    {
      path: 'profile',
      element: <UserProfile />,
      meta: {
        title: '个人资料',
        icon: 'user',
        requireAuth: true
      }
    },
    {
      path: 'settings',
      element: <UserSettings />,
      meta: {
        title: '账户设置',
        icon: 'settings',
        requireAuth: true
      }
    }
  ]
};

export default userRoutes;