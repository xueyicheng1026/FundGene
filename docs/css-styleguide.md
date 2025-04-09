# CSS 样式指南

## 目录

1. [CSS架构原则](#css架构原则)
2. [变量使用规范](#变量使用规范)
3. [命名约定](#命名约定)
4. [选择器使用指南](#选择器使用指南)
5. [样式冲突解决方案](#样式冲突解决方案)
6. [响应式设计规范](#响应式设计规范)
7. [性能优化建议](#性能优化建议)

## CSS架构原则

### 分层结构

我们的CSS架构采用以下分层结构：

1. **变量层**：定义在`variables.css`、`responsive-variables.css`和`layout-variables.css`中
2. **基础层**：全局重置和基础样式，定义在`globals.css`中
3. **工具层**：可复用的工具类，定义在`composable-classes.css`中
4. **页面层**：特定页面的样式，定义在`pages/`目录下
5. **组件层**：特定组件的样式，定义在`components/`目录下

### 模块化原则

- 每个CSS文件应专注于一个功能或组件
- 使用命名空间防止样式冲突
- 组件内部样式不应依赖外部上下文

## 变量使用规范

### 变量命名规则

- 使用`--`前缀表示CSS变量
- 使用`-`分隔单词
- 按功能分组（颜色、间距、字体等）

### 变量使用优先级

1. 优先使用语义化变量（如`--text-primary`而非直接颜色值）
2. 对于变体，使用主变量的扩展（如`--primary-light`、`--primary-dark`）

## 命名约定

### BEM命名法（推荐）

```css
/* 块 */
.block {}

/* 元素 */
.block__element {}

/* 修饰符 */
.block--modifier {}
.block__element--modifier {}
```

### 命名空间前缀

- `.l-`：布局组件（layout）
- `.c-`：内容组件（content）
- `.u-`：工具类（utility）
- `.js-`：JavaScript钩子（不应用于样式）
- `.is-`、`.has-`：状态类

## 选择器使用指南

### 选择器优先级

选择器优先级按以下顺序从低到高：

1. 元素选择器：`h1`, `p`
2. 类选择器：`.header`, `.content`
3. ID选择器：`#main`, `#sidebar`
4. 内联样式：`style="color: red;"`
5. !important：`color: red !important;`

### 避免的模式

- 避免过深的选择器嵌套（不超过3层）
- 避免使用ID选择器和!important
- 避免在全局范围内修改元素选择器

### 推荐的模式

- 优先使用类选择器
- 使用直接子选择器（>）减少副作用
- 组件内的样式使用命名空间前缀

## 样式冲突解决方案

### 避免使用composes

不要使用：
```css
.card {
  composes: base-card;
}
```

而要使用：
```css
.card {
  /* 直接应用样式或使用多个类 */
  background-color: var(--card-background);
  border-radius: var(--border-radius-lg);
  /* ... */
}
```

### 使用组合类

HTML中使用多个类：
```html
<div class="layout-container layout-padding card-base card-padding">
  <!-- 内容 -->
</div>
```

### 特定性冲突

当出现特定性冲突时：

1. 检查是否可以重构为更具语义的组件
2. 使用更具体的父元素限定选择器
3. 考虑调整HTML结构以减少样式依赖

## 响应式设计规范

### 移动优先

- 首先为移动设备编写基础样式
- 使用媒体查询添加更大屏幕的样式

### 断点使用

使用变量中定义的标准断点：
```css
@media (max-width: var(--breakpoint-md)) {
  /* 平板样式 */
}
```

### 响应式工具类

为常见的响应式模式使用工具类：
```css
.grid-cols-1-mobile {
  grid-template-columns: 1fr;
}
```

## 性能优化建议

- 避免过度使用通配选择器（*）
- 最小化重绘和回流（避免频繁改变布局属性）
- 使用CSS而非JavaScript进行动画
- 考虑使用transform和opacity进行动画，利用GPU加速

## 检查与维护

- 定期运行 `npm run check-css` 检查样式冲突
- 在代码审查中关注CSS质量和一致性
- 及时清理未使用的CSS代码
