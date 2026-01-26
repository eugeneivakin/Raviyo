(function () {
	'use strict';

	const selectors = {
		slider: ".js-testimonials-slider"
	};

	var Testimonials = () => {
		let sections = [];

		function setEqualCardHeights(slider) {
			// Get all cards in the slider
			const allCards = slider.querySelectorAll('.testimonials-section__card');
			if (allCards.length === 0) return;

			// Reset heights to auto to get natural height
			allCards.forEach(card => {
				card.style.height = 'auto';
			});

			// Force reflow to get accurate heights
			void slider.offsetHeight;

			// Find the maximum height among all cards
			let maxHeight = 0;
			allCards.forEach(card => {
				const height = card.offsetHeight;
				if (height > maxHeight) {
					maxHeight = height;
				}
			});

			// Set all cards to the maximum height
			if (maxHeight > 0) {
				allCards.forEach(card => {
					card.style.height = maxHeight + 'px';
				});
			}
		}

		function init(sectionId) {
			const Swiper = window.themeCore.utils.Swiper;
			
			if (!Swiper) {
				console.warn('Swiper is not available');
				return;
			}

			sections = [...document.querySelectorAll(selectors.slider)].filter((slider) => {
				if (sectionId) {
					const section = slider.closest(`#shopify-section-${sectionId}`);
					return section !== null;
				}
				return true;
			});

			sections.forEach((slider) => {
				if (!slider) {
					return;
				}

				// Destroy existing slider if it exists
				if (slider.swiper) {
					slider.swiper.destroy(true, true);
				}

				const section = slider.closest('[id^="shopify-section-"]');
				const nextButton = section ? section.querySelector('.swiper-button-next') : null;
				const prevButton = section ? section.querySelector('.swiper-button-prev') : null;

				const navigationButtons = (nextButton && prevButton) ? {
					nextEl: nextButton,
					prevEl: prevButton
				} : false;

				const swiperInstance = new Swiper(slider, {
					slidesPerView: 1,
					slidesPerGroup: 1,
					spaceBetween: 20,
					speed: 600,
					loop: true,
					loopAdditionalSlides: 2,
					autoplay: {
						delay: 5000,
						disableOnInteraction: false,
						pauseOnMouseEnter: true
					},
					navigation: navigationButtons,
					breakpoints: {
						375: {
							slidesPerView: 1,
							slidesPerGroup: 1,
							spaceBetween: 20
						},
						768: {
							slidesPerView: 1,
							slidesPerGroup: 1,
							spaceBetween: 20
						},
						980: {
							slidesPerView: 1,
							slidesPerGroup: 1,
							spaceBetween: 20
						},
						1280: {
							slidesPerView: 1,
							slidesPerGroup: 1,
							spaceBetween: 20
						},
						1281: {
							slidesPerView: 'auto',
							slidesPerGroup: 1,
							spaceBetween: 20
						},
						1440: {
							slidesPerView: 'auto',
							slidesPerGroup: 1,
							spaceBetween: 20
						},
						1920: {
							slidesPerView: 'auto',
							slidesPerGroup: 1,
							spaceBetween: 20
						}
					},
					on: {
						init: function() {
							setEqualCardHeights(slider);
						},
						resize: function() {
							setEqualCardHeights(slider);
						},
						slideChange: function() {
							setEqualCardHeights(slider);
						},
						loopFix: function() {
							setEqualCardHeights(slider);
						}
					}
				});

				// Set equal heights initially
				setTimeout(() => {
					setEqualCardHeights(slider);
				}, 100);

				// Update slider after initialization
				if (swiperInstance) {
					swiperInstance.update();
				}
			});
		}

		return Object.freeze({
			init
		});
	};

	const action = () => {
		window.themeCore.Testimonials = window.themeCore.Testimonials || Testimonials();
		window.themeCore.utils.register(window.themeCore.Testimonials, "testimonials");
	};

	if (window.themeCore && window.themeCore.loaded) {
		action();
	} else {
		document.addEventListener("theme:all:loaded", action, { once: true });
	}

})();

