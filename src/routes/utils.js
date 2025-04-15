/**
 * 路由工具函数
 * 用于根据路由配置生成菜单和获取路由信息
 */
import { DASHBOARD } from './constants';

/**
 * 从路由配置中提取菜单项
 * @param {Array} routes - 路由配置数组
 * @param {string} parentPath - 父级路径
 * @returns {Array} 菜单项数组
 */
export const generateMenuFromRoutes = (routes, parentPath = '') => {
  if (!routes || !Array.isArray(routes)) return [];

  return routes
    .filter(route => {
      // 过滤掉没有meta的路由或明确标记为不在菜单中显示的路由
      const meta = route.meta || {};
      return meta && meta.title && !meta.hideInMenu;
    })
    .map(route => {
      const meta = route.meta || {};
      const path = parentPath ? `${parentPath}/${route.path}` : route.path;
      const fullPath = path.startsWith('/') ? path : `/${path}`;
      
      // 构建菜单项
      const menuItem = {
        key: fullPath,
        path: fullPath,
        title: meta.title,
        icon: meta.icon,
        badge: meta.badge,
        developmentStage: meta.developmentStage,
        children: []
      };
      
      // 如果有子路由，递归处理
      if (route.children && Array.isArray(route.children)) {
        menuItem.children = generateMenuFromRoutes(route.children, path);
      }
      
      // 只返回有子菜单或没有children字段的菜单项
      return menuItem.children.length > 0 || !route.children ? menuItem : null;
    })
    .filter(Boolean); // 过滤掉空值
};

/**
 * 获取路由的面包屑导航数据
 * @param {string} path - 当前路径
 * @param {Array} routes - 路由配置数组
 * @returns {Array} 面包屑导航数据
 */
export const getBreadcrumbsFromPath = (path, routes) => {
  // 移除开头和结尾的斜杠
  const normalizedPath = path.replace(/^\/|\/$/g, '');
  const pathSegments = normalizedPath.split('/');
  const breadcrumbs = [];
  
  // 仪表盘永远是第一级
  breadcrumbs.push({
    title: '仪表盘',
    path: DASHBOARD
  });
  
  // 如果当前就是仪表盘，不需要继续处理
  if (normalizedPath === DASHBOARD.replace(/^\//, '') || normalizedPath === '') {
    return breadcrumbs;
  }
  
  // 递归查找路由
  const findRouteInfo = (routes, currentPath, depth = 0) => {
    if (!routes || !Array.isArray(routes)) return null;
    
    for (const route of routes) {
      // 构建完整路径
      const routePath = `${currentPath}/${route.path}`.replace(/\/+/g, '/');
      const routePathSegment = routePath.replace(/^\//, '').split('/')[depth];
      const pathSegment = pathSegments[depth];
      
      // 如果路径段匹配当前路由
      if (routePathSegment === pathSegment || 
          (route.path.includes(':') && pathSegment)) {
        
        // 获取路由元数据
        const meta = route.meta || {};
        const title = meta.title || routePathSegment;
        
        // 添加到面包屑
        breadcrumbs.push({
          title,
          path: routePath
        });
        
        // 如果有子路由且还有更深的路径段，继续递归
        if (route.children && depth + 1 < pathSegments.length) {
          findRouteInfo(route.children, routePath, depth + 1);
          break;
        }
      }
    }
  };
  
  // 开始递归查找
  findRouteInfo(routes, '', 0);
  
  return breadcrumbs;
};

/**
 * 查找指定路径的路由配置
 * @param {string} path - 要查找的路径
 * @param {Array} routes - 路由配置数组
 * @returns {Object|null} 匹配的路由配置或null
 */
export const findRouteByPath = (path, routes) => {
  if (!routes || !Array.isArray(routes)) return null;
  
  for (const route of routes) {
    // 构建完整路径
    const routePath = route.path;
    
    // 如果路径完全匹配
    if (routePath === path) {
      return route;
    }
    
    // 如果有子路由，递归查找
    if (route.children) {
      const childRoute = findRouteByPath(path, route.children);
      if (childRoute) return childRoute;
    }
  }
  
  return null;
};