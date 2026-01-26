if (!window.customSliderConfigs) {
  window.customSliderConfigs = {
    1: {
      slidesPerView: 2,
      spaceBetween: 20,
      breakpoints: {
        1: {
          slidesPerView: 1,
          slidesOffsetBefore: 16,
          slidesOffsetAfter: 16
        },
        320: {
          slidesPerView: 1.1,
          slidesOffsetBefore: 16,
          slidesOffsetAfter: 16
        },
        640: {
          slidesPerView: 2,
          slidesOffsetBefore: 0,
          slidesOffsetAfter: 0
        },
      }
    },
    2: {
      slidesPerView: 4,
      spaceBetween: 40,
      breakpoints: {
        1: {
          slidesPerView: 1,
          slidesOffsetBefore: 16,
          slidesOffsetAfter: 16,
          spaceBetween: 16
        },
        320: {
          slidesPerView: 1.23,
          slidesOffsetBefore: 16,
          slidesOffsetAfter: 16,
          spaceBetween: 16
        },
        500: {
          slidesPerView: 2,
          slidesOffsetBefore: 0,
          slidesOffsetAfter: 0
        },
        768: {
          slidesPerView: 3,
          slidesOffsetBefore: 0,
          slidesOffsetAfter: 0
        },
        1024: {
          slidesPerView: 4,
          spaceBetween: 20
        },
        1440: {
          spaceBetween: 40
        },
      }
    },
    3: {
      slidesPerView: 1.279,
      spaceBetween: 20,
      breakpoints: {
        1: {
          slidesPerView: 1,
          slidesOffsetBefore: 20,
          slidesOffsetAfter: 20,
        },
        320: {
          slidesPerView: 1.15,
          slidesOffsetBefore: 20,
          slidesOffsetAfter: 20,
        },
        500: {
          slidesPerView: 1.279,
          slidesOffsetBefore: 0,
          slidesOffsetAfter: 20,
        }
      }
    }
  };
}
if (!customElements.get('custom-slider')) {
    class CustomSlider extends HTMLElement {
        connectedCallback() {
            this.index = Number(this.dataset.index) || 1;
            this.pagination =this.dataset.pagination !== undefined,
            this.config = window.customSliderConfigs[this.index];
            if(this.pagination) {
                this.config = {
                    ...this.config,
                    navigation: {
                        nextEl: this.closest('.shopify-section').querySelector('.swiper-button-next'),
                        prevEl: this.closest('.shopify-section').querySelector('.swiper-button-prev'),
                    }
                }
            }
            this.swiper = new Swiper(this, this.config);
        }
    }

    customElements.define('custom-slider', CustomSlider);
}
