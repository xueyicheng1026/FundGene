/**
 * 聊天服务接口
 * 该文件专门处理与AI聊天相关的API调用
 * 目前使用模拟数据，未来将接入微调模型
 */
import { fetchChatHistory, sendChatMessage } from './mockApi';

/**
 * 获取聊天历史记录
 * @param {Object} params - 查询参数
 * @param {string} params.userId - 用户ID
 * @param {number} params.limit - 返回消息数量限制
 * @param {string} params.before - 分页标记，获取此ID之前的消息
 * @returns {Promise<Object>} - 返回聊天记录数据
 */
export const getChatHistory = async (params = {}) => {
  // 目前使用模拟数据
  const response = await fetchChatHistory();
  
  // 未来实现微调模型API调用
  // const response = await axios.get('/api/chat/history', { params });
  
  return response;
};

/**
 * 发送消息到AI模型并获取回复
 * @param {Object} message - 消息对象
 * @param {string} message.content - 消息内容
 * @param {Object} options - 额外选项
 * @param {string} options.userId - 用户ID
 * @param {string} options.modelVersion - 模型版本
 * @param {boolean} options.useContext - 是否使用上下文
 * @param {number} options.maxTokens - 最大生成token数
 * @param {Array<Object>} options.context - 上下文消息数组
 * @returns {Promise<Object>} - 返回AI回复
 */
export const sendMessage = async (message, options = {}) => {
  // 默认选项
  const defaultOptions = {
    userId: 'default',
    modelVersion: 'latest',
    useContext: true,
    maxTokens: 1000,
    context: []
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  // 目前使用模拟数据
  const response = await sendChatMessage(message);
  
  // 未来实现微调模型API调用
  // const payload = {
  //   message: message.content,
  //   userId: mergedOptions.userId,
  //   modelVersion: mergedOptions.modelVersion,
  //   useContext: mergedOptions.useContext,
  //   maxTokens: mergedOptions.maxTokens,
  //   context: mergedOptions.context
  // };
  // const response = await axios.post('/api/chat/message', payload);
  
  return response;
};

/**
 * 获取可用的模型版本
 * @returns {Promise<Object>} - 返回可用模型列表
 */
export const getAvailableModels = async () => {
  // 目前使用模拟数据
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    success: true,
    data: [
      { id: 'fund-advisor-base', name: '基础投资顾问', description: '通用投资知识和基金分析能力' },
      { id: 'fund-advisor-pro', name: '专业投资顾问', description: '更深入的市场分析和投资组合建议' },
      { id: 'behavior-analysis', name: '行为分析专家', description: '专注于识别和矫正投资行为偏差' }
    ]
  };
  
  // 未来实现微调模型API调用
  // return await axios.get('/api/models/available');
};

/**
 * 创建智能投顾会话
 * @param {Object} params - 会话参数
 * @param {string} params.userId - 用户ID
 * @param {string} params.modelId - 模型ID
 * @param {string} params.sessionType - 会话类型(general|portfolio|behavior)
 * @returns {Promise<Object>} - 返回创建的会话信息
 */
export const createAdvisorSession = async (params = {}) => {
  // 目前使用模拟数据
  await new Promise(resolve => setTimeout(resolve, 700));
  
  return {
    success: true,
    data: {
      sessionId: `session_${Date.now()}`,
      modelId: params.modelId || 'fund-advisor-base',
      createdAt: new Date().toISOString(),
      status: 'active'
    }
  };
  
  // 未来实现微调模型API调用
  // return await axios.post('/api/chat/sessions', params);
};

/**
 * 获取特定用户的投资分析提示
 * 这些提示将根据用户的投资行为和组合表现生成
 * @param {string} userId - 用户ID
 * @returns {Promise<Object>} - 返回个性化提示
 */
export const getPersonalizedPrompts = async (userId) => {
  // 目前使用模拟数据
  await new Promise(resolve => setTimeout(resolve, 600));
  
  return {
    success: true,
    data: [
      { id: 1, text: "我的投资组合波动较大，如何降低风险？" },
      { id: 2, text: "我的投资组合中科技股比例较高，如何更好地分散投资？" },
      { id: 3, text: "最近市场波动较大，我应该如何应对当前市场环境？" },
      { id: 4, text: "我想制定一个适合自己风险偏好的长期投资计划，有什么建议？" }
    ]
  };
  
  // 未来实现微调模型API调用
  // return await axios.get(`/api/users/${userId}/prompts`);
};

/**
 * 评价AI回复质量
 * 这有助于改进模型的微调过程
 * @param {string} messageId - 消息ID
 * @param {Object} feedback - 反馈信息
 * @param {number} feedback.rating - 评分(1-5)
 * @param {string} feedback.comment - 评价内容
 * @returns {Promise<Object>} - 返回处理结果
 */
export const provideFeedback = async (messageId, feedback) => {
  // 目前使用模拟数据
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return {
    success: true,
    data: {
      received: true,
      messageId,
      timestamp: new Date().toISOString()
    }
  };
  
  // 未来实现微调模型API调用
  // return await axios.post(`/api/chat/feedback/${messageId}`, feedback);
};
