/**
 * 格式化货币
 * @param {number} value - 需要格式化的数值
 * @returns {string} - 格式化后的货币字符串
 */
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2
  }).format(value);
};

/**
 * 格式化百分比
 * @param {number} value - 需要格式化的数值 (0.1 表示 10%)
 * @returns {string} - 格式化后的百分比字符串
 */
export const formatPercent = (value) => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 2
  }).format(value / 100);
};

/**
 * 格式化日期
 * @param {string|Date} dateString - 日期对象或日期字符串
 * @param {string} format - 格式选项 'short'|'medium'|'long'，默认'short'
 * @returns {string} - 格式化后的日期字符串
 */
export const formatDate = (dateString, format = 'short') => {
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
};

/**
 * 将文本截断到指定长度，并添加省略号
 * @param {string} text - 需要截断的文本
 * @param {number} maxLength - 最大长度
 * @returns {string} - 处理后的文本
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + '...';
};

/**
 * 将数字格式化为带千位分隔符的字符串
 * @param {number} value - 需要格式化的数字
 * @param {number} decimals - 小数位数，默认0
 * @returns {string} - 格式化后的字符串
 */
export const formatNumber = (value, decimals = 0) => {
  if (value === undefined || value === null) return '-';
  
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};

/**
 * 格式化基金代码（前面补0到6位）
 * @param {string|number} code - 基金代码
 * @returns {string} - 格式化后的基金代码
 */
export const formatFundCode = (code) => {
  if (!code) return '-';
  
  const codeStr = String(code);
  return codeStr.padStart(6, '0');
};
