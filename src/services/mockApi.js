import { 
  mockPortfolioData, 
  mockComparisonData, 
  mockBehaviorData,
  mockBehaviorBiases,
  mockNewsData,
  mockPolicyData,
  mockScenarioData,
  mockChatData,
  mockChatResponses,
  mockRebalanceData,
  mockUserBehaviorData,
  mockPortfolioHistoryData
} from './mockData';

// 模拟延迟
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 聊天记录
export async function fetchChatHistory() {
  await delay(800);
  return {
    success: true,
    data: mockChatData
  };
}

// 发送聊天消息
export async function sendChatMessage(message) {
  await delay(1500);
  
  // 模拟AI回复
  let responseContent = mockChatResponses.default;
  
  // 简易的关键词匹配
  const keywords = [
    { keywords: ['什么是基金', '基金是什么', '基金定义'], response: '什么是基金' },
    { keywords: ['基金类型', '种类', '分类', '有哪些基金'], response: '基金类型' },
    { keywords: ['如何选择', '选择基金', '挑选', '筛选', '怎么选'], response: '如何选择基金' },
    { keywords: ['定投', '定期投资'], response: '什么是定投' },
    { keywords: ['损失厌恶', '亏损', '止损'], response: '什么是损失厌恶' },
    { keywords: ['羊群效应', '跟风', '从众'], response: '什么是羊群效应' },
    { keywords: ['当前市场', '市场分析', '行情', '走势'], response: '当前市场分析' },
    { keywords: ['投资组合', '资产配置', '如何配置', '怎么配置'], response: '如何构建投资组合' }
  ];
  
  const lowerContent = message.content.toLowerCase();
  for (const item of keywords) {
    if (item.keywords.some(keyword => lowerContent.includes(keyword))) {
      responseContent = mockChatResponses[item.response];
      break;
    }
  }
  
  const response = {
    id: Date.now(),
    role: 'assistant',
    content: responseContent
  };
  
  return {
    success: true,
    data: response
  };
}

// 模拟投资组合数据
export async function fetchPortfolioData() {
  await delay(800);
  return {
    success: true,
    data: [
      { name: '股票型基金', value: 25000, percent: 47.5 },
      { name: '债券型基金', value: 15000, percent: 28.5 },
      { name: '混合型基金', value: 8000, percent: 15.2 },
      { name: '货币市场基金', value: 4680.75, percent: 8.8 }
    ]
  };
}

// 获取再平衡建议
export async function fetchRebalanceRecommendations() {
  await delay(1000);
  return {
    success: true,
    data: {
      rationale: '当前股票市场估值较高，建议适当降低股票型基金占比，增加债券型基金配置以降低组合波动性。同时，您的投资组合缺乏海外资产暴露，建议新增部分全球市场配置以提高分散化程度。',
      currentAllocation: [
        { category: '股票型基金', current: 47.5, target: 40, action: 'reduce', amount: 3950 },
        { category: '债券型基金', current: 28.5, target: 35, action: 'increase', amount: 3500 },
        { category: '混合型基金', current: 15.2, target: 15, action: 'maintain', amount: 0 },
        { category: '货币市场基金', current: 8.8, target: 5, action: 'reduce', amount: 2000 },
        { category: '海外基金', current: 0, target: 5, action: 'increase', amount: 2450 }
      ],
      specificRecommendations: [
        {
          fund: '易方达中小盘混合',
          code: '110011',
          currentValue: 10000,
          targetValue: 8000,
          action: 'reduce',
          amount: 2000,
          reason: '当前估值较高，风险收益比降低，建议适度减持锁定部分收益'
        },
        {
          fund: '华夏上证50ETF',
          code: '510050',
          currentValue: 15000,
          targetValue: 13050,
          action: 'reduce',
          amount: 1950,
          reason: '大盘蓝筹估值处于历史较高水平，适当降低配置控制风险'
        },
        {
          fund: '南方宝元债券',
          code: '202101',
          currentValue: 15000,
          targetValue: 18500,
          action: 'increase',
          amount: 3500,
          reason: '提高防御性资产配置，降低组合波动性，债券收益率处于相对合理水平'
        },
        {
          fund: '易方达中证海外互联网ETF',
          code: '513050',
          currentValue: 0,
          targetValue: 2450,
          action: 'increase',
          amount: 2450,
          reason: '增加海外市场配置，提高组合多元化水平，降低地域集中风险'
        },
        {
          fund: '天弘余额宝货币',
          code: '000198',
          currentValue: 4680.75,
          targetValue: 2680.75,
          action: 'reduce',
          amount: 2000,
          reason: '当前货币市场基金收益率较低，维持适度流动性即可，资金可配置到收益潜力更高的资产类别'
        }
      ],
      expectedImpact: {
        risk: '预计组合波动性降低约15%',
        return: '长期收益潜力略有提升（约0.3%），短期可能略有波动',
        sharpeRatio: '风险调整后收益率(夏普比率)预计从0.85提升至1.05左右'
      }
    }
  };
}

// 获取决策对比数据
export async function fetchComparisonData() {
  await delay(800);
  return {
    success: true,
    data: [
      { date: '2023-01', userReturn: 2.1, aiReturn: 1.8, benchmark: 1.5 },
      { date: '2023-02', userReturn: 1.8, aiReturn: 2.5, benchmark: 2.0 },
      { date: '2023-03', userReturn: -1.2, aiReturn: -0.5, benchmark: -0.8 },
      { date: '2023-04', userReturn: 0.5, aiReturn: 1.2, benchmark: 0.9 },
      { date: '2023-05', userReturn: 1.8, aiReturn: 2.2, benchmark: 1.7 },
      { date: '2023-06', userReturn: -2.5, aiReturn: -1.0, benchmark: -1.5 },
      { date: '2023-07', userReturn: 3.2, aiReturn: 3.5, benchmark: 3.0 },
      { date: '2023-08', userReturn: 0.8, aiReturn: 1.5, benchmark: 1.1 },
      { date: '2023-09', userReturn: -1.5, aiReturn: -0.8, benchmark: -1.2 },
      { date: '2023-10', userReturn: 2.0, aiReturn: 2.8, benchmark: 2.2 },
      { date: '2023-11', userReturn: 1.2, aiReturn: 1.6, benchmark: 1.3 },
      { date: '2023-12', userReturn: 0.9, aiReturn: 1.8, benchmark: 1.1 }
    ]
  };
}

// 获取模拟场景数据
export async function fetchScenarios() {
  await delay(600);
  return {
    success: true,
    data: [
      {
        id: 1,
        title: '2015年股灾模拟',
        description: '体验2015年6月股票市场暴跌，测试您在极端市场条件下的决策过程',
        events: [
          { date: '2015-06-01', title: '市场达到阶段性顶点，上证指数5178点' },
          { date: '2015-06-12', title: '股指开始快速下跌' },
          { date: '2015-06-19', title: '千股跌停，恐慌情绪蔓延' },
          { date: '2015-06-26', title: '央行降息，试图稳定市场' },
          { date: '2015-06-29', title: '再次千股跌停，市场崩盘' }
        ],
        lessons: [
          '学习如何控制恐慌情绪',
          '了解杠杆交易的风险',
          '认识市场泡沫形成的过程',
          '掌握风险管理策略'
        ]
      },
      {
        id: 2,
        title: '长牛市场投资策略',
        description: '模拟2020-2021年美股牛市，练习如何在上涨市场中控制风险并获取收益',
        events: [
          { date: '2020-03-23', title: '美股触底，开启牛市行情' },
          { date: '2020-08-01', title: '科技股领涨，估值持续上升' },
          { date: '2020-11-09', title: '疫苗消息公布，市场板块轮动' },
          { date: '2021-02-15', title: '通胀预期上升，资金从成长转向价值' }
        ],
        lessons: [
          '学习如何判断市场趋势',
          '了解板块轮动规律',
          '掌握牛市中的利润锁定策略',
          '认识过度自信的风险'
        ]
      },
      {
        id: 3,
        title: '利率上升环境下的基金选择',
        description: '在央行加息背景下，学习如何调整基金组合以应对利率变化',
        events: [
          { date: '2022-03-01', title: '央行释放加息信号' },
          { date: '2022-04-15', title: '首次加息25基点' },
          { date: '2022-06-10', title: '通胀数据超预期，债券市场下跌' },
          { date: '2022-09-05', title: '连续加息后经济增长放缓' }
        ],
        lessons: [
          '了解不同类型基金对利率变化的敏感度',
          '掌握债券基金久期管理',
          '学习如何调整资产配置应对利率周期',
          '认识货币政策与市场关系'
        ]
      }
    ]
  };
}

// 获取政策解读数据
export async function fetchPolicyInterpretations() {
  await delay(700);
  return {
    success: true,
    data: [
      {
        id: 1,
        title: '央行降准0.5个百分点对基金市场的影响',
        issuer: '中国人民银行',
        date: '2023-10-15',
        summary: '中国人民银行宣布全面降准0.5个百分点，释放长期资金约1万亿元，以支持实体经济发展。',
        analysis: '此次降准是央行为应对经济下行压力采取的重要举措。降准后，银行体系流动性增加，有利于降低市场利率，减轻企业融资成本，刺激信贷扩张。对基金市场而言，短期内可能提振市场信心，特别是对流动性敏感的成长股和科技股可能受益明显。',
        impact: [
          { sector: '科技板块', effect: 'positive', description: '流动性改善有利于估值修复，特别是前期跌幅较大的科技成长股可能迎来反弹。' },
          { sector: '金融板块', effect: 'neutral', description: '降准可能压缩银行息差，但也可能提升信贷规模，整体影响中性。' },
          { sector: '地产板块', effect: 'positive', description: '降准有助于降低按揭贷款利率，对地产销售和融资环境改善有积极作用。' },
          { sector: '消费板块', effect: 'positive', description: '经济预期改善有利于提振消费信心，特别是可选消费品可能受益。' }
        ],
        relevantFunds: ['易方达科技创新混合', '广发双擎升级混合', '南方消费活力混合', '华夏上证科创板50ETF']
      },
      {
        id: 2,
        title: '财政部扩大专项债发行规模政策解读',
        issuer: '财政部',
        date: '2023-09-28',
        summary: '财政部宣布在2023年第四季度增加发行5000亿元地方政府专项债券，重点支持基础设施建设和重大项目。',
        analysis: '此举表明政府正加大逆周期调节力度，通过财政政策发力稳增长。专项债资金主要流向交通、能源、水利等基础设施领域，也包括新能源、数字经济等战略性新兴产业。这对相关产业链上企业业绩形成支撑，有望带动投资和就业增长。',
        impact: [
          { sector: '基建板块', effect: 'positive', description: '直接受益于专项债资金投入，建筑、材料、机械设备等相关产业链公司将获得更多订单。' },
          { sector: '新能源板块', effect: 'positive', description: '专项债资金部分流向新能源基础设施建设，光伏、风电等产业链有望受益。' },
          { sector: '银行板块', effect: 'neutral', description: '专项债发行增加地方政府性融资需求，但对商业银行影响有限。' }
        ],
        relevantFunds: ['中欧基建先锋股票', '华安创业板50ETF', '嘉实基本面50指数']
      }
    ]
  };
}

// 获取新闻分析数据
export async function fetchNewsAnalysis() {
  await delay(600);
  return {
    success: true,
    data: [
      {
        id: 1,
        title: '美联储暗示2024年可能降息，全球市场普涨',
        source: '财经早报',
        date: '2023-12-14',
        summary: '美联储在12月议息会议上维持利率不变，但官员们预测2024年可能有三次降息，这一表态超出市场预期，美股大涨，美元指数下跌，全球股市普遍走强。',
        impact: '美联储转向鸽派立场，全球流动性预期改善，有利于风险资产表现。对中国基金市场而言，外资流入预期增强，有望提振A股市场，特别是受益于美元走弱和全球流动性改善的行业如新兴市场、科技和消费龙头。投资者可适度关注全球配置型基金和科技成长主题基金。',
        relevantFunds: ['易方达中证海外互联ETF', '华安标普全球石油指数', '南方全球精选配置']
      },
      {
        id: 2,
        title: '国家发改委：加快培育新质生产力，推动经济高质量发展',
        source: '经济参考报',
        date: '2023-12-12',
        summary: '国家发改委召开专题会议，强调要以科技创新引领现代化产业体系建设，加快培育新质生产力，推动经济高质量发展。重点发展人工智能、量子信息、生物技术等前沿领域。',
        impact: '政策导向明确支持科技创新和产业升级，有望带动相关领域投资增长。对基金投资而言，科技创新、高端制造、人工智能等主题基金可能迎来政策红利期。投资者可关注具有核心技术和研发优势的科技龙头企业以及产业链上下游的优质公司，适度配置相关主题基金。',
        relevantFunds: ['工银瑞信前沿医疗股票', '招商中证人工智能主题指数', '易方达创新驱动混合']
      },
      {
        id: 3,
        title: '重磅数据：11月社融增量超预期，经济回暖信号显现',
        source: '证券时报',
        date: '2023-12-10',
        summary: '央行公布11月金融数据，新增社会融资规模2.45万亿元，明显高于市场预期；M2同比增长9.3%，新增人民币贷款1.09万亿元，均显示经济活动有所回暖。',
        impact: '金融数据超预期反映经济企稳回升迹象，有利于市场风险偏好提升。对基金市场而言，经济基本面改善将支撑企业盈利预期，有望推动权益类资产估值修复。建议投资者可适度增配低估值的周期性行业基金和受益于经济复苏的消费类基金，同时保持对成长板块的关注。',
        relevantFunds: ['富国沪深300指数增强', '景顺长城消费精选混合', '汇添富价值精选混合']
      }
    ]
  };
}

// 用于行为画像数据的钩子
export function useBehaviorData() {
  return {
    behaviorRadarData: [
      { subject: '损失厌恶', score: 75 },
      { subject: '过度自信', score: 60 },
      { subject: '从众心理', score: 30 },
      { subject: '锚定效应', score: 55 },
      { subject: '处置效应', score: 65 },
      { subject: '心理账户', score: 45 }
    ],
    behaviorBiases: [
      {
        name: '损失厌恶',
        score: 75,
        description: '您对亏损的反应比同等收益更强烈，这可能导致您在面临亏损时不愿意止损，或过早兑现收益。',
        suggestions: [
          '设置自动止损点，避免情绪化决策',
          '制定投资计划并严格执行',
          '将注意力从短期波动转移到长期价值上'
        ]
      },
      {
        name: '过度自信',
        score: 60,
        description: '您可能高估自己的判断和预测能力，这可能导致过度交易或过度集中投资。',
        suggestions: [
          '定期回顾和评估过去的投资决策',
          '考虑相反观点和潜在风险',
          '增加投资组合多样性'
        ]
      }
    ],
    behaviorStats: {
      tradingFrequency: {
        daily: 0.5,
        weekly: 2.8,
        monthly: 12.4
      },
      marketConditionReactions: {
        bullMarket: 'aggressive',
        bearMarket: 'fearful',
        volatileMarket: 'reactive'
      }
    },
    getPrimaryBiases: () => ['损失厌恶', '过度自信'],
    getBehaviorRiskScore: () => 68,
    getKnowledgeScore: () => 72,
    loading: false,
    error: null
  };
}

// 实用格式化工具
export const formatters = {
  // 格式化货币
  formatCurrency: (value) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 2
    }).format(value);
  },
  // 格式化百分比
  formatPercent: (value) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 2
    }).format(value / 100);
  },
  // 格式化日期
  formatDate: (dateString, format = 'short') => {
    const date = new Date(dateString);
    if (format === 'short') {
      return date.toLocaleDateString('zh-CN');
    } else if (format === 'medium') {
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } else if (format === 'long') {
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      });
    }
    return dateString;
  }
};
