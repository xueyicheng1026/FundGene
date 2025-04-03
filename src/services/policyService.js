/**
 * 政策解读服务
 * 该文件用于处理政策相关的API调用
 * 目前使用模拟数据，未来可替换为实际API调用
 */
import { fetchPolicyInterpretations } from './mockApi';

/**
 * 获取政策解读列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.keyword - 搜索关键词
 * @param {string} params.sortBy - 排序字段
 * @returns {Promise<Object>} - 返回政策列表数据
 */
export const getPolicyList = async (params = {}) => {
  // 目前使用模拟数据
  const response = await fetchPolicyInterpretations();
  
  // 未来实现实时API调用
  // const response = await axios.get('/api/policies', { params });
  
  return response;
};

/**
 * 获取政策详情
 * @param {string|number} id - 政策ID
 * @returns {Promise<Object>} - 返回政策详情数据
 */
export const getPolicyDetail = async (id) => {
  // 目前使用模拟数据，从列表中筛选
  const response = await fetchPolicyInterpretations();
  
  if (response.success) {
    const policy = response.data.find(item => item.id.toString() === id.toString());
    
    if (policy) {
      return {
        success: true,
        data: policy
      };
    } else {
      return {
        success: false,
        message: '未找到指定政策'
      };
    }
  }
  
  return response;
  
  // 未来实现实时API调用
  // return await axios.get(`/api/policies/${id}`);
};

/**
 * 获取最新政策解读
 * @param {number} limit - 返回数量限制
 * @returns {Promise<Object>} - 返回最新政策列表
 */
export const getLatestPolicies = async (limit = 3) => {
  // 目前使用模拟数据，按日期排序并限制数量
  const response = await fetchPolicyInterpretations();
  
  if (response.success) {
    // 按日期排序
    const sorted = [...response.data].sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });
    
    return {
      success: true,
      data: sorted.slice(0, limit)
    };
  }
  
  return response;
};

/**
 * 请求AI分析政策
 * @param {string} policyText - 政策文本内容
 * @returns {Promise<Object>} - 返回AI分析结果
 */
export const analyzePolicy = async (policyText) => {
  // 未来接入AI模型分析接口
  // 目前返回模拟数据
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return {
    success: true,
    data: {
      summary: '这是一个模拟的AI政策解读摘要...',
      impact: [
        { sector: '科技行业', effect: 'positive', description: '政策有利于科技创新...' },
        { sector: '传统制造', effect: 'neutral', description: '影响相对有限...' }
      ],
      investmentSuggestion: '建议关注相关主题基金...'
    }
  };
  
  // 未来实现
  // return await axios.post('/api/analyze-policy', { policyText });
};
