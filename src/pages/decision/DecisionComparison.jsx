import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import ComparisonChart from '../../components/charts/ComparisonChart';
import { fetchComparisonData } from '../../services/mockApi';
import { ArrowUpOutlined, ArrowDownOutlined, MinusOutlined, ExperimentOutlined, ReloadOutlined } from '@ant-design/icons';
import './DecisionComparison.css';

/**
 * 决策对比页面
 * 展示用户、AI决策与市场基准的对比分析
 */
const DecisionComparison = () => {
  // 多组示例数据场景
  const exampleScenarios = {
    default: {
      name: "常规市场",
      description: "展示过去一年用户决策与AI推荐在常规市场中的表现对比",
      data: [
        { date: '2025-03', userReturn: 2.3, aiReturn: 3.1, benchmark: 1.8 },
        { date: '2025-02', userReturn: -1.5, aiReturn: -0.7, benchmark: -1.2 },
        { date: '2025-01', userReturn: 1.8, aiReturn: 2.5, benchmark: 2.0 },
        { date: '2024-12', userReturn: 2.7, aiReturn: 3.2, benchmark: 2.4 },
        { date: '2024-11', userReturn: 1.4, aiReturn: 2.0, benchmark: 1.6 },
        { date: '2024-10', userReturn: -0.6, aiReturn: 0.5, benchmark: -0.3 },
        { date: '2024-09', userReturn: 2.2, aiReturn: 2.5, benchmark: 1.9 },
        { date: '2024-08', userReturn: 0.8, aiReturn: 1.6, benchmark: 1.0 },
        { date: '2024-07', userReturn: -2.1, aiReturn: -1.3, benchmark: -1.8 },
        { date: '2024-06', userReturn: 3.2, aiReturn: 3.9, benchmark: 3.0 },
        { date: '2024-05', userReturn: 1.1, aiReturn: 1.8, benchmark: 1.3 },
        { date: '2024-04', userReturn: 2.5, aiReturn: 3.0, benchmark: 2.2 }
      ],
      stats: {
        userReturn: 14.8,
        aiReturn: 22.1,
        benchmarkReturn: 13.9,
        outperformance: 7.3
      },
      analysis: {
        title: "常规市场分析",
        summary: "在过去一年的常规市场环境中，AI推荐策略总体表现优于用户决策，主要优势体现在市场波动期间。",
        insights: [
          {
            title: "时机把握",
            content: "AI策略在市场波动期间表现更为稳健，尤其在2024年7月市场下跌时损失较小，这表明在市场下跌时可能存在过度反应的情况。"
          },
          {
            title: "板块选择",
            content: "您的决策在科技和消费领域的配置较为准确，但在传统周期性行业的配置较为保守，而AI策略在这些领域有更多的配置。"
          },
          {
            title: "可能的行为偏差",
            content: "分析显示您可能存在一定程度的'锚定效应'和'损失厌恶'，导致在下跌市场中不愿及时止损或低估反弹机会。"
          }
        ]
      }
    },
    bullMarket: {
      name: "牛市情景",
      description: "展示牛市行情下用户决策与AI推荐的表现对比",
      data: [
        { date: '2025-03', userReturn: 3.8, aiReturn: 4.2, benchmark: 3.5 },
        { date: '2025-02', userReturn: 4.2, aiReturn: 4.6, benchmark: 3.9 },
        { date: '2025-01', userReturn: 3.5, aiReturn: 3.9, benchmark: 3.3 },
        { date: '2024-12', userReturn: 5.1, aiReturn: 4.8, benchmark: 4.5 },
        { date: '2024-11', userReturn: 2.7, aiReturn: 3.3, benchmark: 2.5 },
        { date: '2024-10', userReturn: 3.2, aiReturn: 3.8, benchmark: 3.0 },
        { date: '2024-09', userReturn: 4.6, aiReturn: 4.2, benchmark: 3.8 },
        { date: '2024-08', userReturn: 3.1, aiReturn: 3.6, benchmark: 2.9 },
        { date: '2024-07', userReturn: 2.8, aiReturn: 3.5, benchmark: 2.6 },
        { date: '2024-06', userReturn: 5.3, aiReturn: 4.9, benchmark: 4.6 },
        { date: '2024-05', userReturn: 4.2, aiReturn: 4.5, benchmark: 3.9 },
        { date: '2024-04', userReturn: 3.7, aiReturn: 4.1, benchmark: 3.4 }
      ],
      stats: {
        userReturn: 46.2,
        aiReturn: 49.4,
        benchmarkReturn: 42.9,
        outperformance: 3.2
      },
      analysis: {
        title: "牛市分析",
        summary: "在牛市行情中，您的投资决策与AI推荐都取得了显著正收益，两者表现较为接近，但不同时期存在特定差异。",
        insights: [
          {
            title: "择时能力",
            content: "您在2024年12月和2024年6月市场高涨期的表现甚至超过了AI，显示出较好的进攻性择时能力。"
          },
          {
            title: "风险承担",
            content: "总体而言，AI策略在大多数月份仍有轻微优势，反映出更一致的风险管理和对市场热点的把握能力。"
          },
          {
            title: "行为特征",
            content: "牛市中您的表现接近AI，说明您的决策在市场向好时更为理性，较少出现认知偏差。这显示出'过度自信'特征可能在上涨市场中反而带来一定优势。"
          }
        ]
      }
    },
    bearMarket: {
      name: "熊市情景",
      description: "展示熊市行情下用户决策与AI推荐的表现对比",
      data: [
        { date: '2025-03', userReturn: -1.2, aiReturn: -0.8, benchmark: -1.5 },
        { date: '2025-02', userReturn: -3.5, aiReturn: -2.1, benchmark: -3.8 },
        { date: '2025-01', userReturn: -2.8, aiReturn: -1.5, benchmark: -3.0 },
        { date: '2024-12', userReturn: -4.5, aiReturn: -2.8, benchmark: -4.7 },
        { date: '2024-11', userReturn: -0.9, aiReturn: -0.5, benchmark: -1.2 },
        { date: '2024-10', userReturn: -5.2, aiReturn: -3.3, benchmark: -5.5 },
        { date: '2024-09', userReturn: -2.4, aiReturn: -1.5, benchmark: -2.7 },
        { date: '2024-08', userReturn: 1.3, aiReturn: 1.8, benchmark: 0.8 },
        { date: '2024-07', userReturn: -6.8, aiReturn: -4.2, benchmark: -7.1 },
        { date: '2024-06', userReturn: -3.1, aiReturn: -1.9, benchmark: -3.4 },
        { date: '2024-05', userReturn: -2.7, aiReturn: -1.6, benchmark: -2.9 },
        { date: '2024-04', userReturn: -1.8, aiReturn: -1.2, benchmark: -2.0 }
      ],
      stats: {
        userReturn: -33.6,
        aiReturn: -19.6,
        benchmarkReturn: -37.0,
        outperformance: 14.0
      },
      analysis: {
        title: "熊市分析",
        summary: "在熊市行情中，虽然投资组合整体呈下跌趋势，但AI推荐策略的下跌幅度明显小于用户决策，体现出更强的风险控制能力。",
        insights: [
          {
            title: "风险控制",
            content: "AI推荐策略在2024年7月市场大幅下跌时，损失比您的决策少了2.6个百分点，显示出更好的风险预警和防御能力。"
          },
          {
            title: "避险策略",
            content: "在2024年8月短暂的市场反弹中，AI能够更好地抓住机会获利，这表明AI在熊市中也能保持对市场积极因素的敏感性。"
          },
          {
            title: "行为偏差",
            content: "您的决策在下跌市场中表现较弱，可能受到'损失厌恶'和'处置效应'的影响，即倾向于过早卖出盈利标的而继续持有亏损标的，希望等待反弹。"
          }
        ]
      }
    },
    volatile: {
      name: "高波动市场",
      description: "展示高波动行情下用户决策与AI推荐的表现对比",
      data: [
        { date: '2025-03', userReturn: 5.6, aiReturn: 4.2, benchmark: 4.9 },
        { date: '2025-02', userReturn: -6.8, aiReturn: -3.9, benchmark: -6.2 },
        { date: '2025-01', userReturn: 3.7, aiReturn: 3.4, benchmark: 3.2 },
        { date: '2024-12', userReturn: -7.3, aiReturn: -4.5, benchmark: -6.8 },
        { date: '2024-11', userReturn: 6.1, aiReturn: 4.8, benchmark: 5.4 },
        { date: '2024-10', userReturn: -4.9, aiReturn: -3.2, benchmark: -4.5 },
        { date: '2024-09', userReturn: 5.2, aiReturn: 4.1, benchmark: 4.7 },
        { date: '2024-08', userReturn: -5.8, aiReturn: -3.6, benchmark: -5.3 },
        { date: '2024-07', userReturn: 4.7, aiReturn: 3.8, benchmark: 4.2 },
        { date: '2024-06', userReturn: -6.5, aiReturn: -3.8, benchmark: -5.9 },
        { date: '2024-05', userReturn: 5.9, aiReturn: 4.5, benchmark: 5.2 },
        { date: '2024-04', userReturn: -5.3, aiReturn: -3.4, benchmark: -4.8 }
      ],
      stats: {
        userReturn: -5.4,
        aiReturn: 2.4,
        benchmarkReturn: -5.9,
        outperformance: 7.8
      },
      analysis: {
        title: "高波动市场分析",
        summary: "在高波动行情中，您的决策与市场基准一样呈现负收益，而AI推荐策略保持了小幅正收益，展现出卓越的波动管理能力。",
        insights: [
          {
            title: "波动管理",
            content: "AI策略在下跌月份的损失普遍小于您的决策，体现出更强的风险控制，尽管在上涨月份您的收益率略高。"
          },
          {
            title: "情绪控制",
            content: "您的决策在波动市场中表现出更明显的'追涨杀跌'特征，可能受到市场情绪的过度影响，而AI策略则更为稳定和理性。"
          },
          {
            title: "策略一致性",
            content: "分析显示AI在保持策略一致性方面表现更佳，不会因短期市场波动而频繁改变投资策略，这在高波动市场中尤为重要。"
          }
        ]
      }
    }
  };
  
  // 状态管理
  const [selectedScenario, setSelectedScenario] = useState('default');
  const [useExampleData, setUseExampleData] = useState(true);
  const [comparisonData, setComparisonData] = useState(exampleScenarios.default.data);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('1year'); // 默认展示1年数据
  const [stats, setStats] = useState(exampleScenarios.default.stats);
  
  // 加载对比数据
  useEffect(() => {
    const loadComparisonData = async () => {
      if (useExampleData) {
        // 使用示例数据
        setComparisonData(exampleScenarios[selectedScenario].data);
        setStats(exampleScenarios[selectedScenario].stats);
        setLoading(false);
        return;
      }
      
      // 否则尝试从API获取真实数据
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetchComparisonData();
        
        if (response.success) {
          setComparisonData(response.data);
          
          // 计算累计收益
          if (response.data.length > 0) {
            // 累计每月收益率计算累计收益
            let userCumulative = 0;
            let aiCumulative = 0;
            let benchmarkCumulative = 0;
            
            response.data.forEach(item => {
              userCumulative += item.userReturn;
              aiCumulative += item.aiReturn;
              benchmarkCumulative += item.benchmark;
            });
            
            setStats({
              userReturn: parseFloat(userCumulative.toFixed(1)),
              aiReturn: parseFloat(aiCumulative.toFixed(1)),
              benchmarkReturn: parseFloat(benchmarkCumulative.toFixed(1)),
              outperformance: parseFloat((aiCumulative - userCumulative).toFixed(1))
            });
          }
        } else {
          console.warn('API获取失败，使用示例数据');
          setUseExampleData(true);
          setComparisonData(exampleScenarios[selectedScenario].data);
          setStats(exampleScenarios[selectedScenario].stats);
        }
      } catch (err) {
        console.error('API获取出错:', err);
        setError('获取决策对比数据失败，显示示例数据');
        // 加载失败时使用示例数据
        setUseExampleData(true);
        setComparisonData(exampleScenarios[selectedScenario].data);
        setStats(exampleScenarios[selectedScenario].stats);
      } finally {
        setLoading(false);
      }
    };
    
    loadComparisonData();
  }, [selectedScenario, useExampleData]);
  
  // 按照所选时间段筛选数据
  const getFilteredData = () => {
    if (!comparisonData || comparisonData.length === 0) {
      return [];
    }
    
    const currentDate = new Date();
    let filterDate = new Date();
    
    switch (selectedPeriod) {
      case '3months':
        filterDate.setMonth(currentDate.getMonth() - 3);
        break;
      case '6months':
        filterDate.setMonth(currentDate.getMonth() - 6);
        break;
      case '1year':
        filterDate.setFullYear(currentDate.getFullYear() - 1);
        break;
      case 'all':
        return comparisonData;
      default:
        filterDate.setFullYear(currentDate.getFullYear() - 1);
    }
    
    return comparisonData.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= filterDate;
    });
  };
  
  // 创建月度表现表格数据
  const getMonthlyPerformanceData = () => {
    if (!comparisonData || comparisonData.length === 0) {
      return [];
    }
    
    // 按日期降序排序（最新的在前面）
    return [...comparisonData].sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });
  };
  
  // 渲染表现指标
  const renderPerformanceIndicator = (value) => {
    if (value > 0) {
      return (
        <span className="performance-indicator positive">
          <ArrowUpOutlined className="indicator-icon" />
          {value.toFixed(1)}%
        </span>
      );
    } else if (value < 0) {
      return (
        <span className="performance-indicator negative">
          <ArrowDownOutlined className="indicator-icon" />
          {Math.abs(value).toFixed(1)}%
        </span>
      );
    } else {
      return (
        <span className="performance-indicator neutral">
          <MinusOutlined className="indicator-icon" />
          {value.toFixed(1)}%
        </span>
      );
    }
  };
  
  // 处理场景切换
  const handleScenarioChange = (scenario) => {
    setSelectedScenario(scenario);
    setUseExampleData(true);
  };
  
  // 切换数据来源 (API或示例)
  const toggleDataSource = () => {
    setUseExampleData(!useExampleData);
  };
  
  // 如果正在加载，显示加载状态
  if (loading) {
    return <div className="loading dark-text-tertiary">加载决策对比数据中...</div>;
  }
  
  // 如果加载出错，显示错误信息
  if (error) {
    return <div className="error dark-bg-error dark-text-error">{error}</div>;
  }
  
  // 获取筛选后的数据和当前选择的场景分析
  const filteredData = getFilteredData();
  const monthlyPerformance = getMonthlyPerformanceData();
  const currentScenario = exampleScenarios[selectedScenario];
  
  return (
    <div className="comparison-page">
      {/* 页面头部 */}
      <div className="page-header">
        <h1 className="page-title dark-text-heading">决策对比分析</h1>
        <p className="page-description dark-text-description">
          对比您的投资决策与AI推荐决策的表现，分析差异原因，帮助您提升决策质量和避免潜在的行为偏差。
        </p>
      </div>
      
      {/* 示例数据提示 */}
      {useExampleData && (
        <div className="example-data-notice dark-bg-info">
          <ExperimentOutlined className="notice-icon" />
          <span>当前显示的是<strong>{currentScenario.name}</strong>示例数据。{currentScenario.description}</span>
          <button 
            className="reload-button"
            onClick={toggleDataSource}
            title="尝试加载真实数据"
          >
            <ReloadOutlined /> 尝试加载真实数据
          </button>
        </div>
      )}
      
      {/* 场景选择器 */}
      {useExampleData && (
        <div className="scenario-selector">
          <h3 className="selector-title dark-text-secondary">选择示例场景：</h3>
          <div className="scenario-buttons">
            {Object.keys(exampleScenarios).map(key => (
              <button
                key={key}
                className={`scenario-button ${selectedScenario === key ? 'active' : ''}`}
                onClick={() => handleScenarioChange(key)}
              >
                {exampleScenarios[key].name}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* 时间段选择器 */}
      <div className="period-selector">
        <button 
          className={`period-button ${selectedPeriod === '3months' ? 'active' : ''}`}
          onClick={() => setSelectedPeriod('3months')}
        >
          3个月
        </button>
        <button 
          className={`period-button ${selectedPeriod === '6months' ? 'active' : ''}`}
          onClick={() => setSelectedPeriod('6months')}
        >
          6个月
        </button>
        <button 
          className={`period-button ${selectedPeriod === '1year' ? 'active' : ''}`}
          onClick={() => setSelectedPeriod('1year')}
        >
          1年
        </button>
        <button 
          className={`period-button ${selectedPeriod === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedPeriod('all')}
        >
          全部
        </button>
      </div>
      
      {/* 图表对比 */}
      <Card className="comparison-chart-card dark-bg-card dark-shadow-sm">
        <h2 className="chart-title dark-text-heading">投资决策表现对比 - {currentScenario.name}</h2>
        <p className="chart-description dark-text-description">
          该图表展示了您的投资决策与AI推荐决策和市场基准的收益率对比。分析历史表现可以帮助您识别决策模式并改进投资策略。
        </p>
        <div className="chart-container">
          <ComparisonChart 
            data={filteredData}
            title="收益率对比"
            userLineLabel="您的决策"
            aiLineLabel="AI推荐"
            benchmarkLabel="基准指数"
          />
        </div>
      </Card>
      
      {/* 统计数据 */}
      <div className="performance-stats">
        <Card className="stat-card dark-bg-card dark-shadow-sm">
          <h3 className="stat-title dark-text-secondary">您的累计收益</h3>
          <p className={`stat-value ${stats.userReturn >= 0 ? 'positive' : 'negative'}`}>
            {stats.userReturn >= 0 ? '+' : ''}{stats.userReturn}%
          </p>
          <p className="stat-description dark-text-tertiary">
            {selectedPeriod === '3months' ? '过去3个月' : 
             selectedPeriod === '6months' ? '过去6个月' : 
             selectedPeriod === '1year' ? '过去1年' : '全部时间'}累计回报率
          </p>
        </Card>
        
        <Card className="stat-card dark-bg-card dark-shadow-sm">
          <h3 className="stat-title dark-text-secondary">AI推荐累计收益</h3>
          <p className={`stat-value ${stats.aiReturn >= 0 ? 'positive' : 'negative'}`}>
            {stats.aiReturn >= 0 ? '+' : ''}{stats.aiReturn}%
          </p>
          <p className="stat-description dark-text-tertiary">
            如果按AI建议执行的累计收益率
          </p>
        </Card>
        
        <Card className="stat-card dark-bg-card dark-shadow-sm">
          <h3 className="stat-title dark-text-secondary">表现差异</h3>
          <p className={`stat-value ${stats.outperformance >= 0 ? 'positive' : 'negative'}`}>
            {stats.outperformance >= 0 ? '+' : ''}{stats.outperformance}%
          </p>
          <p className="stat-description dark-text-tertiary">
            AI推荐相对于您的决策的超额收益
          </p>
        </Card>
      </div>
      
      {/* 月度表现详情 */}
      <Card className="details-card dark-bg-card dark-shadow-sm">
        <h2 className="details-title dark-text-heading">月度表现详情</h2>
        <div className="table-container">
          <table className="comparison-table dark-border">
            <thead>
              <tr className="dark-table-header">
                <th>日期</th>
                <th>您的收益</th>
                <th>AI推荐收益</th>
                <th>基准收益</th>
                <th>超额收益</th>
              </tr>
            </thead>
            <tbody>
              {monthlyPerformance.map((item, index) => (
                <tr key={index} className="dark-table-row-hover">
                  <td className="dark-text-primary">{item.date}</td>
                  <td>{renderPerformanceIndicator(item.userReturn)}</td>
                  <td>{renderPerformanceIndicator(item.aiReturn)}</td>
                  <td>{renderPerformanceIndicator(item.benchmark)}</td>
                  <td>{renderPerformanceIndicator(item.aiReturn - item.userReturn)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      
      {/* 分析说明 */}
      <Card className="details-card dark-bg-card dark-shadow-sm">
        <h2 className="details-title dark-text-heading">{currentScenario.analysis.title}</h2>
        <div className="analysis-content dark-text-description">
          <p>{currentScenario.analysis.summary}</p>
          <ul className="analysis-points">
            {currentScenario.analysis.insights.map((insight, index) => (
              <li key={index}>
                <span className="analysis-highlight dark-text-bold">{insight.title}</span> - {insight.content}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="action-buttons">
          <Link to="/dashboard/behavior/profile" className="btn primary">
            查看我的行为画像
          </Link>
          <Link to="/dashboard/cognitive/chat" className="btn secondary dark-bg-tertiary dark-text-primary dark-hover">
            咨询AI顾问
          </Link>
        </div>
        
        <div className="metrics-explanation">
          <h3 className="metrics-title">指标说明</h3>
          <ul className="metrics-list">
            <li><span className="metrics-term">您的收益</span> - 根据您实际执行的投资决策计算的月度收益率</li>
            <li><span className="metrics-term">AI推荐收益</span> - 如果按照AI系统推荐执行的理论收益率</li>
            <li><span className="metrics-term">基准收益</span> - 沪深300指数的月度表现，作为比较基准</li>
            <li><span className="metrics-term">超额收益</span> - AI推荐相对于您的决策的收益差异，正值表示AI表现更好</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default DecisionComparison;