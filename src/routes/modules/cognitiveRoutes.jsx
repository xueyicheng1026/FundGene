import React, { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { COGNITIVE, COGNITIVE_CHAT } from '../constants';

// 使用React.lazy实现组件懒加载
const ChatInterface = lazy(() => import('../../pages/cognitive/ChatInterface'));
const LearningCenter = lazy(() => import('../../pages/cognitive/LearningCenter'));
const CourseDetail = lazy(() => import('../../pages/cognitive/CourseDetail'));
const ScenarioSimulation = lazy(() => import('../../pages/cognitive/ScenarioSimulation'));

// 认知诊断与教学模块路由配置
const cognitiveRoutes = {
  path: 'cognitive',
  children: [
    {
      index: true,
      element: <Navigate to={COGNITIVE_CHAT} replace />
    },
    {
      path: 'chat',
      element: <ChatInterface />,
      meta: {
        title: 'AI 助手对话',
        icon: 'chat',
        requireAuth: true
      }
    },
    {
      path: 'learning',
      element: <LearningCenter />,
      meta: {
        title: '学习中心',
        icon: 'book',
        requireAuth: true
      }
    },
    {
      path: 'learning/course/:courseId',
      element: <CourseDetail />,
      meta: {
        title: '课程详情',
        hideInMenu: true,
        requireAuth: true
      }
    },
    {
      path: 'simulation',
      element: <ScenarioSimulation />,
      meta: {
        title: '场景模拟',
        icon: 'simulation',
        requireAuth: true
      }
    }
  ]
};

export default cognitiveRoutes;