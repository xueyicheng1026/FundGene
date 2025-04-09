# CSS样式优先级和覆盖检查工具

这个工具帮助你检查项目中所有CSS文件的样式覆盖和优先级逻辑，识别潜在的问题。

## 功能

- 检测选择器特异性（Specificity）问题
- 识别重复的CSS选择器
- 统计并警告过度使用 `!important`
- 检测潜在的样式冲突
- 分析CSS选择器特异性分布

## 安装

在tools目录下运行：

```bash
npm install
```

## 使用方法

### 检查特定CSS文件

```bash
npm run check -- path/to/your/file.css
```

### 检查整个目录

```bash
npm run check -- path/to/your/directory
```

### 检查整个项目

```bash
npm run check -- ..
```

## 输出说明

工具将分析每个CSS文件并输出：

1. 潜在的样式冲突
2. 重复的选择器
3. !important的使用情况
4. 选择器特异性分布
5. 汇总报告

## CSS优先级规则概述

CSS优先级遵循以下规则（从高到低）：

1. `!important` 声明
2. 内联样式（style属性）
3. ID选择器（#id）
4. 类选择器（.class）、属性选择器（[attr=value]）和伪类（:hover）
5. 元素选择器（div）和伪元素（::before）
6. 通用选择器（*）和组合器（>, +, ~）

特异性计算表示为四个数字：(内联,ID,类/属性/伪类,元素/伪元素)
```

## 最佳实践建议

- 避免过度使用 `!important`
- 减少高特异性选择器的使用
- 使用BEM等命名约定减少选择器嵌套
- 组织CSS以避免冲突
- 考虑使用CSS Modules或Scoped CSS
