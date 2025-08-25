import dom, { useTemplate } from '../../dist/index.js';

const renderExample = useTemplate('#example-template');
const renderSubsection = useTemplate('#subsection-template');

export function addAnimationExamples() {
  const animationSection = dom('#animation');
  if (animationSection.length === 0) return;

  animationSection.append(renderSubsection({
    id: 'animation-overview',
    title: 'Animation',
    content: `
      <p class="text-gray-700 mb-4">
        Animate elements using the Web Animations API with a simple interface.
      </p>
    `
  }));

  const animationExample = renderExample({
    id: 'basic-animations-example',
    title: 'Basic Animations',
    description: 'Simple animations using keyframes',
    demo: `
      <div class="space-y-6">
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <h5 class="font-medium">Movement Animations</h5>
            <div class="flex space-x-2">
              <button id="slide-demo" class="btn btn-primary text-xs">Slide</button>
              <button id="bounce-demo" class="btn btn-primary text-xs">Bounce</button>
              <button id="rotate-demo" class="btn btn-primary text-xs">Rotate</button>
            </div>
            <div class="demo-area border border-gray-300 rounded p-4 h-24 bg-gray-50 relative overflow-hidden">
              <div id="move-box" class="w-12 h-12 bg-blue-500 rounded absolute top-2 left-2 flex items-center justify-center text-white text-xs font-bold">
                BOX
              </div>
            </div>
          </div>
          
          <div class="space-y-2">
            <h5 class="font-medium">Appearance Animations</h5>
            <div class="flex space-x-2">
              <button id="fade-demo" class="btn btn-primary text-xs">Fade</button>
              <button id="scale-demo" class="btn btn-primary text-xs">Scale</button>
              <button id="pulse-demo" class="btn btn-primary text-xs">Pulse</button>
            </div>
            <div class="demo-area border border-gray-300 rounded p-4 h-24 bg-gray-50 flex items-center justify-center">
              <div id="appear-box" class="w-16 h-16 bg-green-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                DEMO
              </div>
            </div>
          </div>
        </div>
        
        <div class="space-y-2">
          <h5 class="font-medium">Sequential Animations</h5>
          <button id="sequence-demo" class="btn btn-primary">Run Sequence</button>
          <div class="demo-area border border-gray-300 rounded p-4 h-32 bg-gray-50 relative overflow-hidden">
            <div id="sequence-box" class="w-12 h-12 bg-red-500 rounded absolute top-2 left-2 flex items-center justify-center text-white text-xs font-bold">
              SEQ
            </div>
          </div>
        </div>
      </div>
    `,
    code: `// Basic slide animation
dom('#box').animate([
  { transform: 'translateX(0px)' },
  { transform: 'translateX(100px)' }
], {
  duration: 1000,
  easing: 'ease-in-out',
  fill: 'forwards'
});

// Fade animation
dom('#element').animate([
  { opacity: 1 },
  { opacity: 0 },
  { opacity: 1 }
], { 
  duration: 1500,
  iterations: 1 
});

// Scale animation
dom('#element').animate([
  { transform: 'scale(1)' },
  { transform: 'scale(1.2)' },
  { transform: 'scale(1)' }
], {
  duration: 600,
  easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
});

// Rotation with infinite loop
dom('#spinner').animate([
  { transform: 'rotate(0deg)' },
  { transform: 'rotate(360deg)' }
], {
  duration: 2000,
  iterations: Infinity,
  easing: 'linear'
});`
  });

  animationSection.append(animationExample);

  // Reset box positions
  function resetBoxes() {
    dom('#move-box').css({
      transform: 'translate(0, 0) rotate(0deg)',
      left: '8px',
      top: '8px'
    });
    dom('#appear-box').css({
      opacity: '1',
      transform: 'scale(1)'
    });
    dom('#sequence-box').css({
      transform: 'translate(0, 0) rotate(0deg) scale(1)',
      left: '8px',
      top: '8px',
      opacity: '1'
    });
  }

  // Movement animations
  dom('#slide-demo').on('click', () => {
    resetBoxes();
    dom('#move-box').animate([
      { transform: 'translateX(0px)' },
      { transform: 'translateX(150px)' },
      { transform: 'translateX(0px)' }
    ], {
      duration: 2000,
      easing: 'ease-in-out'
    });
  });

  dom('#bounce-demo').on('click', () => {
    resetBoxes();
    dom('#move-box').animate([
      { transform: 'translateY(0px)' },
      { transform: 'translateY(-30px)' },
      { transform: 'translateY(0px)' },
      { transform: 'translateY(-15px)' },
      { transform: 'translateY(0px)' }
    ], {
      duration: 1500,
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    });
  });

  dom('#rotate-demo').on('click', () => {
    resetBoxes();
    dom('#move-box').animate([
      { transform: 'rotate(0deg)' },
      { transform: 'rotate(360deg)' }
    ], {
      duration: 1500,
      easing: 'ease-in-out'
    });
  });

  // Appearance animations
  dom('#fade-demo').on('click', () => {
    resetBoxes();
    dom('#appear-box').animate([
      { opacity: 1 },
      { opacity: 0.2 },
      { opacity: 1 }
    ], {
      duration: 2000,
      easing: 'ease-in-out'
    });
  });

  dom('#scale-demo').on('click', () => {
    resetBoxes();
    dom('#appear-box').animate([
      { transform: 'scale(1)' },
      { transform: 'scale(1.5)' },
      { transform: 'scale(1)' }
    ], {
      duration: 1500,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    });
  });

  dom('#pulse-demo').on('click', () => {
    resetBoxes();
    dom('#appear-box').animate([
      { transform: 'scale(1)', opacity: 1 },
      { transform: 'scale(1.1)', opacity: 0.8 },
      { transform: 'scale(1)', opacity: 1 }
    ], {
      duration: 800,
      iterations: 3,
      easing: 'ease-in-out'
    });
  });

  // Sequential animation
  dom('#sequence-demo').on('click', async () => {
    resetBoxes();
    const box = dom('#sequence-box');

    // Step 1: Slide right
    await box.animate([
      { transform: 'translateX(0px)' },
      { transform: 'translateX(100px)' }
    ], { duration: 800, fill: 'forwards' }).finished;

    // Step 2: Slide down
    await box.animate([
      { transform: 'translateX(100px) translateY(0px)' },
      { transform: 'translateX(100px) translateY(60px)' }
    ], { duration: 800, fill: 'forwards' }).finished;

    // Step 3: Scale and rotate
    await box.animate([
      { transform: 'translateX(100px) translateY(60px) scale(1) rotate(0deg)' },
      { transform: 'translateX(100px) translateY(60px) scale(1.5) rotate(180deg)' }
    ], { duration: 1000, fill: 'forwards' }).finished;

    // Step 4: Return home with fade
    await box.animate([
      { transform: 'translateX(100px) translateY(60px) scale(1.5) rotate(180deg)', opacity: 1 },
      { transform: 'translateX(0px) translateY(0px) scale(1) rotate(0deg)', opacity: 1 }
    ], { duration: 1200, fill: 'forwards' }).finished;
  });

  // Animation Presets Example
  const animationPresetsExample = renderExample({
    id: 'animation-presets-example',
    title: 'Animation Presets',
    description: 'Built-in animation presets: fadeIn, fadeOut, slideUp, slideDown, pulse, shake',
    demo: `
      <div class="space-y-4">
        <div class="grid grid-cols-3 gap-2">
          <button id="fade-in-preset" class="btn btn-primary text-sm">Fade In</button>
          <button id="fade-out-preset" class="btn btn-primary text-sm">Fade Out</button>
          <button id="slide-up-preset" class="btn btn-secondary text-sm">Slide Up</button>
          <button id="slide-down-preset" class="btn btn-secondary text-sm">Slide Down</button>
          <button id="pulse-preset" class="btn btn-accent text-sm">Pulse</button>
          <button id="shake-preset" class="btn btn-accent text-sm">Shake</button>
        </div>
        
        <div class="demo-area border border-gray-300 rounded p-6 bg-gray-50 flex items-center justify-center min-h-[120px]">
          <div id="preset-demo-box" class="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-lg">
            DEMO
          </div>
        </div>
        
        <div class="flex space-x-2">
          <button id="reset-preset-demo" class="btn btn-outline text-sm">Reset</button>
          <input id="duration-input" type="number" class="input text-sm w-20" value="400" min="100" max="2000" step="100">
          <label class="flex items-center text-sm text-gray-600">ms duration</label>
        </div>
        
        <div id="preset-output" class="text-sm text-gray-600 bg-gray-100 p-3 rounded"></div>
      </div>
    `,
    code: `import { animations } from '@dmitrijkiltau/dom.js';

// Use built-in animation presets
dom('.element').fadeIn(300);
dom('.modal').fadeOut(500);
dom('.notification').slideUp(400);
dom('.dropdown').slideDown(300);
dom('.button').pulse(600);
dom('.error').shake(500);

// Get preset keyframes and options for custom use
const [keyframes, options] = animations.fadeIn(400);
dom('.element').animate(keyframes, options);

// Chain animations
dom('.item')
  .fadeIn(300)
  .then(() => dom('.item').pulse(200))
  .then(() => dom('.item').shake(300));

// All presets return proper Web Animations API configurations
const fadePreset = animations.fadeOut(600);
console.log(fadePreset); // [[{opacity: 1}, {opacity: 0}], {duration: 600, easing: 'ease-in'}]`
  });

  animationSection.append(animationPresetsExample);

  function resetPresetDemo() {
    dom('#preset-demo-box').css({
      opacity: '1',
      transform: 'translateY(0) scale(1)',
      display: 'flex'
    });
  }

  dom('#fade-in-preset').on('click', () => {
    const duration = parseInt(dom('#duration-input').val()) || 400;
    resetPresetDemo();
    dom('#preset-demo-box').css('opacity', '0');
    dom('#preset-demo-box').fadeIn(duration);
    dom('#preset-output').html(`<strong>Fade In animation!</strong> Duration: ${duration}ms. The element fades from transparent to opaque.`);
  });

  dom('#fade-out-preset').on('click', () => {
    const duration = parseInt(dom('#duration-input').val()) || 400;
    resetPresetDemo();
    dom('#preset-demo-box').fadeOut(duration);
    dom('#preset-output').html(`<strong>Fade Out animation!</strong> Duration: ${duration}ms. The element fades from opaque to transparent.`);
  });

  dom('#slide-up-preset').on('click', () => {
    const duration = parseInt(dom('#duration-input').val()) || 400;
    resetPresetDemo();
    dom('#preset-demo-box').css({ transform: 'translateY(20px)', opacity: '0' });
    dom('#preset-demo-box').slideUp(duration);
    dom('#preset-output').html(`<strong>Slide Up animation!</strong> Duration: ${duration}ms. The element slides up while fading in.`);
  });

  dom('#slide-down-preset').on('click', () => {
    const duration = parseInt(dom('#duration-input').val()) || 400;
    resetPresetDemo();
    dom('#preset-demo-box').css({ transform: 'translateY(-20px)', opacity: '0' });
    dom('#preset-demo-box').slideDown(duration);
    dom('#preset-output').html(`<strong>Slide Down animation!</strong> Duration: ${duration}ms. The element slides down while fading in.`);
  });

  dom('#pulse-preset').on('click', () => {
    const duration = parseInt(dom('#duration-input').val()) || 600;
    resetPresetDemo();
    dom('#preset-demo-box').pulse(duration);
    dom('#preset-output').html(`<strong>Pulse animation!</strong> Duration: ${duration}ms. The element scales up and down smoothly.`);
  });

  dom('#shake-preset').on('click', () => {
    const duration = parseInt(dom('#duration-input').val()) || 500;
    resetPresetDemo();
    dom('#preset-demo-box').shake(duration);
    dom('#preset-output').html(`<strong>Shake animation!</strong> Duration: ${duration}ms. The element shakes horizontally to get attention.`);
  });

  dom('#reset-preset-demo').on('click', () => {
    resetPresetDemo();
    dom('#preset-output').html('Demo reset! Try the different animation presets above with custom duration.');
  });

  // Advanced animation example
  const advancedExample = renderExample({
    id: 'advanced-animations-example',
    title: 'Advanced Animation Techniques',
    description: 'Complex animations with timing and control',
    demo: `
      <div class="space-y-6">
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <h5 class="font-medium">Timing Functions</h5>
            <div class="grid grid-cols-2 gap-1">
              <button id="ease-demo" class="btn btn-secondary text-xs">Ease</button>
              <button id="linear-demo" class="btn btn-secondary text-xs">Linear</button>
              <button id="bounce-ease-demo" class="btn btn-secondary text-xs">Bounce</button>
              <button id="elastic-demo" class="btn btn-secondary text-xs">Elastic</button>
            </div>
            <div class="demo-area border border-gray-300 rounded p-2 h-20 bg-gray-50 relative overflow-hidden">
              <div id="timing-box" class="w-8 h-8 bg-purple-500 rounded absolute top-2 left-2"></div>
            </div>
          </div>
          
          <div class="space-y-2">
            <h5 class="font-medium">Interactive Animations</h5>
            <div class="space-y-1">
              <button id="hover-demo" class="btn btn-secondary text-xs w-full">Hover Me</button>
              <button id="click-demo" class="btn btn-secondary text-xs w-full">Click Me</button>
            </div>
            <div class="demo-area border border-gray-300 rounded p-4 h-20 bg-gray-50 relative">
              <div id="interactive-box" class="w-12 h-12 bg-indigo-500 rounded-lg mx-auto cursor-pointer hover:shadow-lg transition-shadow"></div>
            </div>
          </div>
        </div>
        
        <div class="space-y-2">
          <h5 class="font-medium">Loading Animation</h5>
          <button id="loading-demo" class="btn btn-primary">Show Loading Animation</button>
          <div class="demo-area border border-gray-300 rounded p-4 h-24 bg-gray-50 flex items-center justify-center">
            <div id="loading-container" class="hidden">
              <div class="flex space-x-1">
                <div class="loading-dot w-3 h-3 bg-blue-500 rounded-full"></div>
                <div class="loading-dot w-3 h-3 bg-blue-500 rounded-full"></div>
                <div class="loading-dot w-3 h-3 bg-blue-500 rounded-full"></div>
              </div>
            </div>
            <div id="loading-placeholder" class="text-gray-500">Click button to show loading animation</div>
          </div>
        </div>
      </div>
    `,
    code: `// Custom easing functions
const easeInOut = 'cubic-bezier(0.42, 0, 0.58, 1)';
const bounceEase = 'cubic-bezier(0.68, -0.55, 0.265, 1.55)';
const elasticEase = 'cubic-bezier(0.175, 0.885, 0.32, 1.275)';

dom('#element').animate([
  { transform: 'translateX(0px)' },
  { transform: 'translateX(200px)' }
], {
  duration: 1500,
  easing: bounceEase,
  fill: 'forwards'
});

// Staggered animations
const items = dom('.list-item');
items.each((el, idx) => {
  dom(el).animate([
    { opacity: 0, transform: 'translateY(20px)' },
    { opacity: 1, transform: 'translateY(0px)' }
  ], {
    duration: 600,
    delay: idx * 100, // Stagger by 100ms
    fill: 'forwards'
  });
});

// Animation control
const animation = dom('#element').animate(keyframes, options);

// Control playback
animation.pause();
animation.play();
animation.reverse();
animation.cancel();

// Listen to events
animation.addEventListener('finish', () => {
  console.log('Animation completed');
});`
  });

  animationSection.append(advancedExample);

  // Timing function demos
  dom('#ease-demo').on('click', (ev, el) => {
    const timingBox = dom('#timing-box');
    const areaWidth = dom('.demo-area').el().clientWidth - timingBox.el().clientWidth - 16; // Calculate the available width for the timing box
    timingBox.css('left', '8px');
    timingBox.animate([
      { transform: 'translateX(0px)' },
      { transform: `translateX(${areaWidth}px)` }
    ], { duration: 1500, easing: 'ease-in-out', fill: 'forwards' });
  });

  dom('#linear-demo').on('click', () => {
    const timingBox = dom('#timing-box');
    const areaWidth = dom('.demo-area').el().clientWidth - timingBox.el().clientWidth - 16; // Calculate the available width for the timing box
    timingBox.css('left', '8px');
    timingBox.animate([
      { transform: 'translateX(0px)' },
      { transform: `translateX(${areaWidth}px)` }
    ], { duration: 1500, easing: 'linear', fill: 'forwards' });
  });

  dom('#bounce-ease-demo').on('click', () => {
    const timingBox = dom('#timing-box');
    const areaWidth = dom('.demo-area').el().clientWidth - timingBox.el().clientWidth - 16; // Calculate the available width for the timing box
    timingBox.css('left', '8px');
    timingBox.animate([
      { transform: 'translateX(0px)' },
      { transform: `translateX(${areaWidth}px)` }
    ], { duration: 1500, easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', fill: 'forwards' });
  });

  dom('#elastic-demo').on('click', () => {
    const timingBox = dom('#timing-box');
    const areaWidth = dom('.demo-area').el().clientWidth - timingBox.el().clientWidth - 16; // Calculate the available width for the timing box
    timingBox.css('left', '8px');
    timingBox.animate([
      { transform: 'translateX(0px)' },
      { transform: `translateX(${areaWidth}px)` }
    ], { duration: 2000, easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', fill: 'forwards' });
  });

  // Interactive animations
  dom('#hover-demo').on('mouseenter', () => {
    dom('#interactive-box').animate([
      { transform: 'scale(1) rotateZ(0deg)' },
      { transform: 'scale(1.2) rotateZ(5deg)' }
    ], { duration: 200, fill: 'forwards' });
  });

  dom('#hover-demo').on('mouseleave', () => {
    dom('#interactive-box').animate([
      { transform: 'scale(1.2) rotateZ(5deg)' },
      { transform: 'scale(1) rotateZ(0deg)' }
    ], { duration: 200, fill: 'forwards' });
  });

  dom('#click-demo').on('click', () => {
    dom('#interactive-box').animate([
      { transform: 'scale(1)', backgroundColor: '#6366f1' },
      { transform: 'scale(0.9)', backgroundColor: '#ef4444' },
      { transform: 'scale(1)', backgroundColor: '#6366f1' }
    ], { duration: 300 });
  });

  // Loading animation
  let loadingAnimation;
  dom('#loading-demo').on('click', () => {
    const container = dom('#loading-container');
    const placeholder = dom('#loading-placeholder');

    if (container.hasClass('hidden')) {
      // Start loading animation
      container.removeClass('hidden');
      placeholder.addClass('hidden');

      const dots = dom('.loading-dot');
      dots.each((el, idx) => {
        dom(el).animate([
          { transform: 'translateY(0px)', opacity: 0.4 },
          { transform: 'translateY(-10px)', opacity: 1 },
          { transform: 'translateY(0px)', opacity: 0.4 }
        ], {
          duration: 800,
          delay: idx * 200,
          iterations: Infinity,
          easing: 'ease-in-out'
        });
      });

      dom('#loading-demo').text('Stop Loading');
    } else {
      // Stop loading animation
      container.addClass('hidden');
      placeholder.removeClass('hidden');

      // Cancel all animations
      const dots = dom('.loading-dot');
      dots.each((el) => {
        const animations = el.getAnimations();
        animations.forEach(anim => anim.cancel());
      });

      dom('#loading-demo').text('Show Loading Animation');
    }
  });
}
