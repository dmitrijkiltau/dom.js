import vk, { useTemplate } from '../../dist/index.js';

const renderExample = useTemplate('#example-template');
const renderSubsection = useTemplate('#subsection-template');

export function addAnimationExamples() {
  const animationSection = vk('#animation');
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
vk('#box').animate([
  { transform: 'translateX(0px)' },
  { transform: 'translateX(100px)' }
], {
  duration: 1000,
  easing: 'ease-in-out',
  fill: 'forwards'
});

// Fade animation
vk('#element').animate([
  { opacity: 1 },
  { opacity: 0 },
  { opacity: 1 }
], { 
  duration: 1500,
  iterations: 1 
});

// Scale animation
vk('#element').animate([
  { transform: 'scale(1)' },
  { transform: 'scale(1.2)' },
  { transform: 'scale(1)' }
], {
  duration: 600,
  easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
});

// Rotation with infinite loop
vk('#spinner').animate([
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
    vk('#move-box').css({
      transform: 'translate(0, 0) rotate(0deg)',
      left: '8px',
      top: '8px'
    });
    vk('#appear-box').css({
      opacity: '1',
      transform: 'scale(1)'
    });
    vk('#sequence-box').css({
      transform: 'translate(0, 0) rotate(0deg) scale(1)',
      left: '8px',
      top: '8px',
      opacity: '1'
    });
  }

  // Movement animations
  vk('#slide-demo').on('click', () => {
    resetBoxes();
    vk('#move-box').animate([
      { transform: 'translateX(0px)' },
      { transform: 'translateX(150px)' },
      { transform: 'translateX(0px)' }
    ], {
      duration: 2000,
      easing: 'ease-in-out'
    });
  });

  vk('#bounce-demo').on('click', () => {
    resetBoxes();
    vk('#move-box').animate([
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

  vk('#rotate-demo').on('click', () => {
    resetBoxes();
    vk('#move-box').animate([
      { transform: 'rotate(0deg)' },
      { transform: 'rotate(360deg)' }
    ], {
      duration: 1500,
      easing: 'ease-in-out'
    });
  });

  // Appearance animations
  vk('#fade-demo').on('click', () => {
    resetBoxes();
    vk('#appear-box').animate([
      { opacity: 1 },
      { opacity: 0.2 },
      { opacity: 1 }
    ], {
      duration: 2000,
      easing: 'ease-in-out'
    });
  });

  vk('#scale-demo').on('click', () => {
    resetBoxes();
    vk('#appear-box').animate([
      { transform: 'scale(1)' },
      { transform: 'scale(1.5)' },
      { transform: 'scale(1)' }
    ], {
      duration: 1500,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    });
  });

  vk('#pulse-demo').on('click', () => {
    resetBoxes();
    vk('#appear-box').animate([
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
  vk('#sequence-demo').on('click', async () => {
    resetBoxes();
    const box = vk('#sequence-box');

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

vk('#element').animate([
  { transform: 'translateX(0px)' },
  { transform: 'translateX(200px)' }
], {
  duration: 1500,
  easing: bounceEase,
  fill: 'forwards'
});

// Staggered animations
const items = vk('.list-item');
items.each((el, idx) => {
  vk(el).animate([
    { opacity: 0, transform: 'translateY(20px)' },
    { opacity: 1, transform: 'translateY(0px)' }
  ], {
    duration: 600,
    delay: idx * 100, // Stagger by 100ms
    fill: 'forwards'
  });
});

// Animation control
const animation = vk('#element').animate(keyframes, options);

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
  vk('#ease-demo').on('click', (ev, el) => {
    const timingBox = vk('#timing-box');
    const areaWidth = vk('.demo-area').el().clientWidth - timingBox.el().clientWidth - 16; // Calculate the available width for the timing box
    timingBox.css('left', '8px');
    timingBox.animate([
      { transform: 'translateX(0px)' },
      { transform: `translateX(${areaWidth}px)` }
    ], { duration: 1500, easing: 'ease-in-out', fill: 'forwards' });
  });

  vk('#linear-demo').on('click', () => {
    const timingBox = vk('#timing-box');
    const areaWidth = vk('.demo-area').el().clientWidth - timingBox.el().clientWidth - 16; // Calculate the available width for the timing box
    timingBox.css('left', '8px');
    timingBox.animate([
      { transform: 'translateX(0px)' },
      { transform: `translateX(${areaWidth}px)` }
    ], { duration: 1500, easing: 'linear', fill: 'forwards' });
  });

  vk('#bounce-ease-demo').on('click', () => {
    const timingBox = vk('#timing-box');
    const areaWidth = vk('.demo-area').el().clientWidth - timingBox.el().clientWidth - 16; // Calculate the available width for the timing box
    timingBox.css('left', '8px');
    timingBox.animate([
      { transform: 'translateX(0px)' },
      { transform: `translateX(${areaWidth}px)` }
    ], { duration: 1500, easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', fill: 'forwards' });
  });

  vk('#elastic-demo').on('click', () => {
    const timingBox = vk('#timing-box');
    const areaWidth = vk('.demo-area').el().clientWidth - timingBox.el().clientWidth - 16; // Calculate the available width for the timing box
    timingBox.css('left', '8px');
    timingBox.animate([
      { transform: 'translateX(0px)' },
      { transform: `translateX(${areaWidth}px)` }
    ], { duration: 2000, easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', fill: 'forwards' });
  });

  // Interactive animations
  vk('#hover-demo').on('mouseenter', () => {
    vk('#interactive-box').animate([
      { transform: 'scale(1) rotateZ(0deg)' },
      { transform: 'scale(1.2) rotateZ(5deg)' }
    ], { duration: 200, fill: 'forwards' });
  });

  vk('#hover-demo').on('mouseleave', () => {
    vk('#interactive-box').animate([
      { transform: 'scale(1.2) rotateZ(5deg)' },
      { transform: 'scale(1) rotateZ(0deg)' }
    ], { duration: 200, fill: 'forwards' });
  });

  vk('#click-demo').on('click', () => {
    vk('#interactive-box').animate([
      { transform: 'scale(1)', backgroundColor: '#6366f1' },
      { transform: 'scale(0.9)', backgroundColor: '#ef4444' },
      { transform: 'scale(1)', backgroundColor: '#6366f1' }
    ], { duration: 300 });
  });

  // Loading animation
  let loadingAnimation;
  vk('#loading-demo').on('click', () => {
    const container = vk('#loading-container');
    const placeholder = vk('#loading-placeholder');

    if (container.hasClass('hidden')) {
      // Start loading animation
      container.removeClass('hidden');
      placeholder.addClass('hidden');

      const dots = vk('.loading-dot');
      dots.each((el, idx) => {
        vk(el).animate([
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

      vk('#loading-demo').text('Stop Loading');
    } else {
      // Stop loading animation
      container.addClass('hidden');
      placeholder.removeClass('hidden');

      // Cancel all animations
      const dots = vk('.loading-dot');
      dots.each((el) => {
        const animations = el.getAnimations();
        animations.forEach(anim => anim.cancel());
      });

      vk('#loading-demo').text('Show Loading Animation');
    }
  });
}
