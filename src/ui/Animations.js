/**
 * Animations — Smooth UI and canvas animations
 * Phase 4C: Visual polish and motion
 */

/**
 * Request animation frame polyfill and utilities
 */
export class AnimationSystem {
  constructor() {
    this.animations = [];
    this.isRunning = false;
  }

  /**
   * Add animation to the system
   */
  add(animation) {
    this.animations.push(animation);
    if (!this.isRunning) {
      this.start();
    }
  }

  /**
   * Start the animation loop
   */
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.tick();
  }

  /**
   * Animation loop tick
   */
  tick() {
    const now = Date.now();

    // Update all animations
    this.animations = this.animations.filter(anim => {
      anim.update(now);
      return anim.isRunning();
    });

    if (this.animations.length > 0) {
      requestAnimationFrame(() => this.tick());
    } else {
      this.isRunning = false;
    }
  }

  /**
   * Clear all animations
   */
  clear() {
    this.animations = [];
    this.isRunning = false;
  }
}

/**
 * Base animation class
 */
export class Animation {
  constructor(duration = 300, onUpdate = null, onComplete = null) {
    this.duration = duration;
    this.startTime = null;
    this.onUpdate = onUpdate;
    this.onComplete = onComplete;
  }

  /**
   * Update animation
   */
  update(now) {
    if (!this.startTime) {
      this.startTime = now;
    }

    const elapsed = now - this.startTime;
    const progress = Math.min(1, elapsed / this.duration);

    if (this.onUpdate) {
      this.onUpdate(progress);
    }

    if (progress >= 1 && this.onComplete) {
      this.onComplete();
    }
  }

  /**
   * Check if animation is still running
   */
  isRunning() {
    return this.startTime === null || (Date.now() - this.startTime) < this.duration;
  }
}

/**
 * Easing functions
 */
export const Easing = {
  linear: (t) => t,
  easeInQuad: (t) => t * t,
  easeOutQuad: (t) => t * (2 - t),
  easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeInCubic: (t) => t * t * t,
  easeOutCubic: (t) => (--t) * t * t + 1,
  easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * (t - 2)) * (2 * (t - 2)) + 1,
  easeOutElastic: (t) => {
    const c5 = (2 * Math.PI) / 4.5;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c5) + 1;
  },
};

/**
 * DOM Element Animations
 */
export function fadeIn(element, duration = 300, easing = Easing.easeOutQuad) {
  const anim = new Animation(
    duration,
    (progress) => {
      const easedProgress = easing(progress);
      element.style.opacity = easedProgress.toString();
    },
    () => {
      element.style.opacity = '1';
    }
  );
  element.style.opacity = '0';
  return anim;
}

export function fadeOut(element, duration = 300, easing = Easing.easeOutQuad) {
  const anim = new Animation(
    duration,
    (progress) => {
      const easedProgress = easing(progress);
      element.style.opacity = (1 - easedProgress).toString();
    },
    () => {
      element.style.opacity = '0';
    }
  );
  return anim;
}

export function slideIn(element, direction = 'left', duration = 300, easing = Easing.easeOutQuad) {
  const directions = {
    left: { from: '-100%', to: '0%' },
    right: { from: '100%', to: '0%' },
    top: { from: '-100%', to: '0%' },
    bottom: { from: '100%', to: '0%' },
  };

  const dir = directions[direction] || directions.left;
  const isVertical = direction === 'top' || direction === 'bottom';
  const prop = isVertical ? 'top' : 'left';

  const anim = new Animation(
    duration,
    (progress) => {
      const easedProgress = easing(progress);
      const from = parseFloat(dir.from);
      const to = parseFloat(dir.to);
      const value = from + (to - from) * easedProgress;
      element.style[prop] = `${value}%`;
    },
    () => {
      element.style[prop] = dir.to;
    }
  );

  element.style.position = 'relative';
  element.style[prop] = dir.from;
  return anim;
}

export function scale(element, fromScale = 0.8, toScale = 1, duration = 300, easing = Easing.easeOutQuad) {
  const anim = new Animation(
    duration,
    (progress) => {
      const easedProgress = easing(progress);
      const scale = fromScale + (toScale - fromScale) * easedProgress;
      element.style.transform = `scale(${scale})`;
    },
    () => {
      element.style.transform = `scale(${toScale})`;
    }
  );

  element.style.transform = `scale(${fromScale})`;
  return anim;
}

export function bounce(element, distance = 20, duration = 600) {
  const anim = new Animation(
    duration,
    (progress) => {
      const easedProgress = Easing.easeOutElastic(progress);
      element.style.transform = `translateY(${-distance * easedProgress}px)`;
    },
    () => {
      element.style.transform = 'translateY(0)';
    }
  );

  return anim;
}

export function shake(element, intensity = 5, duration = 300) {
  const anim = new Animation(
    duration,
    (progress) => {
      const shakeAmount = Math.sin(progress * Math.PI * 4) * intensity * (1 - progress);
      element.style.transform = `translateX(${shakeAmount}px)`;
    },
    () => {
      element.style.transform = 'translateX(0)';
    }
  );

  return anim;
}

/**
 * Color transition animation
 */
export function colorChange(element, fromColor, toColor, duration = 300) {
  const anim = new Animation(
    duration,
    (progress) => {
      // Simple hex color interpolation
      const from = parseInt(fromColor.slice(1), 16);
      const to = parseInt(toColor.slice(1), 16);

      const r = Math.round(((from >> 16) & 255) + (((to >> 16) & 255) - ((from >> 16) & 255)) * progress);
      const g = Math.round(((from >> 8) & 255) + (((to >> 8) & 255) - ((from >> 8) & 255)) * progress);
      const b = Math.round((from & 255) + ((to & 255) - (from & 255)) * progress);

      element.style.backgroundColor = `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
    },
    () => {
      element.style.backgroundColor = toColor;
    }
  );

  element.style.backgroundColor = fromColor;
  return anim;
}

/**
 * Pulse animation (for notifications)
 */
export function pulse(element, duration = 1000) {
  const anim = new Animation(
    duration,
    (progress) => {
      const scale = 1 + Math.sin(progress * Math.PI * 2) * 0.1;
      const opacity = 1 - progress * 0.5;
      element.style.transform = `scale(${scale})`;
      element.style.opacity = opacity.toString();
    },
    () => {
      element.style.transform = 'scale(1)';
      element.style.opacity = '0';
    }
  );

  return anim;
}
