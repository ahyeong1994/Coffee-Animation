# Animation learning and reuse guide

这个目录保存「动画控制逻辑」。画面仍放在 `src/components`，页面组合放在
`src/screens`，业务状态放在 `src/hooks`。这样复制动画到新项目时，不需要复制
整个 screen。

> 代码中使用 `//` 和 `/** */` 学习注释，不使用 `console.log`。动画每帧打印
> log 会拖慢 JS thread，反而容易造成掉帧。

## Folder responsibilities

```text
src/
├── animations/   Animated.Value、timing、spring、loop、interpolation
├── components/   动画实际渲染的 UI
├── screens/      组合 component，并连接事件
├── hooks/        App state、camera/photo workflow 等业务逻辑
├── services/     Album 等 native side effects
├── theme/        Color 和 spacing token
└── types/        Shared TypeScript types
```

## Animation catalogue

| Animation | Controller | Renderer | Extra dependency |
| --- | --- | --- | --- |
| Cart flying queue | `cart/useCartFlightAnimation.ts` | `components/coffee/FlyingCoffee.tsx` | None |
| Slide to order | `cart/useSlideToOrderAnimation.ts` | `components/cart/SlideToOrder.tsx` | None |
| Hold to order | `cart/useHoldToOrderAnimation.ts` | `components/cart/HoldToOrder.tsx` | `react-native-svg` for gradient |
| Order success check | `cart/useOrderSuccessAnimation.ts` | `components/cart/OrderSuccessOverlay.tsx` | Reanimated + SVG |
| Pull-down camera | `camera/usePullDownCameraAnimation.ts` | `components/profile/PullDownCoffeeCamera.tsx` | VisionCamera only for real preview |
| Polaroid photo flow | `hooks/useCoffeePhotoFlow.ts` | camera components | RNShake + CameraRoll |
| Sticky search | `coffee/useStickySearchAnimation.ts` | `screens/OrderScreen.tsx` | None |
| Coffee card focus | local values in `AnimatedCoffeeCard.tsx` | same file | None |
| Category indicator | local values in `CoffeeCategorySelector.tsx` | same file | None |
| Delivery radar | `delivery/useDeliveryStepRadarAnimation.ts` | `components/delivery/DeliveryStepDot.tsx` | None |
| Delivery bike | `delivery/useDeliveryVehicleAnimation.ts` | `components/delivery/DeliveryProgress.tsx` | None |
| Page transition | `navigation/usePageTransitionAnimation.ts` | `App.tsx` | None |

所有 public animation 都可从 `src/animations/index.ts` import。

## Copy recipe: cart flying animation

复制 `useCartFlightAnimation.ts` 与 `FlyingCoffee.tsx`，再将
`CartFlight.coffee` 换成目标项目的 payload type。

```tsx
const {flight, progress, cartScale, launch} = useCartFlightAnimation();

sourceRef.current?.measureInWindow((x, y, width, height) => {
  targetRef.current?.measureInWindow((tx, ty, tw, th) => {
    launch(
      item,
      {x: x + width / 2, y: y + height / 2},
      {x: tx + tw / 2, y: ty + th / 2},
      () => addItemToCart(item), // 落入 cart 后才增加 badge
    );
  });
});
```

`launch` 内有 FIFO queue。快速点击五次会完整播放五次，每次抵达才运行自己的
`onArrival`。

## Copy recipe: slide to order

```tsx
const animation = useSlideToOrderAnimation({maxTravel, onComplete});

<Animated.View {...animation.panHandlers}>
  <Animated.View
    style={{transform: [{translateX: animation.translateX}]}}
  />
</Animated.View>
```

完成条件在 hook 内：滑过 78%，或滑过 58% 同时速度大于 `0.9`。这些数字就是
最适合实验手感的地方。

## Copy recipe: hold to order

复制 `useHoldToOrderAnimation.ts`、`holdToOrderParticles.ts`，再使用
`HoldToOrder.tsx` 或自己的 renderer。

把 `startHolding` 连接 `onPressIn`，`cancelHolding` 连接
`onPressOut`。默认必须持续按住 4500ms。将
`HOLD_PARTICLES_ENABLED` 改成 `true` 可开启 42 个光点；关闭时不会启动
particle loops。

## Copy recipe: delivery radar

```tsx
const radar = useDeliveryStepRadarAnimation(isCurrentStep);

<Animated.View
  style={{
    opacity: radar.radarOpacity,
    transform: [{scale: radar.radarScale}],
  }}
/>
```

外圈使用 `radarScale/radarOpacity`，中心点使用
`dotScale/dotOpacity`。当 `active=false` 时 hook 会停止并清理两个无限循环。

## React Native Animated vs Reanimated

- 大部分 interaction 使用 React Native `Animated`，复制成本低。
- Order success 使用 Reanimated，因为 SVG path drawing 和多个 UI-thread
  sequence 更适合 worklet。
- `transform` 和 `opacity` 尽量使用 `useNativeDriver: true`。
- `width`、`height`、颜色或 JS listener 必须使用
  `useNativeDriver: false`。
- Reanimated 项目必须安装 `react-native-reanimated`，并确保 Babel plugin 是
  `babel.config.js` 的最后一个 plugin。

## Safe animation checklist

1. `Animated.loop` 是否在 cleanup 中 `stop()`。
2. `setTimeout` 是否在 unmount 时 `clearTimeout()`。
3. gesture value 是否 clamp，避免元素跑出边界。
4. completion callback 是否可能重复执行。
5. state update 是否真的应该发生在 animation 完成后。
6. 是否可用 native driver，减少 JS thread 压力。
7. animation hook 是否依赖原项目的 theme、service 或 business type。

## Inspiration references

1. https://60fps.design/shots/opal-hold-to-leave-button-interaction
2. https://60fps.design/shots/pico-cam-pull-down-notch-camera-interaction
3. https://60fps.design/shots/pico-cam-shake-and-swipe-coach-mark-animation

这些实现是为了学习交互原理而重新编写，并不是原网站 source code 的复制。
