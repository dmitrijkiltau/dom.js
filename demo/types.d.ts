import { VKCollection } from '../src/index';

declare module '../src/index' {
  interface VKCollection {
    animate(keyframes: Keyframe[] | PropertyIndexedKeyframes, options?: KeyframeAnimationOptions): VKCollection;
  }
}
