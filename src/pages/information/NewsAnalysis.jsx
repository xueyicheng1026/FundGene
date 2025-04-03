import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchNewsAnalysis } from '../../services/mockApi';
import './NewsAnalysis.css';

const NewsAnalysis = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();
  
  // 加载新闻分析数据
  useEffect(() => {
    const loadNews = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 调用API获取新闻数据
        const response = await fetchNewsAnalysis();
        
        if (response.success) {
          setNews(response.data);
        } else {
          throw new Error('获取新闻分析数据失败');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadNews();
  }, []);
  
  // 如果正在加载，显示加载状态
  if (loading) {
    return <div className="loading">加载新闻分析数据中...</div>;
  }
  
  // 如果加载出错，显示错误信息
  if (error) {
    return <div className="error">{error}</div>;
  }
  
  // 列表页面
  return (
    <div className="news-list-page">
      <div className="page-header">
        <h1 className="page-title">新闻解读</h1>
        <p className="page-description">
          智能分析市场热点新闻，深入解读其对投资市场的影响，帮助您把握投资方向。
        </p>
      </div>
      
      <div className="news-container">
        {news.map(item => (
          <div key={item.id} className="news-card">
            <div className="news-header">
              <h2 className="news-title">{item.title}</h2>
              <div className="news-meta">
                <span className="news-source">{item.source}</span>
                <span className="news-date">{item.date}</span>
              </div>
            </div>
            
            <p className="news-summary">{item.summary}</p>
            
            <div className="news-impact">
              <h3 className="impact-title">投资影响</h3>
              <p className="impact-content">{item.impact}</p>
            </div>
            
            {item.relevantFunds && (
              <div className="relevant-funds">
                <h3 className="funds-title">相关基金</h3>
                <div className="funds-list">
                  {item.relevantFunds.map((fund, idx) => (
                    <span key={idx} className="fund-tag">{fund}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* 未来分页组件位置 */}
      <div className="pagination-placeholder">
        <p>未来将实现分页功能</p>
      </div>
    </div>
  );
};

export default NewsAnalysis;
