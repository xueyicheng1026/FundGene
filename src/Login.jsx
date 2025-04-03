import React, { useContext } from 'react';
import { Form, Input, Button, Card, Typography, Divider } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import './Auth.css';

const { Title } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const onFinish = (values) => {
    // 简单模拟登录过程，实际项目需要与后端API交互
    console.log('登录信息:', values);
    // 使用认证上下文的登录方法
    login({ username: values.username });
    navigate('/');
  };

  return (
    <div className="auth-container">
      <Card className="auth-card">
        <div className="auth-header">
          <Title level={2}>FundGene</Title>
          <p className="auth-subtitle">智能基金投资助手</p>
        </div>
        <Divider />
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          size="large"
          layout="vertical"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              登录
            </Button>
          </Form.Item>
          
          <div className="auth-links">
            <Link to="/register">注册新账号</Link>
            <Link to="/forgot-password">忘记密码？</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
