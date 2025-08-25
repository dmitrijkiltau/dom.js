export function animate(el: HTMLElement, keyframes: Keyframe[] | PropertyIndexedKeyframes, options?: KeyframeAnimationOptions) {
  return el.animate(keyframes as any, options);
}

// Common animation presets
export const animations = {
  fadeIn: (duration: number = 300): [Keyframe[], KeyframeAnimationOptions] => [
    [{ opacity: 0 }, { opacity: 1 }],
    { duration, easing: 'ease-out' }
  ],
  fadeOut: (duration: number = 300): [Keyframe[], KeyframeAnimationOptions] => [
    [{ opacity: 1 }, { opacity: 0 }],
    { duration, easing: 'ease-in' }
  ],
  slideUp: (duration: number = 300): [Keyframe[], KeyframeAnimationOptions] => [
    [{ transform: 'translateY(20px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }],
    { duration, easing: 'ease-out' }
  ],
  slideDown: (duration: number = 300): [Keyframe[], KeyframeAnimationOptions] => [
    [{ transform: 'translateY(-20px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }],
    { duration, easing: 'ease-out' }
  ],
  pulse: (duration: number = 600): [Keyframe[], KeyframeAnimationOptions] => [
    [{ transform: 'scale(1)' }, { transform: 'scale(1.1)' }, { transform: 'scale(1)' }],
    { duration, easing: 'ease-in-out' }
  ],
  shake: (duration: number = 500): [Keyframe[], KeyframeAnimationOptions] => [
    [
      { transform: 'translateX(0)' },
      { transform: 'translateX(-10px)' },
      { transform: 'translateX(10px)' },
      { transform: 'translateX(-10px)' },
      { transform: 'translateX(0)' }
    ],
    { duration, easing: 'ease-in-out' }
  ]
};
