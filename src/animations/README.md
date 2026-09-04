# Animation learning and reuse guide

这个目录集中管理 App 的动画控制逻辑。目标是让每个 animation 可以独立学习、调节，
也能在不复制整个 screen 的情况下移植到其他 React Native 项目。

## 阅读方式

一个完整动画通常分成两部分：

1. **Controller**：放在 `src/animations`，负责 Animated Value、timing、gesture 和
   completion callback。
2. **Renderer**：放在 `src/components`，负责把 value 映射成 transform、opacity、SVG
   或实际 UI。

业务流程较长时，会另外使用 `src/hooks` 连接状态，例如拍照、显影与保存照片。

所有公开动画都从以下入口 export：

```ts
import {
  useCartFlightAnimation,
  usePullDownCameraAnimation,
} from '../animations'; // 按调用文件的位置调整相对路径
```

## Animation catalogue

为了避免一个过宽的表格，这里按照功能拆分。`Copy starting point` 是移植动画时建议
先复制的文件。

### Order 与 Cart

| Animation           | Copy starting point                             | Also copy / use with                                         |
| ------------------- | ----------------------------------------------- | ------------------------------------------------------------ |
| Cart flying queue   | `animations/cart/useCartFlightAnimation.ts`     | `components/coffee/FlyingCoffee.tsx`                         |
| Coffee steam icon   | `components/common/AnimatedCoffeeIcon.tsx`      | `components/common/BottomTabs.tsx`、`screens/CartScreen.tsx` |
| Coffee card focus   | `components/coffee/AnimatedCoffeeCard.tsx`      | Animation 在 component 内完成                                |
| Category indicator  | `components/coffee/CoffeeCategorySelector.tsx`  | Animation 在 component 内完成                                |
| Sticky search       | `animations/coffee/useStickySearchAnimation.ts` | `screens/OrderScreen.tsx`                                    |
| Border comet glow   | `components/common/AnimatedGlowButton.tsx`      | Animation 在 component 内完成、SVG                           |
| Slide to order      | `animations/cart/useSlideToOrderAnimation.ts`   | `components/cart/SlideToOrder.tsx`                           |
| Hold to order       | `animations/cart/useHoldToOrderAnimation.ts`    | `components/cart/HoldToOrder.tsx`、SVG                       |
| Order success check | `animations/cart/useOrderSuccessAnimation.ts`   | `components/cart/OrderSuccessOverlay.tsx`、Reanimated、SVG   |

表格路径全部以 `src/` 为起点。

### Delivery 与 Navigation

| Animation       | Copy starting point                                    | Also copy / use with                       |
| --------------- | ------------------------------------------------------ | ------------------------------------------ |
| Delivery radar  | `animations/delivery/useDeliveryStepRadarAnimation.ts` | `components/delivery/DeliveryStepDot.tsx`  |
| Delivery bike   | `animations/delivery/useDeliveryVehicleAnimation.ts`   | `components/delivery/DeliveryProgress.tsx` |
| Page transition | `animations/navigation/usePageTransitionAnimation.ts`  | `App.tsx`                                  |

### Camera 与 Polaroid

| Animation           | Copy starting point                                | Also copy / use with                                                     |
| ------------------- | -------------------------------------------------- | ------------------------------------------------------------------------ |
| Pull-down camera    | `animations/camera/usePullDownCameraAnimation.ts`  | `components/profile/PullDownCoffeeCamera.tsx`、Vision Camera             |
| Continuous shake    | `animations/camera/useContinuousShakeDetection.ts` | `components/profile/camera/DevelopingPolaroid.tsx`、React Native Sensors |
| Photo workflow      | `hooks/useCoffeePhotoFlow.ts`                      | `screens/CoffeeCameraScreen.tsx`、Camera Roll                            |
| Print configuration | `animations/camera/photoPrintConfig.ts`            | Camera flow 共用                                                         |

`hooks/useCoffeePhotoFlow.ts` 负责串联 printing、shaking、revealing、ready-to-save 和
saving，不建议只复制一半状态流程。

## Copy recipes

### 1. 商品飞入购物车

复制：

```text
src/animations/cart/useCartFlightAnimation.ts
src/components/coffee/FlyingCoffee.tsx
```

基本连接方式：

```tsx
const {flight, progress, cartScale, launch} = useCartFlightAnimation();

sourceRef.current?.measureInWindow((x, y, width, height) => {
  targetRef.current?.measureInWindow((tx, ty, tw, th) => {
    launch(
      item,
      {x: x + width / 2, y: y + height / 2},
      {x: tx + tw / 2, y: ty + th / 2},
      () => addItemToCart(item),
    );
  });
});
```

`launch` 使用 FIFO queue，连续点击不会覆盖前一个动画。`onArrival` 在商品抵达后才
执行，所以 badge number 会在飞行动画结束时增加。

### 2. Button border comet glow

复制：

```text
src/components/common/AnimatedGlowButton.tsx
```

这个 component 已经包含 controller 与 renderer，只需要传入 `label` 和 `onPress`。
原本的金色实心 button 会保留；三条共用 timeline、但长度与透明度不同的 SVG stroke
会组合成彗星。长而淡的是尾巴，短而亮的是内层轨迹，纯白小点是彗星头。三层 dash
采用不同的 offset 对齐末端，因此反向绕行时尾巴仍然留在光点后方。

常用调整位置都在 component 顶部：

- `COMET_TAIL_LENGTH`：最外层尾巴长度。
- `COMET_TRAIL_LENGTH`：较亮的内层轨迹长度。
- `COMET_HEAD_LENGTH`：彗星头长度；维持接近 `1` 会呈现圆点。
- `GLOW_PADDING`：外部光晕可以超出按钮多少。
- `duration`：完成一圈所需时间，目前为 `2200ms`。
- 三个 `strokeWidth`：分别控制长尾、短轨迹和头部光点的粗细。
- `dashOffset.outputRange`：目前使用 `[0, -perimeter]`；交换正负号可以改变
  绕行方向，但也要同步调整三层 dash 的对齐方式。

### 3. Coffee steam icon

复制：

```text
src/components/common/AnimatedCoffeeIcon.tsx
```

这个 component 保留 Lucide Coffee 原本的杯身 SVG path，只把上方三条 steam stroke 拆成
独立的 `Animated.View`。每条蒸汽会错峰向上移动、轻微左右漂移并淡出，因此小尺寸 tab
icon 和较大的 empty-state icon 都不会失去原本轮廓。

```tsx
<AnimatedCoffeeIcon color={colors.gold} size={32} strokeWidth={1.6} />
```

主要调整参数：

- `STEAM_RISE_DURATION`：一条蒸汽完成上浮的时间。
- `STEAM_STAGGER`：三条蒸汽开始动画的间隔。
- `STEAM_DRIFT`：每条蒸汽往左右漂移的方向和距离比例。
- `translateY` 的 `-size * 0.26`：蒸汽往上飘的高度。
- `opacity.outputRange`：蒸汽出现和消失的节奏。

### 4. Slide to order

复制：

```text
src/animations/cart/useSlideToOrderAnimation.ts
src/components/cart/SlideToOrder.tsx
```

```tsx
const animation = useSlideToOrderAnimation({maxTravel, onComplete});

<Animated.View {...animation.panHandlers}>
  <Animated.View style={{transform: [{translateX: animation.translateX}]}} />
</Animated.View>;
```

完成条件定义在 hook：滑过 `78%`，或滑过 `58%` 且速度高于 `0.9`。

### 5. Hold to order

复制：

```text
src/animations/cart/useHoldToOrderAnimation.ts
src/animations/cart/holdToOrderParticles.ts
src/components/cart/HoldToOrder.tsx
```

将 `startHolding` 接到 `onPressIn`，`cancelHolding` 接到 `onPressOut`。默认需要持续按住
`4500ms`。`HOLD_PARTICLES_ENABLED` 控制 shining particles 是否运行。

### 6. Order success check

复制：

```text
src/animations/cart/useOrderSuccessAnimation.ts
src/components/cart/OrderSuccessOverlay.tsx
```

这个动画使用 Reanimated 和 SVG path drawing。目标项目必须安装
`react-native-reanimated` 与 `react-native-svg`，并确保 Reanimated Babel plugin 是
`babel.config.js` 的最后一个 plugin。

### 7. Delivery radar

复制：

```text
src/animations/delivery/useDeliveryStepRadarAnimation.ts
src/components/delivery/DeliveryStepDot.tsx
```

```tsx
const radar = useDeliveryStepRadarAnimation(isCurrentStep);

<Animated.View
  style={{
    opacity: radar.radarOpacity,
    transform: [{scale: radar.radarScale}],
  }}
/>;
```

当 `active=false` 时，hook 会停止并清理 loop；Delivered 阶段因此不会继续发光。

### 8. Pull-down camera

复制：

```text
src/animations/camera/usePullDownCameraAnimation.ts
src/components/profile/PullDownCoffeeCamera.tsx
src/components/profile/camera/PullDownCameraContent.tsx
```

`progress=0` 表示收起的 notch，`progress=1` 表示完整相机。`beginPull`、`movePull`、
`endPull` 和 `cancelPull` 可以连接 PanResponder 或 Gesture Handler。

如果需要真实拍照，还要复制相机 permission/capture 部分，并安装 Vision Camera。

### 9. Polaroid print 与摇动显影

完整 flow 建议一起复制：

```text
src/animations/camera/photoPrintConfig.ts
src/animations/camera/useContinuousShakeDetection.ts
src/hooks/useCoffeePhotoFlow.ts
src/components/profile/camera/DevelopingPolaroid.tsx
src/services/photoLibrary.ts
```

流程如下：

```text
Capture
  → shutter loading
  → printer morph
  → photo eject and settle
  → continuous shake for 3 seconds
  → blur gradually clears
  → pull down to save
```

一次有效的 accelerometer 摆动只调用一次 `onShakePulse`，所以照片只晃动一次。用户
必须持续摇动，进度才会增加；停手超过设定时间会重新计算连续三秒。

## Camera tuning reference

相机 loading、打印与摇动参数集中在
`src/animations/camera/photoPrintConfig.ts`。

### Shutter loading

- `minimumLoadingDuration`：loading 至少显示多久。
- `loadingRotationDuration`：loading ring 转动速度。

### Polaroid printing

- `ejectDelay`：相机关闭后多久开始出照片。
- `ejectDuration`：照片完整推出的速度。
- `settleDuration`：照片缩回最终尺寸的速度。
- `translateY`：开始、推出完成、最终落位的 Y 位置。
- `scale`：开始、最大、最终三个尺寸。
- `rotate`：开始、推出和落位时的角度。
- `widthRatio` / `maxWidth`：照片与 printer slot 共用的宽度公式。

### Continuous shake

- `requiredDuration`：持续摇动多久才完成，默认 `3000ms`。
- `sampleInterval`：读取 accelerometer 的频率。
- `activityThreshold`：多少加速度变化才算仍在摇动。
- `pulseThreshold`：多少加速度变化触发一次照片晃动。
- `pulseCooldown`：两次照片晃动之间的防抖时间。
- `activityGracePeriod`：换方向时允许的短暂空隙。
- `inactivityResetDelay`：停手多久后清空连续进度。
- `pulseAnimationDuration`：照片单次晃动的时间。
- `revealDuration`：照片从模糊变清晰的时间。

Android 的 accelerometer 使用 `m/s²`，iOS 使用近似 `g`。检测 hook 会先统一单位，再比较
相邻 sample，复制时不需要另外写平台判断。

## Animated 与 Reanimated 的选择

- 普通 transform、opacity 和 gesture 使用 React Native `Animated`，复制成本较低。
- Order success 使用 Reanimated，因为 SVG path 与 UI-thread sequence 更适合 worklet。
- `transform` 与 `opacity` 尽量设置 `useNativeDriver: true`。
- `width`、`height`、颜色和 JS listener 需要 `useNativeDriver: false`。
- 不要在 sensor 或 animation 每一帧执行 `console.log`，否则 JS thread 容易掉帧。

## Copy 前检查

1. Controller 和 renderer 是否一起复制。
2. Import 的 theme、type、service 是否需要替换。
3. `Animated.loop` 是否在 cleanup 调用 `stop()`。
4. Timer 是否在 unmount 时清理。
5. Completion callback 是否可能重复执行。
6. Gesture value 是否有 clamp。
7. Native package 是否安装，并完成 iOS `pod install`。
8. Camera 和 accelerometer 是否已在 real device 测试。

## Inspiration

- [Opal hold interaction](https://60fps.design/shots/opal-hold-to-leave-button-interaction)
- [Pico Cam pull-down camera](https://60fps.design/shots/pico-cam-pull-down-notch-camera-interaction)
- [Pico Cam shake coach mark](https://60fps.design/shots/pico-cam-shake-and-swipe-coach-mark-animation)

这些实现用于学习交互原理，是根据视觉与行为重新编写的代码，并不是原网站 source
code 的复制。
