import React, { useState, useEffect, useRef } from 'react';
import { getChatHistory, sendMessage, getPersonalizedPrompts } from '../../services/chatService';
import './ChatInterface.css';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [personalizedPrompts, setPersonalizedPrompts] = useState([]);
  const [selectedModel, setSelectedModel] = useState('fund-advisor-base');
  const [useContext, setUseContext] = useState(true);

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getChatHistory({
          userId: 'current-user',
          limit: 50,
        });

        if (response.success) {
          setMessages(response.data);
        } else {
          throw new Error('获取聊天历史失败');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadChatHistory();

    const loadPersonalizedPrompts = async () => {
      try {
        const response = await getPersonalizedPrompts('current-user');
        if (response.success) {
          setPersonalizedPrompts(response.data);
        }
      } catch (err) {
        console.error('加载个性化提示失败', err);
      }
    };

    loadPersonalizedPrompts();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || sending) return;

    try {
      setSending(true);

      const userMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: inputValue,
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputValue('');

      const response = await sendMessage(userMessage, {
        userId: 'current-user',
        modelVersion: selectedModel,
        useContext: useContext,
        context: messages.slice(-10),
      });

      if (response.success) {
        setMessages((prev) => [...prev, response.data]);
      } else {
        throw new Error('发送消息失败');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickQuestion = (question) => {
    setInputValue(question);
  };

  const handleModelChange = (modelId) => {
    setSelectedModel(modelId);
  };

  const handleContextToggle = () => {
    setUseContext(!useContext);
  };

  // 如果没有个性化提示，使用默认提示 - 从用户角度出发的问题
  const defaultQuestions = [
    "什么是基金？我该如何入门？",
    "基金有哪些类型？哪类更适合我？",
    "我应该如何选择适合自己的基金？",
    "定投的优势是什么？我适合定投吗？",
    "当前市场形势如何？有投资机会吗？",
    "如何构建一个分散风险的投资组合？"
  ];

  if (loading) {
    return <div className="loading">加载聊天记录中...</div>;
  }

  // 使用个性化提示或默认提示
  const quickQuestions = personalizedPrompts.length > 0 
    ? personalizedPrompts.map(p => ({
        id: p.id,
        // 将AI角度的问题转换为用户角度
        text: p.text.replace(/您的/g, "我的")
               .replace(/您是否/g, "我该如何")
               .replace(/您想/g, "我想")
               .replace(/您/, "我")
               .replace(/\?/, "？")
      }))
    : defaultQuestions.map(text => ({ id: `default-${Date.now()}-${Math.random()}`, text }));

  return (
    <div className="chat-page">
      <div className="page-header">
        <h1 className="page-title">AI投资顾问</h1>
        <p className="page-description">
          与AI对话，获取个性化投资建议和知识讲解。AI会根据您的投资历史和风险偏好提供针对性的指导。
        </p>
      </div>

      <div className="chat-container">
        <div className="chat-main">
          <div className="chat-card">
            <div className="chat-header">
              <h2>智能对话</h2>
            </div>

            <div className="chat-messages" ref={chatContainerRef}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`message ${message.role === 'user' ? 'message-user' : 'message-assistant'}`}
                >
                  <div className="message-avatar">{message.role === 'user' ? '👤' : '🤖'}</div>
                  <div className="message-content">
                    {message.content.split('\n').map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />

              {sending && (
                <div className="message message-assistant">
                  <div className="message-avatar">🤖</div>
                  <div className="message-content typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
            </div>

            {error && <div className="chat-error">{error}</div>}

            <div className="chat-input-container">
              <textarea
                className="chat-input"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="输入您的投资问题，按Enter发送..."
                rows={3}
                disabled={sending}
              />
              <button
                className="send-button"
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || sending}
              >
                {sending ? '发送中...' : '发送'}
              </button>
            </div>
          </div>
        </div>

        <div className="chat-sidebar">
          <div className="quick-questions-card">
            <h3>推荐问题</h3>
            <div className="quick-questions-list">
              {quickQuestions.map((question, index) => (
                <button 
                  key={question.id || index}
                  className="quick-question-button"
                  onClick={() => handleQuickQuestion(question.text)}
                >
                  {question.text}
                </button>
              ))}
            </div>
          </div>

          <div className="behavior-card">
            <h3>您的投资行为分析</h3>
            <div className="behavior-summary">
              <div className="behavior-item">
                <span className="behavior-label">损失厌恶</span>
                <div className="behavior-bar">
                  <div className="behavior-fill" style={{ width: '75%' }}></div>
                </div>
                <span className="behavior-score">较高</span>
              </div>

              <div className="behavior-item">
                <span className="behavior-label">过度自信</span>
                <div className="behavior-bar">
                  <div className="behavior-fill" style={{ width: '60%' }}></div>
                </div>
                <span className="behavior-score">中等</span>
              </div>

              <div className="behavior-item">
                <span className="behavior-label">从众心理</span>
                <div className="behavior-bar">
                  <div className="behavior-fill" style={{ width: '30%' }}></div>
                </div>
                <span className="behavior-score">较低</span>
              </div>
            </div>
            <p className="behavior-note">
              您的投资行为显示出较高的损失厌恶特征，建议在决策时更加理性，制定明确的投资计划并坚持执行。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
