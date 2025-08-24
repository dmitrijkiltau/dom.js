export function animate(el: HTMLElement, keyframes: Keyframe[] | PropertyIndexedKeyframes, options?: KeyframeAnimationOptions) {
  return el.animate(keyframes as any, options);
}
