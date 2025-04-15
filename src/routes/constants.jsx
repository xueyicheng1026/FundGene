/**
 * 路由路径常量
 * 集中管理所有路由路径，避免硬编码
 */

// 基础路径
export const ROOT = '/';
export const DASHBOARD = '/dashboard';
export const LOGIN = '/login';
export const REGISTER = '/register';

// 认知诊断模块
export const COGNITIVE = `${DASHBOARD}/cognitive`;
export const COGNITIVE_CHAT = `${COGNITIVE}/chat`;
export const COGNITIVE_LEARNING = `${COGNITIVE}/learning`;
export const COGNITIVE_COURSE_DETAIL = `${COGNITIVE_LEARNING}/course/:courseId`;
export const COGNITIVE_SIMULATION = `${COGNITIVE}/simulation`;

// 行为矫正模块
export const BEHAVIOR = `${DASHBOARD}/behavior`;
export const BEHAVIOR_PROFILE = `${BEHAVIOR}/profile`;
export const BEHAVIOR_TRADING = `${BEHAVIOR}/trading`;
export const BEHAVIOR_ALERTS = `${BEHAVIOR}/alerts`;
export const BEHAVIOR_CORRECTION = `${BEHAVIOR}/correction`;

// 决策支持模块
export const DECISION = `${DASHBOARD}/decision`;
export const DECISION_PORTFOLIO = `${DECISION}/portfolio`;
export const DECISION_REBALANCE = `${DECISION}/rebalance`;
export const DECISION_COMPARISON = `${DECISION}/comparison`;

// 信息解读模块
export const INFORMATION = `${DASHBOARD}/information`;
export const INFORMATION_NEWS = `${INFORMATION}/news`;
export const INFORMATION_POLICY = `${INFORMATION}/policy`;

// 用户模块
export const USER = `${DASHBOARD}/user`;
export const USER_PROFILE = `${USER}/profile`;
export const USER_SETTINGS = `${USER}/settings`;

// 错误页面
export const NOT_FOUND = '*';