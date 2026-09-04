# Noir Coffee Mobile Animation

这是一个以黑金色视觉为主的 React Native 咖啡订购练习 App。项目重点不是后端或
真实付款，而是把常见的 mobile interaction 拆成容易阅读、调整和复制的动画模块。

## App 包含什么

底部导航目前有四个主要页面：

- **Order**：浏览、搜索和筛选咖啡，并将商品加入购物车。
- **Cart**：修改数量、左滑删除商品，以及 Slide/Hold 两种下单方式。
- **Delivery**：显示 Brewing、Arriving、Delivered 三个配送阶段。
- **Profile**：设置咖啡偏好、下单方式，并进入 pull-down camera 页面。

相机页面包含完整的拍立得流程：下拉打开相机、拍照 loading、照片打印、持续摇动
显影，以及下拉保存到系统相册。

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

每个动画的代码入口、component、依赖与复制说明都在
[Animation learning and reuse guide](src/animations/README.md)。

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
├── hooks/        Cart、camera 和 photo flow 等业务状态
├── services/     相册等 native side effect
├── data/         Coffee 等静态资料
├── theme/        颜色和共用 design token
└── types/        Shared TypeScript types
```

动画应该优先从 `src/animations/index.ts` import。只有在修改特定动画内部实现时，才直接
引用子目录文件。

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
