/**
 * 学习服务
 * 该文件用于处理与学习中心相关的API调用
 * 目前使用模拟数据，未来可替换为实际API调用
 */
import { delay } from './baseService';

/**
 * 获取所有课程
 * @param {Object} params - 查询参数
 * @param {string} params.category - 课程类别
 * @param {string} params.level - 难度级别
 * @param {string} params.search - 搜索关键词
 * @returns {Promise<Object>} - 返回课程列表
 */
export const getCourses = async (params = {}) => {
  // 模拟API请求延迟
  await delay(800);
  
  // 模拟课程数据
  const courses = [
    {
      id: 'course-001',
      title: '投资基础知识入门',
      description: '介绍基本投资概念、风险与收益关系、资产类别及其特点，适合投资新手。',
      category: '基础知识',
      level: '初级',
      duration: '2小时',
      imageUrl: 'https://source.unsplash.com/random/300x200?finance,1',
      students: 2547,
      lessons: 8,
      recommended: true,
      lastAccessed: '2023-12-15T10:30:00Z'
    },
    {
      id: 'course-002',
      title: '基金类型与特点详解',
      description: '深入了解不同类型基金的特点、风险收益特性、费用结构和适合的投资者类型。',
      category: '基金投资',
      level: '初级',
      duration: '3小时',
      imageUrl: 'https://source.unsplash.com/random/300x200?finance,2',
      students: 1892,
      lessons: 10,
      recommended: false,
      lastAccessed: '2023-12-10T14:45:00Z'
    },
    {
      id: 'course-003',
      title: '投资心理学：认知偏差与决策',
      description: '探讨投资过程中常见的心理偏差，以及如何通过认知训练改进决策质量。',
      category: '行为金融',
      level: '中级',
      duration: '4小时',
      imageUrl: 'https://source.unsplash.com/random/300x200?psychology',
      students: 1436,
      lessons: 12,
      recommended: true,
      lastAccessed: '2023-12-05T09:15:00Z'
    },
    {
      id: 'course-004',
      title: '基金定投策略详解',
      description: '学习基金定投的原理、优势、适用场景以及不同市场环境下的操作策略。',
      category: '投资策略',
      level: '初级',
      duration: '2.5小时',
      imageUrl: 'https://source.unsplash.com/random/300x200?chart',
      students: 2105,
      lessons: 8,
      recommended: false,
      lastAccessed: '2023-11-28T16:20:00Z'
    },
    {
      id: 'course-005',
      title: '技术分析基础',
      description: '介绍基本技术分析概念，包括趋势、支撑与阻力、常见图表形态及技术指标。',
      category: '技术分析',
      level: '中级',
      duration: '5小时',
      imageUrl: 'https://source.unsplash.com/random/300x200?chart,2',
      students: 1254,
      lessons: 15,
      recommended: false,
      lastAccessed: null
    },
    {
      id: 'course-006',
      title: '基本面分析方法',
      description: '学习如何分析基金的基本面因素，包括管理团队、投资策略、历史业绩等。',
      category: '基本面分析',
      level: '中级',
      duration: '4小时',
      imageUrl: 'https://source.unsplash.com/random/300x200?analysis',
      students: 982,
      lessons: 12,
      recommended: false,
      lastAccessed: null
    },
    {
      id: 'course-007',
      title: '资产配置原理与实践',
      description: '掌握资产配置的核心原则，学习如何根据自身情况构建多元化投资组合。',
      category: '投资策略',
      level: '中级',
      duration: '3.5小时',
      imageUrl: 'https://source.unsplash.com/random/300x200?portfolio',
      students: 1562,
      lessons: 10,
      recommended: true,
      lastAccessed: '2023-12-12T11:05:00Z'
    },
    {
      id: 'course-008',
      title: '市场周期与投资时机',
      description: '了解经济与市场周期的运行规律，学习如何识别不同周期阶段并调整投资策略。',
      category: '宏观经济',
      level: '高级',
      duration: '6小时',
      imageUrl: 'https://source.unsplash.com/random/300x200?cycle',
      students: 875,
      lessons: 18,
      recommended: false,
      lastAccessed: null
    },
    {
      id: 'course-009',
      title: '投资者常见心理陷阱',
      description: '深入分析投资过程中的常见心理陷阱，包括从众心理、损失厌恶等，并学习克服方法。',
      category: '行为金融',
      level: '初级',
      duration: '2小时',
      imageUrl: 'https://source.unsplash.com/random/300x200?psychology,2',
      students: 1789,
      lessons: 6,
      recommended: false,
      lastAccessed: null
    }
  ];
  
  // 根据参数筛选课程
  let filteredCourses = [...courses];
  
  if (params.category) {
    filteredCourses = filteredCourses.filter(course => course.category === params.category);
  }
  
  if (params.level) {
    filteredCourses = filteredCourses.filter(course => course.level === params.level);
  }
  
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filteredCourses = filteredCourses.filter(course => 
      course.title.toLowerCase().includes(searchLower) || 
      course.description.toLowerCase().includes(searchLower)
    );
  }
  
  return {
    success: true,
    data: filteredCourses
  };
};

/**
 * 获取学习进度
 * @param {string} userId - 用户ID
 * @returns {Promise<Object>} - 返回学习进度数据
 */
export const getCoursesProgress = async (userId) => {
  // 模拟API请求延迟
  await delay(600);
  
  // 模拟进度数据
  const progress = {
    'course-001': {
      status: 'in-progress',
      percentage: 60,
      completedLessons: [1, 2, 3, 4, 5],
      totalLessons: 8,
      lastAccessed: '2023-12-15T10:30:00Z'
    },
    'course-003': {
      status: 'in-progress',
      percentage: 25,
      completedLessons: [1, 2, 3],
      totalLessons: 12,
      lastAccessed: '2023-12-05T09:15:00Z'
    },
    'course-007': {
      status: 'in-progress',
      percentage: 40,
      completedLessons: [1, 2, 3, 4],
      totalLessons: 10,
      lastAccessed: '2023-12-12T11:05:00Z'
    },
    'course-004': {
      status: 'completed',
      percentage: 100,
      completedLessons: [1, 2, 3, 4, 5, 6, 7, 8],
      totalLessons: 8,
      lastAccessed: '2023-11-28T16:20:00Z'
    }
  };
  
  return {
    success: true,
    data: progress
  };
};

/**
 * 获取课程详情
 * @param {string} courseId - 课程ID
 * @returns {Promise<Object>} - 返回课程详情
 */
export const getCourseDetail = async (courseId) => {
  // 模拟API请求延迟
  await delay(700);
  
  // 获取所有课程
  const coursesResponse = await getCourses();
  
  if (coursesResponse.success) {
    const course = coursesResponse.data.find(c => c.id === courseId);
    
    if (!course) {
      return {
        success: false,
        message: '未找到指定课程'
      };
    }
    
    // 扩展课程详情
    const courseDetail = {
      ...course,
      objectives: [
        '理解课程涵盖的核心概念和原理',
        '掌握相关的实践技能和方法',
        '能够将所学知识应用到实际投资中',
        '培养理性思考和分析能力'
      ],
      syllabus: [
        { 
          id: 1, 
          title: '课程介绍', 
          duration: '10分钟',
          type: 'video'
        },
        { 
          id: 2, 
          title: '基础概念', 
          duration: '25分钟',
          type: 'video'
        },
        { 
          id: 3, 
          title: '核心原理', 
          duration: '40分钟',
          type: 'video'
        },
        { 
          id: 4, 
          title: '实践应用', 
          duration: '35分钟',
          type: 'video'
        },
        { 
          id: 5, 
          title: '案例分析', 
          duration: '30分钟',
          type: 'video'
        },
        { 
          id: 6, 
          title: '知识测验', 
          duration: '20分钟',
          type: 'quiz'
        }
      ],
      instructors: [
        {
          id: 'instructor-001',
          name: '张教授',
          title: '金融学博士',
          bio: '拥有超过15年的金融教育和研究经验，曾在多家顶尖投资机构担任顾问。',
          avatar: 'https://source.unsplash.com/random/100x100?portrait,1'
        }
      ],
      reviews: [
        {
          id: 'review-001',
          user: '李先生',
          rating: 5,
          comment: '内容非常实用，讲解清晰易懂，对我的投资理念有很大帮助。',
          date: '2023-11-10'
        },
        {
          id: 'review-002',
          user: '王女士',
          rating: 4,
          comment: '课程质量高，但希望能有更多的实践案例。',
          date: '2023-10-25'
        }
      ],
      relatedCourses: [
        'course-002',
        'course-004',
        'course-007'
      ]
    };
    
    return {
      success: true,
      data: courseDetail
    };
  }
  
  return {
    success: false,
    message: '获取课程详情失败'
  };
};

/**
 * 更新课程进度
 * @param {string} courseId - 课程ID
 * @param {Object} progressData - 进度数据
 * @returns {Promise<Object>} - 返回更新结果
 */
export const updateCourseProgress = async (courseId, progressData) => {
  // 模拟API请求延迟
  await delay(500);
  
  // 模拟更新成功
  return {
    success: true,
    message: '进度更新成功',
    data: {
      courseId,
      ...progressData,
      updatedAt: new Date().toISOString()
    }
  };
};

/**
 * 获取学习路径
 * @param {string} pathId - 路径ID
 * @returns {Promise<Object>} - 返回学习路径数据
 */
export const getLearningPath = async (pathId) => {
  // 模拟API请求延迟
  await delay(800);
  
  // 模拟学习路径数据
  const paths = {
    'path-beginner': {
      id: 'path-beginner',
      title: '投资新手入门',
      description: '适合刚开始投资的用户，涵盖基础投资概念、基金类型和简单的分析方法。',
      courses: ['course-001', 'course-002', 'course-004', 'course-009'],
      duration: '约10小时',
      level: '初级'
    },
    'path-intermediate': {
      id: 'path-intermediate',
      title: '基金投资进阶',
      description: '进一步深入基金投资领域，学习更复杂的分析方法和投资策略。',
      courses: ['course-003', 'course-005', 'course-006', 'course-007'],
      duration: '约15小时',
      level: '中级'
    },
    'path-behavioral': {
      id: 'path-behavioral',
      title: '行为金融学专题',
      description: '深入了解投资心理和认知偏差，掌握如何避免常见的投资行为陷阱。',
      courses: ['course-003', 'course-009'],
      duration: '约8小时',
      level: '中级'
    }
  };
  
  if (pathId && paths[pathId]) {
    return {
      success: true,
      data: paths[pathId]
    };
  } else if (!pathId) {
    return {
      success: true,
      data: Object.values(paths)
    };
  }
  
  return {
    success: false,
    message: '未找到指定的学习路径'
  };
};
