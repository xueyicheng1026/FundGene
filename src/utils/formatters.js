/**
 * 格式化工具函数集合
 * 用于在应用中统一数据格式化方式
 */

/**
 * 格式化货币值为人民币格式
 * @param {number} value - 要格式化的数值
 * @param {Object} options - 格式化选项
 * @param {number} options.decimals - 小数位数，默认为2
 * @param {boolean} options.showSymbol - 是否显示货币符号，默认为true
 * @param {boolean} options.compact - 是否使用紧凑格式（如：1.2万），默认为false
 * @returns {string} 格式化后的货币字符串
 */
export const formatCurrency = (value, { decimals = 2, showSymbol = true, compact = false } = {}) => {
  if (value === null || value === undefined) return '--';
  
  try {
    if (compact) {
      return formatCompactCurrency(value, { decimals, showSymbol });
    }
    
    const formattedValue = value.toLocaleString('zh-CN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
    
    return showSymbol ? `¥${formattedValue}` : formattedValue;
  } catch (error) {
    console.error('formatCurrency error:', error);
    return '--';
  }
};

/**
 * 以紧凑格式显示货币值（适用于大数额显示）
 * @param {number} value - 货币值
 * @param {Object} options - 格式化选项
 * @param {number} options.decimals - 小数位数
 * @param {boolean} options.showSymbol - 是否显示货币符号
 * @returns {string} 格式化后的货币字符串
 */
const formatCompactCurrency = (value, { decimals = 2, showSymbol = true } = {}) => {
  if (value === null || value === undefined) return '--';
  
  let formattedValue = '';
  const absValue = Math.abs(value);
  
  if (absValue >= 1000000000) {
    formattedValue = (value / 1000000000).toFixed(decimals) + '亿';
  } else if (absValue >= 10000) {
    formattedValue = (value / 10000).toFixed(decimals) + '万';
  } else {
    formattedValue = value.toFixed(decimals);
  }
  
  return showSymbol ? `¥${formattedValue}` : formattedValue;
};

/**
 * 格式化百分比值
 * @param {number} value - 要格式化的百分比值（0.1 表示 10%）
 * @param {Object} options - 格式化选项
 * @param {number} options.decimals - 小数位数，默认为2
 * @param {boolean} options.showSign - 是否显示正负号，默认为false
 * @param {boolean} options.colorful - 是否返回带颜色的文本（需与CSS结合），默认为false
 * @returns {string|Object} 格式化后的百分比字符串或带有color属性的对象
 */
export const formatPercent = (value, { decimals = 2, showSign = false, colorful = false } = {}) => {
  if (value === null || value === undefined) return '--';
  
  try {
    const sign = showSign && value > 0 ? '+' : '';
    const formattedValue = (value * 100).toFixed(decimals);
    const result = `${sign}${formattedValue}%`;
    
    if (!colorful) return result;
    
    // 返回带颜色信息的对象，需配合CSS或style使用
    return {
      text: result,
      color: value > 0 ? 'var(--success-color)' : value < 0 ? 'var(--error-color)' : 'inherit'
    };
  } catch (error) {
    console.error('formatPercent error:', error);
    return '--';
  }
};

/**
 * 格式化日期
 * @param {string|Date} dateInput - 日期字符串或Date对象
 * @param {string} format - 格式类型: 'short'(年月日), 'long'(年月日时分), 'full'(年月日时分秒), 'custom'(自定义)
 * @param {string} customFormat - 自定义格式，当format为'custom'时使用
 * @returns {string} 格式化后的日期字符串
 */
export const formatDate = (dateInput, format = 'short', customFormat = '') => {
  if (!dateInput) return '--';
  
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '--';
    
    if (format === 'custom' && customFormat) {
      return formatDateCustom(date, customFormat);
    }
    
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    };
    
    if (format === 'long' || format === 'full') {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }
    
    if (format === 'full') {
      options.second = '2-digit';
    }
    
    return date.toLocaleString('zh-CN', options)
      .replace(/\//g, '-'); // 将2021/01/01转换为2021-01-01格式
  } catch (error) {
    console.error('formatDate error:', error);
    return '--';
  }
};

/**
 * 使用自定义格式格式化日期
 * 支持的格式: 
 * - YYYY: 四位年份
 * - MM: 两位月份
 * - DD: 两位日期
 * - HH: 两位小时
 * - mm: 两位分钟
 * - ss: 两位秒数
 * 例如: "YYYY-MM-DD HH:mm"
 * 
 * @param {Date} date - Date对象
 * @param {string} format - 自定义格式
 * @returns {string} 格式化后的日期字符串
 */
const formatDateCustom = (date, format) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

/**
 * 获取日期范围的友好表示
 * @param {Date|string} startDate - 开始日期
 * @param {Date|string} endDate - 结束日期
 * @param {string} separator - 分隔符，默认为"至"
 * @returns {string} 格式化后的日期范围
 */
export const formatDateRange = (startDate, endDate, separator = ' 至 ') => {
  if (!startDate || !endDate) return '--';
  
  try {
    const formattedStart = formatDate(startDate);
    const formattedEnd = formatDate(endDate);
    
    if (formattedStart === formattedEnd) {
      return formattedStart;
    }
    
    return `${formattedStart}${separator}${formattedEnd}`;
  } catch (error) {
    console.error('formatDateRange error:', error);
    return '--';
  }
};

/**
 * 截断文本并添加省略号
 * @param {string} text - 要截断的文本
 * @param {number} maxLength - 最大长度，默认为100
 * @param {string} ellipsis - 省略符号，默认为'...'
 * @returns {string} 截断后的文本
 */
export const truncateText = (text, maxLength = 100, ellipsis = '...') => {
  if (!text) return '';
  
  try {
    if (text.length <= maxLength) return text;
    
    return text.substring(0, maxLength) + ellipsis;
  } catch (error) {
    console.error('truncateText error:', error);
    return text;
  }
};

/**
 * 格式化数字
 * @param {number} value - 要格式化的数值
 * @param {Object} options - 格式化选项
 * @param {number} options.decimals - 小数位数，默认为0
 * @param {boolean} options.grouping - 是否使用千分位分组，默认为true
 * @param {string} options.defaultValue - 值为空时的默认显示，默认为'--'
 * @returns {string} 格式化后的数字字符串
 */
export const formatNumber = (value, { decimals = 0, grouping = true, defaultValue = '--' } = {}) => {
  if (value === null || value === undefined) return defaultValue;
  
  try {
    if (!grouping) {
      return Number(value).toFixed(decimals);
    }
    
    return value.toLocaleString('zh-CN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  } catch (error) {
    console.error('formatNumber error:', error);
    return defaultValue;
  }
};

/**
 * 格式化基金代码，确保显示为6位数字
 * @param {string} code - 基金代码
 * @param {boolean} showPrefix - 是否显示前缀，默认为false
 * @returns {string} 格式化后的基金代码
 */
export const formatFundCode = (code, showPrefix = false) => {
  if (!code) return '';
  
  try {
    // 移除非数字字符
    const numericCode = code.toString().replace(/\D/g, '');
    
    // 确保是6位数字
    const formattedCode = numericCode.padStart(6, '0');
    
    return showPrefix ? `${formattedCode}` : formattedCode;
  } catch (error) {
    console.error('formatFundCode error:', error);
    return code;
  }
};

/**
 * 获取相对时间描述（如：3分钟前，2小时前）
 * @param {string|Date} dateInput - 日期字符串或Date对象
 * @param {Object} options - 格式化选项
 * @param {boolean} options.full - 是否显示完整格式（超过30天则显示完整日期），默认为false
 * @returns {string} 相对时间描述
 */
export const getRelativeTimeString = (dateInput, { full = false } = {}) => {
  if (!dateInput) return '--';
  
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '--';
    
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    
    if (diffSec < 60) return '刚刚';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}分钟前`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}小时前`;
    if (diffSec < 2592000) return `${Math.floor(diffSec / 86400)}天前`;
    
    // 超过30天，根据选项决定是否显示完整日期
    if (full) {
      return formatDate(date);
    }
    
    if (diffSec < 31536000) return `${Math.floor(diffSec / 2592000)}个月前`;
    
    return `${Math.floor(diffSec / 31536000)}年前`;
  } catch (error) {
    console.error('getRelativeTimeString error:', error);
    return '--';
  }
};

/**
 * 格式化数字为带单位的字符串（中文：万、亿；英文：k、M、B）
 * @param {number} value - 要格式化的数值
 * @param {Object} options - 格式化选项
 * @param {number} options.decimals - 小数位数，默认为1
 * @param {boolean} options.useChineseUnits - 是否使用中文单位（万、亿），默认为true
 * @returns {string} 格式化后的带单位的字符串
 */
export const formatNumberWithUnit = (value, { decimals = 1, useChineseUnits = true } = {}) => {
  if (value === null || value === undefined) return '--';
  
  try {
    if (useChineseUnits) {
      return formatNumberWithChineseUnit(value, { decimals });
    }
    
    return formatNumberWithEnglishUnit(value, { decimals });
  } catch (error) {
    console.error('formatNumberWithUnit error:', error);
    return value.toString();
  }
};

/**
 * 使用中文单位格式化数字
 */
const formatNumberWithChineseUnit = (value, { decimals = 1 } = {}) => {
  const absValue = Math.abs(value);
  
  if (absValue < 10000) {
    return value.toFixed(decimals);
  }
  
  if (absValue < 100000000) {
    return (value / 10000).toFixed(decimals) + '万';
  }
  
  return (value / 100000000).toFixed(decimals) + '亿';
};

/**
 * 使用英文单位格式化数字
 */
const formatNumberWithEnglishUnit = (value, { decimals = 1 } = {}) => {
  const absValue = Math.abs(value);
  
  if (absValue < 1000) {
    return value.toString();
  }
  
  if (absValue < 1000000) {
    return (value / 1000).toFixed(decimals) + 'k';
  }
  
  if (absValue < 1000000000) {
    return (value / 1000000).toFixed(decimals) + 'M';
  }
  
  return (value / 1000000000).toFixed(decimals) + 'B';
};

/**
 * 格式化文件大小
 * @param {number} bytes - 文件大小（字节）
 * @param {number} decimals - 小数位数，默认为2
 * @returns {string} 格式化后的文件大小
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 B';
  
  try {
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
  } catch (error) {
    console.error('formatFileSize error:', error);
    return bytes + ' B';
  }
};

/**
 * 格式化手机号码为更易读的格式
 * @param {string} phone - 手机号码
 * @param {string} separator - 分隔符，默认为空格
 * @returns {string} 格式化后的手机号码
 */
export const formatPhoneNumber = (phone, separator = ' ') => {
  if (!phone) return '';
  
  try {
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{4})(\d{4})$/);
    
    if (match) {
      return match[1] + separator + match[2] + separator + match[3];
    }
    
    return phone;
  } catch (error) {
    console.error('formatPhoneNumber error:', error);
    return phone;
  }
};

/**
 * 格式化整数为中文数字（适用于金额、序号等）
 * @param {number} num - 整数
 * @returns {string} 中文数字
 */
export const formatNumberToChinese = (num) => {
  if (isNaN(num)) return '';
  
  try {
    const chineseNum = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    const chineseUnit = ['', '十', '百', '千', '万', '十', '百', '千', '亿'];
    
    let result = '';
    const numStr = num.toString();
    
    for (let i = 0; i < numStr.length; i++) {
      const digit = parseInt(numStr[i]);
      const unit = chineseUnit[numStr.length - i - 1];
      
      // 处理零的特殊情况
      if (digit === 0) {
        if (result.charAt(result.length - 1) !== '零' && i !== numStr.length - 1) {
          result += '零';
        }
      } else {
        result += chineseNum[digit] + unit;
      }
    }
    
    // 处理一十开头的情况
    if (result.startsWith('一十')) {
      result = result.substring(1);
    }
    
    // 处理末尾的零
    if (result.endsWith('零')) {
      result = result.substring(0, result.length - 1);
    }
    
    // 处理全零的情况
    if (result === '') {
      result = '零';
    }
    
    return result;
  } catch (error) {
    console.error('formatNumberToChinese error:', error);
    return num.toString();
  }
};

/**
 * 格式化银行卡号，每4位添加一个空格
 * @param {string} cardNumber - 银行卡号
 * @returns {string} 格式化后的银行卡号
 */
export const formatBankCardNumber = (cardNumber) => {
  if (!cardNumber) return '';
  
  try {
    const cleaned = cardNumber.replace(/\s/g, '');
    const groups = [];
    
    for (let i = 0; i < cleaned.length; i += 4) {
      groups.push(cleaned.substring(i, i + 4));
    }
    
    return groups.join(' ');
  } catch (error) {
    console.error('formatBankCardNumber error:', error);
    return cardNumber;
  }
};

/**
 * 格式化身份证号，隐藏中间8位
 * @param {string} idNumber - 身份证号
 * @returns {string} 格式化后的身份证号
 */
export const formatIdCardNumber = (idNumber) => {
  if (!idNumber || idNumber.length < 15) return idNumber;
  
  try {
    return `${idNumber.substring(0, 6)}********${idNumber.substring(14)}`;
  } catch (error) {
    console.error('formatIdCardNumber error:', error);
    return idNumber;
  }
};
