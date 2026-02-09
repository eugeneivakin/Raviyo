gsap.registerPlugin(ScrollTrigger);

class ScrollTriggerStack {
  constructor() {
    this.queue = [];
    this.inited = false;
  }

  add(el, fn) {
    if (this.inited) {
      return fn();
    }
    this.queue.push({ el, fn });
  }

  init() {
    if (this.inited) return;
    this.inited = true;

    this.queue.sort((a, b) => {
      if (a.el === b.el) return 0;
      const pos = a.el.compareDocumentPosition(b.el);
      if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;  
      if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
      return 0;
    });

    this.queue.forEach(({ el, fn }, index) => {
      fn();
    });

    this.queue.length = 0;

    // initialize step-based sections (e.g. main-list) after queued blocks
    if (typeof initStepSections === 'function') {
      try { initStepSections(); } catch (e) { console.error(e); }
    }

    if (window.ScrollTrigger) {
      ScrollTrigger.refresh();
    }
  }

  reset() {
    this.queue = [];
    this.inited = false;
  }
}

const scrollTriggerStack = new ScrollTriggerStack();
class ShowScrollBlock extends HTMLElement {
  constructor() {
    super();
    this.handleResize = this.handleResize.bind(this);
    this.prevWidth = window.innerWidth;
  }

  connectedCallback() {
    scrollTriggerStack.add(this,() => {
      this.createScrollTrigger();
    })
    window.addEventListener('resize', this.handleResize);
  }

  disconnectedCallback() {
    window.removeEventListener('resize', this.handleResize);
    this.scrollTrigger?.kill();
  }

  handleResize() {
    const w = window.innerWidth;

    if (w !== this.prevWidth) {
      this.scrollTrigger?.kill();
      this.createScrollTrigger();
      this.prevWidth = w; 
    }
   
  }

  createScrollTrigger() {
    this.scrollTrigger = ScrollTrigger.create({
      trigger: this,
      start: "-50% center",
      onEnter: () => this.classList.add('active'),
      onLeaveBack: () => this.classList.remove('active'),
    });
  }
}

customElements.define('animation-block', ShowScrollBlock);
class AnimationText extends HTMLElement {
    constructor() {
        super();
        this.words = this.querySelectorAll('.animation-letter');
        this.prevWidth = window.innerWidth;
    }
    connectedCallback() {
      scrollTriggerStack.add(this,() => {
        this.init();
      });
    }
    init() {
      this.createScrollTrigger()
      this.animation(); 
    }
    createScrollTrigger() {
        this.scrollTriggerObject = {
            scrollTrigger: {
                trigger: this,
                start: "-140% 70%",
                end: "bottom center",
                scrub: 3
            }
        }
        this.tl = gsap.timeline(this.scrollTriggerObject);
    }

   animation() {
        this.words.forEach((word, index) => {
            this.tl.fromTo(
                word,
                {
                    opacity: .2
                },
                {
                    duration: 1.2,
                    opacity: 1,
                    ease: "power3.out"
                },
                index * 0.25
            );
        });
    }
}

customElements.define('animation-text', AnimationText);

class AnimationHorizontalScroll extends HTMLElement {
  constructor() {
    super();
    this.blocks = [];
    this.container = null;
    this.prevWidth = window.innerWidth;
    this.resizeWindow = this.resizeWindow.bind(this);
    this.resizeTimeout = null;
    this.tween = null;
  }

  connectedCallback() {
    scrollTriggerStack.add(this, () => {
      this.init();
    });
    window.addEventListener('resize', this.resizeWindow);
  }

  disconnectedCallback() {
    window.removeEventListener('resize', this.resizeWindow);
    this.destroyTimeline();
  }

  init() {
    this.blocks = gsap.utils.toArray(this.querySelectorAll('.block'));
    this.container = this.querySelector('.animation-scroll__wrap');

    if (!this.container || this.blocks.length < 2) {
      this.destroyTimeline();
      return;
    }

    this.destroyTimeline();
    this.createScrollTrigger();
  }

  destroyTimeline() {
    if (this.tween) {
      this.tween.scrollTrigger?.kill();
      this.tween.kill();
      this.tween = null;
    }
  }

  resizeWindow() {
    const w = window.innerWidth;

    if (w !== this.prevWidth) {
     clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => {
        if (this.tween && this.tween.scrollTrigger) {
          this.tween.scrollTrigger.refresh(); 
          this.prevWidth = w; 
        }
      }, 150);
    }
    
  }

  createScrollTrigger() {
    this.tween = gsap.to(this.blocks, {
      xPercent: -100 * (this.blocks.length - 1),
      ease: "none",
      scrollTrigger: {
        trigger: this.container,
        start: "top top",
        scrub: 0.5,
        pin: true,
        invalidateOnRefresh: true,
        snap: 1 / (this.blocks.length - 1),
      },
    });
  }
}

customElements.define('animation-scroll', AnimationHorizontalScroll);
class VideoScroll extends HTMLElement {
  constructor() {
    super();
    this.video = this.querySelector('video');
    this.container = this.querySelector('.video-scroll__wrap');
    this.tl = null;
    this.prevWidth = window.innerWidth;
    this.resizeWindow = this.resizeWindow.bind(this);
    window.addEventListener('resize', this.resizeWindow);
  }

  connectedCallback() {
    if (!this.video || !this.container) return;

    this.video.load();

    scrollTriggerStack.add(this, () => {
      this.init();
    });
  }

  disconnectedCallback() {
    window.removeEventListener('resize', this.resizeWindow);
    if (this.tl) {
      this.tl.scrollTrigger?.kill();
      this.tl.kill();
      this.tl = null;
    }
  }

  init() {
    this.createScrollTrigger();

    const onReady = () => {
      try {
        this.video.currentTime = 0.01;
      } catch (e) {}

      this.video.classList.add('is-video-ready');

      if (this.video.paused) {
        this.video.play().then(() => {
          this.video.pause();
        }).catch(() => {});
      }

      this.animation();
    };

    if (this.video.readyState >= 3) { 
      onReady();
    } else {
      this.video.addEventListener('canplay', onReady, { once: true });
    }
  }

  resizeWindow() {
    const w = window.innerWidth;

    if (w !== this.prevWidth) {
      this.tl?.scrollTrigger?.refresh();
      this.prevWidth = w; 
    }
  }

  animation() {
    if (!this.tl) return;

    this.tl.to(this.video, {
      currentTime: Math.max(this.video.duration - 1, 0),
      ease: "none"
    });
  }

  createScrollTrigger() {
    this.tl = gsap.timeline({
      scrollTrigger: {
        trigger: this.container,
        start: "top top",
        end: "+=7000",
        pin: true,
        scrub: true
      }
    });
  }
}

customElements.define('video-scroll', VideoScroll);
document.addEventListener('DOMContentLoaded', () => {
  scrollTriggerStack.init();
});

function initStepSections() {
  if (!window.gsap || !window.ScrollTrigger) return;
  document.querySelectorAll('.main-list__feats').forEach(feats => {
    const blocks = gsap.utils.toArray(feats.querySelectorAll('animation-block'));
    if (blocks.length < 2) return;
    const container = feats.closest('.main-list__wrapper') || feats;

    if (feats._stepInit) return;
    feats._stepInit = true;

    const snapStep = 1 / (blocks.length - 1);

    // map corresponding video wrappers by data attribute (1-based index)
    const sectionRoot = container.closest('.main-list') || container;
    const videoEls = blocks.map((_, i) => sectionRoot.querySelector(`[data-animation-video="${i+1}"]`));

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: "top top",
        end: "+=" + (window.innerHeight * blocks.length),
        pin: true,
        scrub: 0.5,
        invalidateOnRefresh: true,
        onRefresh: self => {
          try {
            const pinEl = self.pin || self.trigger;
            if (pinEl && pinEl.style) {
              pinEl.style.top = "var(--header-height-static, 90px)";
            }
          } catch (e) { /* ignore */ }
        },
        snap: {
          snapTo: (value) => Math.round(value / snapStep) * snapStep,
          duration: 0.25,
          ease: "power1.inOut"
        },
        onUpdate: self => {
          const index = Math.round(self.progress * (blocks.length - 1));
          blocks.forEach((b, i) => b.classList.toggle('active', i === index));
          // toggle video wrappers and start playback for the active one
          videoEls.forEach((ve, i) => {
            if (!ve) return;
            const isActive = i === index;
            const hadActive = ve.classList.contains('active');
            ve.classList.toggle('active', isActive);
            if (isActive && !hadActive) {
              const v = ve.querySelector('video');
              if (v && typeof v.play === 'function') {
                v.play().catch(() => {});
              }
            }
          });
        }
      }
    });

    // dummy tween to provide timeline length
    tl.to({}, { duration: 1 });
  });
}
