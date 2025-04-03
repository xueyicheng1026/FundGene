import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchOutlined } from '@ant-design/icons';
import Card from '../../components/common/Card';
import { getCourses, getCoursesProgress } from '../../services/learningService';
import './LearningCenter.css';

/**
 * 学习中心页面
 * 提供投资知识学习、课程管理和进度跟踪
 */
const LearningCenter = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [progress, setProgress] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 筛选和搜索状态
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // 获取课程数据和进度
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 并行请求数据
        const [coursesResponse, progressResponse] = await Promise.all([
          getCourses(),
          getCoursesProgress()
        ]);
        
        if (coursesResponse.success && progressResponse.success) {
          setCourses(coursesResponse.data);
          setProgress(progressResponse.data);
          
          // 提取所有类别
          const uniqueCategories = [...new Set(coursesResponse.data.map(course => course.category))];
          setCategories(uniqueCategories);
        } else {
          throw new Error('获取数据失败');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // 搜索和筛选课程
  const filteredCourses = courses.filter(course => {
    const matchesCategory = activeCategory === 'all' || course.category === activeCategory;
    const matchesSearch = !searchQuery || 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });
  
  // 获取推荐课程
  const recommendedCourses = courses
    .filter(course => course.recommended)
    .slice(0, 3);
  
  // 获取进行中的课程
  const inProgressCourses = courses
    .filter(course => progress[course.id] && progress[course.id].status === 'in-progress')
    .sort((a, b) => new Date(b.lastAccessed) - new Date(a.lastAccessed))
    .slice(0, 3);
  
  // 处理课程点击
  const handleCourseClick = (courseId) => {
    navigate(`/cognitive/learning/course/${courseId}`);
  };
  
  // 处理搜索输入
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // 处理类别切换
  const handleCategoryChange = (category) => {
    setActiveCategory(category);
  };
  
  if (loading) {
    return <div className="loading">加载学习资源中...</div>;
  }
  
  if (error) {
    return <div className="error">{error}</div>;
  }
  
  return (
    <div className="learning-center-page">
      <div className="page-header">
        <h1 className="page-title">学习中心</h1>
        <p className="page-description">
          提升您的投资知识和认知能力，通过系统化的学习内容和互动课程，培养理性投资思维。
        </p>
      </div>
      
      {/* 搜索栏 */}
      <div className="search-bar">
        <div className="search-input-container">
          <SearchOutlined className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="搜索课程、文章或知识点..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>
      
      {/* 进行中的课程 */}
      {inProgressCourses.length > 0 && (
        <div className="in-progress-section">
          <h2 className="section-title">继续学习</h2>
          <div className="course-cards in-progress">
            {inProgressCourses.map(course => (
              <Card 
                key={course.id} 
                className="course-card in-progress"
                onClick={() => handleCourseClick(course.id)}
              >
                <div className="course-progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${progress[course.id].percentage}%` }}
                  ></div>
                </div>
                <h3 className="course-title">{course.title}</h3>
                <div className="course-meta">
                  <span className="course-category">{course.category}</span>
                  <span className="course-progress">
                    已完成 {progress[course.id].percentage}%
                  </span>
                </div>
                <p className="course-last-accessed">
                  上次学习: {new Date(course.lastAccessed).toLocaleDateString()}
                </p>
                <button className="continue-button">继续学习</button>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {/* 推荐课程 */}
      <div className="recommended-section">
        <h2 className="section-title">推荐课程</h2>
        <div className="course-cards recommended">
          {recommendedCourses.map(course => (
            <Card 
              key={course.id} 
              className="course-card recommended"
              onClick={() => handleCourseClick(course.id)}
            >
              <div className="course-tag">推荐</div>
              <div className="course-image-container">
                <img src={course.imageUrl} alt={course.title} className="course-image" />
              </div>
              <h3 className="course-title">{course.title}</h3>
              <p className="course-description">{course.description}</p>
              <div className="course-meta">
                <span className="course-category">{course.category}</span>
                <span className="course-duration">{course.duration}</span>
              </div>
              <div className="course-stats">
                <span className="course-level">{course.level}</span>
                <span className="course-students">{course.students}人学习</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
      
      {/* 所有课程 */}
      <div className="all-courses-section">
        <div className="section-header">
          <h2 className="section-title">全部课程</h2>
          <div className="category-filter">
            <button 
              className={`category-button ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => handleCategoryChange('all')}
            >
              全部
            </button>
            {categories.map(category => (
              <button 
                key={category}
                className={`category-button ${activeCategory === category ? 'active' : ''}`}
                onClick={() => handleCategoryChange(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        
        {filteredCourses.length === 0 ? (
          <div className="empty-state">
            没有找到符合条件的课程，请尝试其他搜索条件。
          </div>
        ) : (
          <div className="course-cards all">
            {filteredCourses.map(course => (
              <Card 
                key={course.id} 
                className="course-card"
                onClick={() => handleCourseClick(course.id)}
              >
                <div className="course-image-container">
                  <img src={course.imageUrl} alt={course.title} className="course-image" />
                </div>
                <h3 className="course-title">{course.title}</h3>
                <p className="course-description">{course.description}</p>
                <div className="course-meta">
                  <span className="course-category">{course.category}</span>
                  <span className="course-duration">{course.duration}</span>
                </div>
                <div className="course-stats">
                  <span className="course-level">{course.level}</span>
                  <span className="course-students">{course.students}人学习</span>
                </div>
                {progress[course.id] && (
                  <div className="course-progress-bar small">
                    <div 
                      className="progress-fill"
                      style={{ width: `${progress[course.id].percentage}%` }}
                    ></div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* 学习路径 */}
      <div className="learning-paths-section">
        <h2 className="section-title">学习路径</h2>
        <p className="section-description">
          选择适合您的学习路径，系统性地掌握投资知识和技能。
        </p>
        
        <div className="learning-paths">
          <Card className="learning-path-card">
            <h3 className="path-title">投资新手入门</h3>
            <p className="path-description">
              适合刚开始投资的用户，涵盖基础投资概念、基金类型和简单的分析方法。
            </p>
            <div className="path-stats">
              <span className="path-courses">5门课程</span>
              <span className="path-duration">总时长: 5小时</span>
            </div>
            <button className="path-button">查看路径</button>
          </Card>
          
          <Card className="learning-path-card">
            <h3 className="path-title">基金投资进阶</h3>
            <p className="path-description">
              进一步深入基金投资领域，学习更复杂的分析方法和投资策略。
            </p>
            <div className="path-stats">
              <span className="path-courses">7门课程</span>
              <span className="path-duration">总时长: 8小时</span>
            </div>
            <button className="path-button">查看路径</button>
          </Card>
          
          <Card className="learning-path-card">
            <h3 className="path-title">行为金融学专题</h3>
            <p className="path-description">
              深入了解投资心理和认知偏差，掌握如何避免常见的投资行为陷阱。
            </p>
            <div className="path-stats">
              <span className="path-courses">4门课程</span>
              <span className="path-duration">总时长: 6小时</span>
            </div>
            <button className="path-button">查看路径</button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LearningCenter;
