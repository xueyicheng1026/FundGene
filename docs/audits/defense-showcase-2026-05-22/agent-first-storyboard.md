# FundGene Agent-first Demo Storyboard

Date: 2026-05-23
Status: 编排稿；当前阶段先定叙事和时间轴，不直接渲染新视频

## 1. 改版目标

当前版本的问题不是单个镜头难看，而是叙事主语偏成了“页面浏览”。下一版要把 FundGene 的核心改成：

> 用户把问题交给 Agent，Agent 规划任务、调用 Today / 资讯 / 训练 / 资料这些能力，最后给出安全下一步和确认边界。

因此页面不再作为独立功能平铺展示，而是作为 Agent 调用的证据、工具和结果画面短暂出现。

## 2. 总体结构

目标时长：约 68-75 秒。

占比原则：

- Agent 画面：45%-55%。
- Today / News / Simulation / Profile：各 4-8 秒，作为工具证据插片。
- 章节页：压缩为“任务阶段”而不是“功能模块”。

核心节奏：

```text
一句话交给 Agent
-> Agent 生成计划
-> Agent 调用 Today/组合/资讯证据
-> Agent 给出解释和安全下一步
-> Agent 推荐训练
-> 用户完成训练
-> Profile 确认写回
-> 回到 Agent/品牌收束
```

## 3. 分镜时间轴

### 0. 开场：这不是页面集合

时长：0.0-3.0s

画面：

- 品牌卡，轻量文字。
- 不展示太多功能名。

标题：

```text
FundGene
把投资问题交给一个有边界的教练 Agent
```

目的：

- 先把观众预期拉到 Agent，而不是 Dashboard。

素材：

- 复用 HyperFrames 品牌卡样式。

### 1. 一句话交给 Agent

时长：3.0-15.0s

画面：

- 直接进入 `/agent?new=1`，不先浏览首页。
- 输入框真实输入：

```text
今天我应该先处理什么？如果有新闻影响，也帮我结合组合解释。
```

- 用户输入时加一个不遮挡 UI 的大号问题气泡，并用输入框聚焦框提示问题来自底部输入区。
- 发送后保留 0.7-1.0s 等待动画，再让 Agent 进入任务计划。

Agent 回答要点：

- 先检查组合集中度。
- 需要参考今日判断、最近资讯、组合快照和行为画像。
- 明确不会输出买卖指令。

章节标题：

```text
一句话交给 Agent
把真实问题变成计划、证据和安全边界
```

右侧步骤：

```text
问题 → 计划 → 证据
```

素材策略：

- 复用 `07-agent-first-core-loop.mp4` 的开头，HyperFrames 叠加问题气泡和输入框聚焦框。
- 第一段 Agent 只保留约 10-12 秒，避免长时间像在展示聊天页。

### 2. Agent 调用 Today 证据

时长：15.0-20.0s

画面：

- 先用一张短章节卡提示“先看 Today 证据”。
- 马上插入 Today 页面，不做完整页面浏览。
- 停在 headline judgment + evidence + safe next action。

目的：

- 让观众理解页面是 Agent 调用的证据来源，而不是并列模块展示。

素材：

- 复用 `02-today-daily-brief.mp4`。

### 3. 回到 Agent：解释“为什么是我”

时长：20.0-35.0s

画面：

- 回到 Agent。
- 叠加一个轻量追问气泡：

```text
为什么这和我的组合有关？
```

- Agent 回答结合：
  - 第一大持仓约 34%；
  - 权益基金和主题重复；
  - 行为画像里的追热点倾向；
  - 安全边界。

目的：

- 这是全片第一个核心高光：Agent 把页面信息变成个人化判断。

需要重录：

- 第二轮 Agent 对话。
- 回答要停留 4-5s，保证可读。

### 4. 工具插片：资讯不是列表，是影响路径

时长：41.0-49.0s

画面：

- 切到 News 页面。
- 展示选中的央行政策新闻和影响路径。
- 不再完整点击“让 Agent 解释”作为主动作；这里是 Agent 已经在调用这个证据。

屏幕角落小标签：

```text
Agent 证据 02 / 资讯影响路径
```

目的：

- 资讯页面作为证据，不作为独立功能游览。

素材：

- 复用当前 `04-news-impact.mp4` 的前半段。
- 如果画面字多，停留 5-6s。

### 5. 回到 Agent：给出安全下一步

时长：49.0-58.0s

画面：

- 回到 Agent。
- Agent 总结：
  - 这条央行新闻不能直接当买卖信号；
  - 今天安全下一步是检查集中度；
  - 建议做一次回撤训练来验证纪律。

Agent 回答标题或可见内容：

```text
安全下一步：先检查集中度，再做一次回撤训练
```

目的：

- 把“解释”推进到“训练”，体现核心价值不是只回答。

需要重录：

- 第三轮或同一回答的后半段。

### 6. 工具插片：训练验证判断

时长：58.0-66.0s

画面：

- 切到 Simulation。
- 用户选择“持有”，填写理由，提交。
- 展示复盘结果和行为证据候选。

屏幕角落小标签：

```text
Agent 推荐动作 / 情境训练
```

目的：

- 说明 Agent 的下一步会变成训练，而不是账户操作。

素材：

- 复用当前 `05-simulation-training.mp4`。

### 7. 确认边界：资料写回必须确认

时长：66.0-72.0s

画面：

- 切到 Profile 待确认资料。
- 停在 pending proposal。
- 不必复杂点击，重点是“确认前不写回”。

屏幕角落小标签：

```text
确认边界 / 不静默改画像
```

目的：

- 收束产品安全性。

素材：

- 可复用 `06-automation-profile.mp4` 的 Profile 部分，或者重录一个更短更干净的 Profile 片段。

### 8. 片尾：Agent Command Center

时长：72.0-75.0s

画面：

- 品牌卡。

文案：

```text
FundGene
Explain · Train · Confirm
```

副文案：

```text
让新手先理解，再决策。
```

## 4. 素材处理策略

### 直接复用

- `02-today-daily-brief.mp4`：作为 Today 证据插片。
- `04-news-impact.mp4`：截取资讯影响路径部分。
- `05-simulation-training.mp4`：作为训练插片。
- `06-automation-profile.mp4`：截取 Profile 确认边界部分。

### 需要重录

- Agent 起始问题。
- Agent 任务规划回答。
- Agent 解释“为什么和我的组合有关”。
- Agent 总结安全下一步并推荐训练。

这些新 Agent 片段应当在同一个会话里完成，避免像当前版本一样看起来是功能之间跳转。

## 5. 录制脚本改动

`apps/web/e2e/showcase-recording.spec.ts` 建议新增一个专门测试：

```text
07-agent-first-core-loop
```

它不替代现有功能素材，而是生成新的主叙事素材：

1. 打开 `/agent?new=1`。
2. 输入“今天我应该先处理什么？如果有新闻影响，也帮我结合组合解释。”
3. 等待 Agent 回复。
4. 追问“为什么这和我的组合有关？”
5. 等待 Agent 回复。
6. 追问“那我下一步应该做训练还是改组合？”
7. 等待 Agent 回复，并停留。

对应 fixture 要新增三轮不同回答，分别突出：

- 任务规划；
- 个人组合解释；
- 安全下一步和训练推荐。

## 6. HyperFrames 重剪策略

不建议在现有时间轴上继续微调顺序。建议新建一个并行工程或分支文件：

```text
docs/audits/defense-showcase-2026-05-22/hyperframes-agent-first/
```

好处：

- 当前版本已备份，不被破坏。
- Agent-first 可以单独维护素材、时间轴和章节设计。
- 如果新版本效果不好，可以回退当前 `fundgene-demo.mp4`。

建议输出：

```text
assets/final/fundgene-demo-agent-first.mp4
```

确认后再覆盖：

```text
assets/final/fundgene-demo.mp4
```

## 7. 视觉与文字原则

- 非 Agent 页面不做长滚动，不展示“我在浏览功能”。
- 鼠标移动更少，尽量只作为动作确认。
- 插片标签只放角落，小而稳，不挡 UI。
- 章节页改成任务阶段，不再是功能模块名。
- 大段 Agent 回答停留更久，宁可少展示页面，也要让观众看懂 Agent 结论。

## 8. 下一步执行顺序

1. 新增 Agent-first fixture 三轮回答。
2. 新增 Playwright 录制用例 `07-agent-first-core-loop`。
3. 录制新 Agent 主素材。
4. 新建 `hyperframes-agent-first` 工程或复制当前工程改时间轴。
5. 按本编排稿重剪。
6. `lint / validate / inspect`。
7. 渲染 `fundgene-demo-agent-first.mp4`。
8. 生成 contact sheet 让用户先审，再决定是否覆盖最终版。
