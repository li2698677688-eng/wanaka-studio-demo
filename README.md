# Wanaka Studio · 工具面板交互 Demo

独立静态网页，用于比较两种 Agent 自定义工具面板布局。无需登录、安装依赖或连接后端。

- **方案一：右侧集中切换** — 所有工具直接加入右侧顶部页签；空间不足时隐藏文字、保留图标，悬停查看名称。
- **方案二：浮窗与停靠** — 右侧仅保留 AI 聊天和属性；工具使用顶部集中入口；拖动浮窗到左、右、底部，松手停靠；点击图标恢复悬浮。
- 传送、巡检、天气、自定义工具均为本页交互示例。
- 聊天中的工具创建是本地模拟，不调用 AI；场景是展示图片，不包含完整游戏运行时。
- 不含原工程、用户聊天记录、项目源码、账号信息、密钥或后端服务。

直接由 GitHub Pages 托管根目录。需要本地体验时，在本目录运行 `python3 -m http.server 8040`，然后访问 `http://localhost:8040`。

页面文件：`index.html`、`styles.css`、`app.js` 与 `assets/`。Inter 字体许可证见 `assets/Inter-LICENSE.txt`。

右栏 Wana 状态卡片对应 [Figma 49905:5040](https://www.figma.com/design/PWtgAaGdl6znpuQykrnIbb/Wanaka-Studio?node-id=49905-5040)：横向布局、50px 动画头像、12px 间距、8px/12px 内边距、20px 圆角、#252525 背景；名称与状态使用已确认的 Inter 14px/21px、400 字重。保留本地动画及就绪／完成绿色，工作状态文字为白色 40%。A/B 共用同一结构。
