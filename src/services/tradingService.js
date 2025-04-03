/**
 * 交易服务
 * 该文件用于处理与模拟交易相关的API调用
 * 目前使用模拟数据，未来可替换为实际API调用
 */

// 模拟延迟
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 获取市场概览数据
 * @returns {Promise<Object>} - 返回市场数据
 */
export const getMarketOverview = async () => {
  // 模拟API请求延迟
  await delay(800);
  
  // 返回模拟数据
  return {
    success: true,
    data: [
      // 指数数据
      { type: 'index', code: '000001', name: '上证指数', value: 3094.67, change: 25.33, changePercent: 0.82 },
      { type: 'index', code: '399001', name: '深证成指', value: 10247.68, change: 91.43, changePercent: 0.90 },
      { type: 'index', code: '399006', name: '创业板指', value: 2033.26, change: 11.24, changePercent: 0.56 },
      { type: 'index', code: '000300', name: '沪深300', value: 3783.81, change: 34.56, changePercent: 0.92 },
      
      // 热门基金数据
      { type: 'fund', code: '001938', name: '中欧时代先锋混合A', value: 1.5273, change: 0.0142, changePercent: 0.94, category: '混合型' },
      { type: 'fund', code: '110011', name: '易方达优质精选混合', value: 2.7241, change: 0.0289, changePercent: 1.07, category: '混合型' },
      { type: 'fund', code: '519068', name: '汇添富成长焦点混合', value: 2.9412, change: 0.0265, changePercent: 0.91, category: '混合型' },
      { type: 'fund', code: '001712', name: '广发沪港深新起点混合', value: 1.8831, change: 0.0168, changePercent: 0.90, category: '混合型' },
      { type: 'fund', code: '000209', name: '信诚新兴产业混合', value: 1.9563, change: 0.0083, changePercent: 0.43, category: '混合型' },
      { type: 'fund', code: '162605', name: '景顺长城鼎益混合', value: 1.6423, change: 0.0198, changePercent: 1.22, category: '混合型' }
    ]
  };
  
  // 未来实现实际API调用
  // return await axios.get('/api/market/overview');
};

/**
 * 获取投资组合概览
 * @param {string} userId - 用户ID
 * @returns {Promise<Object>} - 返回投资组合数据
 */
export const getPortfolioSummary = async (userId) => {
  // 模拟API请求延迟
  await delay(600);
  
  // 返回模拟数据
  return {
    success: true,
    data: {
      totalValue: 52680.75,
      availableCash: 10000.00,
      todayProfit: 235.21,
      todayProfitPercent: 0.45,
      holdingsCount: 5,
      holdings: [
        { 
          code: '001938', 
          name: '中欧时代先锋混合A', 
          shares: 10000.00, 
          nav: 1.5273, 
          marketValue: 15273.00,
          profit: 1273.00,
          profitPercent: 9.10,
          category: '混合型'
        },
        { 
          code: '110011', 
          name: '易方达优质精选混合', 
          shares: 5000.00, 
          nav: 2.7241, 
          marketValue: 13620.50,
          profit: 2120.50,
          profitPercent: 18.44,
          category: '混合型'
        },
        { 
          code: '000209', 
          name: '信诚新兴产业混合', 
          shares: 3000.00, 
          nav: 1.9563, 
          marketValue: 5868.90,
          profit: -131.10,
          profitPercent: -2.18,
          category: '混合型'
        }
      ]
    }
  };
  
  // 未来实现实际API调用
  // return await axios.get(`/api/portfolio/summary?userId=${userId}`);
};

/**
 * 执行交易订单
 * @param {Object} order - 交易订单对象
 * @param {string} order.action - 交易类型 (buy/sell)
 * @param {string} order.fundCode - 基金代码
 * @param {number} order.amount - 金额/份额
 * @returns {Promise<Object>} - 返回交易结果
 */
export const executeTradeOrder = async (order) => {
  // 模拟API请求延迟
  await delay(1200);
  
  // 模拟交易成功
  const now = new Date();
  const tradeId = `TR${now.getTime()}`;
  
  // 查找基金信息
  const marketData = await getMarketOverview();
  const fundInfo = marketData.data.find(item => item.code === order.fundCode && item.type === 'fund');
  
  // 如果找不到基金，返回错误
  if (!fundInfo) {
    return {
      success: false,
      message: `未找到基金代码 ${order.fundCode}`
    };
  }
  
  // 生成交易记录
  const newTrade = {
    id: tradeId,
    action: order.action,
    fundCode: order.fundCode,
    fundName: fundInfo.name,
    timestamp: now.toISOString(),
    status: 'completed'
  };
  
  // 买入操作
  if (order.action === 'buy') {
    newTrade.amount = order.amount;
    newTrade.shares = +(order.amount / fundInfo.value).toFixed(2);
    newTrade.nav = fundInfo.value;
  } 
  // 卖出操作
  else if (order.action === 'sell') {
    newTrade.shares = order.amount;
    newTrade.amount = +(order.amount * fundInfo.value).toFixed(2);
    newTrade.nav = fundInfo.value;
  }
  
  // 获取当前投资组合
  const portfolioResponse = await getPortfolioSummary();
  const currentPortfolio = portfolioResponse.data;
  
  // 更新投资组合（模拟）
  const updatedPortfolio = { ...currentPortfolio };
  
  if (order.action === 'buy') {
    // 减少可用资金
    updatedPortfolio.availableCash -= order.amount;
    
    // 查找是否已持有该基金
    const existingHolding = updatedPortfolio.holdings.find(h => h.code === order.fundCode);
    
    if (existingHolding) {
      // 更新现有持仓
      existingHolding.shares += newTrade.shares;
      existingHolding.marketValue = +(existingHolding.shares * existingHolding.nav).toFixed(2);
    } else {
      // 添加新持仓
      updatedPortfolio.holdings.push({
        code: order.fundCode,
        name: fundInfo.name,
        shares: newTrade.shares,
        nav: fundInfo.value,
        marketValue: newTrade.amount,
        profit: 0,
        profitPercent: 0,
        category: fundInfo.category
      });
      
      // 更新持仓数量
      updatedPortfolio.holdingsCount = updatedPortfolio.holdings.length;
    }
  } else if (order.action === 'sell') {
    // 增加可用资金
    updatedPortfolio.availableCash += newTrade.amount;
    
    // 查找持仓
    const holdingIndex = updatedPortfolio.holdings.findIndex(h => h.code === order.fundCode);
    
    if (holdingIndex >= 0) {
      const holding = updatedPortfolio.holdings[holdingIndex];
      
      // 更新份额
      holding.shares -= order.amount;
      
      // 如果份额为0，移除持仓
      if (holding.shares <= 0) {
        updatedPortfolio.holdings.splice(holdingIndex, 1);
        updatedPortfolio.holdingsCount = updatedPortfolio.holdings.length;
      } else {
        // 更新市值
        holding.marketValue = +(holding.shares * holding.nav).toFixed(2);
      }
    }
  }
  
  // 更新总资产价值
  updatedPortfolio.totalValue = updatedPortfolio.availableCash + 
    updatedPortfolio.holdings.reduce((sum, h) => sum + h.marketValue, 0);
  
  // 生成行为反馈
  const behaviorFeedback = await getBehaviorFeedback(order);
  
  return {
    success: true,
    message: `${order.action === 'buy' ? '买入' : '卖出'}成功`,
    data: {
      newTrade,
      updatedPortfolio,
      behaviorFeedback
    }
  };
};

/**
 * 获取交易历史
 * @param {Object} params - 查询参数
 * @param {string} params.userId - 用户ID
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页条数
 * @returns {Promise<Object>} - 返回交易历史数据
 */
export const getTradeHistory = async (params = {}) => {
  // 模拟API请求延迟
  await delay(500);
  
  // 返回模拟数据
  return {
    success: true,
    data: [
      {
        id: 'TR1663259750000',
        action: 'buy',
        fundCode: '001938',
        fundName: '中欧时代先锋混合A',
        timestamp: '2023-12-16T10:15:50Z',
        amount: 10000.00,
        shares: 6545.54,
        nav: 1.5275,
        status: 'completed'
      },
      {
        id: 'TR1663186950000',
        action: 'buy',
        fundCode: '110011',
        fundName: '易方达优质精选混合',
        timestamp: '2023-12-15T14:15:50Z',
        amount: 5000.00,
        shares: 1835.47,
        nav: 2.7241,
        status: 'completed'
      },
      {
        id: 'TR1663100550000',
        action: 'sell',
        fundCode: '519068',
        fundName: '汇添富成长焦点混合',
        timestamp: '2023-12-14T14:15:50Z',
        amount: 2941.20,
        shares: 1000.00,
        nav: 2.9412,
        status: 'completed'
      }
    ]
  };
};

/**
 * 获取行为反馈
 * 基于用户交易行为提供反馈和建议
 * @param {Object} order - 最近的交易订单（可选）
 * @returns {Promise<Object>} - 返回行为反馈数据
 */
export const getBehaviorFeedback = async (order = null) => {
  // 模拟API请求延迟
  await delay(800);
  
  // 根据交易历史分析用户行为（模拟）
  // 实际应用中应该基于更复杂的分析逻辑
  
  // 基本反馈数据
  const feedback = {
    overallScore: 72,  // 0-100分
    scoreDescription: '您的投资行为总体表现良好，但存在一些可以改进的地方。继续保持纪律性投资，并注意控制情绪化决策。',
    detectedBehaviors: [
      {
        name: '过度交易',
        severity: 'medium',
        description: '您在短期内进行了较多交易操作，可能导致不必要的交易成本。建议制定明确的投资计划并坚持执行。'
      },
      {
        name: '追涨情绪',
        severity: 'low',
        description: '您偶尔会在基金涨幅较大后买入，这可能是追涨心理的体现。建议关注基金的长期价值而非短期表现。'
      }
    ],
    suggestions: [
      {
        title: '建立交易计划',
        content: '在交易前设定明确的买入与卖出条件，避免受市场短期波动影响而频繁交易。'
      },
      {
        title: '分散投资',
        content: '您的投资较为集中在混合型基金，建议适当分散到不同类型、不同风格的基金中以降低风险。'
      },
      {
        title: '定期投资',
        content: '考虑采用定投策略，通过固定时间、固定金额的投资方式降低择时风险。'
      }
    ]
  };
  
  // 如果提供了最新交易，增加针对性反馈
  if (order) {
    // 针对买入操作
    if (order.action === 'buy') {
      feedback.detectedBehaviors.unshift({
        name: '积极投资',
        severity: 'low',
        description: '您选择了合适的时机进行买入操作，这体现了良好的投资意识。'
      });
    }
    // 针对卖出操作
    else if (order.action === 'sell') {
      feedback.detectedBehaviors.unshift({
        name: '利润锁定',
        severity: 'low',
        description: '您选择了适当的时机进行卖出操作，这有助于锁定收益并控制风险。'
      });
    }
  }
  
  return {
    success: true,
    data: feedback
  };
  
  // 未来实现实际API调用
  // return await axios.get('/api/behavior/feedback', { params: { orderId: order?.id } });
};
