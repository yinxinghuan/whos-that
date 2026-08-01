# 《这是谁？》视觉与界面文档

## 1. Visual thesis

- Game and audience：面向熟人关系的 45–75 秒手机社交猜人游戏。
- Emotional promise：不是“识图考试”，而是“我只看到这么一点，还是认出了你”。
- One-sentence visual thesis：一张朋友照片在温暖暗房里从窄缝逐步显影，所有 UI 像摄影师的联系印样和裁切记号。
- Signature visual moment：18% 窄条瞬间拉开成完整头像，白色闪光后盖下 `KNEW YOU AT 18%` 印样标签。
- Three required qualities：真实人物优先、三秒可懂、温暖而非监控感。
- Three directions to avoid：冷蓝生物识别 HUD、犯罪嫌疑人墙、彩色派对贴纸堆叠。

### Explored directions

1. 身份扫描仪：黑底、冷青扫描线、数据框；清楚但过于通用且像监控产品。
2. 小报嫌疑人墙：黄黑标题、撕纸与红线；戏剧强但把朋友放进“罪犯”语境。
3. 暗房联系印样（采用）：暖纸、黑墨、真实照片与朱红裁切线；最适合正向识别与简洁 UI。

## 2. Composition and camera

- Orientation and aspect ratios：响应式竖屏 DOM，目标 390×844 与 320×568；不使用整页 transform 缩放。
- Camera and perspective：真实头像保持正向裁切，`object-fit: cover`，不改变镜像方向。
- Playfield focal area：主照片占屏幕中上部 54%–60%；中心窄条是第一视觉焦点。
- Foreground, midground, background：前景为朱红裁切框与显影标签；中景为照片；背景为暖纸与极淡接触表网格。
- HUD safe areas：顶部 52–64 px 放轮次和声音；底部安全区加 `env(safe-area-inset-bottom)`。
- Attention path：局部照片 → “WHO'S THAT?” → 三位候选 → 即时对错与更宽线索。

## 3. Color

- Paper background `#EEE8DB`；photo mat `#151411`；ink `#12110E`；muted `#6F6A60`。
- Interaction cobalt `#2451E6`；crop vermilion `#DF4934`；success chartreuse `#B8D94A`；flash `#FFFDF7`。
- Usage ratios：暖纸 58%，照片与黑墨 30%，钴蓝 7%，朱红/黄绿 5%。
- 状态不只靠颜色：错误有斜线与缩进，正确有完整显影与文字标签，禁用有删除线和 opacity。
- 禁止霓虹渐变、玻璃拟态、持续辉光和大面积纯红背景。

## 4. Typography

- Display：`Arial Black`, `Helvetica Neue`, CJK `PingFang SC`, `Noto Sans CJK SC`, sans-serif；全大写英文，紧字距 -0.035em。
- UI/body：`Inter`, `SF Pro Text`, `PingFang SC`, sans-serif；16–18 px，600–800。
- Numeric/HUD：`SFMono-Regular`, `Menlo`, `Noto Sans Mono CJK SC`, monospace；11–13 px，0.09em tracking。
- 主标题 34–44 px / 0.92 行高；候选名 16 px；长用户名使用 `min-width:0` 与单行省略。
- 不对中文强制全角字距；英文标签可全大写，中文保持自然字重。

## 5. Shape, material, and lighting

- Dominant shapes：照片矩形、窄裁切条、接触表编号；圆只用于真实头像缩略图。
- Corner language：照片 2 px，候选按钮 6 px，禁止通用 20–28 px 大圆角卡片。
- Border/shadow：1.5–2 px 黑墨边；纸片投影固定 `4px 5px 0 rgba(18,17,14,.18)`，不使用模糊悬浮阴影。
- Materials：温暖无涂层纸、黑色照片遮片、朱红蜡笔裁切线。
- Lighting：头像本身不做统一调色；正确显影仅一次 90 ms 白场闪光。

## 6. Characters, environments, and assets

- 产品人物素材仅使用联系人 `head_url`；不设置 `crossOrigin`。
- 目标必须有真实头像；无头像联系人不能进入本作候选池。
- 平台外 demo 使用 6 位虚构成年人的独立生成头像，正面或轻微三分之二角度、自然室内光、中性背景、无文字和 Logo。
- 头像缩略图必须为圆形并与名字并列；主照片为 4:5 竖裁切，不做卡通化或生图变形。
- CSS 遮片、`clip-path`、灰度和亮度只改变可见范围，不把头像读入 Canvas。

## 7. UI and icons

- Icons：自绘 24×24、1.8 px 圆端线 SVG；仅声音开/关、重试和向前箭头，保持同一家族。
- Candidate button：全宽、60–68 px 高；48–52 px 头像、姓名、1–3 编号；按压下移 2 px。
- HUD：轮次在左，18%/44%/76% 在中，声音在右；不显示分数面板直到结算。
- Default：暖纸底；pressed：钴蓝边 + 2 px 下移；focus：3 px 黑/白双层轮廓；disabled：斜线覆盖并缩进 6 px。
- Loading：三张空白联系印样按 180 ms 顺序显影；empty/error 使用一张被抽空的照片框和直接恢复按钮。
- Success：完整头像、名字、揭露比例；error：朱红裁切叉与原因文字，不仅靠颜色。
- Emoji policy：禁止 Emoji 充当任何功能图标。

## 8. Motion and VFX

- Tokens：press 90 ms；candidate settle 160 ms；mask expand 280 ms `cubic-bezier(.2,.8,.2,1)`；reveal 620 ms；result 420 ms。
- 错误：候选按钮向左 6 px、斜线 160 ms 划过；80 ms 后照片遮片扩大。
- 正确：输入同帧锁定；60 ms 白闪；遮片 280 ms 全开；照片轻微从 0.985 到 1；标签 180 ms 盖下。
- 结算：最佳联系印样从底部滑入 18 px，不使用彩纸屑或持续粒子。
- Screen shake：仅错误按钮自身 4 px，不震动整屏。
- Reduced motion：取消白闪、位移和标签冲击，只保留 120 ms opacity 与立即全开。

### Feedback matrix

| Event | Immediate acknowledgement | Visual/motion | Audio | Intensity | Recovery |
|---|---|---|---|---:|---|
| 候选按下 | 同帧下移 2 px | 钴蓝描边 | 420 Hz click | 1 | 90 ms |
| 猜错 | 锁定该候选 | 斜线 + 6 px recoil | 180→120 Hz | 2 | 180 ms 后扩大线索 |
| 线索扩大 | 百分比立即更新 | 遮片 280 ms 拉开 | 160 ms sweep | 2 | 允许下一次选择 |
| 猜对 | 锁定全部输入 | 白闪 + 完整显影 + 标签 | 两音上行 | 4 | 900 ms 后下一轮 |
| 18% 认出 | 正确反馈上加印章 | 朱红 `18%` 标签 | +1240 Hz | 5 | 记录最佳联系人 |
| 完成一局 | 立即显示分数 | 最佳联系印样滑入 | 三音结算 | 4 | 再玩一次 |

## 9. References translated into principles

- 摄影联系印样：用连续裁切和编号表达“识别进度”；不复制任何摄影品牌或具体版式。
- Guess Who：三位候选和排除反馈必须立即可读；不复制翻板棋盘或卡通人物。
- WhoLiked?：谜底必须来自真实社交对象；不读取或复制朋友的点赞历史。
- Exposed：规则一句话即可开始；不采用羞辱性问题库或强制多人同场。

## 10. Anti-patterns

- 禁止用名字首字母假装“头像推理”；目标没有 `head_url` 就不进入题池。
- 禁止把完整目标头像与同一完整候选头像并排到像素匹配无需思考。
- 禁止随机指定“正确朋友”而没有真实头像/回答/投票证据。
- 禁止每轮通知一个人、猜错也通知、通知自己或 demo 联系人。
- 禁止人物卡片套玻璃、霓虹扫描 HUD、案件档案、长教程和复杂积分条。
- 禁止为外部访客栏永久下移照片或 HUD。

## 11. Vertical-slice acceptance

- Entry/start：一句话看懂“看一点，认出朋友”，真实/演示状态明确。
- Gameplay：18% 目标照片 + 三个头像姓名候选，在 390×844 和 320×568 全部可达。
- High-feedback moment：一次错误扩大至 44%，一次 18% 正确完整显影。
- Completion/end：3 轮 demo 结算，显示最佳对象与通知规则。
- Narrow mobile：320×568 主照片不小于 178 px 高，候选按钮不低于 52 px，底部 CTA 可达。
- Required states：loading、cover、round、miss、reveal、result、empty、error、external guest。
- Visual QA：垂直切片必须先覆盖上述四个代表状态并清零 P0/P1，才扩展真实联系人与通知。

## 12. Screen/state contract

| State | Player question | Primary focus | Primary action | Recovery |
|---|---|---|---|---|
| loading | 我的朋友准备好了吗？ | 三张空白联系印样 | 无 | 超时进入 error |
| cover | 这是什么？ | 标题 + 18% 示例照片 | 开始 | demo/真实模式标签 |
| empty | 为什么不能开始？ | 至少三位有头像联系人 | 返回平台 / demo | 重试联系人 |
| error | 接口出了什么问题？ | 简短错误原因 | 重试 | 进入 demo |
| round | 这是谁？ | 局部目标照片 | 选一位联系人 | 错误后扩大线索 |
| reveal | 我猜对了吗？ | 完整头像与姓名 | 继续 | 自动 900 ms 推进 |
| result | 我有多了解朋友？ | 分数 + 最佳对象 | 再玩一次 | 打开最佳对象资料 |

Global：响应式 DOM；顶部 56 px 稳定 HUD；照片区域保护手指路径；候选不滚动；长名字省略；离线 demo 明确标注。资料按钮仅在 reveal/result 中使用 `onClick`。
