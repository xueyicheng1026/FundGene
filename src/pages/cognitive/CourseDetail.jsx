import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseDetail, updateCourseProgress } from '../../services/learningService';
import Card from '../../components/common/Card';
import './CourseDetail.css';

/**
 * 课程详情页面
 * 显示课程的详细内容、大纲和学习材料
 */
const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 获取课程详情
  useEffect(() => {
    const loadCourseDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await getCourseDetail(courseId);
        
        if (response.success) {
          setCourse(response.data);
          // 如果有课程大纲，默认选中第一课
          if (response.data.syllabus && response.data.syllabus.length > 0) {
            setActiveLesson(response.data.syllabus[0]);
          }
        } else {
          throw new Error(response.message || '获取课程详情失败');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadCourseDetail();
  }, [courseId]);
  
  // 处理返回学习中心
  const handleBackToLearning = () => {
    navigate('/cognitive/learning');
  };
  
  // 选择课程章节
  const handleSelectLesson = (lesson) => {
    setActiveLesson(lesson);
    
    // 模拟更新进度
    updateCourseProgress(courseId, {
      lastLesson: lesson.id,
      timestamp: new Date().toISOString()
    });
  };
  
  if (loading) {
    return <div className="loading">加载课程内容中...</div>;
  }
  
  if (error) {
    return <div className="error">{error}</div>;
  }
  
  if (!course) {
    return <div className="empty-state">未找到课程信息</div>;
  }
  
  return (
    <div className="course-detail-page">
      <button className="back-button dark-text-link" onClick={handleBackToLearning}>
        返回学习中心
      </button>
      
      <div className="course-header">
        <div className="course-info">
          <h1 className="course-title dark-text-heading">{course.title}</h1>
          <div className="course-meta">
            <span className="course-category dark-text-meta">{course.category}</span>
            <span className="course-level dark-text-meta">{course.level}</span>
            <span className="course-duration dark-text-meta">{course.duration}</span>
          </div>
          <p className="course-description dark-text-description">{course.description}</p>
        </div>
        <div className="course-image-container">
          <img src={course.imageUrl} alt={course.title} className="course-image" />
        </div>
      </div>
      
      <div className="course-content">
        <div className="course-sidebar">
          <Card className="syllabus-card dark-bg-card dark-shadow-sm">
            <h2 className="card-title dark-text-heading">课程大纲</h2>
            <div className="syllabus-list">
              {course.syllabus.map((lesson) => (
                <div 
                  key={lesson.id}
                  className={`syllabus-item ${activeLesson && activeLesson.id === lesson.id ? 'active dark-active' : ''} dark-hover`}
                  onClick={() => handleSelectLesson(lesson)}
                >
                  <div className="lesson-info">
                    <span className="lesson-number dark-text-meta">{lesson.id}.</span>
                    <span className="lesson-title dark-text-primary">{lesson.title}</span>
                  </div>
                  <div className="lesson-meta">
                    <span className="lesson-duration dark-text-meta">{lesson.duration}</span>
                    <span className={`lesson-type ${lesson.type} dark-text-meta`}>
                      {lesson.type === 'video' ? '视频' : '测验'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          
          <Card className="instructor-card dark-bg-card dark-shadow-sm">
            <h2 className="card-title dark-text-heading">讲师介绍</h2>
            {course.instructors.map((instructor) => (
              <div key={instructor.id} className="instructor-info">
                <div className="instructor-avatar-container">
                  <img src={instructor.avatar} alt={instructor.name} className="instructor-avatar" />
                </div>
                <div className="instructor-details">
                  <h3 className="instructor-name dark-text-heading">{instructor.name}</h3>
                  <p className="instructor-title dark-text-meta">{instructor.title}</p>
                  <p className="instructor-bio dark-text-description">{instructor.bio}</p>
                </div>
              </div>
            ))}
          </Card>
        </div>
        
        <div className="lesson-content">
          {activeLesson ? (
            <Card className="lesson-card dark-bg-card dark-shadow-sm">
              <div className="lesson-header">
                <h2 className="lesson-title dark-text-heading">
                  {activeLesson.id}. {activeLesson.title}
                </h2>
                <span className="lesson-duration dark-text-meta">{activeLesson.duration}</span>
              </div>
              
              {activeLesson.type === 'video' ? (
                <div className="video-container">
                  <div className="video-placeholder">
                    <div className="placeholder-text">
                      <span className="play-icon">▶</span>
                      视频内容加载中...
                    </div>
                  </div>
                  <div className="video-controls">
                    <button className="control-button">播放</button>
                    <div className="video-progress">
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: '0%' }}></div>
                      </div>
                    </div>
                    <button className="control-button">全屏</button>
                  </div>
                </div>
              ) : (
                <div className="quiz-container">
                  <h3 className="quiz-title">知识测验</h3>
                  <p className="quiz-description">
                    完成此测验来测试您对课程内容的理解。
                  </p>
                  <button className="start-quiz-button">开始测验</button>
                </div>
              )}
              
              <div className="lesson-notes">
                <h3 className="notes-title">课程笔记</h3>
                <textarea 
                  className="notes-input"
                  placeholder="在这里记录您的学习笔记..."
                ></textarea>
                <button className="save-notes-button">保存笔记</button>
              </div>
            </Card>
          ) : (
            <div className="empty-lesson">
              <p>请从左侧选择一个课程章节开始学习</p>
            </div>
          )}
          
          <Card className="course-resources">
            <h2 className="card-title">学习资源</h2>
            <div className="resources-list">
              <div className="resource-item">
                <span className="resource-icon document">📄</span>
                <span className="resource-name">课程讲义.pdf</span>
                <button className="download-button">下载</button>
              </div>
              <div className="resource-item">
                <span className="resource-icon spreadsheet">📊</span>
                <span className="resource-name">案例数据.xlsx</span>
                <button className="download-button">下载</button>
              </div>
              <div className="resource-item">
                <span className="resource-icon link">🔗</span>
                <span className="resource-name">扩展阅读链接</span>
                <button className="view-button">查看</button>
              </div>
            </div>
          </Card>
          
          <Card className="related-courses">
            <h2 className="card-title">相关课程推荐</h2>
            <div className="related-courses-list">
              {course.relatedCourses && course.relatedCourses.map((relatedId, index) => {
                const relatedCourse = {
                  id: relatedId,
                  title: `相关课程 ${index + 1}`,
                  description: "加载中...",
                  imageUrl: "https://via.placeholder.com/100"
                };
                
                return (
                  <div 
                    key={relatedId} 
                    className="related-course-item"
                    onClick={() => navigate(`/cognitive/learning/course/${relatedId}`)}
                  >
                    <div className="related-course-image">
                      <img src={relatedCourse.imageUrl} alt={relatedCourse.title} />
                    </div>
                    <div className="related-course-info">
                      <h3 className="related-course-title">{relatedCourse.title}</h3>
                      <p className="related-course-description">{relatedCourse.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
