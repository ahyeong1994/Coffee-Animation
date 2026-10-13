# Noir Coffee Mobile Animation

这是一个以黑金色视觉为主的 React Native 咖啡订购练习 App。项目重点不是后端或
真实付款，而是把常见的 mobile interaction 拆成容易阅读、调整和复制的动画模块。

## App 包含什么

底部导航目前有四个主要页面：

- **Order**：浏览、搜索和筛选咖啡；点击 card 查看详情与选择 S／M／L，或使用 `+`
  快速加入默认 M size。
- **Cart**：修改数量、左滑删除商品；点击 Checkout 后先在 Order Summary modal
  检查商品与金额，再使用 Slide/Hold 完成下单。
- **Delivery**：显示 Brewing、Arriving、Delivered 三个配送阶段，并可打开
  Delivery Details modal 查看地址、商品快照与完整金额。
- **Profile**：设置咖啡偏好、下单方式，并进入 pull-down camera 页面。

相机页面包含完整的拍立得流程：下拉打开相机、拍照 loading、照片打印、持续摇动
显影，以及下拉保存到系统相册。

主要订购流程如下：

```text
Order
  → Cart
  → Checkout
  → Order Summary modal
  → Slide / Hold to process order
  → Order success animation
  → Delivery
  → View delivery details
```

Cart 在 Checkout 时不会立即建立订单。用户需要先在 Summary modal 检查商品、size、数量、
delivery fee 与总额，再完成 Profile 中选定的 Slide 或 Hold interaction。成功动画播放完毕后，
App 才会清空购物车、保存不可变的 delivery order snapshot，并进入 Delivery page。

## Animation 一览

- 商品飞入购物车，并在抵达后更新 cart badge。
- Coffee card scrolling focus 与金色边框效果。
- Order tab 与 empty state 的咖啡蒸汽上浮动画。
- Category selector 滑动与点击反馈。
- Sticky search：向下滚动后固定在 header。
- Browse Coffee 圆角边框的反向游走彗星光点。
- Slide to order 与 Hold to order。
- 下单成功的青色打勾动画。
- Delivery 当前阶段的 radar glow 与脚踏车动画。
- Page transition。
- Pull-down camera、shutter loading、Polaroid printing。
- Accelerometer 持续摇动显影，以及照片 pull-to-save。

下面的 Animation catalogue 会列出每个动画的 controller、renderer、额外依赖和建议的
复制入口。本项目只保留这一份 README，避免动画说明散落在不同目录。

## Animation catalogue

一个完整动画通常分成两部分：

1. **Controller**：放在 `src/animations`，负责 Animated Value、timing、gesture 和
   completion callback。
2. **Renderer**：放在 `src/components`，负责把 value 映射成 transform、opacity、SVG
   或实际 UI。

业务流程较长时，会另外使用 `src/hooks` 串联状态，例如拍照、显影与保存照片。所有公开
animation controller 都应该优先从 `src/animations/index.ts` import。

### Order 与 Cart

| Animation           | 建议从这里开始复制                                  | 搭配文件 / 依赖                                                                      |
| ------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Cart flying queue   | `src/animations/cart/useCartFlightAnimation.ts`     | `src/components/coffee/FlyingCoffee.tsx`                                             |
| Coffee steam icon   | `src/components/common/AnimatedCoffeeIcon.tsx`      | Component 内包含完整动画                                                             |
| Coffee card focus   | `src/components/coffee/AnimatedCoffeeCard.tsx`      | Component 内包含完整动画                                                             |
| Category indicator  | `src/components/coffee/CoffeeCategorySelector.tsx`  | Component 内包含完整动画                                                             |
| Sticky search       | `src/animations/coffee/useStickySearchAnimation.ts` | `src/screens/OrderScreen.tsx`                                                        |
| Border comet glow   | `src/components/common/AnimatedGlowButton.tsx`      | React Native SVG                                                                     |
| Slide to order      | `src/animations/cart/useSlideToOrderAnimation.ts`   | `src/components/cart/SlideToOrder.tsx`                                               |
| Hold to order       | `src/animations/cart/useHoldToOrderAnimation.ts`    | `src/animations/cart/holdToOrderParticles.ts`、`src/components/cart/HoldToOrder.tsx` |
| Order success check | `src/animations/cart/useOrderSuccessAnimation.ts`   | `src/components/cart/OrderSuccessOverlay.tsx`、Reanimated、SVG                       |

### Delivery 与 Navigation

| Animation       | 建议从这里开始复制                                         | 搭配文件 / 依赖                                |
| --------------- | ---------------------------------------------------------- | ---------------------------------------------- |
| Delivery radar  | `src/animations/delivery/useDeliveryStepRadarAnimation.ts` | `src/components/delivery/DeliveryStepDot.tsx`  |
| Delivery bike   | `src/animations/delivery/useDeliveryVehicleAnimation.ts`   | `src/components/delivery/DeliveryProgress.tsx` |
| Page transition | `src/animations/navigation/usePageTransitionAnimation.ts`  | `App.tsx`                                      |

### Camera 与 Polaroid

| Animation           | 建议从这里开始复制                                     | 搭配文件 / 依赖                                                              |
| ------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------- |
| Pull-down camera    | `src/animations/camera/usePullDownCameraAnimation.ts`  | `src/components/profile/PullDownCoffeeCamera.tsx`、Vision Camera             |
| Continuous shake    | `src/animations/camera/useContinuousShakeDetection.ts` | `src/components/profile/camera/DevelopingPolaroid.tsx`、React Native Sensors |
| Photo workflow      | `src/hooks/useCoffeePhotoFlow.ts`                      | `src/screens/CoffeeCameraScreen.tsx`、Camera Roll                            |
| Print configuration | `src/animations/camera/photoPrintConfig.ts`            | Camera flow 共用参数                                                         |

`useCoffeePhotoFlow.ts` 会串联 printing、shaking、revealing、ready-to-save 和 saving，移植
拍立得功能时不建议只复制其中一半状态流程。

## 技术与主要依赖

- React Native `0.72.4`
- React Native Animated
- React Native Reanimated
- React Native Vision Camera
- React Native Sensors
- React Native SVG
- Camera Roll
- Lucide React Native

## 安装

项目使用 npm。Node.js 需要 `16` 或以上版本。

```bash
npm install
```

iOS 第一次安装或 native package 有改变时，还需要更新 Pods：

```bash
cd ios
pod install
cd ..
```

## 开发运行

先开启 Metro：

```bash
npm run dev
```

另开一个 terminal 运行 Android：

```bash
npm run android
```

运行 iOS：

```bash
npx react-native run-ios
```

也可以直接使用 Android Studio 或打开 `ios/MobileAnimation.xcworkspace`。

> 项目路径包含空格。在 terminal 手动进入项目时，请把完整路径放在引号内。

## Android Release build

```bash
npm run android:build:dev
```

APK 输出位置：

```text
android/app/build/outputs/apk/release/app-release.apk
```

目前 Android 没有配置 Gradle product flavors，也没有 `.env.*` 文件。因此
`android:build:dev`、`android:build:qa` 和 `android:build:prod` 暂时都会生成相同的
Release app；script 名称只是为以后加入环境配置预留。

Release build 不会在摇动手机时打开 React Native Developer Menu。Debug build 则会，
这是 React Native 的正常开发行为。

## Project structure

```text
src/
├── animations/   可复用的 animation controller、timing 与 interpolation
├── components/   UI 和 animation renderer
├── screens/      页面组合与 screen-level interaction
├── styles/       集中的 page-level StyleSheet（React Native 的 CSS layer）
├── hooks/        Cart、camera 和 photo flow 等业务状态
├── services/     相册等 native side effect
├── data/         Coffee 等静态资料
├── theme/        颜色和共用 design token
└── types/        Shared TypeScript types
```

所有 screen 的视觉规则集中在 `src/styles/screens.ts`。可复用 component 仍保留自己的
colocated StyleSheet，复制 component 或 animation 到其他项目时才不会遗漏必要样式。

动画应该优先从 `src/animations/index.ts` import。只有在修改特定动画内部实现时，才直接
引用子目录文件。

## Animation copy guide

### Cart flying queue

复制以下 controller 和 renderer：

```text
src/animations/cart/useCartFlightAnimation.ts
src/components/coffee/FlyingCoffee.tsx
```

`launch` 使用 FIFO queue，因此连续点击不会覆盖前一个飞行动画。商品抵达后才会执行
`onArrival`，cart badge number 也会在这个时间点增加。

### Border comet glow

复制 `src/components/common/AnimatedGlowButton.tsx`。这个 component 已经包含 controller
与 renderer，只需要传入 `label` 和 `onPress`。

三条共用 timeline 的 SVG stroke 会组合成彗星：长而淡的是尾巴、短而亮的是内层轨迹、
纯白小点是彗星头。常用参数如下：

- `COMET_TAIL_LENGTH`：长尾长度。
- `COMET_TRAIL_LENGTH`：明亮内层轨迹长度。
- `COMET_HEAD_LENGTH`：彗星头长度，接近 `1` 时会呈现圆点。
- 三层 `strokeWidth`：分别控制长尾、短轨迹和光点的粗细。
- `GLOW_PADDING`：光晕可以超出按钮的范围。
- `duration`：跑完一圈所需时间。
- `dashOffset.outputRange`：控制运行方向；改方向时要同步调整三层 dash 的末端对齐。

### Coffee steam icon

复制 `src/components/common/AnimatedCoffeeIcon.tsx`。它保留 Lucide Coffee 的杯身 SVG，
并把三条 steam stroke 拆成独立动画，分别错峰上升、左右漂移和淡出。

```tsx
<AnimatedCoffeeIcon color={colors.gold} size={32} strokeWidth={1.6} />
```

可以调整 `STEAM_RISE_DURATION`、`STEAM_STAGGER`、`STEAM_DRIFT`、`translateY` 和 opacity
interpolation 来改变蒸汽速度、间隔、高度与消失节奏。

### Slide / Hold to order

两个 interaction 都显示在 `OrderSummaryModal` 内，而不是直接显示在 Cart page。Cart page 的
Checkout button 只负责打开订单摘要；Slide 或 Hold 完成后才进入 order-success flow。

Slide 版本复制：

```text
src/animations/cart/useSlideToOrderAnimation.ts
src/components/cart/SlideToOrder.tsx
```

完成条件位于 hook：滑过 `78%`，或滑过 `58%` 且速度高于 `0.9`。PanResponder 会在
thumb track 开始触摸时接管 gesture，避免嵌套 Modal 或 ScrollView 抢走滑动事件。

Hold 版本复制：

```text
src/animations/cart/useHoldToOrderAnimation.ts
src/animations/cart/holdToOrderParticles.ts
src/components/cart/HoldToOrder.tsx
```

将 `startHolding` 接到 `onPressIn`，`cancelHolding` 接到 `onPressOut`。默认持续按住
`4500ms` 完成，`HOLD_PARTICLES_ENABLED` 控制 shining particles。

### Order success check

复制：

```text
src/animations/cart/useOrderSuccessAnimation.ts
src/components/cart/OrderSuccessOverlay.tsx
```

目标项目需要安装 `react-native-reanimated` 与 `react-native-svg`，并确保 Reanimated
Babel plugin 位于 `babel.config.js` plugins 的最后。

### Delivery radar

复制：

```text
src/animations/delivery/useDeliveryStepRadarAnimation.ts
src/components/delivery/DeliveryStepDot.tsx
```

`active=false` 时 hook 会停止并清理 loop，因此 Delivered 阶段不会继续发光。

Delivery card 的 `View delivery details` 会打开 `DeliveryDetailsModal.tsx`。这个 modal 本身
不是新的自定义 animation；它读取 checkout 时保存在 `Delivery` record 中的商品与金额快照。
因此购物车在下单后即使已经清空，历史 delivery 仍能显示正确的 coffee、size、quantity、
subtotal、delivery fee、total、地址和配送状态。

### Pull-down camera

复制：

```text
src/animations/camera/usePullDownCameraAnimation.ts
src/components/profile/PullDownCoffeeCamera.tsx
src/components/profile/camera/PullDownCameraContent.tsx
```

`progress=0` 表示收起的 notch，`progress=1` 表示完整相机。需要真实拍照时，还要复制
permission/capture 逻辑并安装 Vision Camera。

### Polaroid print 与持续摇动显影

完整 flow 建议一起复制：

```text
src/animations/camera/photoPrintConfig.ts
src/animations/camera/useContinuousShakeDetection.ts
src/hooks/useCoffeePhotoFlow.ts
src/components/profile/camera/DevelopingPolaroid.tsx
src/services/photoLibrary.ts
```

```text
Capture
  → shutter loading
  → printer morph
  → photo eject and settle
  → continuous shake for 3 seconds
  → blur gradually clears
  → pull down to save
```

打印尺寸、推出速度、最终位置和角度集中在 `photoPrintConfig.ts`。持续摇动的时长、sensor
取样频率、动作 threshold、pulse cooldown 和显影时间集中在
`useContinuousShakeDetection.ts`。检测逻辑会统一 Android `m/s²` 与 iOS 近似 `g` 的单位。

## Copy animation 前检查

1. Controller 与 renderer 是否一起复制。
2. Theme、type 和 service import 是否需要替换。
3. `Animated.loop` 是否在 cleanup 调用 `stop()`。
4. Timer 是否在 unmount 时清理。
5. Completion callback 是否可能重复执行。
6. Gesture value 是否有 clamp。
7. Native package 是否安装，并完成 iOS `pod install`。
8. Camera 和 accelerometer 是否已在 real device 测试。

## Animated 与 Reanimated 的选择

- 普通 transform、opacity 和 gesture 使用 React Native `Animated`，复制成本较低。
- Order success 使用 Reanimated，SVG path 与 UI-thread sequence 更适合 worklet。
- `transform` 与 `opacity` 尽量设置 `useNativeDriver: true`。
- `width`、`height`、颜色与 JS listener 需要 `useNativeDriver: false`。
- 不要在 sensor 或 animation 每一帧执行 `console.log`，否则 JS thread 容易掉帧。

## Quality checks

```bash
npm run lint
npx tsc --noEmit
npm test -- --runInBand
```

## Native package 注意事项

安装或移除 camera、sensor、Reanimated 等 native package 后，Fast Refresh 不足以加载
改变，需要重新 build app。iOS 还要再次执行 `pod install`。

Accelerometer 和真实相机功能必须使用 real device 测试；simulator/emulator 无法完整
还原实际摇动与拍摄体验。

## Animation inspiration

- [Opal hold interaction](https://60fps.design/shots/opal-hold-to-leave-button-interaction)
- [Pico Cam pull-down camera](https://60fps.design/shots/pico-cam-pull-down-notch-camera-interaction)
- [Pico Cam shake coach mark](https://60fps.design/shots/pico-cam-shake-and-swipe-coach-mark-animation)

这些实现用于学习交互原理，是根据视觉与行为重新编写的代码，并不是原网站 source code
的复制。
