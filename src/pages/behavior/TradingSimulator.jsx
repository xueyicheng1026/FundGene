import React, { useState } from 'react';
import { Card, Grid, Typography, Button, Box, Paper } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// 模拟交易数据
const simulatedData = [
  { date: '2023-01', price: 100 },
  { date: '2023-02', price: 105 },
  { date: '2023-03', price: 110 },
  { date: '2023-04', price: 108 },
  { date: '2023-05', price: 115 },
  { date: '2023-06', price: 120 },
];

export function TradingSimulator() {
  const [portfolio, setPortfolio] = useState({
    cash: 10000,
    stocks: 0,
    history: []
  });
  
  const [currentPrice, setCurrentPrice] = useState(simulatedData[simulatedData.length - 1].price);
  
  const handleBuy = () => {
    if (portfolio.cash >= currentPrice) {
      setPortfolio({
        cash: portfolio.cash - currentPrice,
        stocks: portfolio.stocks + 1,
        history: [...portfolio.history, { 
          type: 'buy', 
          price: currentPrice, 
          date: new Date().toISOString(),
          message: '您可能正在追涨，这可能是一种从众心理的表现。'
        }]
      });
    }
  };
  
  const handleSell = () => {
    if (portfolio.stocks > 0) {
      setPortfolio({
        cash: portfolio.cash + currentPrice,
        stocks: portfolio.stocks - 1,
        history: [...portfolio.history, { 
          type: 'sell', 
          price: currentPrice, 
          date: new Date().toISOString(),
          message: '您选择在价格上涨后卖出，这可能表现出了很好的风险控制意识。'
        }]
      });
    }
  };
  
  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>交易模拟器</Typography>
      <Typography variant="subtitle1" gutterBottom>
        通过模拟交易，我们将分析您的交易行为并提供个性化反馈
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>市场走势</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={simulatedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="price" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>投资组合</Typography>
            <Typography>当前价格: ¥{currentPrice}</Typography>
            <Typography>现金: ¥{portfolio.cash.toFixed(2)}</Typography>
            <Typography>股票: {portfolio.stocks} 股</Typography>
            <Typography>总价值: ¥{(portfolio.cash + portfolio.stocks * currentPrice).toFixed(2)}</Typography>
            
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button variant="contained" color="primary" onClick={handleBuy}>
                买入
              </Button>
              <Button variant="outlined" color="secondary" onClick={handleSell}>
                卖出
              </Button>
            </Box>
          </Card>
        </Grid>
        
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>行为反馈</Typography>
            {portfolio.history.length > 0 ? (
              <Box>
                {portfolio.history.map((record, index) => (
                  <Paper key={index} sx={{ p: 1, mb: 1, bgcolor: record.type === 'buy' ? '#e3f2fd' : '#fff8e1' }}>
                    <Typography variant="body2">
                      {new Date(record.date).toLocaleString()} - 
                      {record.type === 'buy' ? ' 买入' : ' 卖出'} 价格: ¥{record.price}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">{record.message}</Typography>
                  </Paper>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="textSecondary">
                开始交易以获取行为反馈
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default TradingSimulator; // 同时提供默认导出
