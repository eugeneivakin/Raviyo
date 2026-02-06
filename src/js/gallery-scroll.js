class GalleryScroll extends HTMLElement {
  constructor() {
    super();
    this.currentImageIndex = 0;
    this.images = [];
    this.isVisible = false;
    this.observer = null;
    this.scrollMargin = 0.1; // 10% margin (track from 10% to 90%)
  }

  connectedCallback() {
    this.images = Array.from(this.querySelectorAll(".gallery-scroll__item"));

    if (this.images.length === 0) return;

    // Initialize styles for images
    this.images.forEach((img, index) => {
      img.style.position = "absolute";
      img.style.opacity = index === 0 ? "1" : "0";
      img.style.transition = "opacity 0.5s ease-in-out";
    });

    // Find parent and track its visibility
    this.parent = this.parentElement;
    if (!this.parent) return;

    // Use Intersection Observer to track parent visibility
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.isVisible = true;
            this.startScrollTracking();
          } else {
            this.isVisible = false;
            this.stopScrollTracking();
          }
        });
      },
      { threshold: 0.1 },
    );

    this.observer.observe(this.parent);
  }

  startScrollTracking() {
    if (!this.scrollListener) {
      this.scrollListener = this.onWindowScroll.bind(this);
      window.addEventListener("scroll", this.scrollListener, { passive: true });
      this.onWindowScroll(); // Call immediately for initialization
    }
  }

  stopScrollTracking() {
    if (this.scrollListener) {
      window.removeEventListener("scroll", this.scrollListener);
      this.scrollListener = null;
    }
  }

  onWindowScroll() {
    if (!this.isVisible || !this.parent) return;

    const rect = this.parent.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // Calculate progress of parent passing through viewport
    const progress = (windowHeight - rect.top) / (windowHeight + rect.height);

    // Apply margin (track from 10% to 90%)
    const adjustedProgress = (progress - this.scrollMargin) / (1 - 2 * this.scrollMargin);
    const clampedProgress = Math.max(0, Math.min(1, adjustedProgress));

    // Calculate image index based on progress
    const newImageIndex = Math.floor(clampedProgress * this.images.length);
    const clampedIndex = Math.min(newImageIndex, this.images.length - 1);

    if (clampedIndex !== this.currentImageIndex) {
      this.switchImage(clampedIndex);
    }
  }

  switchImage(newIndex) {
    if (newIndex === this.currentImageIndex || newIndex >= this.images.length) return;

    // Hide current image
    this.images[this.currentImageIndex].style.opacity = "0";

    // Show new image
    this.images[newIndex].style.opacity = "1";

    // Set component height equal to current image height
    this.style.height = `${this.images[newIndex].offsetHeight}px`;

    this.currentImageIndex = newIndex;
  }

  disconnectedCallback() {
    this.stopScrollTracking();
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

customElements.define("gallery-scroll", GalleryScroll);
