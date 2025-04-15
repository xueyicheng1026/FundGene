import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { LOGIN } from './constants';

/**
 * 路由守卫组件
 * 用于保护需要登录才能访问的路由
 * 
 * @param {Object} props - 组件属性
 * @param {React.ReactNode} props.children - 子组件
 * @param {boolean} [props.requireAuth=true] - 是否需要认证
 * @param {string[]} [props.allowedRoles] - 允许访问的角色列表
 */
const RouteGuard = ({ children, requireAuth = true, allowedRoles = [] }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  // 如果认证状态正在加载中，显示加载状态
  if (loading) {
    return <div className="route-loading">认证中...</div>;
  }

  // 如果路由需要认证但用户未登录，重定向到登录页面
  if (requireAuth && !user) {
    // 将当前路径保存到location state，以便登录后重定向回来
    return <Navigate to={LOGIN} state={{ from: location.pathname }} replace />;
  }

  // 如果指定了角色限制且用户不具备所需角色，显示无权限页面
  if (requireAuth && allowedRoles.length > 0 && user) {
    const hasRequiredRole = allowedRoles.some(role => 
      user.roles && user.roles.includes(role)
    );
    
    if (!hasRequiredRole) {
      return <div className="unauthorized">您没有访问此页面的权限</div>;
    }
  }

  // 通过所有验证，渲染子组件
  return children;
};

export default RouteGuard;