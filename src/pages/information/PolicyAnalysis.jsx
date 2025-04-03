import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchPolicyInterpretations } from '../../services/mockApi';
import './PolicyAnalysis.css';

const PolicyAnalysis = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();
  
  // 加载政策解读数据
  useEffect(() => {
    const loadPolicies = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 调用API获取政策数据
        const response = await fetchPolicyInterpretations();
        
        if (response.success) {
          setPolicies(response.data);
        } else {
          throw new Error('获取政策解读数据失败');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadPolicies();
  }, []);
  
  // 如果正在加载，显示加载状态
  if (loading) {
    return <div className="loading">加载政策解读数据中...</div>;
  }
  
  // 如果加载出错，显示错误信息
  if (error) {
    return <div className="error">{error}</div>;
  }
  
  // 如果存在ID参数，则显示详情页，否则显示列表页
  if (id) {
    const policy = policies.find(item => item.id.toString() === id);
    
    if (!policy) {
      return <div className="error">未找到相关政策解读</div>;
    }
    
    return (
      <div className="policy-detail-page">
        <div className="page-header">
          <button 
            className="back-button" 
            onClick={() => navigate('/information/policy')}
          >
            返回列表
          </button>
          <h1 className="page-title">{policy.title}</h1>
          <div className="policy-meta">
            <span className="policy-issuer">{policy.issuer}</span>
            <span className="policy-date">{policy.date}</span>
          </div>
        </div>
        
        <div className="policy-content">
          <div className="policy-card">
            <h2 className="section-title">政策摘要</h2>
            <p className="policy-summary">{policy.summary}</p>
          </div>
          
          <div className="policy-card">
            <h2 className="section-title">影响分析</h2>
            <div className="policy-analysis">{policy.analysis}</div>
            
            <h3 className="subsection-title">行业影响</h3>
            <div className="sector-impacts">
              {policy.impact.map((item, index) => (
                <div 
                  key={index} 
                  className={`impact-item impact-${item.effect}`}
                >
                  <div className="impact-header">
                    <h4 className="sector-name">{item.sector}</h4>
                    <span className="impact-effect">{
                      item.effect === 'positive' ? '利好' :
                      item.effect === 'negative' ? '利空' : '中性'
                    }</span>
                  </div>
                  <p className="impact-description">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="policy-card">
            <h2 className="section-title">相关基金推荐</h2>
            <div className="related-funds">
              {policy.relevantFunds.map((fund, index) => (
                <div key={index} className="fund-item">
                  <span className="fund-name">{fund}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // 列表页
  return (
    <div className="policy-list-page">
      <div className="page-header">
        <h1 className="page-title">政策解读</h1>
        <p className="page-description">
          智能分析最新政策动向，解读其对不同行业和基金的影响，助您把握投资机会。
        </p>
      </div>
      
      <div className="policies-container">
        {policies.map(policy => (
          <div 
            key={policy.id}
            className="policy-card preview"
            onClick={() => navigate(`/information/policy/${policy.id}`)}
          >
            <div className="policy-header">
              <h2 className="policy-title">{policy.title}</h2>
              <div className="policy-meta">
                <span className="policy-issuer">{policy.issuer}</span>
                <span className="policy-date">{policy.date}</span>
              </div>
            </div>
            
            <p className="policy-summary">{policy.summary}</p>
            
            <div className="policy-impact-preview">
              <h3 className="impact-preview-title">主要影响</h3>
              <div className="impact-tags">
                {policy.impact.map((impact, idx) => (
                  <span 
                    key={idx} 
                    className={`impact-tag ${impact.effect}`}
                  >
                    {impact.sector}
                  </span>
                )).slice(0, 3)}
                {policy.impact.length > 3 && (
                  <span className="impact-tag more">+{policy.impact.length - 3}</span>
                )}
              </div>
            </div>
            
            <div className="policy-card-footer">
              <button className="view-detail-button">查看详情</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PolicyAnalysis;
