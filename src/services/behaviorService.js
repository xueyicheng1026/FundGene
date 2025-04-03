/**
 * 行为矫正服务
 * 该文件用于处理与行为矫正相关的API调用
 * 目前使用模拟数据，未来可替换为实际API调用
 */
import { delay } from './baseService';

/**
 * 获取用户行为画像
 * @param {string} userId - 用户ID
 * @returns {Promise<Object>} - 返回行为画像数据
 */
export const getUserBehaviorProfile = async (userId) => {
  // 模拟API请求延迟
  await delay(800);
  
  // 返回模拟数据
  return {
    success: true,
    data: {
      // 风险评估
      riskScore: 68,
      riskLevel: '中等',
      riskDescription: '您的风险承受能力评级为中等，适合配置多元化的投资组合，包含一定比例的权益类资产。',
      
      // 交易风格
      tradeFrequency: '中频',
      holdingPeriod: '3-6个月',
      volatilityTolerance: '中等',
      diversificationLevel: '较低',
      tradeStyleAnalysis: '您的交易频率适中，但投资分散度较低，主要集中在少数几只基金上。建议适当增加不同类型和风格的基金，降低非系统性风险。',
      
      // 行为雷达图数据
      behaviorRadarData: [
        { subject: '损失厌恶', score: 75 },
        { subject: '过度自信', score: 60 },
        { subject: '从众心理', score: 30 },
        { subject: '锚定效应', score: 55 },
        { subject: '处置效应', score: 65 },
        { subject: '心理账户', score: 45 }
      ],
      
      // 认知偏差
      detectedBiases: [
        {
          name: '损失厌恶',
          score: 75,
          severity: 'high',
          description: '您对亏损的反应比同等收益的喜悦感受更强烈，这可能导致您在面临亏损时不愿意止损，同时又过早兑现盈利。',
          suggestions: [
            '设置自动止损点，避免情绪化决策',
            '制定投资计划并严格执行',
            '将注意力从短期波动转移到长期价值上'
          ]
        },
        {
          name: '过度自信',
          score: 60,
          severity: 'medium',
          description: '您可能高估自己的判断和预测能力，这可能导致过度交易或过度集中投资。',
          suggestions: [
            '定期回顾和评估过去的投资决策',
            '考虑相反观点和潜在风险',
            '增加投资组合多样性'
          ]
        },
        {
          name: '处置效应',
          score: 65,
          severity: 'medium',
          description: '您倾向于过早卖出盈利的资产，而持有亏损的资产过久，这可能导致收益减少并增加风险。',
          suggestions: [
            '定期评估所有持仓，而不仅关注亏损部分',
            '设置明确的买入和卖出规则',
            '考虑税收因素进行投资决策'
          ]
        },
        {
          name: '从众心理',
          score: 30,
          severity: 'low',
          description: '您很少跟随市场热点或追逐热门基金，表现出较好的独立思考能力。',
          suggestions: [
            '继续保持独立思考的习惯',
            '适度关注市场共识，但做决策时应基于自己的分析'
          ]
        }
      ],
      
      // 知识评估
      knowledgeScore: 72,
      knowledgeDescription: '您的投资知识水平良好，对基本投资概念和产品特性有较清晰的理解，但在某些专业领域仍有提升空间。',
      strengths: ['基金类型与特点', '基础市场分析', '分散投资原则'],
      weaknesses: ['衍生品知识', '债券久期概念', '海外市场投资'],
      
      // 行为改进计划
      actionPlan: [
        {
          title: '克服损失厌恶',
          priority: '高优先级',
          description: '您的损失厌恶程度较高，需要优先解决这一问题以避免不必要的损失或错失机会。',
          steps: [
            '制定明确的止损策略并严格执行',
            '投资前预设退出条件',
            '逐步培养接受小额亏损的心态',
            '参加损失厌恶特训课程'
          ]
        },
        {
          title: '降低投资集中度',
          priority: '中优先级',
          description: '您的投资较为集中，增加了非系统性风险。',
          steps: [
            '重新评估资产配置方案',
            '增加不同类型、风格的基金',
            '考虑增加海外资产配置',
            '定期检查和调整投资组合分散度'
          ]
        },
        {
          title: '提升投资知识',
          priority: '中优先级',
          description: '提升在固定收益和海外市场方面的知识，以扩展投资视野。',
          steps: [
            '完成债券投资基础课程',
            '学习海外市场投资基础知识',
            '参与每周的市场分析讨论'
          ]
        }
      ]
    }
  };
};

/**
 * 获取用户行为提醒
 * @param {string} userId - 用户ID
 * @returns {Promise<Object>} - 返回行为提醒数据
 */
export const getUserBehaviorAlerts = async (userId) => {
  // 模拟API请求延迟
  await delay(700);
  
  // 返回模拟数据
  return {
    success: true,
    data: [
      {
        id: 'alert-001',
        title: '检测到可能的追涨行为',
        behavior: '您近期连续买入了多只大幅上涨的基金，这可能是追涨心理的体现。持续的追涨行为可能导致在高点买入，增加投资风险。',
        marketContext: '近期市场热点频繁切换，多个板块出现较大涨幅，但市场整体估值已处于历史较高水平，波动风险加大。',
        suggestion: '建议您回顾投资计划，避免盲目追涨。考虑分批买入而非一次性投入，并关注基金的长期业绩和基本面，而非短期涨幅。',
        priority: 'high',
        time: '2023-12-18 10:25',
        read: false
      },
      {
        id: 'alert-002',
        title: '持仓过度集中风险提醒',
        behavior: '您的投资组合中，超过60%的资产集中在科技主题基金，行业集中度过高可能增加投资组合的波动性。',
        marketContext: '科技板块近期表现强势，但估值已处于历史高位，波动风险加大。同时，市场轮动迹象明显，防御性板块开始获得资金关注。',
        suggestion: '建议适当分散投资，降低单一行业集中度。考虑增加低相关性的资产，如部分消费、医药或低估值蓝筹基金，提高组合的抗风险能力。',
        priority: 'medium',
        time: '2023-12-15 16:42',
        read: true
      },
      {
        id: 'alert-003',
        title: '市场情绪波动加大，注意控制交易频率',
        behavior: '您在过去一周的交易频率显著提高，是平常的3倍，频繁交易可能导致决策质量下降和不必要的交易成本。',
        marketContext: '近期市场波动加大，消息面复杂多变，投资者情绪敏感，市场短期走向不明确。',
        suggestion: '建议您降低交易频率，避免被短期市场噪音影响。复盘近期交易决策，评估是否受到市场情绪影响。坚持长期投资计划，避免过度反应。',
        priority: 'medium',
        time: '2023-12-12 09:15',
        read: false
      },
      {
        id: 'alert-004',
        title: '可能错过定投时机',
        behavior: '您已连续两个月未执行基金定投计划，错过了市场调整期的低位买入机会。',
        marketContext: '过去两个月市场经历了一定幅度的调整，主要指数回撤超过10%，为定投策略提供了良好的买入时机。',
        suggestion: '建议重新开始执行定投计划，市场调整为长期投资者提供了更好的买入价格。定投的核心优势在于平均成本，坚持执行比择时更重要。',
        priority: 'low',
        time: '2023-12-05 14:30',
        read: false
      },
      {
        id: 'alert-005',
        title: '投资知识更新提醒',
        behavior: '系统检测到您对近期出台的新监管政策了解有限，这可能影响您对市场变化的正确理解。',
        marketContext: '近期监管部门出台了多项关于基金管理和投资者保护的新政策，这些变化可能对部分基金的运作和市场环境产生影响。',
        suggestion: '建议您阅读我们准备的政策解读文章，了解最新监管变化及其可能对您投资的影响。及时更新投资知识有助于做出更明智的决策。',
        priority: 'low',
        time: '2023-11-28 11:20',
        read: true
      }
    ]
  };
};

/**
 * 更新用户行为设置
 * @param {string} userId - 用户ID
 * @param {Object} settings - 用户设置
 * @returns {Promise<Object>} - 返回更新结果
 */
export const updateBehaviorSettings = async (userId, settings) => {
  // 模拟API请求延迟
  await delay(500);
  
  // 返回模拟成功结果
  return {
    success: true,
    message: '设置更新成功'
  };
};

/**
 * 获取行为矫正进度
 * @param {string} userId - 用户ID
 * @returns {Promise<Object>} - 返回进度数据
 */
export const getBehaviorCorrectionProgress = async (userId) => {
  // 模拟API请求延迟
  await delay(600);
  
  // 返回模拟数据
  return {
    success: true,
    data: {
      overallProgress: 65, // 百分比
      startDate: '2023-09-15',
      milestones: [
        { name: '完成行为诊断', completed: true, date: '2023-09-16' },
        { name: '设置改进目标', completed: true, date: '2023-09-18' },
        { name: '学习关键概念', completed: true, date: '2023-10-02' },
        { name: '实践模拟交易', completed: true, date: '2023-10-15' },
        { name: '中期评估', completed: true, date: '2023-11-01' },
        { name: '应用到实际投资', completed: false, target: '2023-12-25' },
        { name: '最终评估', completed: false, target: '2024-01-15' }
      ],
      improvements: [
        { behavior: '损失厌恶', initialScore: 85, currentScore: 75, change: -10 },
        { behavior: '过度自信', initialScore: 72, currentScore: 60, change: -12 },
        { behavior: '从众心理', initialScore: 45, currentScore: 30, change: -15 }
      ]
    }
  };
};
