import React, { useState } from 'react';
import './Trading.css';

/**
 * 交易表单组件
 * 用户可以通过此表单提交买入或卖出基金的申请
 * @param {Object} props - 组件属性
 * @param {Array} props.marketData - 市场数据
 * @param {Object} props.portfolio - 投资组合数据
 * @param {Function} props.onSubmit - 提交表单的回调函数
 */
const TradeForm = ({ marketData, portfolio, onSubmit }) => {
  // 表单状态
  const [formData, setFormData] = useState({
    action: 'buy', // buy 或 sell
    fundCode: '',
    amount: '', // 买入金额或卖出份额
    isAmountValid: true
  });
  
  // 交易结果状态
  const [tradeResult, setTradeResult] = useState(null);
  
  // 正在提交状态
  const [submitting, setSubmitting] = useState(false);
  
  // 可交易基金列表 (市场中的基金 + 持仓中的基金)
  const tradableFunds = React.useMemo(() => {
    const marketFunds = marketData.filter(item => item.type === 'fund');
    const portfolioFunds = portfolio?.holdings || [];
    
    // 合并市场基金和持仓基金，并去重
    const allFunds = [...marketFunds];
    
    portfolioFunds.forEach(holding => {
      if (!allFunds.find(fund => fund.code === holding.code)) {
        allFunds.push({
          code: holding.code,
          name: holding.name,
          value: holding.nav,
          category: holding.category || '未知'
        });
      }
    });
    
    return allFunds;
  }, [marketData, portfolio]);
  
  // 当前选中的基金
  const selectedFund = React.useMemo(() => {
    return tradableFunds.find(fund => fund.code === formData.fundCode);
  }, [tradableFunds, formData.fundCode]);
  
  // 当前持仓的基金
  const holdingFund = React.useMemo(() => {
    return portfolio?.holdings.find(holding => holding.code === formData.fundCode);
  }, [portfolio, formData.fundCode]);
  
  // 处理输入变化
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'amount') {
      // 验证金额/份额输入
      const isValid = /^\d*\.?\d*$/.test(value) && parseFloat(value) > 0;
      setFormData({
        ...formData,
        [name]: value,
        isAmountValid: isValid
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // 清除之前的交易结果
    setTradeResult(null);
  };
  
  // 处理表单提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 验证表单
    if (!formData.fundCode || !formData.amount || !formData.isAmountValid) {
      return;
    }
    
    // 构建交易订单
    const order = {
      action: formData.action,
      fundCode: formData.fundCode,
      amount: parseFloat(formData.amount)
    };
    
    setSubmitting(true);
    
    try {
      // 提交交易订单
      const result = await onSubmit(order);
      setTradeResult(result);
      
      // 如果交易成功，重置表单
      if (result.success) {
        setFormData({
          action: 'buy',
          fundCode: '',
          amount: '',
          isAmountValid: true
        });
      }
    } catch (err) {
      setTradeResult({
        success: false,
        message: '交易过程中发生错误: ' + err.message
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="trade-form">
      <form onSubmit={handleSubmit}>
        {/* 买入/卖出选择 */}
        <div className="form-group">
          <label className="form-label text-secondary">交易类型</label>
          <div className="trade-type-selector">
            <label className={`trade-type-option ${formData.action === 'buy' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="action"
                value="buy"
                checked={formData.action === 'buy'}
                onChange={handleInputChange}
              />
              买入
            </label>
            <label className={`trade-type-option ${formData.action === 'sell' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="action"
                value="sell"
                checked={formData.action === 'sell'}
                onChange={handleInputChange}
              />
              卖出
            </label>
          </div>
        </div>
        
        {/* 基金选择 */}
        <div className="form-group">
          <label htmlFor="fundCode" className="form-label text-secondary">选择基金</label>
          <select
            id="fundCode"
            name="fundCode"
            value={formData.fundCode}
            onChange={handleInputChange}
            className="fund-select"
            required
          >
            <option value="">请选择基金</option>
            {tradableFunds.map(fund => (
              <option key={fund.code} value={fund.code}>
                {fund.name} ({fund.code})
              </option>
            ))}
          </select>
        </div>
        
        {/* 金额/份额输入 */}
        <div className="form-group">
          <label htmlFor="amount" className="form-label text-secondary">
            {formData.action === 'buy' ? '买入金额 (元)' : '卖出份额'}
          </label>
          <input
            type="text"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleInputChange}
            className={`amount-input ${!formData.isAmountValid ? 'invalid' : ''}`}
            placeholder={formData.action === 'buy' ? '请输入买入金额' : '请输入卖出份额'}
            required
          />
          {!formData.isAmountValid && (
            <div className="input-error text-error text-xs">请输入有效的{formData.action === 'buy' ? '金额' : '份额'}</div>
          )}
          
          {/* 显示可用资金或可卖出份额 */}
          {formData.fundCode && (
            <div className="available-info text-sm text-tertiary">
              {formData.action === 'buy' && portfolio ? (
                <span>可用资金: ¥{portfolio.availableCash.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</span>
              ) : (
                holdingFund && (
                  <span>可卖出份额: {holdingFund.shares.toFixed(2)}</span>
                )
              )}
            </div>
          )}
        </div>
        
        {/* 交易信息预览 */}
        {selectedFund && formData.isAmountValid && formData.amount && (
          <div className="trade-preview">
            <h4 className="preview-title text-sm text-secondary">交易预览</h4>
            <div className="preview-item">
              <span className="preview-label text-tertiary">基金:</span>
              <span className="preview-value">{selectedFund.name}</span>
            </div>
            <div className="preview-item">
              <span className="preview-label text-tertiary">最新净值:</span>
              <span className="preview-value">{selectedFund.value.toFixed(4)}</span>
            </div>
            {formData.action === 'buy' ? (
              <div className="preview-item">
                <span className="preview-label text-tertiary">预估份额:</span>
                <span className="preview-value">
                  {(parseFloat(formData.amount) / selectedFund.value).toFixed(2)}
                </span>
              </div>
            ) : (
              <div className="preview-item">
                <span className="preview-label text-tertiary">预估金额:</span>
                <span className="preview-value">
                  ¥{(parseFloat(formData.amount) * selectedFund.value).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
          </div>
        )}
        
        {/* 交易结果提示 */}
        {tradeResult && (
          <div className={`trade-result ${tradeResult.success ? 'success' : 'error'}`}>
            {tradeResult.message}
          </div>
        )}
        
        {/* 提交按钮 */}
        <button
          type="submit"
          className="submit-button"
          disabled={!formData.fundCode || !formData.amount || !formData.isAmountValid || submitting}
        >
          {submitting ? '处理中...' : formData.action === 'buy' ? '买入' : '卖出'}
        </button>
      </form>
    </div>
  );
};

export default TradeForm;
