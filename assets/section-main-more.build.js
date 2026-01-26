(function () {
	'use strict';

	const selectors = {
		slider: ".js-main-more-slider",
		sliderPagination: ".js-main-more-pagination"
	};

	const breakpoints = {
		extraSmall: "(max-width: 767px)"
	};

	const extraSmallScreen = window.matchMedia(breakpoints.extraSmall);

	var MainMore = () => {
		const Swiper = window.themeCore.utils.Swiper;
		let sections = [];

		function init(sectionId) {
			sections = [...document.querySelectorAll(selectors.slider)].filter((section) => !sectionId || section.closest(`#shopify-section-${sectionId}`));

			sections.forEach((section) => {
				let slider = section;

				if (!slider) {
					return;
				}

				initSlider(slider);
			});
		}

		function initSlider(slider) {
			if (!extraSmallScreen.matches) {
				// On desktop, destroy slider if it exists
				if (slider.swiper) {
					slider.swiper.destroy(true, true);
				}
				return;
			}

			// Only initialize on mobile
			if (slider.swiper) {
				return; // Already initialized
			}

			new Swiper(slider, {
				slidesPerView: 1.2,
				spaceBetween: 16,
				speed: 600
			});
		}

		function handleBreakpointChange(media) {
			sections.forEach((section) => {
				const slider = section;
				if (!slider) {
					return;
				}

				if (media.matches) {
					// Mobile: initialize slider
					initSlider(slider);
				} else {
					// Desktop: destroy slider
					if (slider.swiper) {
						slider.swiper.destroy(true, true);
					}
				}
			});
		}

		function setBreakpointListener() {
			extraSmallScreen.addEventListener("change", handleBreakpointChange);
		}

		return Object.freeze({
			init: () => {
				init();
				setBreakpointListener();
			}
		});
	};

	const action = () => {
		window.themeCore.MainMore = window.themeCore.MainMore || MainMore();
		window.themeCore.utils.register(window.themeCore.MainMore, "main-more");
	};

	if (window.themeCore && window.themeCore.loaded) {
		action();
	} else {
		document.addEventListener("theme:all:loaded", action, { once: true });
	}

})();

