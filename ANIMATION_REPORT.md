# Noir Coffee App — Animation 功能报告

- **报告日期：** 2026 年 10 月 13 日
- **平台：** React Native（Android / iOS）
- **主题：** 黑金精品咖啡订购体验

## 1. Executive summary

目前 App 已完成 **19 项主要动画与手势互动**，覆盖 Order、Cart、Delivery、Profile、
Camera / Polaroid 以及页面切换。动画并非单纯装饰，主要用于以下四个目的：

1. **提供操作反馈**：让用户知道点击、加入购物车、下单和保存照片是否成功。
2. **解释状态变化**：通过 cart badge、delivery radar、脚踏车位置和照片显影表达流程进度。
3. **引导操作**：通过 slide arrows、hold progress、pull-down camera 和向下保存箭头提示手势。
4. **建立品牌体验**：黑金彗星光点、咖啡蒸汽、拍立得打印和青色成功勾形成具有辨识度的视觉语言。

整体动画以 React Native `Animated` 为主；SVG 路径动画使用 Reanimated；相机、传感器和
相册功能分别由 Vision Camera、React Native Sensors 与 Camera Roll 支持。

## 2. Animation inventory

### A. Order 与商品浏览

#### 1. Coffee card entrance animation

- **触发方式**：Order page 首次显示 coffee list。
- **视觉效果**：前几张 card 以 staggered delay 逐张淡入并向上进入。
- **目的**：避免商品突然同时出现，建立自然的页面进入节奏。
- **实现**：React Native Animated，约 `340ms`，每张 card 间隔约 `55ms`。

#### 2. Coffee card scroll focus

- **触发方式**：用户上下滚动 coffee list。
- **视觉效果**：接近画面中央的 card 会轻微放大、提高 opacity、减少倾斜并显示较粗金色边框；
  远离中央的 card 会缩小、淡化并产生透视旋转。
- **目的**：让只有少量商品的列表也有明显的 scrolling depth，并把注意力集中在当前商品。
- **实现**：scale、opacity、perspective、rotateX、translateY 与内部图片 parallax interpolation。

#### 3. Category selector sliding indicator

- **触发方式**：点击 All、Espresso、Milk 或 Cold Brew。
- **视觉效果**：共用的选中背景以 spring 移动到新分类；文字颜色和点击 scale 同步变化。
- **目的**：比直接切换颜色更清楚地表达分类之间的连续关系。
- **实现**：Animated spring、color interpolation 与 press scale。

#### 4. Sticky search transition

- **触发方式**：Order page 向下滚动超过设定位置。
- **视觉效果**：原本位于标题下方的 search field 淡出；compact search field 淡入并固定在 cart icon 左侧。
- **目的**：用户浏览较下方商品时仍可搜索，同时保留 cart 的快速入口。
- **实现**：scrollY interpolation、opacity cross-fade、translateY 与 pointer-event threshold。

#### 5. Add-to-cart flying queue

- **触发方式**：连续点击 coffee card 的 `+`。
- **视觉效果**：咖啡图案沿弧线路径旋转、缩小并飞入 header cart icon；抵达时 cart icon 会弹跳。
- **业务逻辑**：商品真正抵达 cart 后才增加红色 badge number。
- **连续操作**：采用 FIFO queue，连续点击五次会完整播放五次，不会覆盖上一段动画。
- **实现**：位置测量、X/Y interpolation、scale、rotate、opacity、sequence 与 spring。

#### 6. Animated coffee steam icon

- **显示位置**：Order tab icon 与 Cart empty state。
- **视觉效果**：保留 Lucide Coffee 杯子轮廓，三条蒸汽分别错峰上浮、左右漂移、拉伸并淡出。
- **目的**：在不改变 icon 原型的情况下增加品牌生命力。
- **实现**：三个独立 Animated loop；支持 tab 小尺寸和 empty-state 大尺寸。

#### 7. Border comet glow

- **显示位置**：Browse Coffee button。
- **视觉效果**：带有亮点、短轨迹和渐淡长尾的彗星沿圆角按钮边框持续移动。
- **目的**：在保留原有金色边框的同时突出主要 CTA。
- **实现**：React Native SVG `strokeDasharray`、`strokeDashoffset` 与三层 animated stroke。

### B. Cart 与 Checkout

Cart 的产品流程为 `Checkout → Order Summary modal → Slide / Hold → Order success`。
Order Summary 会先列出商品、size、quantity、subtotal、delivery fee 与 total；只有在这个
确认层内才会显示用户于 Profile 选定的 Slide 或 Hold interaction。Summary modal 属于流程
UI，不另外计入自定义 animation 数量。

#### 8. Swipe-to-remove interaction

- **触发方式**：Cart item 向左滑动。
- **视觉效果**：商品 row 跟随手指左移，露出红色 Remove action；未达到 threshold 时 spring 回原位。
- **目的**：提供符合 mobile 使用习惯的删除方式，并避免误删。
- **实现**：PanResponder、clamped translateX、velocity / distance threshold 与 spring settle。

#### 9. Slide to place order

- **触发方式**：点击 Checkout、检查 Order Summary 后，将 modal 内的 thumb 向右滑到完成区域。
- **视觉效果**：idle chevrons 循环提示方向；拖动时 thumb 跟随手指；不足 threshold 会弹回，完成时显示确认状态。
- **目的**：避免误触下单，同时提供具有仪式感的 checkout interaction。
- **完成条件**：滑过约 `78%`，或滑过约 `58%` 且具备足够滑动速度。
- **实现**：PanResponder、Animated Value、spring、timing 与 idle arrow loop。手势从 track
  touch start 开始取得 responder，避免被 Modal 或相邻 ScrollView 拦截。

#### 10. Hold to place order

- **触发方式**：点击 Checkout、检查 Order Summary 后，持续按住 modal 内的 process control。
- **视觉效果**：进度从左向右填满；按钮轻微压缩；金色 gradient、白色 shining band、glow 和大量 particles 同时运行；完成后出现 checkmark。
- **目的**：作为 Slide Checkout 的另一种可选下单体验。
- **完成时间**：默认持续按住约 `4.5s`。
- **实现**：Animated timing / spring / parallel / loop、SVG gradients 与粒子参数阵列。

#### 11. Order success confirmation

- **触发方式**：Slide 或 Hold checkout 完成。
- **视觉效果**：全屏 overlay 淡入、青色圆形 spring 出现、checkmark 以 SVG path drawing 方式画出，外层 glow pulse 后再显示文字。
- **业务流程**：动画完成后才创建 delivery order，并自动进入 Delivery page。
- **实现**：React Native Reanimated、SVG strokeDashoffset、spring、sequence、delay 与 repeat。

### C. Delivery tracking

Order success animation 完成后，App 会保存当次订单的 immutable snapshot，包括商品、size、
quantity、价格、delivery fee 和地址。Delivery card 的 `View delivery details` 位于进度条与
日期之间，打开后可在 bottom-sheet modal 查看完整订单资料。这个详情 modal 是辅助理解配送
story 的流程 UI，不另外计入自定义 animation 数量。

#### 12. Active-step radar glow

- **触发方式**：Delivery 状态为 Brewing 或 Arriving。
- **视觉效果**：当前 step 中心点 heartbeat；外层圆环像雷达一样扩散并淡出。
- **目的**：让用户立即看出当前配送进度。
- **状态处理**：Delivered 阶段会停止动画并清理 loop。
- **实现**：两个独立 Animated loop，分别控制 radar wave 与 center heartbeat。

#### 13. Delivery vehicle movement

- **触发方式**：Delivery status 从 Brewing 切换到 Arriving。
- **视觉效果**：脚踏车／运输 icon 从第一个 checkpoint 移动到 Arriving，并持续上下跳动与轻微旋转，模拟行驶感。
- **目的**：把抽象状态转换成容易理解的移动过程。
- **状态处理**：Delivered 时车辆到达最终位置并停止 live animation。
- **实现**：横向 travel timing，加上独立 bounce / rotate loop。

### D. Profile 与页面导航

#### 14. Coffee preferences dropdown

- **触发方式**：点击 Profile 的 Coffee Preferences。
- **视觉效果**：列表高度展开／收起，内容淡入并向下进入，chevron 同时旋转 180°。
- **目的**：在不跳转页面的情况下显示偏好选项，并保持 Profile 页面整洁。
- **实现**：单一 normalized progress 同步控制 height、opacity、translateY 与 rotate。

#### 15. Page transition

- **触发方式**：切换 tab、进入 Coffee Detail 或打开 Camera page。
- **视觉效果**：新页面短暂淡入并从下方约 10px 上升到最终位置。
- **目的**：避免页面瞬间替换产生跳动感。
- **实现**：约 `260ms` fade-and-rise transition。

### E. Camera 与 Polaroid experience

#### 16. Pull-down notch camera

- **触发方式**：在 Coffee Lover page 向下拉整个界面，或点击顶部 notch。
- **视觉效果**：小型 pull-down control 平滑扩展为完整 camera panel；宽度、高度、圆角、提示内容与 camera preview 同步变化。
- **附加功能**：真实相机 preview、flash 开关、前后镜头切换与 permission state。
- **目的**：将工具型相机功能包装成具有品牌特色的互动入口。
- **实现**：PanResponder、normalized progress、spring / timing 与 Vision Camera。

#### 17. Shutter capture feedback

- **触发方式**：按下拍照按钮。
- **视觉效果**：shutter button scale feedback、中间 loading ring 旋转，并产生快速 camera flash overlay。
- **目的**：让用户清楚知道系统正在拍摄和处理照片。
- **实现**：Animated scale、rotation loop、opacity flash；minimum loading 约 `850ms`。

#### 18. Polaroid printing and settling

- **触发方式**：相机成功取得照片。
- **视觉效果**：Camera panel 收缩并 morph 成 printer slot；照片从 slot 缓慢推出，过程中先放大并改变角度，完整推出后缩小、旋转并落到接近画面中央的位置。
- **目的**：模拟拍立得实体出片过程，是目前 App 最具辨识度的 animation flow。
- **实现**：printer morph、translateY、scale、rotate、opacity 与多阶段 timing / easing。
- **主要时间**：推出约 `1550ms`，最终 settle 约 `620ms`。

#### 19. Shake-to-develop and pull-to-save

- **触发方式**：照片打印完成后持续摇动手机约三秒；清晰后将照片向下拉。
- **视觉效果**：
  - 每次有效摇动，Polaroid card 只晃动一次。
  - 必须持续产生动作，停顿过久会重置连续进度。
  - 达标后照片从 blur `22` 逐渐变清晰。
  - 清晰后向下箭头循环跳动，提示 pull-to-save。
  - 下拉达到 threshold 后，照片向下离场并保存至系统相册；不足时 spring 回原位。
- **目的**：把照片显影与保存转化为可学习、可反馈的完整互动流程。
- **实现**：Accelerometer sampling、card wobble、blur bridge、arrow loop、PanResponder、Camera Roll。

## 3. 技术实现概览

| 技术                       | 在 App 中的用途                                                   |
| -------------------------- | ----------------------------------------------------------------- |
| React Native Animated      | 大部分 transform、opacity、gesture、loop 与 spring animation      |
| React Native Reanimated    | Order success 的 UI-thread sequence 与 SVG checkmark path drawing |
| React Native SVG           | 彗星边框、Hold gradient 与成功 checkmark                          |
| PanResponder               | Slide checkout、swipe remove、pull-down camera、pull-to-save      |
| React Native Vision Camera | 真实 camera preview、拍照、flash 与镜头切换                       |
| React Native Sensors       | 持续三秒的 accelerometer shake detection                          |
| Camera Roll                | 将完成显影的照片保存到系统 album                                  |

## 4. 工程与性能处理

- Animation controller 与 renderer 尽量分离，主要 controller 集中在 `src/animations`。
- 所有公开 animation controller 可从 `src/animations/index.ts` import。
- transform 和 opacity 优先使用 native driver，减少 JavaScript thread 压力。
- Cart flying animation 使用 queue，避免快速连续操作丢失动画或 cart update。
- Infinite loop、timer、sensor subscription 和 animation listener 都在 unmount 时清理。
- Camera flow 使用明确的 phase state machine，避免 printing、shaking、revealing 和 saving 状态互相冲突。
- Animation 参数集中配置，便于调整时间、速度、大小、角度与 sensor sensitivity。

## 5. 产品层面的重点亮点

1. **双 Checkout Interaction**：用户可在 Profile 选择 Slide 或 Hold，下单前先通过 Order Summary 确认内容。
2. **动作与业务状态同步**：商品飞进 cart 后才增加 badge；成功勾完成后才建立 delivery snapshot。
3. **可视化 Delivery 状态**：radar 与车辆位置让 Brewing / Arriving / Delivered 更直观，详情 modal 保留完整订单 context。
4. **完整 Camera Storytelling**：从 pull-down、拍照、打印、摇动显影到保存相册形成连续体验。
5. **统一黑金视觉语言**：彗星光点、金色 glow、coffee steam 与 Polaroid hardware styling 保持品牌一致。

## 6. 测试注意事项

- 普通 UI animation 可在 Android Emulator 与 iOS Simulator 检查。
- 真实相机、flash、accelerometer shake 和保存相册权限必须在 real device 验证。
- Android Debug build 的系统 shake gesture 可能打开 Developer Menu；测试 shake-to-develop 时建议使用 Release build。
- 安装或调整 Camera、Sensors、Reanimated 等 native package 后，需要重新 build；iOS 同时需要重新执行 `pod install`。

## 7. 结论

目前 Noir Coffee App 已具备从商品浏览、加入购物车、结账确认、配送追踪到品牌相机体验的
完整 animation system。动画同时承担反馈、引导、状态表达与品牌塑造功能，不只是页面装饰。
其中最具展示价值的部分是 **连续飞入购物车、Slide / Hold 双 Checkout、Delivery Radar**
以及 **Pull-down Camera + Polaroid Shake-to-Develop** 完整流程。
