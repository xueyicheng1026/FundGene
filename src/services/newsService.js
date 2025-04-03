/**
 * 新闻分析服务
 * 该文件用于处理新闻相关的API调用
 * 目前使用模拟数据，未来可替换为实际API调用
 */
import { fetchNewsAnalysis } from './mockApi';

/**
 * 获取新闻分析列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.keyword - 搜索关键词
 * @param {string} params.category - 新闻类别 
 * @returns {Promise<Object>} - 返回新闻列表数据
 */
export const getNewsList = async (params = {}) => {
  // 目前使用模拟数据
  const response = await fetchNewsAnalysis();
  
  // 未来实现实时API调用
  // const response = await axios.get('/api/news', { params });
  
  return response;
};

/**
 * 获取新闻详情
 * @param {string|number} id - 新闻ID
 * @returns {Promise<Object>} - 返回新闻详情数据
 */
export const getNewsDetail = async (id) => {
  // 目前使用模拟数据，从列表中筛选
  const response = await fetchNewsAnalysis();
  
  if (response.success) {
    const news = response.data.find(item => item.id.toString() === id.toString());
    
    if (news) {
      return {
        success: true,
        data: news
      };
    } else {
      return {
        success: false,
        message: '未找到指定新闻'
      };
    }
  }
  
  return response;
  
  // 未来实现实时API调用
  // return await axios.get(`/api/news/${id}`);
};

/**
 * 获取最新新闻
 * @param {number} limit - 返回数量限制
 * @returns {Promise<Object>} - 返回最新新闻列表
 */
export const getLatestNews = async (limit = 5) => {
  // 目前使用模拟数据，按日期排序并限制数量
  const response = await fetchNewsAnalysis();
  
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
 * 分析自定义新闻内容
 * @param {string} newsContent - 新闻内容
 * @returns {Promise<Object>} - 返回分析结果
 */
export const analyzeCustomNews = async (newsContent) => {
  // 未来接入AI模型分析接口
  // 目前返回模拟数据
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return {
    success: true,
    data: {
      summary: '这是一个模拟的新闻内容摘要...',
      impact: '这条新闻可能对市场产生以下影响...',
      relevantFunds: ['易方达创新未来混合', '华夏科技创新混合']
    }
  };
  
  // 未来实现
  // return await axios.post('/api/analyze-news', { newsContent });
};
