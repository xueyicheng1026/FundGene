// 模拟投资组合数据
export const mockPortfolioData = [
  { name: '股票型基金', value: 50000, percent: 0.5 },
  { name: '债券型基金', value: 30000, percent: 0.3 },
  { name: '货币型基金', value: 15000, percent: 0.15 },
  { name: '混合型基金', value: 5000, percent: 0.05 },
];

// 模拟投资组合历史表现数据
export const mockPortfolioHistoryData = [
  { date: '2023-01', value: 100000 },
  { date: '2023-02', value: 102000 },
  { date: '2023-03', value: 105000 },
  { date: '2023-04', value: 103000 },
  { date: '2023-05', value: 108000 },
  { date: '2023-06', value: 110000 },
  { date: '2023-07', value: 111000 },
  { date: '2023-08', value: 114000 },
  { date: '2023-09', value: 113000 },
  { date: '2023-10', value: 116000 },
  { date: '2023-11', value: 119000 },
  { date: '2023-12', value: 120000 },
];

// 模拟决策对比数据
export const mockComparisonData = [
  { date: '2023-01-01', user: 0.00, ai: 0.00, benchmark: 0.00 },
  { date: '2023-02-01', user: 0.02, ai: 0.025, benchmark: 0.015 },
  { date: '2023-03-01', user: 0.05, ai: 0.06, benchmark: 0.03 },
  { date: '2023-04-01', user: 0.03, ai: 0.05, benchmark: 0.02 },
  { date: '2023-05-01', user: 0.08, ai: 0.09, benchmark: 0.04 },
  { date: '2023-06-01', user: 0.10, ai: 0.12, benchmark: 0.06 },
  { date: '2023-07-01', user: 0.11, ai: 0.14, benchmark: 0.07 },
  { date: '2023-08-01', user: 0.14, ai: 0.17, benchmark: 0.09 },
  { date: '2023-09-01', user: 0.13, ai: 0.18, benchmark: 0.10 },
  { date: '2023-10-01', user: 0.16, ai: 0.21, benchmark: 0.12 },
  { date: '2023-11-01', user: 0.19, ai: 0.24, benchmark: 0.14 },
  { date: '2023-12-01', user: 0.20, ai: 0.28, benchmark: 0.15 },
];

// 模拟行为画像数据
export const mockBehaviorData = [
  {
    subject: '风险承受能力',
    value: 65,
    ideal: 80,
    description: '您对风险的承受能力低于理想水平。建议尝试更多元化的投资组合。'
  },
  {
    subject: '情绪控制',
    value: 40,
    ideal: 90,
    description: '您在投资过程中容易受情绪影响。建议制定明确的投资计划并严格执行。'
  },
  {
    subject: '知识水平',
    value: 70,
    ideal: 75,
    description: '您的投资知识基本到位，可以继续深入了解复杂投资产品的特性。'
  },
  {
    subject: '行为一致性',
    value: 55,
    ideal: 85,
    description: '您的投资行为存在不一致性，建议建立明确的投资原则。'
  },
  {
    subject: '决策速度',
    value: 80,
    ideal: 70,
    description: '您的决策速度过快，可能导致草率决定。建议进行更全面的研究。'
  },
  {
    subject: '自我学习',
    value: 75,
    ideal: 90,
    description: '您有良好的学习习惯，但可以更系统地学习投资知识。'
  },
];

// 模拟行为偏差数据
export const mockBehaviorBiases = [
  {
    name: '损失厌恶',
    score: 8.2,
    description: '您过度害怕亏损，可能导致错过好的投资机会。',
    suggestions: [
      '设定止损点但不过早退出市场',
      '关注长期回报而非短期波动',
      '尝试小额投资来降低心理压力'
    ]
  },
  {
    name: '过度自信',
    score: 7.6,
    description: '您可能高估自己的知识和预测能力。',
    suggestions: [
      '定期检查投资业绩与基准的对比',
      '记录投资决策和原因，以便回顾',
      '听取不同的观点'
    ]
  },
  {
    name: '从众效应',
    score: 6.1,
    description: '您有时会跟随大众情绪而非独立思考。',
    suggestions: [
      '制定投资计划并坚持执行',
      '逆向思考：当大多数人恐惧时考虑投资机会',
      '关注基本面而非市场情绪'
    ]
  },
  {
    name: '锚定效应',
    score: 5.7,
    description: '您可能过度依赖于某个参考点（如购买价格）来做决策。',
    suggestions: [
      '关注资产的内在价值而非购买价格',
      '定期重新评估投资组合中的每个资产',
      '避免"沉没成本"思维陷阱'
    ]
  },
];

// 模拟新闻数据
export const mockNewsData = [
  {
    id: 1,
    title: '央行降准0.5个百分点，释放流动性约1万亿元',
    source: '经济日报',
    date: '2023-12-15',
    summary: '中国人民银行宣布下调存款准备金率0.5个百分点，将释放长期资金约1万亿元。这一措施旨在增强金融对实体经济的支持力度。',
    impact: '这一政策可能对债券市场形成利好，债券型基金有望受益。同时可能提振股市信心，尤其是金融板块。',
    relevantFunds: ['易方达稳健收益债券', '南方宝元债券', '工银瑞信金融地产ETF']
  },
  {
    id: 2,
    title: '新能源汽车产业链迎来政策红利，多地出台补贴措施',
    source: '证券时报',
    date: '2023-12-10',
    summary: '多个省市近期相继出台新能源汽车消费补贴政策，包括购置补贴、充电设施建设补贴等多种形式，进一步促进新能源汽车消费。',
    impact: '新能源汽车产业链相关公司有望受益，包括整车制造、电池、电机、电控等细分领域。相关主题基金可能在短期内表现活跃。',
    relevantFunds: ['易方达新能源汽车主题ETF', '华夏新能源车ETF', '广发汽车ETF']
  },
  {
    id: 3,
    title: '医疗创新推动医药行业结构优化，CXO企业迎来发展机遇',
    source: '上海证券报',
    date: '2023-12-05',
    summary: '国家药监局发布《关于深化药品审评审批制度改革加快创新医药产品上市的意见》，支持创新药物研发和产业化。',
    impact: '医药创新企业和CXO企业有望加速发展，生物医药行业结构优化趋势明显。相关医药主题基金可能在中长期获得较好表现。',
    relevantFunds: ['富国生物医药主题', '汇添富医疗服务混合', '易方达医疗保健行业']
  },
];

// 模拟政策解读数据
export const mockPolicyData = [
  {
    id: 1,
    title: '《关于加快推动数字技术与实体经济深度融合的指导意见》',
    issuer: '国务院',
    date: '2023-11-28',
    summary: '文件提出到2025年，数字技术向国民经济各领域加速渗透，制造业数字化转型成效显著，数字经济新业态新模式蓬勃发展。',
    analysis: '这一政策强调数字经济与实体经济深度融合，重点支持方向包括工业互联网、大数据、人工智能等领域。数字技术相关企业，特别是能够助力传统产业数字化转型的企业将直接受益。',
    impact: [
      { sector: '数字经济', effect: 'positive', description: '云计算、大数据、人工智能等领域将获得政策支持' },
      { sector: '制造业', effect: 'positive', description: '智能制造、工业互联网应用将加速推进' },
      { sector: '传统零售', effect: 'neutral', description: '数字化转型是挑战也是机遇' }
    ],
    relevantFunds: ['华夏科技创新混合', '易方达创新未来混合', '南方信息创新混合']
  },
  {
    id: 2,
    title: '《关于金融支持实体经济高质量发展的意见》',
    issuer: '中国人民银行、国家金融监督管理总局',
    date: '2023-11-15',
    summary: '文件强调金融要更好服务实体经济，引导金融资源重点支持科技创新、绿色发展、中小微企业等领域。',
    analysis: '这一政策旨在优化金融资源配置，提高金融服务实体经济的效率。科技创新、绿色发展、中小微企业等领域将获得更多金融支持，相关企业融资环境有望改善。',
    impact: [
      { sector: '科技创新', effect: 'positive', description: '高新技术企业融资渠道将拓宽' },
      { sector: '绿色产业', effect: 'positive', description: '绿色金融将进一步发展，支持低碳转型' },
      { sector: '中小企业', effect: 'positive', description: '融资难、融资贵问题有望缓解' },
      { sector: '传统高污染行业', effect: 'negative', description: '金融支持将减少' }
    ],
    relevantFunds: ['博时科创主题3年封闭运作混合', '广发资源优选混合', '招商中证全指证券公司ETF']
  },
];

// 模拟场景模拟数据
export const mockScenarioData = [
  {
    id: 1,
    title: '2015年股灾',
    description: '2015年中国股市经历了大幅波动，6月中旬至8月末上证指数从5178点最低跌至2850点，跌幅近45%。',
    events: [
      { date: '2015-06-12', title: '股市见顶', description: '上证指数达到5178.19点的高位。', action: 'sell' },
      { date: '2015-06-19', title: '首次大跌', description: '上证指数单周下跌13.32%。', action: 'hold' },
      { date: '2015-07-27', title: '黑色星期一', description: '上证指数单日下跌8.48%。', action: 'buy' },
      { date: '2015-08-24', title: '再次暴跌', description: '上证指数单日下跌8.49%。', action: 'buy' },
      { date: '2015-08-26', title: '市场企稳', description: '股市开始企稳回升。', action: 'hold' }
    ],
    questions: [
      { 
        id: 1, 
        question: '在股市见顶时，最理性的投资行为是什么？', 
        options: [
          '继续买入以获取更多收益', 
          '全部卖出规避风险', 
          '减持部分高估值股票，保留价值型股票',
          '不做任何操作，继续持有'
        ],
        correctAnswer: 2,
        explanation: '市场出现非理性繁荣时，适当减持高估值、高风险资产是明智之举，但不必完全清仓，可以保留具有长期价值的标的。'
      },
      { 
        id: 2, 
        question: '在市场大幅下跌后，如何判断是否是买入机会？', 
        options: [
          '只要跌幅超过20%就是买入机会', 
          '跟随大多数投资者的行为', 
          '基于对公司基本面和估值的分析做决策',
          '等待市场完全企稳后再买入'
        ],
        correctAnswer: 2,
        explanation: '投资决策应该基于对公司基本面和估值的客观分析，而不是简单地跟随市场情绪或机械地基于价格波动。'
      }
    ],
    lessons: [
      '投资决策应以基本面分析为基础，而非市场情绪',
      '分散投资可以有效降低投资组合波动性',
      '市场极度恐慌时往往是长期价值投资者的买入机会',
      '在牛市高点保持谨慎，适当降低仓位是明智之举'
    ]
  },
  {
    id: 2,
    title: '新冠疫情市场冲击',
    description: '2020年初新冠疫情全球蔓延，全球股市遭遇剧烈震荡，随后在流动性宽松和经济复苏预期下强劲反弹。',
    events: [
      { date: '2020-02-03', title: '疫情爆发初期', description: '中国股市大幅下跌，上证指数单日跌幅7.72%。', action: 'hold' },
      { date: '2020-03-16', title: '全球股灾', description: '道琼斯指数单日下跌12.93%，创下1987年以来最大单日跌幅。', action: 'buy' },
      { date: '2020-03-24', title: '美股触底', description: '美股开始反弹，道指单日上涨11.37%。', action: 'buy' },
      { date: '2020-04-30', title: '市场回暖', description: '全球主要股指从低点已反弹20%以上。', action: 'hold' },
      { date: '2020-11-09', title: '疫苗曙光', description: '辉瑞公布疫苗有效性数据，全球股市大涨。', action: 'rebalance' }
    ],
    questions: [
      { 
        id: 1, 
        question: '在全球性危机爆发初期，投资者应该如何应对？', 
        options: [
          '立即清仓所有股票类资产', 
          '增加现金储备，同时寻找低估的优质资产', 
          '加杠杆抄底',
          '不做任何调整，坚持原有策略'
        ],
        correctAnswer: 1,
        explanation: '在危机初期保持一定流动性很重要，但同时也应该冷静分析，逐步布局被过度悲观情绪打压的优质资产。'
      },
      { 
        id: 2, 
        question: '疫情危机中，哪类资产配置策略最为有效？', 
        options: [
          '全仓避险资产（如黄金、国债）', 
          '全仓股票抄底', 
          '多元资产配置，兼顾防御和进攻',
          '全部转为现金等待机会'
        ],
        correctAnswer: 2,
        explanation: '多元化资产配置能够在不确定性高的环境中提供更好的风险调整后回报，既有防御性资产保护资金安全，又有进攻性资产把握反弹机会。'
      }
    ],
    lessons: [
      '危机往往是长期投资者的良好买入机会',
      '流动性危机中现金为王，保持充足流动性很重要',
      '多元化资产配置是应对极端市场事件的有效手段',
      '情绪化决策往往导致在最低点卖出，错过随后的反弹'
    ]
  }
];

// 模拟聊天对话数据
export const mockChatData = [
  {
    id: 1,
    role: 'assistant',
    content: '欢迎使用FundGene智能助手，我可以帮助您了解基金投资相关知识，分析您的投资行为，并提供个性化建议。请问有什么可以帮到您的？'
  }
];

export const mockChatResponses = {
  default: '我正在学习更多关于投资的知识。您能够更具体地描述您的问题吗？',
  
  // 基础问题回答
  '什么是基金': '基金是一种集合投资工具，由基金管理公司管理，将众多投资者的资金集中起来，投资于股票、债券等金融工具的组合。基金可以让普通投资者间接投资于分散的投资组合，降低单一投资风险。',
  
  '基金类型': '基金主要分为以下类型：\n1. 股票型基金：主要投资于股票\n2. 债券型基金：主要投资于债券\n3. 混合型基金：同时投资股票和债券\n4. 货币市场基金：投资于短期货币市场工具\n5. 指数基金：跟踪特定指数\n6. ETF：可在交易所交易的指数基金\n每种类型的风险和收益特点都不同，适合不同的投资需求。',
  
  '如何选择基金': '选择基金可考虑以下因素：\n1. 投资目标与风险承受能力\n2. 基金历史业绩与波动性\n3. 基金经理的管理能力与经验\n4. 基金规模与费率\n5. 基金公司的声誉\n建议根据自身情况多元化配置不同类型的基金，并定期检视调整。',
  
  '什么是定投': '基金定投是指在固定时间以固定金额投资特定基金的策略。其优势在于：\n1. 平均成本法，降低择时风险\n2. 培养良好投资习惯\n3. 适合长期投资\n4. 利用复利效应积累财富\n定投适合没有大量闲置资金但有稳定收入的投资者。',
  
  // 行为偏差相关问题
  '什么是损失厌恶': '损失厌恶是指投资者对亏损的痛苦感受比同等收益的喜悦感受更强烈。这种心理偏差可能导致投资者在面临亏损时不愿意止损，同时又过早兑现盈利。克服损失厌恶可通过设定明确的投资计划、使用自动止损和定期再平衡等策略。',
  
  '什么是羊群效应': '羊群效应是指投资者倾向于跟随大众行为而非独立思考的现象。在投资中表现为追涨杀跌、热门基金集中申购等。这种行为往往导致在高点买入、低点卖出的结果。应对策略包括：制定独立的投资计划、反向思考、关注价值而非价格、避免频繁交易。',
  
  // 市场分析类问题
  '当前市场分析': '当前市场呈现结构性特征，科技、消费和新能源等成长板块估值较高，而金融、地产等传统板块估值处于历史低位。建议：\n1. 均衡配置成长与价值\n2. 关注政策支持方向\n3. 保持适度现金仓位应对波动\n4. 定投指数基金作为核心配置\n请注意，这只是一般性建议，具体投资决策应结合您的个人情况。',
  
  // 投资组合建议
  '如何构建投资组合': '构建健康的投资组合应考虑：\n1. 资产配置：根据风险承受能力和投资目标配置股票、债券、现金比例\n2. 多元化：分散投资于不同行业、地区的基金\n3. 风险管理：根据风险等级合理分配资金比例\n4. 定期再平衡：维持目标资产配置比例\n5. 长期视角：避免频繁交易，专注长期表现\n对于普通投资者，可考虑"核心-卫星"策略，核心部分配置低成本指数基金，卫星部分选择特定行业或主题基金。'
};

// 模拟再平衡建议数据
export const mockRebalanceData = {
  currentAllocation: [
    { category: '股票型基金', current: 60, target: 50, action: 'reduce', amount: 10000 },
    { category: '债券型基金', current: 20, target: 30, action: 'increase', amount: 10000 },
    { category: '货币市场基金', current: 15, target: 15, action: 'maintain', amount: 0 },
    { category: '黄金/商品', current: 5, target: 5, action: 'maintain', amount: 0 },
  ],
  specificRecommendations: [
    { 
      fund: '易方达沪深300ETF联接', 
      code: '110020', 
      currentValue: 30000, 
      targetValue: 25000, 
      action: 'reduce', 
      amount: 5000,
      reason: '当前股票型基金比例过高，降低系统性风险' 
    },
    { 
      fund: '华夏上证50ETF', 
      code: '510050', 
      currentValue: 30000, 
      targetValue: 25000, 
      action: 'reduce', 
      amount: 5000,
      reason: '大盘蓝筹估值处于历史高位，适度降低配置' 
    },
    { 
      fund: '南方中债1-3年国开行债券指数', 
      code: '005095', 
      currentValue: 10000, 
      targetValue: 15000, 
      action: 'increase', 
      amount: 5000,
      reason: '短债收益率处于相对高位，性价比较高' 
    },
    { 
      fund: '建信中债5-10年国开行债券指数', 
      code: '003358', 
      currentValue: 10000, 
      targetValue: 15000, 
      action: 'increase', 
      amount: 5000,
      reason: '中长期利率债收益率有所上升，配置价值提升' 
    },
  ],
  rationale: '根据当前市场环境分析，股票市场估值处于合理偏高区间，债券收益率相对有吸引力。考虑到您的风险承受能力评估结果为"中等"，建议适当降低权益类资产比例，增加固定收益类资产配置，以降低组合波动性，同时保持合理收益预期。',
  expectedImpact: {
    risk: '预计组合波动性降低约15%',
    return: '预期年化收益率略有降低（约0.5%），但风险调整后收益有望提升',
    sharpeRatio: '夏普比率预期从0.85提升至1.1左右'
  }
};

// 模拟用户行为数据
export const mockUserBehaviorData = {
  userId: '123456',
  loginFrequency: {
    daily: 2.3,
    weekly: 12.5,
    monthly: 45.2
  },
  tradingFrequency: {
    daily: 0.5,
    weekly: 2.1,
    monthly: 8.4
  },
  behaviorPatterns: {
    chasePerformance: 0.75, // 0-1, 1表示非常明显
    lossAversion: 0.82,
    overconfidence: 0.65,
    herdBehavior: 0.58,
    anchoringBias: 0.71
  },
  marketConditionReactions: {
    bullMarket: 'aggressive', // aggressive, moderate, conservative
    bearMarket: 'fearful', // fearful, cautious, opportunistic
    volatileMarket: 'reactive' // reactive, stable, counter-cyclical
  },
  riskToleranceScore: 68, // 0-100
  knowledgeScore: 72, // 0-100
};
