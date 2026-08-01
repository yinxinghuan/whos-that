# 《这是谁？》技术文档

## 1. 技术栈

- React 18 + TypeScript + Less + Vite 5。
- 响应式 DOM 与 CSS `clip-path` 实现头像显影，不读取头像像素、不使用 Canvas，也不设置跨域属性。
- Aigram 能力通过项目内 `src/shared/runtime` 接入：联系人 API、资料跳转、游戏事件与通知。
- 音效由 Web Audio API 的短振荡器合成，不依赖外部音频素材。

## 2. 目录结构

- `src/WhosThat/WhosThat.tsx`：屏幕状态、轮次、判定、结算、资料跳转和通知节流。
- `src/WhosThat/hooks/useContacts.ts`：真实联系人加载、响应解包、过滤、错误与 demo 回退。
- `src/WhosThat/data.ts`：六位虚构 demo 联系人和洗牌函数。
- `src/WhosThat/i18n/index.ts`：中文 / 英文文案。
- `src/WhosThat/audio.ts`：点击、错误、正确与结算音效。
- `src/WhosThat/WhosThat.less`：暗房联系印样视觉系统与 390×844 / 320×568 适配。
- `public/demo/`：通过正式 Aigram transit 接口生成并裁切的虚构演示头像。
- `_production/`：演示素材和海报的生成脚本、原始文件与来源记录。
- `_qa/`：Playwright 双视口流程截图。

## 3. 核心模块

- 状态机：`loading → cover → round → reveal → result`，另有 `empty`、`error` 与重试/demo 恢复。
- 联系人：请求 `/note/telegram/user/contact/list`，只保留非当前玩家、ID 唯一、名字和 `head_url` 齐全的真实联系人；少于 3 位时不混入假数据。
- 回合：3–4 位有效联系人玩 3 轮，5 位以上玩 5 轮；目标不重复；揭露比例为 18% / 44% / 76%，得分为 3 / 2 / 1。
- 社交：揭晓和结算中的头像姓名组合调用 `openAigramProfile`；答题候选只作选择。每局最多通知最早在 18% 认出的真实联系人一次。
- 适配：页面内部响应式布局，`100dvh` 和底部安全区；小于 650 px 高度压缩照片与按钮间距，但保留至少 44 px 触控目标。
- 多语言：读取 `localStorage.game_locale`，否则跟随浏览器语言。

## 4. 扩展点

- 改揭露档位、轮数或计分：修改 `WhosThat.tsx` 的 `REVEAL_LEVELS` 与 `start()`。
- 换 demo 人物：替换 `public/demo/` 并同步 `data.ts`；真实产品模式不受影响。
- 调整视觉、显影和小屏密度：修改 `WhosThat.less` 的色彩、照片网格和 `max-height: 650px` 规则。
- 增加题型：保留“真实答案来源”合同，在新 hook 中接实际回答或群体投票，不得随机指定好友身份。
- 修改通知：调整 `recognized_at_18` 事件及其 `actions`；仍须保持单局一次、只通知正向成功。
