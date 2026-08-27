# Reusable animations

Import reusable interactions through `src/animations/index.ts`. Each category
keeps animation timing and gesture state separate from screen business logic.

## Camera

- `usePullDownCameraAnimation`: notch-to-fullscreen panel gesture. It does not
  depend on VisionCamera, so another project can render any content inside it.
- `useCoffeePhotoFlow`: print, shake-to-develop, discard, and pull-to-save flow.

## Cart

- `useCartFlightAnimation`: flies a measured item into a measured target.
- `SlideToOrder`: slide-to-confirm control.
- `HoldToOrder`: hold-to-confirm control with optional particles.
- `SwipeableCartItem`: reusable swipe-left action container.

## Coffee list

- `useStickySearchAnimation`: swaps a full search field for a sticky version.
- `AnimatedCoffeeCard`: scroll focus/parallax card wrapper.
- `CoffeeCategorySelector`: animated selection indicator and press feedback.
- `FlyingCoffee`: visual layer used by the cart-flight hook.

## Delivery and navigation

- `useDeliveryVehicleAnimation`: bouncing/travelling delivery vehicle values.
- `usePageTransitionAnimation`: fade-and-rise transition for page changes.

Most hooks return `Animated.Value` or interpolations instead of fixed UI. This
lets another project keep the behavior while replacing colors and components.
