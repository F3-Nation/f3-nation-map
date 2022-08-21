export const isTouchDevice = () => {
  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-expect-error - MSPointerEvent is not recognized by TypeScript
    (typeof navigator.msMaxTouchPoints === "number" &&
      // @ts-expect-error - MSPointerEvent is not recognized by TypeScript
      navigator.msMaxTouchPoints > 0)
  );
};
