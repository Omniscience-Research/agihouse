(function ($) {

'use strict';

/*!==========================================================================
 * ==========================================================================
 * ==========================================================================
 *
 * [Table of Contents]
 *
 * 1. Animations
 * 2. Base Component
 * 3. Base GL Animation
 * 4. Pswp
 * 5. Scroll
 * 6. Scroll Animation
 * 7. Set Text
 * 8. Slider
 * 9. PJAX Animate Cloned Image
 * 10. PJAX Clone Image
 * 11. PJAX Fallback Cloned Image
 * 12. PJAX Finish Loading
 * 13. PJAX Init New Page
 * 14. PJAX Set Next Container
 * 15. PJAX Start Loading
 * 16. PJAX Transition Flying Image
 * 17. PJAX Transition Fullscreen Slider
 * 18. PJAX Transition General
 * 19. PJAX Transition List Hover
 * 20. PJAX Transition Overlay Menu
 * 21. PJAX Update Body
 * 22. PJAX Update Head
 * 23. PJAX Update Nodes
 * 24. PJAX Update Trackers
 * 25. PJAX
 * 26. Arrow
 * 27. Aside Counters
 * 28. Change Text Hover
 * 29. Circle Button
 * 30. Counter
 * 31. Cursor
 * 32. Effect Distortion
 * 33. Effect Stretch
 * 34. Filter
 * 35. Form
 * 36. Form AJAX
 * 37. Gmap
 * 38. Grid
 * 39. Header
 * 40. Lazy Load
 * 41. Magnetic
 * 42. Page Indicator
 * 43. Arts Parallax
 * 44. Preloader
 * 45. Smooth Scroll
 * 46. PSWP Album
 * 47. PSWP Gallery
 * 48. Scroll Down
 * 49. Section Content
 * 50. Section Grid
 * 51. Section List
 * 52. Section Masthead
 * 53. Section Nav Projects
 * 54. Section Scroll
 * 55. Section Projects Slider
 * 56. Section Slider Images
 * 57. Section Testimonials
 * 58. Slider Images
 * 59. Slider Fullscreen Projects
 * 60. Slider Categories
 * 61. Slider Counter
 * 62. Slider Distortion Effect
 * 63. Slider Dots
 * 64. Slider Hover Backgrounds
 * 65. Slider Text Transitions
 * 66. Slider Testimonials
 * 67. Mobile Bar Height
 * 68. Debounce
 * 69. Distribute By Position
 * 70. Get Stagger From
 * 71. Is Anchor
 * 72. Math
 * 73. Run On High Performance GPU
 * 74. Sync Attributes
 *
 * ==========================================================================
 * ==========================================================================
 * ==========================================================================
 */

/**
 * Try to use high performance GPU on dual-GPU systems
 */
runOnHighPerformanceGPU();

/**
 * Use passive listeners to improve scrolling performance
 */
jQuery.event.special.touchstart = {
	setup: function (_, ns, handle) {
		if (ns.includes('noPreventDefault')) {
			this.addEventListener('touchstart', handle, {
				passive: false
			});
		} else {
			this.addEventListener('touchstart', handle, {
				passive: true
			});
		}
	}
};

jQuery.event.special.touchend = {
	setup: function (_, ns, handle) {
		if (ns.includes('noPreventDefault')) {
			this.addEventListener('touchend', handle, {
				passive: false
			});
		} else {
			this.addEventListener('touchend', handle, {
				passive: true
			});
		}
	}
};

/**
 * Extend default easing functions set
 */
jQuery.extend(jQuery.easing, {
	easeInOutExpo: function (x, t, b, c, d) {
		if (t == 0) return b;
		if (t == d) return b + c;
		if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
		return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
	}
});

/**
 * GSAP: turn off console warnings
 */
gsap.config({
	nullTargetWarn: false
});

/**
 * Global Vars
 */
window.$document = $(document);
window.$window = $(window);
window.$body = $('body');
window.$html = $('html');
window.$spinner = $('#js-spinner');
window.$barbaWrapper = $('[data-barba="wrapper"]');
window.$pageWrapper = $('#page-wrapper');
window.$pageContent = $('.page-wrapper__content');
window.$pagePreloader = $('#js-preloader');
window.PagePreloader = new Preloader({
	scope: window.$document,
	target: window.$pagePreloader,
	curtain: {
		element: $('#js-page-transition-curtain'),
		background: $('.section-masthead').attr('data-background-color')
	},
	counter: {
		easing: 'power4.out',
		duration: 25,
		start: 0,
		target: 100,
		prefix: '',
		suffix: ''
	}
});

/**
 * Begin Page Load
 */
window.PagePreloader.start();

/**
 * Default Theme Options
 * Used to prevent errors if there is
 * no data provided from backend
 */
if (typeof window.theme === 'undefined') {
	window.theme = {
		ajax: {
			enabled: true,
			preventRules: '' // jQuery selectors of the elements to exclude them from AJAX transitions
		},
		animations: {
			triggerHook: 0.85, // more info https://scrollmagic.io/docs/ScrollMagic.Scene.html#triggerHook
			timeScale: {
				onScrollReveal: 1, // on-scroll animations global speed
				overlayMenuOpen: 1, // fullscreen menu open speed
				overlayMenuClose: 1, // fullscreen menu close speed
			}
		},
		cursorFollower: {
			enabled: true,
			labels: {
				slider: 'Drag'
			}
		},
		smoothScroll: { // more info https://github.com/idiotWu/smooth-scrollbar/tree/develop/docs
			enabled: true,
			damping: 0.12,
			renderByPixels: true,
			continuousScrolling: false,
			plugins: {
				edgeEasing: true
			}
		},
		contactForm7: {
			customModals: true
		}
	}
}

/**
 * ScrollMagic Setup
 */
window.SMController = new ScrollMagic.Controller();
window.SMController.enabled(false); // don't start animations yet
window.SMSceneTriggerHook = window.theme.animations.triggerHook;
window.SMSceneReverse = false;

/**
 * Don't save scroll position
 * after AJAX transition
 */
if ('scrollRestoration' in history) {
	history.scrollRestoration = 'manual';
}

/**
 * Page Load Strategy
 */
window.$window.on('load', function () {

	new Animations();

	// load fonts first
	document.fonts.ready
		// prepare all the texts
		.then(() => SetText.splitText({
			target: window.$document.find('.js-split-text')
		}))
		.then(() => SetText.setLines({
			target: window.$document.find('.split-text[data-split-text-set="lines"]')
		}))
		.then(() => SetText.setWords({
			target: window.$document.find('.split-text[data-split-text-set="words"]')
		}))
		.then(() => SetText.setChars({
			target: window.$document.find('.split-text[data-split-text-set="chars"]')
		}))
		// init template components
		.then(() => {
			initComponentsOnce({
				scope: window.$document
			});

			initComponents({
				scope: window.$document
			});
		})
		.then(() => window.PagePreloader.finish())
		.then(() => {
			// init cursor only on non-touch browsers
			if (window.theme.cursorFollower.enabled && !window.Modernizr.touchevents) {
				new Cursor({
					scope: window.$document,
					target: $('#js-cursor'),
					cursorElements: '[data-arts-cursor]',
					highlightElements: 'a:not(a[data-arts-cursor]):not(.social__item a):not(.section-video__link):not(.no-highlight), button:not(button[data-arts-cursor]), .filter__item, .section-nav-projects__header', // links to highlight
					highlightScale: 1.5, // default highlight scaling
					magneticElements: '[data-arts-cursor-magnetic]', // magnetic elements 
					magneticScaleCursorBy: 1.3, // default magnetic scaling
					animDuration: 0.25,
				});
			}
			// begin animations 
			window.SMController.enabled(true);
			window.SMController.update(true);
		});

	// init AJAX navigation
	if (window.theme.ajax.enabled) {
		new PJAX({
			target: window.$barbaWrapper,
			scope: window.$document
		});
	}

});

/**
 * Init Template Components after the initial
 * load and after an AJAX transition happens.
 * 
 * You can init your custom scripts here
 * in that function
 */
function initComponents({
	scope = window.$document,
	container = window.$pageWrapper,
	scrollToHashElement = true
}) {

	// init page header one time only
	if (typeof window.theme.header === 'undefined') {
		window.theme.header = new Header();
	}

	new MobileBarHeight();
	new SmoothScroll({
		target: container.filter('.js-smooth-scroll'),
		adminBar: $('#wpadminbar'),
		absoluteElements: $('[data-arts-scroll-absolute]'), // correct handling of absolute elements OUTSIDE scrolling container
		fixedElements: $('[data-arts-scroll-fixed]') // correct handling of fixed elements INSIDE scrolling container
	});
	new ScrollDown({
		target: scope.find('[data-arts-scroll-down]'),
		scope,
		duration: 0.8
	})
	new ArtsParallax({
		target: scope.find('[data-arts-parallax]'),
		factor: 0.3,
		ScrollMagicController: window.SMController,
		SmoothScrollBarController: window.SB
	});
	new AsideCounters({
		target: scope.find('.aside-counters'),
		scope
	});
	new Arrow({
		target: scope.find('.js-arrow')
	});
	new SectionMasthead({
		target: scope.find('.section-masthead'),
		scope
	});
	new SectionContent({
		target: scope.find('.section-content'),
		scope
	});
	new SectionProjectsSlider({
		target: scope.find('.section-projects-slider'),
		scope
	});
	new SectionList({
		target: scope.find('.section-list'),
		scope
	});
	new ChangeTextHover({
		target: scope.find('.js-change-text-hover:not(.js-change-text-hover .js-change-text-hover)'), // exclude nested elements
		scope,
		pageIndicator: scope.find('.js-page-indicator'), // fixed page indicator
		triggers: scope.find('.js-page-indicator-trigger'), // elements that triggers the change of page indicator
	});
	new PageIndicator(scope);
	new PSWPGallery({
		target: scope.find('.js-gallery'),
		scope,
		options: { // Pass your custom PhotoSwipe options here https://photoswipe.com/documentation/options.html
			history: window.theme.ajax.enabled ? false : true, // galleries URLs navigation is NOT compatible with AJAX
			showAnimationDuration: 300,
		}
	});
	new PSWPAlbum({
		target: scope.find('.js-album'),
		scope,
		options: { // Pass your custom PhotoSwipe options here https://photoswipe.com/documentation/options.html
			history: window.theme.ajax.enabled ? false : true, // galleries URLs navigation is NOT compatible with AJAX
			showAnimationDuration: 300,
		}
	});
	new GMap({
		target: scope.find('.js-gmap'),
		scope
	});
	new Form({
		target: scope,
		scope
	});
	new FormAJAX({
		target: scope.find('.js-ajax-form'),
		scope
	});
	new SectionSliderImages({
		target: scope.find('.section-slider-images'),
		scope
	});
	new SectionTestimonials({
		target: scope.find('.section-testimonials'),
		scope
	});
	new SectionGrid({
		target: scope.find('.section-grid'),
		scope
	});

	new SectionNavProjects({
		target: scope.find('.section-nav-projects'),
		scope
	});

	new CircleButton({
		target: scope.find('.js-circle-button:not(.js-circle-button_curved)'),
		scope
	});

	new SectionScroll({
		target: scope.find('.section-scroll'),
		scope
	});

	// scroll to anchor from URL hash
	if (scrollToHashElement) {
		Scroll.scrollToAnchorFromHash(2600);
	}

	//
	// your custom plugins init here
	//

}

/**
 * Init Template Components
 * only once after the initial
 * page load
 */
function initComponentsOnce({
	scope = window.$document,
	container = window.$pageWrapper
}) {
	window.theme.header = new Header();

	new LazyLoad({
		scope: window.$document,
		setPaddingBottom: true,
		run: true
	});
}

/*!========================================================================
	1. Animations
	======================================================================!*/
class Animations {
  constructor() {
    this._revealCurtain();
    this._moveCurtain();
    this._setCurtain();
    this._animateChars();
    this._animateLines();
    this._animateWords();
    this._hideChars();
    this._hideLines();
    this._hideWords();
    this._animateHeadline();
  }

  _setCurtain() {
    gsap.registerEffect({
      name: 'setCurtain',
      effect: (target, config) => {
        const
          tl = new gsap.timeline(),
          $target = $(target);

        if (!$target.length) {
          return tl;
        }

        const
          $svg = $target.find('.curtain-svg'),
          $normal = $target.find('.curtain-svg__normal'),
          $curve = $target.find('.curtain-svg__curve'),
          $rect = $target.find('.curtain__rect');

        tl
          .set($target, {
            display: 'none',
            autoAlpha: 1,
            y: config.y
          })
          .set($svg, {
            fill: config.background,
          });

        return tl;

      },
      extendTimeline: true,
      defaults: {
        y: '100%'
      }
    });
  }

  _moveCurtain() {
    gsap.registerEffect({
      name: 'moveCurtain',
      effect: (target, config) => {
        const
          tl = new gsap.timeline(),
          $target = $(target);

        if (!$target.length) {
          return tl;
        }

        const
          $svg = $target.find('.curtain-svg'),
          $normal = $svg.find('.curtain-svg__normal');

        let $curveTop, $curveBottom;

        if (window.innerWidth / window.innerHeight >= 1) {
          $curveTop = $target.find('.curtain-svg__curve_top-desktop');
          $curveBottom = $svg.find('.curtain-svg__curve_bottom-desktop');
        } else {
          $curveTop = $svg.find('.curtain-svg__curve_top-mobile');
          $curveBottom = $svg.find('.curtain-svg__curve_bottom-mobile');
        }

        tl
          .set($target, {
            display: 'block',
            autoAlpha: 1
          })
          .set([$curveTop, $curveBottom], {
            visibility: 'hidden',
          })
          .to($target, {
            y: config.y,
            duration: 1.8,
            ease: 'expo.inOut'
          });

        if (config.curve === 'top') {
          tl
            .set($normal, {
              visibility: 'visible'
            }, '0')
            .to($normal, {
              duration: 0.9,
              ease: 'power2.out',
              morphSVG: $curveTop[0]
            }, '-=1.8')
            .to($normal, {
              duration: 0.9,
              ease: 'power2.out',
              morphSVG: $normal[0],
              overwrite: 'all'
            }, '-=0.9');
        } else {
          tl
            .set($normal, {
              visibility: 'visible',
            }, '0')
            .to($normal, {
              duration: 0.9,
              ease: 'power2.out',
              morphSVG: $curveBottom[0],
              overwrite: 'all',
            }, '-=1.8')
            .to($normal, {
              duration: 0.9,
              ease: 'power2.out',
              morphSVG: $normal[0],
            });
        }

        tl.totalDuration(config.duration);

        return tl;

      },
      extendTimeline: true,
      defaults: {
        duration: 2.4,
        curve: 'top',
        y: '0%'
      }
    });
  }

  _revealCurtain() {
    gsap.registerEffect({
      name: 'revealCurtain',
      effect: (target, config) => {
        const
          tl = new gsap.timeline(),
          $target = $(target);

        if (!$target.length) {
          return tl;
        }

        const
          $normal = $target.find('.curtain-svg__normal'),
          $curve = $target.find('.curtain-svg__curve');

        tl
          .set($target, {
            y: '100%',
            autoAlpha: 1
          })
          .set($normal, {
            visibility: 'visible'
          })
          .set($curve, {
            visibility: 'hidden',
          })
          .to($target, {
            y: '0%',
            duration: 1.8,
            ease: 'expo.inOut'
          })
          .to($normal, {
            duration: 0.9,
            ease: 'power2.out',
            morphSVG: $curve[0]
          }, '-=1.8')
          .to($normal, {
            duration: 0.9,
            ease: 'power2.out',
            morphSVG: $normal[0],
            overwrite: 'all'
          }, '-=0.9');

        tl.totalDuration(config.duration)

        return tl;

      },
      extendTimeline: true,
      defaults: {
        duration: 2.4
      }
    });
  }

  _animateChars() {
    gsap.registerEffect({
      name: 'animateChars',
      effect: (target, config) => {
        const
          $target = $(target),
          $chars = $target.find('.split-text__char');

        let textAlign;

        if (!$chars.length) {
          return;
        }

        textAlign = $target.css('text-align');

        if (!config.stagger.from) {

          switch (textAlign) {
            case 'left':
              config.stagger.from = 'start';
              break;
            case 'center':
              config.stagger.from = 'center';
              break;
            case 'right':
              config.stagger.from = 'end';
              break;
          }

        }

        return gsap.to($chars, config);
      },
      defaults: {
        xPercent: 0,
        yPercent: 0,
        x: '0%',
        y: '0%',
        autoAlpha: 1,
        duration: 1,
        ease: 'power3.inOut',
        stagger: distributeByPosition({
          from: 'start',
          amount: 0.3
        })
      },
      extendTimeline: true,
    });
  }

  _animateLines() {
    gsap.registerEffect({
      name: 'animateLines',
      effect: (target, config) => {
        const $target = $(target);
        let $lines = $target.find('.split-text__line');

        if (!$lines.length) {
          return;
        }

        if (config.excludeEl) {
          $lines = $lines.not(config.excludeEl);
          delete config.excludeEl;
        }

        return gsap.to($lines, config);
      },
      defaults: {
        xPercent: 0,
        yPercent: 0,
        x: '0%',
        y: '0%',
        autoAlpha: 1,
        duration: 1.2,
        ease: 'power3.out',
        stagger: {
          amount: 0.08
        }
      },
      extendTimeline: true,
    });
  }

  _animateWords() {
    gsap.registerEffect({
      name: 'animateWords',
      effect: (target, config) => {
        const
          $target = $(target),
          $words = $target.find('.split-text__word');

        if (!$words.length) {
          return;
        }

        return gsap.to($words, config);
      },
      defaults: {
        duration: 1.2,
        y: '0%',
        ease: 'power3.out',
        stagger: {
          amount: 0.2
        }
      },
      extendTimeline: true,
    });
  }

  _hideChars() {
    gsap.registerEffect({
      name: 'hideChars',
      effect: (target, config) => {
        const
          $target = $(target),
          $chars = $target.find('.split-text__char'),
          textAlign = $target.css('text-align');

        if (!$chars.length) {
          return;
        }

        if (!config.stagger.from) {

          switch (textAlign) {
            case 'left':
              config.stagger.from = 'start';
              break;
            case 'center':
              config.stagger.from = 'center';
              break;
            case 'right':
              config.stagger.from = 'end';
              break;
          }

        }

        if (config.duration === 0) {
          config.stagger = 0;
        }

        return gsap.to($chars, config);
      },
      defaults: {
        duration: 1.2,
        x: '0%',
        y: '100%',
        autoAlpha: 0,
        ease: 'power3.inOut',
        stagger: distributeByPosition({
          from: 'center',
          amount: 0.3
        })
      },
      extendTimeline: true,
    });
  }

  _hideLines() {
    gsap.registerEffect({
      name: 'hideLines',
      effect: (target, config) => {
        const
          $target = $(target),
          $lines = $target.find('.split-text__line');

        if (!$lines.length) {
          return;
        }

        if (config.duration === 0) {
          config.stagger = 0;
        }

        return gsap.to($lines, config);
      },
      defaults: {
        y: '-100%',
        autoAlpha: 1,
        duration: 1.2,
        ease: 'power3.out',
        stagger: {
          amount: 0.02
        }
      },
      extendTimeline: true,
    });
  }

  _hideWords() {
    gsap.registerEffect({
      name: 'hideWords',
      effect: (target, config) => {
        const
          $target = $(target),
          $words = $target.find('.split-text__word');

        if (!$words.length) {
          return;
        }

        return gsap.to($words, config);
      },
      defaults: {
        y: '-100%',
        autoAlpha: 0,
        duration: 1.2,
        ease: 'power3.out',
        stagger: {
          amount: 0.02
        }
      },
      extendTimeline: true,
    });
  }

  _animateHeadline() {
    gsap.registerEffect({
      name: 'animateHeadline',
      effect: (target, config) => {
        const
          $target = $(target);

        let textAlign;
        textAlign = $target.css('text-align');

        if (!config.transformOrigin) {

          switch (textAlign) {
            case 'left':
              config.transformOrigin = 'left center';
              break;
            case 'center':
              config.transformOrigin = 'center center';
              break;
            case 'right':
              config.transformOrigin = 'right center';
              break;
          }

        }

        return gsap.to($target, config);
      },
      defaults: {
        scaleX: 1,
        scaleY: 1,
        duration: 1.2,
        ease: 'power3.inOut',
      },
      extendTimeline: true,
    });
  }
}

/*!========================================================================
	2. Base Component
	======================================================================!*/
class BaseComponent {

  constructor({
    target,
    scope = window.$document
  }) {
    const self = this;

    this.$scope = scope;
    this.$target = this.$scope.find(target);
    this.$el;

    if (this.$target && this.$target.length) {
      this.$target.each(function () {
        self.$el = $(this);
        self.set(self.$el);
        self.run(self.$el);
      });
    }
  }

  set($el) {

  }

  run($el) {

  }

}

/*!========================================================================
	3. Base GL Animation
	======================================================================!*/
class BaseGLAnimation {

	constructor({
		target,
		canvas,
		aspect
	}) {
		this.target = target;
		this.canvas = canvas;

		if (!BaseGLAnimation.isThreeLoaded() || !this.canvas) {
			return false;
		}
		this.coverMode = aspect ? true : false;
		this.aspect = aspect || window.innerWidth / window.innerHeight;
		this.scene = this._getScene();
		this.viewport = this.coverMode ? this._getViewportCover() : this._getViewport();
		this.camera = this._getCamera();
		this.viewSize = this._getViewSize();
		this.position = this._calculatePosition();

		this.renderer = this._getRenderer();
		this.renderer.setPixelRatio(1); // window.devicePixelRatio
		this.renderer.setClearColor(0xffffff, 0.0);
		this.renderer.setSize(this.viewport.width, this.viewport.height);
		this.renderer.setAnimationLoop(this._render.bind(this));

		this.loader = this._getTextureLoader();

		this.camera.position.z = 1;
		this.camera.updateProjectionMatrix();
		this._updateScene();

		this._bindEvents();
	}

	_bindEvents() {
		window.$window.on('resize', debounce(() => {
			this._updateScene();
		}, 250));

		window.$window.on('arts/barba/transition/start', () => {
			this.destroy();
		});
	}

	_render() {
		this.renderer.render(this.scene, this.camera);
	}

	_getRenderer() {
		return new THREE.WebGLRenderer({
			canvas: this.canvas,
			powerPreference: 'high-performance',
			alpha: true
		});
	}

	_getScene() {
		return new THREE.Scene();
	}

	_getCamera() {
		return new THREE.PerspectiveCamera(
			53.1,
			this.viewport.aspectRatio,
			0.1,
			1000
		);
	}

	_getTextureLoader() {
		return new THREE.TextureLoader();
	}

	_getPlane({
		geometry,
		material
	}) {
		return new THREE.Mesh(geometry, material);
	}

	_updateScene() {
		this.viewport = this.coverMode ? this._getViewportCover() : this._getViewport();
		this.viewSize = this._getViewSize();
		this.camera.aspect = this.viewport.aspectRatio;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(this.viewport.width, this.viewport.height);
	}

	_getViewport() {

		const width = window.innerWidth;
		const height = window.innerHeight;
		const aspectRatio = width / height;

		return {
			width,
			height,
			aspectRatio
		}
	}

	_getViewportCover() {
		let
			height = parseFloat(window.innerHeight),
			width = parseFloat(height * this.aspect),
			aspectRatio = this.aspect,
			multiplier = 1

		if (this.aspect > 1) {
			multiplier = window.innerWidth > width ? window.innerWidth / width : 1;
		} else {
			multiplier = this.canvas.clientWidth / width;
		}

		if (multiplier < 1) {
			multiplier = 1;
		}

		width = width * multiplier;
		height = height * multiplier;

		return {
			width,
			height,
			aspectRatio
		};
	}

	_getViewSize() {
		// fit plane to screen
		// https://gist.github.com/ayamflow/96a1f554c3f88eef2f9d0024fc42940f

		const distance = this.camera.position.z;
		const vFov = (this.camera.fov * Math.PI) / 180;
		const height = 2 * Math.tan(vFov / 2) * distance;
		const width = height * this.viewport.aspectRatio;

		return {
			width,
			height,
			vFov
		};
	}

	_calculatePosition() {
		let
			height = parseFloat(window.innerHeight),
			width = parseFloat(height * this.viewport.aspectRatio),
			multiplier = 1;

		if (this.viewport.aspectRatio > 1) {
			multiplier = window.innerWidth > width ? window.innerWidth / width : 1;
		} else {
			multiplier = this.canvas.clientWidth / width;
		}

		if (multiplier < 1) {
			multiplier = 1;
		}

		width = width * multiplier;
		height = height * multiplier;

		return {
			width,
			height
		};
	}

	_loadTextures() {
		const self = this,
			promises = [];

		this.items.each(function (index) {
			const url = $(this).find('[data-texture-src]').attr('data-texture-src');

			promises.push(
				self._loadTexture({
					loader: self.loader,
					url,
					index
				})
			);
		});

		return new Promise((resolve, reject) => {
			// resolve textures promises
			Promise.all(promises).then(promises => {
				// all textures are loaded
				promises.forEach((promise, index) => {
					const $img = $(this.items[index]).find('[data-texture-src]');
					// assign texture to item
					this.items[index].texture = promise.texture;
					this.items[index].texture.magFilter = THREE.LinearFilter;
					this.items[index].texture.minFilter = THREE.LinearFilter;
					this.items[index].texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();

					if ($img.is('img')) {
						// load texture back to src (needed for AJAX transition)
						$img.attr('src', $img.attr('data-texture-src'));
					}
				});

				resolve();
			});
		});
	}

	_loadTexture({
		loader,
		url,
		index
	}) {
		// https://threejs.org/docs/#api/en/loaders/TextureLoader
		return new Promise((resolve, reject) => {
			if (!url) {
				resolve({
					texture: null,
					index
				});
				return;
			}
			// load a resource
			loader.load(
				// resource URL
				url,

				// onLoad callback
				texture => {
					resolve({
						texture,
						index
					});
				},

				// onProgress callback currently not supported
				undefined,

				// onError callback
				error => {
					console.error('An error happened during loading a texture to the canvas.', error);
					reject(error);
				}
			)
		})
	}

	_getVertexShader(id) {
		return document.getElementById(id).textContent || false;
	}

	_getFragmentShader(id) {
		return document.getElementById(id).textContent || false;
	}

	static isThreeLoaded() {
		return (typeof window.THREE === 'object');
	}

	destroy() {
		this.renderer.setAnimationLoop(null);
		this.camera = undefined;
		this.scene = undefined;
		this.loader = undefined;
		this.material = undefined;
		// this.renderer = undefined;
		window.$window.off('resize');
	}
}

/*!========================================================================
	4. Pswp
	======================================================================!*/
class Pswp extends BaseComponent {
	constructor({
		scope,
		target,
		options
	}) {
		super({
			scope,
			target
		});
		this.options = options || {
			history: false,
			showAnimationDuration: 300,
		};
		this._setGalleriesID();
		this.$pswpEl = $('.pswp');
		this.$container = this.$pswpEl.find('.pswp__container');
		this.pswpEl = this.$pswpEl.get(0);
	}

	_bindEvents() {
		const eventTouchUp = new CustomEvent('arts/pswp/touchUp', {
				detail: {
					direction: 'all'
				}
			}),
			eventTouchDown = new CustomEvent('arts/pswp/touchDown', {
				detail: {
					direction: 'all'
				}
			}),
			eventClose = new CustomEvent('arts/pswp/close'),
			eventSlideChange = new CustomEvent('arts/pswp/slideChange');

		this.$pswpEl
			.off('click')
			.on('click', '.pswp__button--arrow--left', (e) => {
				e.preventDefault();
				this.gallery.prev();
			}).on('click', '.pswp__button--arrow--right', (e) => {
				e.preventDefault();
				this.gallery.next();
			});

		window.$window.on('arts/barba/transition/start', () => {
			if (typeof this.gallery === 'object' && this.gallery.destroy === 'function') {
				this.gallery.destroy();
			}
		});

		// Dispatch cursor events
		this.gallery.listen('preventDragEvent', (e, isDown, preventObj) => {
			preventObj.prevent = false;
			if ($(e.target).is('.pswp--zoomed-in .pswp__img')) {
				if (isDown) {
					document.dispatchEvent(eventTouchDown);
				} else {
					document.dispatchEvent(eventTouchUp);
				}
			}
		});

		this.gallery.listen('close', () => {
			document.dispatchEvent(eventClose);
			this.$pswpEl.find('iframe, video').remove();
		});

		this.gallery.listen('beforeChange', (e) => {
			document.dispatchEvent(eventSlideChange);
			this._stopVideo();
		});
	}

	_openPhotoSwipe({
		index = 0,
		galleryElement = null,
		disableAnimation = false,
		fromURL = false
	}) {
		const
			items = this._getItems(galleryElement, index),
			options = {
				galleryUID: galleryElement.attr('data-pswp-uid')
			};

		if (typeof items[index] !== 'undefined' && 'el' in items[index]) {
			options.getThumbBoundsFn = function (index) {
				let
					pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
					img = items[index].el.querySelector('img'),
					rect;

				if (img) {
					rect = img.getBoundingClientRect();
					return {
						x: rect.left,
						y: rect.top + pageYScroll,
						w: rect.width
					}
				}
			}
		}

		// PhotoSwipe opened from URL
		if (fromURL) {
			if (options.galleryPIDs) {
				// parse real index when custom PIDs are used 
				// http://photoswipe.com/documentation/faq.html#custom-pid-in-url
				for (let j = 0; j < items.length; j++) {
					if (items[j].pid == index) {
						options.index = j;
						break;
					}
				}
			} else {
				// in URL indexes start from 1
				options.index = parseInt(index, 10) - 1;
			}
		} else {
			options.index = parseInt(index, 10);
		}

		// exit if index not found
		if (isNaN(options.index)) {
			return;
		}

		if (disableAnimation) {
			options.showAnimationDuration = 0;
		}

		// Pass data to PhotoSwipe and initialize it
		this.gallery = new PhotoSwipe(this.pswpEl, PhotoSwipeUI_Default, items, $.extend(options, this.options));
		this.gallery.init();

		this._bindEvents();
	}

	_getMediaTypeFromURL(url, size, autoplay = false) {
		const
			result = {
				type: false,
				html: null
			},
			iframeSize = size ? size.split('x') : [640, 360],
			attr = {
				video: autoplay ? 'muted playsinline loop autoplay' : '',
			},
			param = {
				youtube: autoplay ? 'autoplay=1' : '',
				vimeo: autoplay ? 'autoplay=1' : ''
			},
			pattern = {
				image: /([-a-zA-Z0-9@:%_\+.~#?&\/\/=]{2,256}(\/[-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)?\.(?:jpg|jpeg|jfif|pjpeg|pjp|bmp|gif|png|apng|webp|svg))/gi,
				video: /([-a-zA-Z0-9@:%_\+.~#?&\/\/=]{2,256}(\/[-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)?\.(?:mp4|ogv|webm))/gi,
				youtube: /(?:http?s?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/)([^&|?|\/]*)/g,
				vimeo: /(?:http?s?:\/\/)?(?:www\.)?(?:vimeo\.com)\/(?:.*\/)?(.+)/g,
			};

		/**
		 * Image
		 */
		if (pattern.image.test(url)) {
			result.type = 'image';
			return result;
		}

		/**
		 * HTML5 video
		 */
		if (pattern.video.test(url)) {
			result.type = 'video';
			result.html = `<video src="${url}" controls ${attr.video}></video>`;
			return result;
		}

		/**
		 * YouTube link
		 */
		if (pattern.youtube.test(url)) {
			result.type = 'youtube';
			result.html = url.replace(pattern.youtube, `<iframe class="iframe-youtube" width="${parseInt(iframeSize[0])}" height="${parseInt(iframeSize[1])}" src="https://www.youtube.com/embed/$1?${param.youtube}&enablejsapi=1" frameborder="0" allow="autoplay; accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`);
			return result;
		}

		/**
		 * Vimeo link
		 */
		if (pattern.vimeo.test(url)) {
			result.type = 'vimeo';
			result.html = url.replace(pattern.vimeo, `<iframe class="iframe-vimeo" width="${parseInt(iframeSize[0])}" height="${parseInt(iframeSize[1])}" src="https://player.vimeo.com/video/$1?${param.vimeo}" frameborder="0" allow="autoplay; fullscreen" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>`);
			return result;
		}

		/**
		 * Fallback iFrame
		 */
		result.type = 'iframe';
		result.html = `<iframe width="${parseInt(iframeSize[0])}" height="${parseInt(iframeSize[1])}" src=${url} frameborder="0" allowfullscreen></iframe>`;

		return result;
	}

	_getItems($galleryElement, activeIndex = 0) {
		const
			self = this,
			$items = $galleryElement.find('a'),
			items = [];

		$items.each(function (index) {
			const $el = $(this),
				item = {},
				size = $el.attr('data-size'),
				autoplay = $el.attr('data-autoplay') && activeIndex === index, // autoplay only currently active item
				src = $el.attr('href'),
				media = self._getMediaTypeFromURL(src, size, autoplay),
				title = $el.attr('data-title');

			if (size) {
				const sizeSplit = size.split('x');
				item.w = parseInt(sizeSplit[0], 10);
				item.h = parseInt(sizeSplit[1], 10);
			}

			if (title) {
				item.title = title;
			}

			switch (media.type) {
				case 'youtube':
					item.html = `<div class="pswp__wrapper-embed">${media.html}</div>`;
					break;
				case 'vimeo':
					item.html = `<div class="pswp__wrapper-embed">${media.html}</div>`;
					break;
				case 'video':
					item.html = `<div class="pswp__wrapper-embed">${media.html}</div>`;
					break;
				case 'image':
					item.el = $el.get(0);
					item.src = src;
					item.msrc = $el.find('img').attr('src');
					break;
				default: // iframe
					item.html = `<div class="pswp__wrapper-embed">${media.html}</div>`;
			}
			items.push(item);
		});

		return items;
	}

	_photoswipeParseHash() {
		const
			hash = window.location.hash.substring(1),
			params = {};

		if (hash.length < 5) {
			return params;
		}

		const vars = hash.split('&');
		for (let i = 0; i < vars.length; i++) {
			if (!vars[i]) {
				continue;
			}
			let pair = vars[i].split('=');
			if (pair.length < 2) {
				continue;
			}
			params[pair[0]] = pair[1];
		}

		if (params.gid) {
			params.gid = parseInt(params.gid, 10);
		}

		return params;
	}

	_setGalleriesID() {
		this.$target.each(function (index) {
			$(this).attr('data-pswp-uid', index + 1);
		});
	}

	_stopVideo() {
		const
			$iframeYoutube = this.$pswpEl.find('.iframe-youtube'),
			$iframeVimeo = this.$pswpEl.find('.iframe-vimeo'),
			$video = this.$pswpEl.find('video');

		if ($iframeYoutube.length) {
			$iframeYoutube.each(function () {
				$(this).get(0).contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
			});
		}

		if ($iframeVimeo.length) {
			$iframeVimeo.each(function () {
				$(this).get(0).contentWindow.postMessage('{"method":"pause"}', '*');
			});
		}

		if ($video.length) {
			$video.each(function () {
				$(this).get(0).pause();
			});
		}
	}
}

/*!========================================================================
	5. Scroll
	======================================================================!*/

function scrollTop() {
	document.body.scrollTop = 0;
	document.documentElement.scrollTop = 0;
}
class Scroll {
  static getEasingScroll(pos) {
    if (pos === 0) return 0;
    if (pos === 1) return 1;
    if ((pos /= 0.5) < 1) return 0.5 * Math.pow(2, 10 * (pos - 1));
    return 0.5 * (-Math.pow(2, -10 * --pos) + 2);
  }

  static scrollTo({
    x = 0,
    y = 0,
    duration = 0,
    cb
  }) {
    if (typeof window.SB !== 'undefined') {
      window.SB.scrollTo(x, y, duration, {
        easing: (pos) => Scroll.getEasingScroll(pos),
        callback: () => {
          if (typeof cb === 'function') {
            cb();
          }
        }
      });
    } else {
      $('html, body').animate({
        scrollLeft: x,
        scrollTop: y
      }, duration, 'easeInOutExpo', () => {
        if (typeof cb === 'function') {
          cb();
        }
      });
    }
  }

  static scrollToTop() {

    // safari fix
    try {
      window.top.scrollTo(0, 0);
    } catch (error) {}

    if (typeof window.SB !== 'undefined') {
      window.SB.scrollTop = 0;
    } else {
      window.scrollTo(0, 0);
    }

    // window.pageYOffset = 0;
  }

  static getScrollTop() {
    if (typeof window.SB !== 'undefined') {
      window.lastTop = window.SB.scrollTop;
    } else {
      window.lastTop = Math.max(document.body.scrollTop, document.documentElement.scrollTop);
    }

    return window.lastTop;
  }

  static restoreScrollTop() {
    if (typeof window.SB !== 'undefined') {
      setTimeout(() => {
        window.SB.scrollTop = window.lastTop;
      }, 100);
    } else {
      $('html, body').animate({
        scrollTop: window.lastTop
      });
    }
  }

  static lock(lock = true) {
    const lockClass = 'body_lock-scroll';

    if (lock === true) {
      if (typeof window.SB !== 'undefined') {
        window.SB.updatePluginOptions('lockscroll', {
          lock: true
        });
      }

      window.$body.addClass(lockClass);
    }

    if (lock === false) {
      window.$body.removeClass(lockClass);

      if (typeof window.SB !== 'undefined') {
        window.SB.updatePluginOptions('lockscroll', {
          lock: false
        });
      }
    }
  }

  static scrollToAnchorFromHash(timeout = 2000) {
    if ( window.location.hash ) {
      const
        $pageHeader = $('#page-header'),
        $scrollElement = $(window.location.hash),
        offsetTop = $pageHeader.length ? $pageHeader.innerHeight() : 0;

      if ($scrollElement.length) {
        setTimeout(() => {
          Scroll.scrollTo({
            x: 0,
            y: $scrollElement.offset().top - offsetTop,
            duration: 800
          });
      }, timeout);
      }
    }
  }
}

/*!========================================================================
	6. Scroll Animation
	======================================================================!*/
class ScrollAnimation extends BaseComponent {

  constructor({
    target,
    scope
  }) {
    super({
      target,
      scope
    });

  }

  _hasAnimationScene($el) {
    return $el.attr('data-arts-os-animation');
  }

  _createScene({
    element,
    timeline,
    customTrigger = false,
    reveal = true,
    delay = 0,
    reverse = false,
    duration = 0,
    triggerHook
  }) {

    const masterTL = new gsap.timeline({
      delay: delay
    });

    let
      $trigger = element,
      scale = 1;

    if (customTrigger && customTrigger.length) {
      $trigger = customTrigger;
    }

    if (reveal === true) {
      // reveal hidden element first
      element.attr('data-arts-os-animation', 'animated');
    }

    masterTL.add(timeline, '0');

    if (window.theme !== 'undefined') {
      scale = window.theme.animations.timeScale.onScrollReveal || scale;
      masterTL.timeScale(scale);
    }

    return new $.ScrollMagic.Scene({
        triggerElement: $trigger,
        triggerHook: triggerHook || window.SMSceneTriggerHook,
        reverse: reverse || window.SMSceneReverse,
        duration: duration
      })
      .setTween(masterTL)
      .addTo(window.SMController);
  }
}

/*!========================================================================
	7. Set Text
	======================================================================!*/
class SetText {
  static splitText({
    target
  }) {
    return new Promise((resolve) => {
      if (!target || !target.length) {
        resolve(true);
        return;
      }

      target.each(function () {
        const
          $el = $(this),
          type = $el.data('split-text-type'),
          set = $el.data('split-text-set');

        let $content = $el;

        // split children elements if they are exist
        // instead of the actual element
        if ($el.children(':not(br)').length > 0) {
          $content = $el.find(' > *');
        }

        // handle texts with drop cap
        const $contentWithDropcap = $content.filter('.has-drop-cap');
        const firstChar = $contentWithDropcap.text()[0];

        // remove first char
        $contentWithDropcap.text($contentWithDropcap.text().substring(1));
        $contentWithDropcap.prepend(`<span class="drop-cap">${firstChar}</span>`).addClass('has-drop-cap_split');

        new SplitText($content, {
          type: type,
          linesClass: ($contentWithDropcap.length || set === 'words') ? 'split-text__line overflow' : 'split-text__line',
          wordsClass: 'split-text__word',
          charsClass: 'split-text__char',
          reduceWhiteSpace: false,
        });

        // double wrapper for "only lines" split type
        if (type === 'lines') {
          new SplitText($content, {
            type: type,
            linesClass: 'overflow',
            reduceWhiteSpace: false,
          });
        }

        $el.removeClass('js-split-text');
      });

      resolve(true);

    });
  }

  static setLines({
    target,
    y = '100%'
  }) {
    return new Promise((resolve) => {
      if (!target || !target.length) {
        resolve(true);
        return;
      }

      gsap.set(target.find('.split-text__line'), {
        y,
        onComplete: resolve(true)
      });
    });
  }

  static setWords({
    target,
    y = '100%'
  }) {
    return new Promise((resolve) => {
      if (!target || !target.length) {
        resolve(true);
        return;
      }

      gsap.set(target.find('.split-text__word'), {
        y,
        onComplete: resolve(true)
      });
    });
  }

  static setChars({
    target,
    x = 0,
    y = 0,
    distribute = true
  }) {
    return new Promise((resolve) => {
      if (!target || !target.length) {
        resolve(true);
        return;
      }

      const instance = new SetText();

      gsap.set(target, {
        clearProps: 'all'
      });

      target.each(function () {
        const
          $el = $(this),
          $lines = $el.find('.split-text__line'),
          textAlign = $el.css('text-align');

        if (distribute === true) {
          switch (textAlign) {
            case 'left':
              instance._setFromLeft({
                lines: $lines,
                x,
                y
              });
              break;
            case 'center':
              instance._setFromCenter({
                lines: $lines,
                x,
                y
              });
              break;
            case 'right':
              instance._setFromRight({
                lines: $lines,
                x,
                y
              });
              break;
          }
        } else {
          instance._setFromLeft({
            lines: $lines,
            x,
            y
          });
        }
      });

      resolve(true);
    });
  }

  _setFromLeft({
    lines,
    x,
    y
  }) {
    if (!lines || !lines.length) {
      return;
    }

    gsap.set(lines.find('.split-text__char'), {
      x,
      y,
      autoAlpha: 0
    });
  }

  _setFromRight({
    lines,
    x,
    y
  }) {
    if (!lines || !lines.length) {
      return;
    }

    gsap.set(lines.find('.split-text__char'), {
      x: -x,
      y: -y,
      autoAlpha: 0
    });
  }

  _setFromCenter({
    lines,
    x,
    y
  }) {
    const self = this;

    if (!lines || !lines.length) {
      return;
    }

    lines.each(function () {
      const
        $currentLine = $(this),
        $wordsInCurrentLine = $currentLine.find('.split-text__word');

      /**
       * 1. Only 1 word in the current line
       */
      if ($wordsInCurrentLine.length === 1) {
        self._setCharsSingleWord({
          words: $wordsInCurrentLine,
          x,
          y
        });
      }

      /**
       * 2. Even number of words in the current line
       */
      if ($wordsInCurrentLine.length !== 1 && $wordsInCurrentLine.length % 2 === 0) {
        self._setCharsEvenWords({
          words: $wordsInCurrentLine,
          x,
          y
        });
      }

      /**
       * 3. Odd number of words in the current line
       */
      if ($wordsInCurrentLine.length !== 1 && $wordsInCurrentLine.length % 2 !== 0) {
        self._setCharsOddWords({
          words: $wordsInCurrentLine,
          x,
          y
        });
      }
    });
  }

  _setCharsSingleWord({
    words,
    x,
    y
  }) {
    const
      $charsInWord = words.find('.split-text__char'),
      halfWord = Math.ceil($charsInWord.length / 2),
      $fistHalfWord = $charsInWord.slice(0, halfWord),
      $secondHalfWord = $charsInWord.slice(halfWord, $charsInWord.length);

    // first half of word to the left
    gsap.set($fistHalfWord, {
      x: -x,
      y: -y,
      autoAlpha: 0
    });

    // second half of word to the right
    gsap.set($secondHalfWord, {
      x,
      y,
      autoAlpha: 0
    });
  }

  _setCharsOddWords({
    words,
    x,
    y
  }) {
    const
      halfLine = Math.ceil(words.length / 2),
      $fistHalf = words.slice(0, halfLine),
      $secondHalf = words.slice(halfLine, words.length),
      $middleWord = words.eq(halfLine - 1),
      $charsInMiddleWord = $middleWord.find('.split-text__char'),
      halfLineMiddleWord = Math.ceil($charsInMiddleWord.length / 2),
      $fistHalfMiddleWord = $charsInMiddleWord.slice(0, halfLineMiddleWord),
      $secondHalfMiddleWord = $charsInMiddleWord.slice(halfLineMiddleWord, $charsInMiddleWord.length);

    // first half
    $fistHalf.each(function () {
      const $charsInWord = $(this).find('.split-text__char');

      gsap.set($charsInWord, {
        x: -x,
        y: -y,
        autoAlpha: 0
      });
    });

    // second half
    $secondHalf.each(function () {
      const $charsInWord = $(this).find('.split-text__char');

      gsap.set($charsInWord, {
        x,
        y,
        autoAlpha: 0
      });
    });

    // middle word: first half
    $fistHalfMiddleWord.each(function () {
      const $charsInWord = $(this);

      gsap.set($charsInWord, {
        x: -x,
        y: -y,
        autoAlpha: 0
      });
    });

    // middle word: second half
    $secondHalfMiddleWord.each(function () {
      const $charsInWord = $(this);

      gsap.set($charsInWord, {
        x,
        y,
        autoAlpha: 0
      });
    });
  }

  _setCharsEvenWords({
    words,
    x,
    y
  }) {
    const
      halfLine = Math.ceil(words.length / 2),
      $fistHalf = words.slice(0, halfLine),
      $secondHalf = words.slice(halfLine, words.length);

    // first half
    $fistHalf.each(function () {
      const $charsInWord = $(this).find('.split-text__char');

      gsap.set($charsInWord, {
        x: -x,
        y: y,
        autoAlpha: 0
      });
    });

    // second half
    $secondHalf.each(function () {
      const $charsInWord = $(this).find('.split-text__char');

      gsap.set($charsInWord, {
        x: x,
        y: y,
        autoAlpha: 0
      });
    });
  }
}

/*!========================================================================
	8. Slider
	======================================================================!*/
class Slider extends BaseComponent {

  constructor({
    scope,
    target
  }) {
    super({
      target,
      scope
    });
  }

  _getSliderDots({
    slider,
    container
  }) {
    return new SliderDots({
      slider,
      container
    });
  }

  _getSliderCounter({
    slider,
    counter = {
      current,
      total,
      style,
      zeros
    }
  }) {
    return new SliderCounter({
      slider: slider,
      sliderCounter: counter.current,
      total: counter.total,
      style: counter.style,
      addZeros: counter.zeros
    });
  }

  _emitDragEvents({
    slider,
    target,
    customClass
  }) {
    const eventTouchUp = new CustomEvent('arts/slider/touchUp', {
      detail: {
        direction: slider.params.direction
      }
    });
    const eventTouchDown = new CustomEvent('arts/slider/touchDown', {
      detail: {
        direction: slider.params.direction
      }
    });

    slider.params.touchStartPreventDefault = false;

    slider
      .on('touchStart', () => {
        if (slider.params.autoplay.enabled) {
          slider.autoplay.stop();
        }

        if (customClass) {
          slider.$el.addClass(customClass);
        }

        target.dispatchEvent(eventTouchDown);
      })
      .on('touchEnd', () => {
        if (slider.params.autoplay.enabled) {
          slider.autoplay.start();
        }

        if (customClass) {
          slider.$el.removeClass(customClass);
        }

        target.dispatchEvent(eventTouchUp);
      });
  }

  _pauseAutoplay({
    slider
  }) {
    if (slider && slider.params.autoplay && slider.params.autoplay.enabled === true) {
      window.$window.on('arts/barba/transition/start', () => {
        slider.autoplay.stop();
      });

      if (window.$pagePreloader && window.$pagePreloader.length && window.$pagePreloader.is(':visible')) {
        window.$window
          .on('arts/preloader/start', () => {
            slider.autoplay.stop();
          })
          .on('arts/preloader/end', () => {
            slider.autoplay.start();
          });
      }
    }
  }
}

/*!========================================================================
	9. PJAX Animate Cloned Image
	======================================================================!*/
function PJAXAnimateClonedImage(data, duration = 2.0) {
	window.dispatchEvent(new CustomEvent('arts/barba/transition/clone/before'));

	return new Promise((resolve) => {
		const
			tl = new gsap.timeline(),
			$nextContainer = $(data.next.container),
			$curtain = $('#js-page-transition-curtain'),
			$nextMasthead = $nextContainer.find('.section-masthead'),
			background = $nextMasthead.attr('data-background-color'),
			$target = $nextMasthead.find('.js-transition-img'),
			target = $target.get(0),
			$clone = $('.clone'),
			$bgClone = $clone.find('.js-transition-img__transformed-el'),
			$bgTarget = $target.find('.js-transition-img__transformed-el'),
			bgTarget = $bgTarget.get(0);

		if (!$target.length || !$clone.length) {
			resolve(true);
			return;
		}

		const bgTargetProperties = $bgTarget.css(['width', 'height', 'objectPosition', 'objectFit']),
			{
				top,
				left,
				width,
				height,
			} = target.getBoundingClientRect(),
			bgTargetScale = gsap.getProperty(bgTarget, 'scale'),
			bgTargetTranslateX = gsap.getProperty(bgTarget, 'x'),
			bgTargetTranslateY = gsap.getProperty(bgTarget, 'y'),
			targetTransform = $target.css('transform'),
			targetBorderRadius = $target.css('border-radius'),
			targetClippath = $clone.css('clip-path') === 'none' ? '' : 'circle(100% at center)';


		tl
			.setCurtain($curtain, {
				background
			})
			.set($clone, {
				maxWidth: '100%',
				maxHeight: '100%',
			})
			.add([
				gsap.to($bgClone, {
					scale: bgTargetScale,
					xPercent: bgTargetTranslateX,
					yPercent: bgTargetTranslateY,
					paddingBottom: 0,
					width: bgTargetProperties.width,
					height: bgTargetProperties.height,
					objectFit: bgTargetProperties.objectFit,
					objectPosition: bgTargetProperties.objectPosition,
					duration: 1.2,
					ease: 'expo.inOut',
					transition: 'none',
					top: 'auto',
					left: 'auto',
					right: 'auto',
					bottom: 'auto',
					autoRound: false
				}),
				gsap.to($clone, {
					transform: targetTransform,
					top,
					left,
					width,
					height,
					duration: 1.2,
					ease: 'expo.inOut',
					transition: 'none',
					borderRadius: targetBorderRadius,
					clipPath: targetClippath,
					autoRound: false,
					onComplete: () => {
						Scroll.scrollToTop();
					}
				}),
				gsap.effects.moveCurtain($curtain, {
					y: '0%',
					duration: 1.2
				}),
			])
			.to($nextContainer, {
				duration: 0.2,
				clearProps: 'all',
				autoAlpha: 1,
			}, '-=0.3')
			.setCurtain($curtain)
			.add(() => {
				resolve(true);
			})
			.totalDuration(duration);
	});
}

/*!========================================================================
	10. PJAX Clone Image
	======================================================================!*/
function PJAXCloneImage(target, customCoordinates) {
	return new Promise((resolve) => {
		if (!target.length) {
			resolve(true);
			return;
		}

		const
			tl = new gsap.timeline(),
			$clone = target.clone(),
			{
				top,
				left,
				width,
				height
			} = target.get(0).getBoundingClientRect();

		// Scroll.lock(true);
		$clone.addClass('clone').appendTo(window.$barbaWrapper);

		tl
			.set($clone, {
				delay: 0.1,
				transform: target.css('transform'),
				transformOrigin: 'center center',
				position: 'fixed',
				display: 'block',
				top: customCoordinates ? customCoordinates.top : top,
				left: customCoordinates ? customCoordinates.left : left,
				width: customCoordinates ? customCoordinates.width : width,
				height: customCoordinates ? customCoordinates.height : height,
				zIndex: 350
			})
			.set(target, {
				autoAlpha: 0
			})
			.add(() => {
				resolve(true);
			});
	});
}

/*!========================================================================
	11. PJAX Fallback Cloned Image
	======================================================================!*/
function PJAXFallbackClonedImage(data, duration = 1.2) {
	return new Promise((resolve) => {
		const
			tl = new gsap.timeline(),
			$currentContainer = $(data.current.container),
			$nextContainer = $(data.next.container),
			$curtain = $('#js-page-transition-curtain'),
			$nextMasthead = $nextContainer.find('.section-masthead'),
			background = $nextMasthead.attr('data-background-color'),
			$clone = $('.clone');

		tl
			.set($clone, {
				clearProps: 'transition'
			})
			.setCurtain($curtain, {
				background
			})
			.add([
				gsap.effects.moveCurtain($curtain, {
					y: '0%',
					duration: 1.2
				}),
				gsap.to($clone, {
					autoAlpha: 0,
					duration: 0.6,
					display: 'none'
				})
			])
			.set($nextContainer, {
				clearProps: 'all',
				autoAlpha: 1,
				zIndex: 300,
			})
			.set($currentContainer, {
				position: 'fixed',
				top: 0,
				left: 0,
				width: '100%',
				zIndex: '-1',
				autoAlpha: 0
			})
			.setCurtain($curtain)
			.add(() => resolve(true))
			.totalDuration(duration);
	})
}

/*!========================================================================
	12. PJAX Finish Loading
	======================================================================!*/
function PJAXFinishLoading(data) {
	return new Promise((resolve) => {
		const $transitionCurtains = $('#js-page-transition-curtain, #js-header-curtain-transition');

		// Clear transition curtains
		gsap.effects.setCurtain($transitionCurtains, {
			display: 'none',
		});

		// Transition ended event
		window.dispatchEvent(new CustomEvent('arts/barba/transition/end'));

		// Hide spinner
		if (typeof window.$spinner !== 'undefined' && window.$spinner.length) {
			gsap.to(window.$spinner, 0.6, {
				autoAlpha: 0
			});
		}

		// audio backgrounds
		if (typeof window.AudioBackground !== 'undefined') {

			if (window.AudioBackground.isAudioSrc()) {
				window.AudioBackground.controller.reveal(true);
			} else {
				window.AudioBackground.controller.reveal(false);
			}
		}

		// Re-init page header
		if (typeof window.theme.header !== 'undefined') {
			window.theme.header.run();
		}

		// re-enable ScrollMagic scenes
		window.SMController.enabled(true);
		window.SMController.update(true);

		setTimeout(() => {

			// remove cloned image if it exists
			$('.clone').remove();

			// unlock scroll
			Scroll.lock(false);

			window.$barbaWrapper.removeClass('cursor-progress');
			$('.menu').removeClass('menu_disabled');

		}, 100);

		// scroll to anchor from URL hash
		Scroll.scrollToAnchorFromHash(600);

		resolve(true);
	});
}

/*!========================================================================
	13. PJAX Init New Page
	======================================================================!*/
function PJAXInitNewPage(data) {
	return new Promise((resolve) => {
		const
			promises = [
				PJAXUpdateBody(data),
				PJAXUpdateNodes(data),
				PJAXUpdateHead(data)
			],
			$nextContainer = $(data.next.container);

		return Promise
			.all(promises)
			.then(() => document.fonts.ready)
			.then(() => SetText.splitText({
				target: $nextContainer.find('.js-split-text')
			}))
			.then(() => SetText.setLines({
				target: $nextContainer.find('.split-text[data-split-text-set="lines"]')
			}))
			.then(() => SetText.setWords({
				target: $nextContainer.find('.split-text[data-split-text-set="words"]')
			}))
			.then(() => SetText.setChars({
				target: $nextContainer.find('.split-text[data-split-text-set="chars"]')
			}))
			.then(() => {
				// re-init Contact Form 7
				if (typeof wpcf7 !== 'undefined') {
					wpcf7.initForm(jQuery('.wpcf7-form'));
				}

				// scroll at the page beginning
				Scroll.scrollToTop();

				// load images
				new LazyLoad({
					scope: $nextContainer,
					setPaddingBottom: true,
					run: true
				});

				// clear & re-init ScrollMagic
				window.SMController.destroy();
				window.SMController = null;
				window.SMController = new ScrollMagic.Controller();

				// Transition init new page event (before components init)
				window.dispatchEvent(new CustomEvent('arts/barba/transition/init/before'));

				// re-init components
				initComponents({
					scope: $nextContainer,
					container: $nextContainer,
					scrollToHashElement: false // will scroll to the anchors later once transition is fully finished
				});

				// don't start animations immediately
				window.SMController.enabled(false);

				// ensure that scroll is still locked
				Scroll.lock(true);

				// Transition init new page event (after components init)
				window.dispatchEvent(new CustomEvent('arts/barba/transition/init/after'));

				// update ad trackers
				PJAXUpdateTrackers();

				resolve(true);
			});
	});
}

/*!========================================================================
	14. PJAX Set Next Container
	======================================================================!*/
function PJAXSetNextContainer(data) {
	return new Promise((resolve) => {
		const
			$nextContainer = $(data.next.container),
			tl = new gsap.timeline();

		tl.add(() => {
				$nextContainer.find('.section-masthead .section-masthead__background').addClass('js-cancel-animation');
			})
			.set($nextContainer, {
				position: 'fixed',
				top: 0,
				left: 0,
				width: '100%',
				zIndex: 300,
				autoAlpha: 0
			})
			.add(() => {
				resolve(true);
			});
	});
}

/*!========================================================================
	15. PJAX Start Loading
	======================================================================!*/
function PJAXStartLoading(data) {
	return new Promise((resolve) => {
		// Transition started event
		window.dispatchEvent(new CustomEvent('arts/barba/transition/start'));

		window.$barbaWrapper.addClass('cursor-progress');
		$('.menu').addClass('menu_disabled');

		Scroll.lock(true);
		window.$document.off('click resize');
		window.$window.off('resize click orientationchange');

		if (typeof window.$spinner !== 'undefined' && window.$spinner.length) {
			gsap.to(window.$spinner, 0.6, {
				autoAlpha: 1
			});
		}

		resolve(true);
	});
}

/*!========================================================================
	16. PJAX Transition Flying Image
	======================================================================!*/
const PJAXTransitionFlyingImage = {
	name: 'flyingImage',

	custom: ({
		trigger
	}) => {
		return $(trigger).data('pjax-link') === 'flyingImage';
	},

	before: (data) => {
		return new Promise((resolve) => {
			PJAXStartLoading(data).then(() => resolve(true));
		});
	},

	beforeLeave: (data) => {
		return new Promise((resolve) => {
			const
				$currentContainer = $(data.current.container),
				$content = $currentContainer.find('.page-wrapper__content'),
				$trigger = $(data.trigger),
				isNavProjectsLink = $trigger.hasClass('section-nav-projects__link'),
				isListHoverLink = $trigger.hasClass('js-list-hover__link');

			let $image, delay;

			if (isNavProjectsLink) {
				$image = $currentContainer.find('.section-nav-projects .js-transition-img');
				delay = 0;
			} else {
				$image = $trigger.find('.js-transition-img');
				delay = 150;
			}

			if (isListHoverLink) {
				$image = $trigger.find('.js-transition-img');

				PJAXCloneImage($image, $trigger.data('coordinates')).then(() => {
					gsap.to($content, {
						duration: 0.3,
						autoAlpha: 0,
						onComplete: () => {
							resolve(true);
						}
					});
				});

			} else {
				setTimeout(() => {
					PJAXCloneImage($image).then(() => {
						gsap.to($content, {
							duration: 0.3,
							autoAlpha: 0,
							onComplete: () => {
								resolve(true);
							}
						});
					});
				}, delay);
			}
		});
	},

	beforeEnter: (data) => {
		return new Promise((resolve) => {
			PJAXSetNextContainer(data).then(() => resolve(true));
		});
	},

	enter: (data) => {
		return new Promise((resolve) => {
			PJAXInitNewPage(data).then(() => resolve(true));
		});
	},

	afterEnter: (data) => {
		return new Promise((resolve) => {
			PJAXAnimateClonedImage(data).then(
				() => resolve(true),
				() => {
					PJAXFallbackClonedImage(data).then(() => resolve(true));
				}
			)
		});
	},

	after: (data) => {
		return new Promise((resolve) => {
			PJAXFinishLoading(data).then(() => resolve(true));
		});
	}
}

/*!========================================================================
	17. PJAX Transition Fullscreen Slider
	======================================================================!*/
const PJAXTransitionFullscreenSlider = {
	name: 'fullscreenSlider',

	custom: ({
		trigger
	}) => {
		return $(trigger).data('pjax-link') === 'fullscreenSlider';
	},

	before: (data) => {
		return new Promise((resolve) => {
			PJAXStartLoading(data).then(() => resolve(true));
		});
	},

	beforeLeave: (data) => {
		return new Promise((resolve) => {
			const
				tl = new gsap.timeline(),
				$currentContainer = $(data.current.container),
				$content = $currentContainer.find('.page-wrapper__content'),
				$trigger = $(data.trigger),
				$slider = $trigger.closest('.js-slider'),
				$image = $slider.find('.swiper-slide-active .js-transition-img'),
				$bg = $image.find('.slider__bg'),
				imageSrc = $bg.attr('data-texture-src');

			if (imageSrc) {
				tl
					.set($bg, {
						backgroundImage: `url(${imageSrc})`
					})
					.add(() => {
						PJAXCloneImage($image).then(() => {
							gsap.to($content, {
								duration: 0.3,
								autoAlpha: 0,
								onComplete: () => {
									resolve(true);
								}
							});
						});
					});
			} else {
				PJAXCloneImage($image).then(() => {
					gsap.to($content, {
						duration: 0.3,
						autoAlpha: 0,
						onComplete: () => {
							resolve(true);
						}
					});
				});
			}
		});
	},

	beforeEnter: (data) => {
		return new Promise((resolve) => {
			PJAXSetNextContainer(data).then(() => resolve(true));
		});
	},

	enter: (data) => {
		return new Promise((resolve) => {
			PJAXInitNewPage(data).then(() => resolve(true));
		});
	},

	afterEnter: (data) => {
		return new Promise((resolve) => {
			PJAXAnimateClonedImage(data).then(
				() => resolve(true),
				() => {
					PJAXFallbackClonedImage(data).then(() => resolve(true));
				}
			)
		});
	},

	after: (data) => {
		return new Promise((resolve) => {
			PJAXFinishLoading(data).then(() => resolve(true));
		});
	}
}

/*!========================================================================
	18. PJAX Transition General
	======================================================================!*/
const PJAXTransitionGeneral = {
	before: (data) => {
		return new Promise((resolve) => {
			PJAXStartLoading(data).then(() => resolve(true));
		});
	},

	beforeLeave: (data) => {
		return new Promise((resolve) => {
			const tl = new gsap.timeline();

			tl
				.setCurtain()
				.add(() => {
					resolve(true)
				})
		});
	},

	beforeEnter: (data) => {
		return new Promise((resolve) => {
			const $nextContainer = $(data.next.container);

			$nextContainer.find('.section-masthead .section-masthead__background').addClass('js-cancel-animation');
			resolve(true)
		});
	},

	enter: (data) => {
		return new Promise((resolve) => {
			PJAXInitNewPage(data).then(() => resolve(true));
		});
	},

	beforeEnter: (data) => {
		return new Promise((resolve) => {
			const
				tl = new gsap.timeline(),
				$nextContainer = $(data.next.container),
				$curtain = $('#js-page-transition-curtain'),
				$nextMasthead = $nextContainer.find('.section-masthead'),
				background = $nextMasthead.attr('data-background-color');

			tl
				.setCurtain($curtain, {
					background
				})
				.moveCurtain($curtain, {
					y: '0%',
					duration: 1.2
				})
				.setCurtain($curtain)
				.set($nextContainer, {
					clearProps: 'all',
					autoAlpha: 1,
				})
				.add(() => {
					resolve(true);
				});

		});
	},

	after: (data) => {
		return new Promise((resolve) => {
			PJAXFinishLoading(data).then(() => resolve(true));
		});
	}
}

/*!========================================================================
	19. PJAX Transition List Hover
	======================================================================!*/
const PJAXTransitionListHover = {
	name: 'listHover',

	custom: ({
		trigger
	}) => {
		return $(trigger).data('pjax-link') === 'listHover';
	},

	before: (data) => {
		return new Promise((resolve) => {
			PJAXStartLoading(data).then(() => resolve(true));
		});
	},

	beforeLeave: (data) => {
		return new Promise((resolve) => {
			const
				$currentContainer = $(data.current.container),
				$content = $currentContainer.find('.page-wrapper__content'),
				$trigger = $(data.trigger),
				$image = $trigger.find('.js-transition-img');

			let coordinates;
			if (!$image.is(':visible')) {
				coordinates = $trigger.data('coordinates');
			}

			PJAXCloneImage($image, coordinates).then(() => {
				gsap.to($content, {
					duration: 0.3,
					autoAlpha: 0,
					onComplete: () => resolve(true)
				});
			});
		});
	},

	beforeEnter: (data) => {
		return new Promise((resolve) => {
			PJAXSetNextContainer(data).then(() => resolve(true));
		});
	},

	enter: (data) => {
		return new Promise((resolve) => {
			PJAXInitNewPage(data).then(() => resolve(true));
		});
	},

	afterEnter: (data) => {
		return new Promise((resolve) => {
			PJAXAnimateClonedImage(data).then(
				() => resolve(true),
				() => {
					PJAXFallbackClonedImage(data).then(() => resolve(true));
				}
			)
		});
	},

	after: (data) => {
		return new Promise((resolve) => {
			PJAXFinishLoading(data).then(() => resolve(true));
		});
	}
}

/*!========================================================================
	20. PJAX Transition Overlay Menu
	======================================================================!*/
const PJAXTransitionOverlayMenu = {
	name: 'overlayMenu',

	custom: ({
		trigger
	}) => {
		return window.theme.header.isOverlayOpened() || $(trigger).data('pjax-link') === 'overlayMenu';
	},

	before: (data) => {
		return new Promise((resolve) => {
			PJAXStartLoading(data).then(() => {
				resolve(true);
			});
		});
	},

	enter: (data) => {
		return new Promise((resolve) => {
			PJAXInitNewPage(data).then(() => {
				resolve(true);
			});
		});
	},

	afterEnter: (data) => {
		return new Promise((resolve) => {
			const
				tl = new gsap.timeline(),
				$currentContainer = $(data.current.container),
				$nextContainer = $(data.next.container),
				$curtain = $('#js-header-curtain-transition'),
				closeTl = window.theme.header.closeMenuTransition(true),
				$nextMasthead = $nextContainer.find('.section-masthead'),
				background = $nextMasthead.attr('data-background-color');

			window.theme.header.setBurger();

			tl
				.set([$nextContainer, $currentContainer], {
					autoAlpha: 0,
				})
				.setCurtain($curtain, {
					background
				})
				.moveCurtain($curtain, {
					duration: 1.2,
					y: '0%',
					curve: 'top',
				})
				.add(closeTl, '-=0.8')
				.setCurtain($curtain)
				.set($nextContainer, {
					clearProps: 'all',
					autoAlpha: 1,
				})
				.add(() => {
					resolve(true);
				});

		});
	},

	after: (data) => {
		return new Promise((resolve) => {
			PJAXFinishLoading(data).then(() => {
				resolve(true);
			});
		});
	}
}

/*!========================================================================
	21. PJAX Update Body
	======================================================================!*/
function PJAXUpdateBody(data) {
	return new Promise((resolve) => {
		const
			regexp = /\<body.*\sclass=["'](.+?)["'].*\>/gi,
			match = regexp.exec(data.next.html);

		if (!match || !match[1]) {
			resolve(true);
			return;
		}

		document.body.setAttribute('class', match[1]);
		resolve(true);
	});
}

/*!========================================================================
	22. PJAX Update Head
	======================================================================!*/
function PJAXUpdateHead(data) {
	return new Promise((resolve) => {
		const
			head = document.head,
			newPageRawHead = data.next.html.match(/<head[^>]*>([\s\S.]*)<\/head>/i)[0],
			newPageHead = document.createElement('head');

		newPageHead.innerHTML = newPageRawHead;

		const headTags = [
			'meta[name="keywords"]',
			'meta[name="description"]',
			'meta[property^="og"]',
			'meta[name^="twitter"]',
			'meta[itemprop]',
			'link[itemprop]',
			'link[rel="prev"]',
			'link[rel="next"]',
			'link[rel="canonical"]',
			'link[rel="alternate"]',
			'link[rel="shortlink"]',
			'link[id*="elementor"]',
			'link[id*="eael"]', // Essential Addons plugin post CSS
			'style[id*="elementor"]',
			'style[id*="eael"]', // Essential Addons plugin inline CSS
		].join(',');

		const
			oldHeadTags = head.querySelectorAll(headTags),
			newHeadTags = newPageHead.querySelectorAll(headTags),
			newStylesLoaded = [];

		let pageStyles = document.querySelectorAll('link[rel="stylesheet"]');

		// flag all current page styles as loaded
		for (let i = 0; i < pageStyles.length; i++) {
			pageStyles[i].isLoaded = true;
		}

		// append new and remove old tags
		for (let i = 0; i < newHeadTags.length; i++) {
			if (typeof oldHeadTags[i] !== 'undefined') {
				head.insertBefore(newHeadTags[i], oldHeadTags[i].nextElementSibling);
				head.removeChild(oldHeadTags[i]);
			} else {
				head.insertBefore(newHeadTags[i], newHeadTags[i - 1]);
			}
		}

		// page now has new styles
		pageStyles = document.querySelectorAll('link[rel="stylesheet"]');

		// listen for 'load' only on elements which are not loaded yet
		for (let i = 0; i < pageStyles.length; i++) {
			if (!pageStyles[i].isLoaded) {
				const promise = new Promise((resolve) => {
					pageStyles[i].addEventListener('load', () => {
						resolve(true);
					});
				});

				newStylesLoaded.push(promise);
			}
		}

		// load all new page styles
		Promise.all(newStylesLoaded).then(() => {
			resolve(true);
		});
	});
}

/*!========================================================================
	23. PJAX Update Nodes
	======================================================================!*/
function PJAXUpdateNodes(data) {
	return new Promise((resolve) => {
		const
			$nextContainer = $($.parseHTML(data.next.html)),
			nodesToUpdate = [
				'#page-header',
				'#page-footer',
				'#js-audio-background__options',
				'#js-page-transition-curtain',
				'#page-header .menu li',
				'#page-header .menu-overlay li'
			]; // selectors of elements that needed to update

		$.each(nodesToUpdate, function () {
			const
				$item = $(this),
				$nextItem = $nextContainer.find(this);

			// sync attributes if element exist in the new container
			if ($nextItem.length) {
				syncAttributes($nextItem, $item);
			}
		});

		resolve(true);
	});
}

/*!========================================================================
	24. PJAX Update Trackers
	======================================================================!*/
function PJAXUpdateTrackers() {
	updateGA();
	updateFBPixel();
	updateYaMetrika();

	/**
	 * Google Analytics
	 */
	function updateGA() {
		if (typeof gtag === 'function' && typeof window.gaData === 'object' && Object.keys(window.gaData)[0] !== 'undefined') {
			const
				trackingID = Object.keys(window.gaData)[0],
				pageRelativePath = (window.location.href).replace(window.location.origin, '');

			gtag('js', new Date());
			gtag('config', trackingID, {
				'page_title': document.title,
				'page_path': pageRelativePath
			});
		}
	}

	/**
	 * Facebook Pixel
	 */
	function updateFBPixel() {
		if (typeof fbq === 'function') {
			fbq('track', 'PageView');
		}
	}

	/**
	 * Yandex Metrika
	 */
	function updateYaMetrika() {
		if (typeof ym === 'function') {
			const trackingID = getYmTrackingNumber();

			ym(trackingID, 'hit', window.location.href, {
				title: document.title
			});
		}
	}

	function getYmTrackingNumber() {
		if (typeof window.Ya !== 'undefined' && typeof window.Ya.Metrika2) {
			return window.Ya.Metrika2.counters()[0].id || null;
		}

		if (typeof window.Ya !== 'undefined' && typeof window.Ya.Metrika) {
			return window.Ya.Metrika.counters()[0].id || null;
		}

		return null;
	}
}

/*!========================================================================
	25. PJAX
	======================================================================!*/
class PJAX extends BaseComponent {
	constructor({
		target,
		scope
	}) {
		super({
			target,
			scope
		});
	}

	run() {
		barba.init({
			sync: true,
			timeout: 10000,
			cacheIgnore: window.Modernizr.touchevents ? true : false, // don't grow cache on mobiles
			// don't trigger barba for links outside wrapper 
			prevent: ({
				el
			}) => {

				const
					$el = $(el),
					url = $el.attr('href'),
					exludeRules = [
						'.no-ajax',
						'.no-ajax a',
						'[data-elementor-open-lightbox]', // Elementor lightbox gallery
						'[data-elementor-lightbox-slideshow]', // Elementor Pro Gallery
						'.lang-switcher a', // Polylang & WPML language switcher
						'.js-gallery a', // any links in the template galleries
						'.js-album' // albums links
					];

				// page anchor
				if ($el.is('[href*="#"]') && window.location.href === url.substring(0, url.indexOf('#'))) {
					return true;
				}

				// page anchor
				if ($el.is('[href^="#"]')) {
					return true;
				}

				// elementor preview
				if (typeof elementor === 'object') {
					return true;
				}

				// clicked on elementor outside barba wrapper
				if ($el.closest(window.$barbaWrapper).length < 1) {
					return true;
				}

				// custom rules from WordPress Customizer
				if (window.theme.ajax.preventRules) {
					exludeRules.push(window.theme.ajax.preventRules);
				}

				// check against array of rules to prevent
				return $el.is(exludeRules.join(','));

			},
			// custom transitions
			transitions: [
				PJAXTransitionGeneral,
				PJAXTransitionFlyingImage,
				PJAXTransitionOverlayMenu,
				PJAXTransitionFullscreenSlider,
				PJAXTransitionListHover
			],

		});
	}

	static getNextPageElement({
		url,
		element
	}) {
		return new Promise((resolve) => {
			barba
				.request(url)
				.then((res) => {
					resolve($($.parseHTML(res)).find(element));
				});
		});
	}
}

/*!========================================================================
	26. Arrow
	======================================================================!*/
class Arrow extends BaseComponent {
	constructor({
		scope,
		target
	}) {
		super({
			target,
			scope
		});

	}

	run() {
		this._bindEvents();
	}

	set() {
		this.$circles = this.$target.find('.circle');
		this.initialSVGPath = '10% 90%';

		gsap.set(this.$circles, {
			clearProps: 'all',
		});

		gsap.set(this.$circles, {
			rotation: 180,
			drawSVG: this.initialSVGPath,
			transformOrigin: 'center center',
		});
	}

	_bindEvents() {
		const
			$circle = this.$el.find(this.$circles),
			tl = new gsap.timeline();

		this.$el
			.on('mouseenter touchstart', () => {
				tl
					.clear()
					.to($circle, {
						duration: 0.3,
						drawSVG: '0% 100%',
						rotation: 180,
						transformOrigin: 'center center'
					});
			})
			.on('mouseleave touchend', () => {
				tl
					.clear()
					.to($circle, {
						duration: 0.3,
						drawSVG: this.initialSVGPath,
						rotation: 180,
						transformOrigin: 'center center'
					});
			});
	}
}

/*!========================================================================
	27. Aside Counters
	======================================================================!*/
class AsideCounters extends BaseComponent {
	constructor({
		scope,
		target
	}) {
		super({
			scope,
			target
		});
	}

	run() {
		const
			self = this,
			$counters = this.$target.find('.js-counter');

		if (!$counters.length) {
			return false;
		}

		$counters.each(function () {
			new Counter({
				scope: self.scope,
				target: $(this)
			});
		});
	}
}

/*!========================================================================
	28. Change Text Hover
	======================================================================!*/
class ChangeTextHover extends BaseComponent {
	constructor({
		target,
		scope,
		pageIndicator,
		triggers,
		options
	}) {
		super({
			target,
			scope
		});

		this.options = options || {
			duration: 0.4,
			ease: 'power4.out'
		};
		this.$pageIndicator = pageIndicator;
		this.$triggers = triggers;
		this._bindEvents();

		if (this.$pageIndicator.length) {
			this._bindEventsHoverIndicator();
		}
	}

	_bindEvents() {
		const self = this;

		this.$target
			.on('mouseenter touchstart', function () {
				const
					$el = $(this),
					$normalText = $el.find('.js-change-text-hover__normal'),
					$hoverText = $el.find('.js-change-text-hover__hover'),
					$hoverLine = $el.find('.js-change-text-hover__line');

				self._getTimelineShowHover({
					normal: $normalText,
					hover: $hoverText,
					line: $hoverLine
				});
			})
			.on('mouseleave touchend', function () {
				const
					$el = $(this),
					$normalText = $el.find('.js-change-text-hover__normal'),
					$hoverText = $el.find('.js-change-text-hover__hover'),
					$hoverLine = $el.find('.js-change-text-hover__line');

				self._getTimelineHideHover({
					normal: $normalText,
					hover: $hoverText,
					line: $hoverLine
				});
			});
	}

	_bindEventsHoverIndicator() {
		const
			$normalText = this.$pageIndicator.find('.js-change-text-hover__normal'),
			$hoverText = this.$pageIndicator.find('.js-change-text-hover__hover'),
			$hoverLine = this.$pageIndicator.find('.js-change-text-hover__line');

		this.$triggers
			.on('mouseenter touchstart', () => {
				this._getTimelineShowHover({
					normal: $normalText,
					hover: $hoverText,
					line: $hoverLine
				});
			})
			.on('mouseleave touchend', () => {
				this._getTimelineHideHover({
					normal: $normalText,
					hover: $hoverText,
					line: $hoverLine
				});
			});

		// initial set
		this._getTimelineHideHover({
			normal: $normalText,
			hover: $hoverText,
			line: $hoverLine
		});
	}

	_getTimelineShowHover({
		normal,
		hover,
		line
	}) {
		return new gsap.timeline({
				delay: 0.02
			})
			.hideLines(hover, {
				y: '100%',
				duration: 0,
				stagger: 0
			})
			.add([
				gsap.effects.animateLines(hover, {
					ease: this.options.ease,
					duration: this.options.duration,
					stagger: 0
				}),
				gsap.effects.hideLines(normal, {
					y: '-100%',
					ease: this.options.ease,
					duration: this.options.duration,
					stagger: 0
				}),
				gsap.to(line, {
					ease: this.options.ease,
					scaleX: 1,
					transformOrigin: 'left center',
					duration: this.options.duration
				})
			]);
	}

	_getTimelineHideHover({
		normal,
		hover,
		line
	}) {
		return new gsap.timeline({
				delay: 0.02
			})
			.hideLines(normal, {
				y: '100%',
				duration: 0,
				stagger: 0
			})
			.add([
				gsap.effects.animateLines(normal, {
					ease: this.options.ease,
					duration: this.options.duration,
					stagger: 0
				}),
				gsap.effects.hideLines(hover, {
					y: '-100%',
					ease: this.options.ease,
					duration: this.options.duration,
					stagger: 0
				}),
				gsap.to(line, {
					ease: this.options.ease,
					scaleX: 0,
					transformOrigin: 'right center',
					duration: this.options.duration
				})
			]);
	}
}

/*!========================================================================
	29. Circle Button
	======================================================================!*/
class CircleButton extends ScrollAnimation {
	constructor({
		target,
		scope
	}) {
		super({
			target,
			scope
		});

	}

	set() {
		this.$arcText = this.$el.find('.circle-button__label');
		this.$arcWrapper = this.$el.find('.circle-button__wrapper-label');
		this.arcTextElement = this.$arcText.get(0);
	}

	run() {
		if (this._hasAnimationScene(this.$el)) {
			this._createScene({
				element: this.$el,
				timeline: this._getSceneTimeline(),
				duration: window.innerHeight,
				reverse: true
			});
		}

		this.instance = this._createArcText();
		this.$el.addClass('js-circle-button_curved');
		this._setRadius();
		this._bindEvents();
	}

	_createArcText() {
		return new CircleType(this.arcTextElement);
	}

	_setRadius() {
		this.instance.radius(this.arcTextElement.offsetWidth / 2);
	}

	_bindEvents() {
		window.$window.on('resize', debounce(() => {
			this._setRadius();
		}, 250));
	}

	_getSceneTimeline() {
		return new gsap.timeline().fromTo(this.$arcWrapper, {
			rotation: 0,
			transformOrigin: 'center center'
		}, {
			duration: 1,
			rotation: 360,
		});
	}
}

/*!========================================================================
	30. Counter
	======================================================================!*/
class Counter extends ScrollAnimation {
	constructor(options) {
		super(options);
		this.$num = this.$target.find('.js-counter__number');
		this.start = this.$target.data('counter-start') || 0;
		this.target = this.$target.data('counter-target') || 100;
		this.digits = this.target.toString().length;
		this.duration = this.$target.data('counter-duration') || 4;
		this.prefix = this.$target.data('counter-prefix') || '';
		this.suffix = this.$target.data('counter-suffix') || '';
		this.counter = {
			val: this.numberStart
		};
		this.prepare();
		this.animate();
	}

	prepare() {
		let value = parseFloat(this.start).toFixed(0);

		value = this.prefix + this._addZeros(value) + this.suffix;
		this.$num.text(value);
	}

	animate() {
		const tl = new gsap.timeline();
		let value;

		tl.to(this.counter, {
			duration: this.duration,
			val: parseFloat(this.target).toFixed(0),
			ease: 'power4.out',
			onUpdate: () => {
				value = parseFloat(this.counter.val).toFixed(0);
				value = this._addZeros(value);
				this.$num.text(this.prefix + value + this.suffix);
			}
		});

		this._createScene({
			element: this.$target,
			timeline: tl
		});
	}

	_addZeros(value) {
		while (value.toString().length < this.digits) {
			value = '0' + value;
		}

		return value;
	}
}

/*!========================================================================
	31. Cursor
	======================================================================!*/
class Cursor extends BaseComponent {
	constructor({
		scope,
		target,
		hideCursorNative = false,
		cursorElements,
		highlightElements,
		highlightScale = 1.3,
		magneticElements,
		magneticScale = 1,
		magneticScaleCursorBy = 'element',
		factorTrailing = 4,
		animDuration = 0.2,
		distanceArrows = 45,
	}) {
		super({
			target,
			scope
		});

		this.timeline = new gsap.timeline();
		this.timelineArrows = new gsap.timeline();
		this.$follower = this.$target.find('.cursor__follower');
		this.$inner = this.$target.find('#inner');
		this.$outer = this.$target.find('#outer');
		this.$arrowUp = this.$target.find('.cursor__arrow_up');
		this.$arrowDown = this.$target.find('.cursor__arrow_down');
		this.$arrowLeft = this.$target.find('.cursor__arrow_left');
		this.$arrowRight = this.$target.find('.cursor__arrow_right');
		this.$label = this.$target.find('.cursor__label');
		this.$icon = this.$target.find('.cursor__icon');
		this.offsetTop = parseInt(window.$html.css('marginTop'), 10);
		this.animDuration = animDuration;
		this.mouseX = window.mouseX || 0;
		this.mouseY = window.mouseY || 0;
		this.magneticX = 0;
		this.magneticY = 0;
		this.scale = 1;
		this.posX = 0;
		this.posY = 0;
		this.cursorCenterX = parseFloat(this.$target.innerWidth() / 2);
		this.cursorCenterY = parseFloat(this.$target.innerHeight() / 2);
		this.isFirstMove = true;
		this.cursorElements = cursorElements;
		this.highlightElements = highlightElements;
		this.highlightScale = highlightScale;
		this.magneticElements = magneticElements;
		this.$magneticElements = $(magneticElements);
		this.magneticScale = magneticScale;
		this.magneticScaleCursorBy = magneticScaleCursorBy;
		this.factorTrailing = factorTrailing;
		this.labels = window.theme.cursorFollower.labels;
		this.distanceArrows = distanceArrows;
		this.hideCursorNative = hideCursorNative;
		this.strokeColor = this.$inner.css('stroke');

		this._bindEvents();
	}

	set() {
		gsap.set(this.$target, {
			display: 'block',
		});
		gsap.to(this.$target, {
			duration: 0.6,
			scale: 1,
			autoAlpha: 1,
			xPercent: 0,
			yPercent: 0,
		});
	}

	run() {
		gsap.to({}, {
			duration: 0.01,
			repeat: -1,
			onRepeat: () => {
				const trailing = this.isFirstMove ? 1 : this.factorTrailing;
				this.posX += (this.mouseX - this.posX) / trailing;
				this.posY += (this.mouseY - this.posY - this.offsetTop) / trailing;

				gsap.set(this.$target, {
					xPercent: 0,
					yPercent: 0,
					x: this.posX - this.cursorCenterX,
					y: this.posY + this.offsetTop - this.cursorCenterY,
					repeat: -1,
				});
				this.isFirstMove = false;
			}
		});
	}

	_scaleCursor() {
		gsap.to(this.$follower, {
			duration: this.animDuration,
			scale: this.scale,
			overwrite: 'all'
		});
	}

	_highlightCursor(highlight = true) {
		gsap.to(this.$inner, {
			duration: this.animDuration,
			fill: highlight ? this.strokeColor : '',
			opacity: highlight ? 0.4 : '',
			overwrite: 'all'
		});
	}

	_bindEvents() {
		const self = this;

		this.$scope.off('mousemove mouseenter mouseleave')
			.on('mousemove', (e) => {
				this.mouseX = this.magneticX || e.clientX;
				this.mouseY = this.magneticY || e.clientY;
			})
			// slider dots
			.on('mouseenter', '.slider__dot', () => {
				this.setCursor({
					hide: true
				});
			})
			.on('mouseleave', '.slider__dot', (e) => {
				this.setCursor({
					hide: false
				});
				this.scale = 1;
				this._scaleCursor();
				this._resetMagnifiedElement($(e.currentTarget));
			})
			.on('mousemove', '.slider__dot', (e) => {
				const $target = $(e.currentTarget);

				this.scale = 0.5;
				this._scaleCursor();
				this._magnifyElement({
					element: $target,
					event: e,
					distance: self.magneticDistance,
					scaleBy: self.magneticScaleCursorBy,
					scale: 0.5,
				});
			})
			// social links
			.on('mouseenter', '.social__item', () => {
				this.setCursor({
					hide: true
				});
			})
			.on('mouseleave', '.social__item', (e) => {
				this.setCursor({
					hide: false
				});
				this.scale = 1;
				this._scaleCursor();
				this._resetMagnifiedElement($(e.currentTarget));
			})
			.on('mousemove', '.social__item', (e) => {
				const $target = $(e.currentTarget);

				this.scale = 0.8;
				this._scaleCursor();
				this._magnifyElement({
					element: $target,
					event: e,
					distance: self.magneticDistance,
					scaleBy: self.magneticScaleCursorBy,
					scale: 0.8,
				});
			})
			// PSWP gallery
			.on('mousemove', '.pswp--zoomed-in .pswp__img', (e) => {
				this.setCursor({
					hide: false
				});
				this._setIcon({
					icon: '',
					hide: true
				});
				this.scale = 1.0;
				this._scaleCursor();
			})
			.on('mousemove', '.pswp--dragging .pswp__img', (e) => {
				this.scale = 1.0;
				this._scaleCursor();
			})
			// cursor elements
			.on('mouseenter', self.cursorElements, (e) => {
				const $target = $(e.currentTarget);

				this.setCursor({
					hide: $target.data('arts-cursor-hide-native') || self.hideCursorNative
				});
				this._setLabel({
					label: $target.data('arts-cursor-label') || ''
				});
				this._setIcon({
					icon: $target.data('arts-cursor-icon') || ''
				});
				this._hideArrows();
				this.scale = parseFloat($target.data('arts-cursor-scale'));
				this._scaleCursor();
			})
			.on('mouseleave', self.cursorElements, () => {
				this.setCursor({
					hide: false
				});
				this._setLabel({
					label: '',
					hide: true
				});
				this._setIcon({
					icon: '',
					hide: true
				});
				this.scale = 1;
				this._scaleCursor();
			})
			// highlight elements
			.on('mouseenter', self.highlightElements, (e) => {
				this.scale = parseFloat(this.highlightScale);
				this._highlightCursor(true);
				this._scaleCursor();
			})
			.on('mouseleave', self.highlightElements, (e) => {
				this.scale = 1;
				this._highlightCursor(false);
				this._scaleCursor();
			})
			// magnetic elements
			.on('mousemove', self.magneticElements, (e) => {
				const $target = $(e.currentTarget);

				this._magnifyElement({
					element: $target,
					event: e,
					distance: self.magneticDistance,
					scaleBy: self.magneticScaleCursorBy,
					scale: parseFloat($target.data('arts-cursor-scale')) || this.magneticScale,
				});
			})
			.on('mouseleave', self.magneticElements, (e) => {
				this._resetMagnifiedElement($(e.currentTarget));
			})
			// slider dragging
			.on('arts/slider/touchDown', (e) => {
				this.setCursor({
					hide: true
				});
				this._setLabel({
					label: this.labels.slider
				});
				this._setIcon({
					icon: '',
					hide: true
				});
				this._revealArrows(e.detail);
				this.scale = 1.6;
				this._scaleCursor();
			})
			.on('arts/slider/touchUp', () => {
				this.setCursor({
					hide: false
				});
				this._setLabel({
					label: this.labels.slider,
					hide: true
				});
				this._setIcon({
					icon: '',
					hide: true
				});
				this._hideArrows();
				this.scale = 1;
				this._scaleCursor();
			})
			// pswp gallery pan
			.on('arts/pswp/touchDown', (e) => {
				this.setCursor({
					hide: false
				});
				this._setLabel({
					label: ''
				});
				this._setIcon({
					icon: '',
					hide: true
				});
				this._revealArrows(e.detail);
				this.scale = 1.0;
				this._scaleCursor();
			})
			.on('arts/pswp/touchUp arts/pswp/close', () => {
				this.setCursor({
					hide: false
				});
				this._setLabel({
					label: '',
					hide: true
				});
				this._setIcon({
					icon: '',
					hide: true
				});
				this._hideArrows();
				this.scale = 1;
				this._scaleCursor();
			})
			.on('arts/pswp/slideChange', (e) => {
				this._setLabel({
					label: '',
					hide: true
				});
				this._setIcon({
					icon: '',
					hide: true
				});
				this._hideArrows();
			});

		// reset cursor after AJAX transition
		window.$window
			.on('arts/barba/transition/end', () => {
				this.setCursor({
					hide: false
				});
				this._setLabel({
					label: '',
					hide: true
				});
				this._setIcon({
					icon: '',
					hide: true
				});
				this._hideArrows();
				this.scale = 1;
				this._scaleCursor();
				this._highlightCursor(false);
			});
	}

	_setLabel({
		label = '',
		hide = false
	}) {
		this.$label.html(label);
		if (hide === true) {
			gsap.to(this.$label, {
				duration: this.animDuration,
				autoAlpha: 0,
				y: -20,
			});
		} else {
			gsap.to(this.$label, {
				duration: this.animDuration,
				autoAlpha: 1,
				y: 0,
			});
		}
	}

	_setIcon({
		icon = '',
		hide = false
	}) {
		this.$icon.html(icon);
		if (hide === true) {
			gsap.to(this.$icon, {
				duration: this.animDuration,
				autoAlpha: 0,
				y: -20,
			});
		} else {
			gsap.to(this.$icon, {
				duration: this.animDuration,
				autoAlpha: 1,
				y: 0,
			});
		}
	}

	_revealArrows({
		direction = 'horizontal'
	}) {
		if (direction === 'horizontal') {
			this.timelineArrows
				.clear()
				.add([
					gsap.to(this.$arrowLeft, {
						duration: this.animDuration,
						autoAlpha: 1,
						x: -this.distanceArrows
					}),
					gsap.to(this.$arrowRight, {
						duration: this.animDuration,
						autoAlpha: 1,
						x: this.distanceArrows
					})
				]);
		}
		if (direction === 'vertical') {
			this.timelineArrows
				.clear()
				.add([
					gsap.to(this.$arrowUp, {
						duration: this.animDuration,
						autoAlpha: 1,
						y: -this.distanceArrows
					}),
					gsap.to(this.$arrowDown, {
						duration: this.animDuration,
						autoAlpha: 1,
						y: this.distanceArrows
					})
				]);
		}

		if (direction === 'all') {
			this.timelineArrows
				.clear()
				.add([
					gsap.to(this.$arrowUp, {
						duration: this.animDuration,
						autoAlpha: 1,
						y: -this.distanceArrows / 2
					}),
					gsap.to(this.$arrowDown, {
						duration: this.animDuration,
						autoAlpha: 1,
						y: this.distanceArrows / 2
					}),
					gsap.to(this.$arrowLeft, {
						duration: this.animDuration,
						autoAlpha: 1,
						x: -this.distanceArrows / 2
					}),
					gsap.to(this.$arrowRight, {
						duration: this.animDuration,
						autoAlpha: 1,
						x: this.distanceArrows / 2
					})
				]);
		}
	}

	_hideArrows() {
		this.timelineArrows
			.clear()
			.to([this.$arrowUp, this.$arrowDown, this.$arrowLeft, this.$arrowRight], {
				duration: this.animDuration,
				autoAlpha: 0,
				x: 0,
				y: 0
			});
	}

	_calcDistance({
		centerX,
		centerY,
		mouseX,
		mouseY
	}) {
		return Math.floor(
			Math.sqrt(
				Math.pow(mouseX - centerX, 2) + Math.pow(mouseY - centerY, 2)
			)
		);
	}

	_resetMagnifiedElement(element) {
		this.magneticX = 0;
		this.magneticY = 0;

		if (element && element.length) {
			gsap.to(element, {
				duration: 0.4,
				y: 0,
				x: 0
			});
		}
	}

	_magnifyElement({
		element,
		event,
		distance,
		scale,
		scaleBy,
	}) {

		const {
			top,
			left,
			width,
			height
		} = element.get(0).getBoundingClientRect(),
			centerX = left + width / 2,
			centerY = top + height / 2,
			deltaX = Math.floor((centerX - event.clientX)) * -.5,
			deltaY = Math.floor((centerY - event.clientY)) * -.5;

		this.magneticX = centerX;
		this.magneticY = centerY;
		this.scale = scaleBy === 'element' ? Math.max(width, height) / this.cursorCenterX * scale : scaleBy * scale;

		gsap.to(element, {
			duration: 0.2,
			y: deltaY,
			x: deltaX,
			overwrite: 'all'
		});
	}

	setCursor({
		hide = false,
		loading = false
	}) {
		if (hide === true && !window.$body.hasClass('cursor-none')) {
			window.$body.addClass('cursor-none');
		} else {
			window.$body.removeClass('cursor-none');
		}

		if (loading === true && !window.$body.hasClass('cursor-progress')) {
			window.$body.addClass('cursor-progress');
		} else {
			window.$body.removeClass('cursor-progress');
		}
	}
}

/*!========================================================================
	32. Effect Distortion
	======================================================================!*/
class EffectDistortion extends BaseGLAnimation {
	constructor({
		slider,
		canvas,
		aspect = 1.5,
		displacementImage,
		items,
	}) {
		super({
			canvas,
			aspect
		});

		this.aspect = aspect;
		this.canvas = canvas;
		this.dispImage = displacementImage;
		this.items = items;
		this.slider = slider;
		this.textures = [];
		this.timeline = new gsap.timeline();

		this.disp = this.loader.load(this.dispImage);
		this.disp.wrapS = this.disp.wrapT = THREE.RepeatWrapping;

		this.scene = this._getScene();
		this.viewport = this._getViewport();
		this.camera = this._getCamera();

		this.uniforms = {
			effectFactor: {
				type: "f",
			},
			dispFactor: {
				type: "f",
				value: 0.0
			},
			texture: {
				type: "t",
				value: this.items[0].texture
			},
			texture2: {
				type: "t",
				value: this.items[1].texture
			},
			disp: {
				type: "t",
				value: this.disp
			}
		};
		this.geometry = this._getPlaneBufferGeometry();
		this.material = this._getShaderMaterial();
		this.plane = this._getPlane({
			geometry: this.geometry,
			material: this.material
		});
		this.scene.add(this.plane);
		this.initialProgress = 0;
		this.progress = 0;

		this.camera.position.z = 1;
		this.camera.updateProjectionMatrix();
		this._updateScene();

		this._loadTextures().then(() => {
			this.isLoaded = true;

			if (window.$pagePreloader && window.$pagePreloader.length && window.$pagePreloader.is(':visible')) {
				window.$window.on('arts/preloader/end', () => {
					this._animateInitial();
				});
			} else {
				this._animateInitial();
			}
		});
	}

	_animateInitial(delay = 0) {
		this.change({
			from: this.slider.realIndex,
			to: this.slider.realIndex,
			delay,
			speed: parseFloat(this.slider.params.speed / 1000),
			onComplete: () => {
				let nextIndex = 1;

				if (this.slider.realIndex >= this.slider.slides.length - 1) {
					nextIndex = 1;
				} else {
					nextIndex = this.slider.realIndex + 1;
				}

				this.material.uniforms.texture.value = this.items[nextIndex].texture;
				if (this.slider.params.mousewheel.enabled) {
					this.slider.mousewheel.enable();
				}
				if (this.slider.params.keyboard.enabled) {
					this.slider.keyboard.enable();
				}
			}
		});
	}

	_getPlaneBufferGeometry() {
		const {
			width,
			height
		} = this._calculatePosition();

		return new THREE.PlaneBufferGeometry(
			width,
			height,
			this.aspect
		);
	}

	_getCamera() {
		const {
			width,
			height
		} = this._calculatePosition();

		return new THREE.OrthographicCamera(
			width / -2,
			width / 2,
			height / 2,
			height / -2,
		);
	}

	_getShaderMaterial() {
		const fsID = this.slider.params.direction === 'horizontal' ? 'slider-textures-horizontal-fs' : 'slider-textures-vertical-fs';

		return new THREE.ShaderMaterial({
			uniforms: this.uniforms,
			vertexShader: this._getVertexShader('slider-textures-vs'),
			fragmentShader: this._getFragmentShader(fsID),
			opacity: 1
		});
	}

	change({
		from = 0,
		to = 0,
		speed = 1.2,
		intensity = 0.25,
		delay = 0,
		ease = 'power3.out',
		onComplete,
	}) {

		if (!this.material) {
			return false;
		}

		this.material.uniforms.texture.value = this.items[from].texture;
		this.material.uniforms.texture2.value = this.items[to].texture;
		this.material.uniforms.effectFactor.value = intensity;

		this.timeline.fromTo(this.material.uniforms.dispFactor, {
			value: 0
		}, {
			value: 1,
			ease: ease,
			duration: speed,
			delay,
			onComplete: () => {
				if (typeof onComplete === 'function') {
					onComplete();
				}
			}
		});
	}
}

/*!========================================================================
	33. Effect Stretch
	======================================================================!*/
class EffectStretch extends BaseGLAnimation {
	constructor({
		target,
		canvas,
		items,
		options
	}) {
		super({
			target,
			canvas,
		});

		if (!items.length) {
			return;
		}

		this.items = items;
		this.tempItemIndex = null;

		this.options = options || {
			strength: 0.2,
			scaleTexture: 1.8,
			scalePlane: 1
		};

		this.mouse = new THREE.Vector2();
		this.position = new THREE.Vector3(0, 0, 0);
		this.scale = new THREE.Vector3(1, 1, 1);

		this.uniforms = {
			uTexture: {
				value: null
			},
			uOffset: {
				value: new THREE.Vector2(0.0, 0.0)
			},
			uAlpha: {
				value: 0
			},
			uScale: {
				value: Math.abs(this.options.scaleTexture - 2)
			}
		};
		this.geometry = this._getPlaneBufferGeometry();
		this.material = this._getShaderMaterial();
		this.plane = this._getPlane({
			geometry: this.geometry,
			material: this.material
		});
		this.scene.add(this.plane);

		this._loadTextures().then(() => {
			this.isLoaded = true;
			target.removeClass('pointer-events-none');
		});
		this._bindMouseEvents();
	}

	_bindMouseEvents() {
		const self = this;

		this.items.each(function (index) {
			$(this)
				.on('mouseenter', (event) => {
					if (!self.isLoaded) {
						return;
					}

					self.tempItemIndex = index;
					self._onMouseEnter();
					if (self.currentItem && self.currentItem.index === index) {
						return;
					}

					self._onTargetChange(index);
				})
				.on('mouseleave', (event) => {
					if (!self.isLoaded) {
						return;
					}

					self.isMouseOver = false;
					self._onMouseLeave(event);
				});
		});

		window.$window.on('mousemove touchmove', (event) => {
			if (event.type !== 'touchmove') {
				this.mouse.x = (event.clientX / this.viewport.width) * 2 - 1;
				this.mouse.y = -(event.clientY / this.viewport.height) * 2 + 1;
				this._onMouseMove(event);
			}
		});
	}

	_getPlaneBufferGeometry() {
		return new THREE.PlaneBufferGeometry(1, 1, 8, 8);
	}

	_getShaderMaterial() {
		return new THREE.ShaderMaterial({
			uniforms: this.uniforms,
			vertexShader: this._getVertexShader('list-hover-vs'),
			fragmentShader: this._getFragmentShader('list-hover-fs'),
			transparent: true
		});
	}

	_onMouseEnter() {
		if (!this.currentItem || !this.isMouseOver) {
			this.isMouseOver = true;
			// show plane
			gsap.to(this.uniforms.uAlpha, {
				duration: 0.3,
				value: 1,
				ease: 'power4.out'
			});
		}
	}

	_onMouseLeave() {
		gsap.to(this.uniforms.uAlpha, {
			duration: 0.3,
			value: 0,
			ease: 'power4.out'
		});
	}

	_onMouseMove() {
		// project mouse position to world coodinates
		let x = this.mouse.x.map(
			-1,
			1,
			-this.viewSize.width / 2,
			this.viewSize.width / 2
		);
		let y = this.mouse.y.map(
			-1,
			1,
			-this.viewSize.height / 2,
			this.viewSize.height / 2
		);

		// update position
		this.position = new THREE.Vector3(x, y, 0);

		gsap.to(this.plane.position, {
			duration: 1,
			x: x,
			y: y,
			ease: 'power4.out',
			onUpdate: this._onPositionUpdate.bind(this)
		});
	}

	_onPositionUpdate() {
		// compute offset
		let offset = this.plane.position
			.clone()
			.sub(this.position)
			.multiplyScalar(-this.options.strength);

		this.uniforms.uOffset.value = offset;
	}

	_onTargetChange(index) {
		// item target changed
		this.currentItem = this.items[index];
		if (!this.currentItem.texture) {
			return;
		}

		// compute image ratio
		const imageRatio = this.currentItem.texture.image.naturalWidth / this.currentItem.texture.image.naturalHeight;

		this.scale = new THREE.Vector3(imageRatio * this.options.scalePlane, 1 * this.options.scalePlane, 1 * this.options.scalePlane);
		this.uniforms.uTexture.value = this.currentItem.texture;
		this.plane.scale.copy(this.scale);
	}
}

/*!========================================================================
	34. Filter
	======================================================================!*/
class Filter {
	constructor({
		scope,
		target
	}) {
		this.$target = target;
		this.$scope = scope;
		this.itemClass = '.js-filter__item';
		this.itemActive = 'filter__item_active';
		this.itemActiveClass = '.filter__item_active';
		this.underlineClass = '.js-filter__underline';
		this.$items = this.$target.find(this.itemClass);
		this.$line = this.$target.find($(this.underlineClass));

		this.bindEvents();
		this.updateLinePosition();
	}

	bindEvents() {
		const self = this;

		this.$scope
			.on('mouseenter', this.itemClass, function () {
				self.updateLinePosition($(this));
			})
			.on('mouseleave', this.itemClass, function () {
				self.updateLinePosition(self.$items.filter(self.itemActiveClass))
			})
			.on('click', this.itemClass, function () {
				const $el = $(this);

				self.$items.removeClass(self.itemActive);
				$el.addClass(self.itemActive);
				self.updateLinePosition($el);
			});

		// update line position on window resize
		window.$window.on('resize', debounce(() => {
			self.updateLinePosition(self.$items.filter(self.itemActiveClass));
		}, 250));
	}

	updateLinePosition($el) {
		if (!this.$line.length) {
			return false;
		}

		if (!$el || !$el.length) {

			gsap.to(this.$line, {
				duration: 0.6,
				width: 0,
				ease: 'expo.out'
			});
		} else {
			const
				$heading = $el.find('div'),
				headingWidth = $heading.innerWidth(),
				headingPos = $heading.position(),
				colPos = $el.position();

			gsap.to(this.$line, {
				duration: 0.6,
				ease: 'expo.inOut',
				width: headingWidth,
				x: headingPos.left + colPos.left,
			});
		}
	}

	setActiveItem(index) {
		const $el = this.$items.eq(index);

		if (!$el.length) {
			return false;
		}

		this.$items.removeClass(this.itemActive);
		$el.addClass(this.itemActive);
		this.updateLinePosition($el);
	}
}

/*!========================================================================
	35. Form
	======================================================================!*/
class Form {
	constructor({
		scope,
		target
	}) {
		this.$scope = scope;
		this.$target = target;

		if (this.$scope.length) {
			this.set();
			this.run();
		}
	}

	set() {
		this.input = '.input-float__input';
		this.inputClassNotEmpty = 'input-float__input_not-empty';
		this.inputClassFocused = 'input-float__input_focused';
		this.$inputs = this.$scope.find(this.input);
	}

	run() {
		this._floatLabels();
		this._bindEvents();
	}

	_floatLabels() {
		const self = this;

		if (!this.$inputs || !this.$inputs.length) {
			return false;
		}

		this.$inputs.each(function () {
			const
				$el = $(this),
				$controlWrap = $el.parent('.wpcf7-form-control-wrap');

			// not empty value
			if ($el.val()) {
				$el.addClass(self.inputClassNotEmpty);
				$controlWrap.addClass(self.inputClassNotEmpty);
				// empty value
			} else {
				$el.removeClass([self.inputClassFocused, self.inputClassNotEmpty]);
				$controlWrap.removeClass([self.inputClassFocused, self.inputClassNotEmpty]);
			}

			// has placeholder & empty value
			if ($el.attr('placeholder') && !$el.val()) {
				$el.addClass(self.inputClassNotEmpty);
				$controlWrap.addClass(self.inputClassNotEmpty);
			}
		});

	}

	_bindEvents() {
		const self = this;

		this.$scope
			.off('focusin')
			.on('focusin', self.input, function () {
				const
					$el = $(this),
					$controlWrap = $el.parent('.wpcf7-form-control-wrap');

				$el.addClass(self.inputClassFocused).removeClass(self.inputClassNotEmpty);
				$controlWrap.addClass(self.inputClassFocused).removeClass(self.inputClassNotEmpty);

			})
			.off('focusout')
			.on('focusout', self.input, function () {

				const
					$el = $(this),
					$controlWrap = $el.parent('.wpcf7-form-control-wrap');

				// not empty value
				if ($el.val()) {
					$el.removeClass(self.inputClassFocused).addClass(self.inputClassNotEmpty);
					$controlWrap.removeClass(self.inputClassFocused).addClass(self.inputClassNotEmpty);
				} else {
					// has placeholder & empty value
					if ($el.attr('placeholder')) {
						$el.addClass(self.inputClassNotEmpty);
						$controlWrap.addClass(self.inputClassNotEmpty);
					}

					$el.removeClass(self.inputClassFocused);
					$controlWrap.removeClass(self.inputClassFocused);
				}

			});

	}

	_getModalTemplate({
		icon,
		message
	}) {
		return `
      <div class="modal" id="modalContactForm">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content radius-img">
            <div class="modal__close" data-dismiss="modal"><img src="./img/general/icon-close.svg"/></div>
              <header class="text-center mb-1">
                <img src="${icon}" width="80" alt=""/>
                <p class="modal__message h4"><strong>${message}</strong></p>
              </header>
              <button type="button" class="button button_solid button_black button_fullwidth" data-dismiss="modal">OK</button>
          </div>
        </div>
      </div>
    `;
	}

	_createModal({
		template,
		onDismiss
	}) {

		if (!template) {
			return false;
		}

		let $modal;
		window.$body.append(template);
		$modal = $('#modalContactForm');

		$modal.modal('show');
		$modal.on('hidden.bs.modal', () => {
			if (typeof onDismiss === 'function') {
				onDismiss();
			}
			$modal.modal('dispose').remove();
		});
	}
}

/*!========================================================================
	36. Form AJAX
	======================================================================!*/
class FormAJAX extends Form {
	constructor(options) {
		super(options);
		this.inputClassError = 'form__error';
		this.method = this.$target.attr('method');
		this.action = this.$target.attr('action');
		this.messages = {
			success: this.$target.attr('data-message-success'),
			error: this.$target.attr('data-message-error')
		};
		this._validate();
	}

	_validate() {
		const self = this;

		this.$target.validate({
			errorElement: 'span',
			errorPlacement: (error, element) => {
				error.appendTo(element.parent()).addClass(self.inputClassError);
			},
			submitHandler: (form) => {
				self._submit(form);
			}
		});
	}

	_submit() {
		const self = this;

		$.ajax({
			type: self.$target.attr('method'),
			url: self.$target.attr('action'),
			data: self.$target.serialize()
		}).done(() => {
			self._createModal({
				template: self._getModalTemplate({
					icon: './img/general/icon-success.svg',
					message: self.messages.success
				}),
				onDismiss: () => {
					self.$target.trigger('reset');
					self._floatLabels();
				}
			});
		}).fail(() => {
			self._createModal({
				template: self._getModalTemplate({
					icon: './img/general/icon-error.svg',
					message: self.messages.error
				})
			});
		});
	}
}

/*!========================================================================
	37. Gmap
	======================================================================!*/
class GMap extends BaseComponent {
	constructor({
		scope,
		target
	}) {
		super({
			scope,
			target
		});
	}

	set() {
		this.prevInfoWindow = false;
		this.$container = this.$target.find('.gmap__container');
		this.$markers = this.$target.find('.gmap__marker');

		this.zoom = parseInt(this.$target.data('gmap-zoom'));
		this.styles = this._parseStyles(this.$target.attr('data-gmap-snazzy-styles'));
	}

	run() {
		if (typeof window.google !== 'undefined' && typeof window.google.maps !== 'undefined' && this.$container.length) {
			this._createMap();
		}
	}

	_parseStyles(styles) {
		if (!styles) {
			return false;
		}

		try {
			return JSON.parse(styles);
		} catch (err) {
			console.error('Google Map: Invalid Snazzy Styles Array!');
			return false;
		}
	}

	_createMap() {

		const
			self = this,
			argsMap = {
				center: new google.maps.LatLng(0, 0),
				zoom: this.zoom,
				scrollwheel: false
			};

		if (this.styles) {
			$.extend(argsMap, {
				styles: this.styles
			});
		}

		this.map = new google.maps.Map(this.$container[0], argsMap);
		this.map.markers = [];

		this.$markers.each(function () {
			self._createMarker($(this));
		});

		this._centerMap(this.zoom);
	}

	_createMarker($marker) {

		if (!$marker.length) {
			return;
		}

		const
			MARKER_LAT = parseFloat($marker.attr('data-marker-lat')),
			MARKER_LON = parseFloat($marker.attr('data-marker-lon')),
			MARKER_IMG = $marker.attr('data-marker-img'),
			MARKER_WIDTH = $marker.attr('data-marker-width'),
			MARKER_HEIGHT = $marker.attr('data-marker-height'),
			MARKER_CONTENT = $marker.attr('data-marker-content');

		let marker;

		/**
		 * Marker
		 */
		const argsMarker = {
			position: new google.maps.LatLng(MARKER_LAT, MARKER_LON),
			map: this.map
		};

		if (MARKER_IMG) {
			$.extend(argsMarker, {
				icon: {
					url: MARKER_IMG
				}
			});
		}

		if (MARKER_IMG && MARKER_WIDTH && MARKER_HEIGHT) {
			$.extend(argsMarker.icon, {
				scaledSize: new google.maps.Size(MARKER_WIDTH, MARKER_HEIGHT)
			});
		}

		marker = new google.maps.Marker(argsMarker);
		this.map.markers.push(marker);

		/**
		 * Info Window (Content)
		 */
		this._createInfoWindow({
			marker,
			content: MARKER_CONTENT
		});

	}

	_createInfoWindow({
		marker,
		content = ''
	}) {
		if (content) {
			const infoWindow = new google.maps.InfoWindow({
				content: content
			});

			marker.addListener('click', () => {
				if (this.prevInfoWindow) {
					this.prevInfoWindow.close();
				}

				this.prevInfoWindow = infoWindow;

				infoWindow.open(this.map, marker);
			});
		}
	}

	_centerMap(zoom) {
		const bounds = new google.maps.LatLngBounds();

		$.each(this.map.markers, function () {
			const item = this;

			if (typeof item.position !== 'undefined') {

				const
					lat = item.position.lat(),
					lng = item.position.lng(),
					newZoom = new google.maps.LatLng(lat, lng);

				bounds.extend(newZoom);
			}
		});

		// center single marker
		if (this.map.markers.length == 1) {
			this.map.setCenter(bounds.getCenter());
			this.map.setZoom(zoom);
		} else { // fit bounds to multiple markers
			this.map.fitBounds(bounds);
		}
	}
}

/*!========================================================================
	38. Grid
	======================================================================!*/
class Grid extends BaseComponent {
	constructor({
		target,
		scope
	}) {
		super({
			target,
			scope
		});
		this.lazyInstance = new LazyLoad({
			scope
		});
		this.$lazyImages = this.$target.find('img[data-src]');
		this.isotopeInstance;
		this._layoutImages();
		this._layoutLazyImages();

		return this.isotopeInstance;
	}

	run() {
		this.isotopeInstance = this.$target.isotope({
			itemSelector: '.js-grid__item',
			columnWidth: '.js-grid__sizer',
			percentPosition: true,
			horizontalOrder: true,
		});

		setTimeout(() => {
			this.isotopeInstance.isotope('layout');
		}, 600);
	}

	_layoutImages() {
		this.$target
			.imagesLoaded()
			.progress(() => {
				this.isotopeInstance.isotope('layout');
			})
			.done(() => {
				setTimeout(() => {
					this.isotopeInstance.isotope('layout');
				}, 300);
			});
	}

	_layoutLazyImages() {
		this.lazyInstance.loadImages({
			target: this.$lazyImages,
			callback: () => {
				this._layoutImages();
			}
		});
	}
}

/*!========================================================================
	39. Header
	======================================================================!*/
class Header {
	constructor() {
		this.$header = $('#page-header');
		this.$controls = this.$header.find('.header__controls');
		this.$stickyHeader = this.$header.filter('.js-header-sticky');
		this.$adminBar = $('#wpadminbar');
		this.$burger = $('#js-burger');
		this.$curtain = $('#js-header-curtain');
		this.$curtainTransition = $('#js-header-curtain-transition');
		this.$overlay = $('.header__wrapper-overlay-menu');
		this.burgerOpenClass = 'header__burger_opened';
		this.$headerColumns = this.$header.find('.header__col');
		this.$headerLeft = this.$header.find('.header__col-left');
		this.$overlayWidgets = this.$header.find('.header__wrapper-overlay-widgets');
		this.$allLinksOverlay = this.$header.find('.menu-overlay a');
		this.$allLinksClassic = this.$header.find('.menu a');

		// Menu
		this.$menuOverlay = this.$overlay.find('.js-menu-overlay');
		this.$menuLinks = this.$overlay.find('.menu-overlay > li > a');
		this.selectedClass = 'selected';
		this.openClass = 'opened';

		// Submenu
		this.$submenu = this.$overlay.find('.menu-overlay .sub-menu');
		this.$submenuButton = $('#js-submenu-back');
		this.$submenuOpeners = this.$overlay.find('.menu-item-has-children > a');
		this.$submenuLinks = this.$submenu.find('> li > a');

		// Sticky
		this.stickyScene = undefined;
		this.stickyClass = 'header_sticky';

		this.setMenu();
		this.run();
	}

	run() {
		this.overlayBackground = this.$header.attr('data-arts-header-overlay-background');
		this.stickyTheme = this.$stickyHeader.attr('data-arts-header-sticky-theme');

		if (typeof this.stickyScene !== 'undefined') {
			this.stickyScene.destroy(true);
		}

		this.timeline = new gsap.timeline();

		this._correctTopOffset();
		this._stick();
		this._bindEvents();
		this._handleAnchors();
	}

	setBurger(open = false) {
		if (open) {
			this.$header.addClass(this.openClass);
			this.$burger.addClass(this.burgerOpenClass);
		} else {
			this.$header.removeClass(this.openClass);
			this.$burger.removeClass(this.burgerOpenClass);
		}
	}

	setMenu() {

		if (this.$overlay.length) {
			gsap.set(this.$overlay, {
				autoAlpha: 0,
				display: 'none'
			});
		}
		if (this.$submenu.length) {
			gsap.set(this.$submenu, {
				autoAlpha: 0
			});
		}

		if (this.$submenuButton.length) {
			gsap.set(this.$submenuButton, {
				autoAlpha: 0
			});
		}

		this.$submenu.removeClass(this.openClass);
		this.$header.removeClass(this.openClass);
		this.$burger.removeClass(this.burgerOpenClass);

		if (this.$menuLinks.length) {
			gsap.effects.hideLines(this.$menuLinks, {
				autoAlpha: 1,
				y: '-100%',
				duration: 0,
			});
		}

		if (this.$submenuLinks.length) {
			gsap.effects.hideLines(this.$submenuLinks, {
				autoAlpha: 1,
				y: '-100%',
				duration: 0,
			});
		}

		if (this.$overlayWidgets.length) {
			gsap.effects.hideLines(this.$overlayWidgets, {
				autoAlpha: 1,
				y: this._isMediumScreen() ? '-100%' : '100%',
				duration: 0
			});
		}

		if (this.$curtain.length) {
			gsap.set(this.$curtain, {
				display: 'none'
			});
		}

	}

	openMenu() {
		return this.timeline
			.clear()
			.set(this.$curtain, {
				display: 'block',
			})
			.setCurtain(this.$curtain, {
				background: this.overlayBackground,
				y: '100%'
			})
			.set(this.$overlay, {
				autoAlpha: 1,
				display: 'flex'
			})
			.add([() => {
				this._setTransition(true);
				this._unstick();

			}])
			.set(this.$adminBar, {
				position: 'fixed',
			})
			.to(this.$headerLeft, {
				duration: 1.2,
				x: 30,
				autoAlpha: 0,
				ease: 'expo.inOut'
			}, 'start')
			.moveCurtain(this.$curtain, {
				duration: 1.2,
				y: '0%',
			}, 'start')
			.add(() => {
				this.$header.addClass(this.openClass);
			}, '-=0.6')
			.add([
				gsap.effects.animateLines(this.$menuLinks, {
					stagger: {
						amount: 0.2,
						from: 'end'
					},
					duration: 1.2,
					ease: 'power4.out'
				}),
				gsap.effects.animateLines(this.$overlayWidgets, {
					stagger: {
						amount: 0.2,
						from: this._isMediumScreen() ? 'end' : 'start'
					},
					duration: 1.2,
					ease: 'power4.out'
				})
			], '-=0.6')
			.add(() => {
				this._setTransition(false);
			}, '-=0.6')
			.timeScale(window.theme.animations.timeScale.overlayMenuOpen || 1);
	}

	closeMenu(force = false, cb) {

		if (!this.$header.hasClass(this.openClass) && !force) {
			return this.timeline;
		}

		const
			$submenuLinksCurrent = this.$submenu.filter(`.${this.openClass}`).find(this.$submenuLinks);

		return this.timeline
			.clear()
			.add(() => {
				this._setTransition(true);
				this._stick();

				if (typeof window.SB !== 'undefined' && window.SB.offset.y >= 1) {
					this.$stickyHeader.addClass(this.stickyClass);
				}
			})
			.to(this.$headerLeft, {
				duration: 1.2,
				x: 0,
				autoAlpha: 1,
				ease: 'expo.inOut'
			}, 'start')
			.to(this.$submenuButton, {
				x: -10,
				autoAlpha: 0,
				duration: 0.3,
				ease: 'expo.inOut'
			}, 'start')
			.moveCurtain(this.$curtain, {
				duration: 1.2,
				y: '-100%',
				curve: 'bottom'
			}, 'start')
			.add(() => {
				this.$header.removeClass(this.openClass);
			}, '-=0.9')
			.add(gsap.effects.hideLines([$submenuLinksCurrent, this.$menuLinks, this.$overlayWidgets], {
				stagger: {
					amount: 0,
					from: 'end'
				},
				y: '100%',
				duration: 0.6,
			}), 'start')
			.add(() => {
				this.$header.attr('data-arts-header-animation', '');
			}, '-=0.3')
			.add(() => {
				if (typeof cb === 'function') {
					cb();
				}
			}, '-=0.6')
			.add(() => {
				this.setMenu();
			})
			.timeScale(window.theme.animations.timeScale.overlayMenuClose || 1);
	}

	closeMenuTransition(force = false) {

		if (!this.$header.hasClass(this.openClass) && !force) {
			return this.timeline;
		}

		const
			$submenuLinksCurrent = this.$submenu.filter(`.${this.openClass}`).find(this.$submenuLinks);

		return this.timeline
			.clear()
			.add(() => {
				this._setTransition(true);
				// Scroll.restoreScrollTop();
				this._stick();

				if (typeof window.SB !== 'undefined' && window.SB.offset.y >= 1) {
					this.$stickyHeader.addClass(this.stickyClass);
				}
			})
			.to(this.$headerLeft, {
				duration: 1.2,
				x: 0,
				autoAlpha: 1,
				ease: 'expo.inOut'
			}, 'start')
			.to(this.$submenuButton, {
				x: -10,
				autoAlpha: 0,
				duration: 0.3,
				ease: 'expo.inOut'
			}, 'start')
			.add(() => {
				this.$header.removeClass(this.openClass);
			}, '-=0.9')
			.add(gsap.effects.hideLines([$submenuLinksCurrent, this.$menuLinks, this.$overlayWidgets], {
				stagger: {
					amount: 0,
					from: 'end'
				},
				y: '100%',
				duration: 0.6,
			}), 'start')
			.add(() => {
				this.$header.attr('data-arts-header-animation', '');
			}, '-=0.3')
			.add(() => {
				this.setMenu();
			});
	}

	_bindEvents() {
		const self = this;

		if (this.$adminBar.length) {
			window.$window.on('resize', debounce(this._correctTopOffset, 250));
		}

		if (this.$burger.length) {
			this.$burger.off('click').on('click', (e) => {
				e.preventDefault();

				if (this._isInTransition()) {
					return;
				}

				if (this.$burger.hasClass(this.burgerOpenClass)) {
					this.closeMenu();
					this.$burger.removeClass(this.burgerOpenClass);
				} else {
					this.openMenu();
					this.$burger.addClass(this.burgerOpenClass);
				}
			});
		}

		if (this.$submenuOpeners.length) {
			this.$submenuOpeners.on('click', function (e) {

				if (self._isInTransition()) {
					e.preventDefault();
					return;
				}

				const
					$el = $(this),
					$currentMenu = $el.parents('ul'),
					$submenu = $el.next('.sub-menu');

				if ($submenu.length) {

					e.preventDefault();

					$el.addClass(self.linkSelectedClass);

					self._openSubmenu({
						submenu: $submenu,
						currentMenu: $currentMenu
					});
				}
			});
		}

		if (this.$submenuButton.length) {
			this.$submenuButton.on('click', (e) => {
				e.preventDefault();

				if (self._isInTransition()) {
					return;
				}

				const $submenu = this.$submenu.filter(`.${this.openClass}`),
					$prevMenu = $submenu.parent('li').parent('ul');

				self._closeSubmenu({
					submenu: $submenu,
					currentMenu: $prevMenu
				});
			});
		}

		window.$window
			.on('arts/preloader/end', () => {
				gsap.to(this.$headerColumns, {
					autoAlpha: 1,
					stagger: 0.2,
					duration: 0.6
				});
			})
			.on('arts/barba/transition/start', () => {
				this.$controls.addClass('pointer-events-none');
				this._unstick();
			})
			.on('arts/barba/transition/end', () => {
				this.$controls.removeClass('pointer-events-none');
			});
	}

	isOverlayOpened() {
		return this.$header.hasClass(this.openClass);
	}

	_isMediumScreen() {
		return window.Modernizr.mq('(max-width: 991px)');
	}

	_isInTransition() {
		return this.$header.attr('data-arts-header-animation') === 'intransition';
	}

	_setTransition(inTransition = true) {
		return this.$header.attr('data-arts-header-animation', inTransition ? 'intransition' : '');
	}

	_correctTopOffset() {
		const top = this.$adminBar.height() || 0;

		gsap.to(this.$header, {
			duration: 0.6,
			top
		});
	}

	_stick() {
		if (!this.$stickyHeader.length) {
			return;
		}

		this.stickyScene = new $.ScrollMagic.Scene({
				offset: '1px',
			})
			.setClassToggle(this.$stickyHeader, [this.stickyTheme, this.stickyClass].join(' '))
			.addTo(window.SMController);
	}

	_unstick() {
		if (!this.$stickyHeader.length || !this.stickyScene) {
			return;
		}

		this.stickyScene.destroy(true);
		this.stickyScene = undefined;
		this.$stickyHeader.removeClass(this.stickyClass);
	}

	_openSubmenu({
		submenu,
		currentMenu
	}) {
		const
			$currentLinks = currentMenu.find('> li > a .menu-overlay__item-wrapper'),
			$submenuLinks = submenu.find('> li > a .menu-overlay__item-wrapper');

		this.timeline
			.clear()
			.add(() => {
				this._setTransition(true);
				this.$submenu.removeClass(this.openClass);
				submenu.not(this.$menuOverlay).addClass(this.openClass);

				if (this.$submenu.hasClass(this.openClass)) {
					gsap.to(this.$submenuButton, {
						autoAlpha: 1,
						x: 0,
						duration: 0.3
					});

					if (this._isMediumScreen()) {
						gsap.effects.hideLines(this.$overlayWidgets, {
							stagger: {
								amount: 0.1,
								from: 'end'
							},
							y: '100%',
							duration: 1.2,
							ease: 'power4.out',
						});
					}
				} else {
					gsap.to(this.$submenuButton, {
						autoAlpha: 0,
						x: -10,
						duration: 0.3
					});

					gsap.effects.animateLines(this.$overlayWidgets, {
						stagger: {
							amount: 0.2,
							from: 'end'
						},
						duration: 1.2,
						ease: 'power4.out',
					});
				}
			})
			.set(submenu, {
				autoAlpha: 1,
				zIndex: 100
			})
			.add(gsap.effects.hideLines($currentLinks, {
				stagger: {
					amount: 0.2,
					from: 'end'
				},
				y: '100%',
				duration: 1.2,
				ease: 'power4.out'
			}))
			.add(gsap.effects.animateLines($submenuLinks, {
				stagger: {
					amount: 0.2,
					from: 'end'
				},
				duration: 1.2,
				ease: 'power4.out'
			}), '-=1.0')
			.add(() => {
				this.$menuLinks.removeClass(this.openClass);
				this._setTransition(false);
			}, '-=0.6')
			.timeScale(1.25);
	}

	_closeSubmenu({
		submenu,
		currentMenu
	}) {
		const
			$currentLinks = currentMenu.find('> li > a .menu-overlay__item-wrapper'),
			$submenuLinks = submenu.find('> li > a .menu-overlay__item-wrapper');

		this.timeline
			.clear()
			.add(() => {
				this._setTransition(true);
				this.$submenu.removeClass(this.openClass);
				currentMenu.not(this.$menuOverlay).addClass(this.openClass);

				if (this.$submenu.hasClass(this.openClass)) {
					gsap.to(this.$submenuButton, {
						autoAlpha: 1,
						x: 0,
						duration: 0.3
					});

					if (this._isMediumScreen()) {
						gsap.effects.hideLines(this.$overlayWidgets, {
							stagger: {
								amount: 0.1,
								from: 'start'
							},
							y: '100%',
							duration: 1.2,
							ease: 'power4.out',
						});
					}
				} else {
					gsap.to(this.$submenuButton, {
						autoAlpha: 0,
						x: -10,
						duration: 0.3
					});

					gsap.effects.animateLines(this.$overlayWidgets, {
						stagger: {
							amount: 0.2,
							from: 'start'
						},
						duration: 1.2,
						ease: 'power4.out',
					});
				}
			})
			.set(submenu, {
				zIndex: -1
			})
			.add(gsap.effects.animateLines($currentLinks, {
				y: '100%',
				duration: 0
			}), 'start')
			.add(gsap.effects.hideLines($submenuLinks, {
				stagger: {
					amount: 0.1,
					from: 'start'
				},
				y: '-100%',
				duration: 1.2,
				ease: 'power4.out'
			}))
			.add(
				gsap.effects.animateLines($currentLinks, {
					stagger: {
						amount: 0.2,
						from: 'start'
					},
					duration: 1.2,
					ease: 'power4.out'
				}), '-=1.0')
			.set(submenu, {
				autoAlpha: 0,
			})
			.add(() => {
				this._setTransition(false);
			}, '-=0.6')
			.timeScale(1.25);
	}

	_handleAnchors() {

		const self = this;

		// overlay anchor links
		this.$allLinksOverlay.filter('a[href*="#"]:not([href="#"])').off('click').each(function () {
			const
				$current = $(this),
				url = $current.attr('href');

			self._scrollToAnchorFromMenu({
				element: $current,
				url,
				menu: 'overlay'
			});
		});

		// regular menu anchor links
		this.$allLinksClassic.filter('a[href*="#"]:not([href="#"])').off('click').each(function () {
			const
				$current = $(this),
				url = $current.attr('href');

			self._scrollToAnchorFromMenu({
				element: $current,
				url,
				menu: 'classic'
			});
		});

	}

	_scrollToAnchorFromMenu({
		element,
		url,
		menu = 'classic'
	}) {
		if (!url || !element) {
			return;
		}

		const filteredUrl = url.substring(url.indexOf('#'));

		try {
			if (filteredUrl.length) {
				const $el = $(filteredUrl);

				if ($el.length) {

					element.on('click', () => {
						if (menu === 'classic') {
							Scroll.scrollTo({
								y: $el.offset().top - this.$header.innerHeight(),
								duration: 800
							});
						}

						if (menu === 'overlay') {
							this.closeMenu(false, () => {
								Scroll.scrollTo({
									y: $el.offset().top - this.$header.innerHeight(),
									duration: 800
								});
							});
						}
					});

				}
			}
		} catch (error) {
			console.error('Error when handling menu anchor links: ' + error);
		}
	}
}

/*!========================================================================
	40. Lazy Load
	======================================================================!*/
class LazyLoad {
	constructor({
		scope,
		setPaddingBottom = false,
		run = false
	}) {
		this.$scope = scope || window.$document;
		this.$images = this.$scope.find('img[data-src]:not(.swiper-lazy)');
		this.$backgrounds = this.$scope.find('.lazy-bg[data-src]');

		if (setPaddingBottom) {
			this.setPaddingBottom();
		}

		if (run) {
			this.run();
		}

		this._bindEvents();

	}

	_bindEvents() {
		window.$window.off('arts/grid/filter').on('arts/grid/filter', debounce(() => {
			this.run();
		}, 300));
	}

	setPaddingBottom() {
		this.$images.each(function () {
			const $el = $(this),
				$elParent = $el.parent(),
				elWidth = $el.attr('width') || 0,
				elHeight = $el.attr('height') || 0,
				elPB = parseFloat((elHeight / elWidth) * 100); // padding-bottom hack

			// we need both width and height of element
			// to calculate proper value for "padding-bottom" hack
			if (!elWidth || !elHeight) {
				return;
			}

			// position image absolutely
			gsap.set($el, {
				position: 'absolute',
				top: 0,
				left: 0,
			});

			// set padding-bottom to the parent element so it will
			// create the needed space for the image
			gsap.set($elParent, {
				position: 'relative',
				overflow: 'hidden',
				paddingBottom: elPB + '%'
			});
		});
	}

	run() {
		this.loadImages({
			target: this.$images
		});
		this.loadBackgrounds({
			target: this.$backgrounds
		});
	}

	loadBackgrounds({
		target,
		callback
	}) {
		if (target && target.length) {
			const instance = target.Lazy({
				threshold: 1000,
				chainable: false,
				afterLoad: (el) => {
					$(el).addClass('lazy-bg_loaded');

					if (typeof callback === 'function') {
						callback();
					}
				}
			});

			window.$window
				.on('arts/barba/transition/start', () => {
					instance.destroy();
				})
				.on('arts/barba/transition/end', () => {
					setTimeout(() => {
						instance.update();
					}, 50);
				});

			setTimeout(() => {
				instance.update();
			}, 50);
		}
	}

	loadImages({
		target,
		callback
	}) {
		if (target && target.length) {
			const instance = target.Lazy({
				threshold: 1000,
				chainable: false,
				afterLoad: (el) => {
					const
						$el = $(el),
						$elParent = $el.parent();

					$el.imagesLoaded({
						background: true
					}).always(() => {
						$elParent.addClass('lazy_loaded');
					});

					if (typeof callback === 'function') {
						callback();
					}
				}
			});

			window.$window
				.on('arts/barba/transition/start', () => {
					instance.destroy();
				})
				.on('arts/barba/transition/end', () => {
					setTimeout(() => {
						instance.update();
					}, 50);
				});

			setTimeout(() => {
				instance.update();
			}, 50);
		}
	}
}

/*!========================================================================
	41. Magnetic
	======================================================================!*/
class Magnetic extends BaseComponent {
	constructor({
		scope,
		target,
		distance
	}) {
		super({
			target,
			scope
		});
		this.defaultDistance = 40;
		this.distance = distance || this.defaultDistance;
	}

	run() {
		this._bindEvents();
	}

	_bindEvents() {
		const self = this;

		this.$scope.on('mousemove', (event) => {
			this.$target.each(function () {
				const $el = $(this);

				self._magnifyElement({
					element: $el,
					event,
					distance: $el.data('arts-magnetic-distance') || self.distance
				});
			});
		});
	}

	_magnifyElement({
		element,
		event,
		distance
	}) {

		const
			centerX = element.offset().left + element.width() / 2,
			centerY = element.offset().top + element.height() / 2,
			deltaX = Math.floor((centerX - event.pageX)) * -.5,
			deltaY = Math.floor((centerY - event.pageY)) * -.5,
			targetDistance = this._calcDistance({
				element: element,
				mouseX: event.pageX,
				mouseY: event.pageY
			});

		if (targetDistance < distance) {
			gsap.to(element, {
				duration: 0.3,
				y: deltaY,
				x: deltaX
			});
		} else {
			gsap.to(element, {
				duration: 0.3,
				y: 0,
				x: 0
			});
		}

	}

	_calcDistance({
		element,
		mouseX,
		mouseY
	}) {
		return Math.floor(Math.sqrt(Math.pow(mouseX - (element.offset().left + (element.width() / 2)), 2) + Math.pow(mouseY - (element.offset().top + (element.height() / 2)), 2)));
	}
}

/*!========================================================================
	42. Page Indicator
	======================================================================!*/
const PageIndicator = function ($scope) {
	const
		$target = $scope.find('.js-page-indicator'),
		$triggers = $scope.find('.js-page-indicator-trigger');

	if (!$target.length) {
		return;
	}

	$triggers.each(function () {

		let $current = $(this);

		$current
			.on('mouseenter touchstart', function () {

			})
			.on('mouseleave touchend', function () {

			});

	});
}

/*!========================================================================
	43. Arts Parallax
	======================================================================!*/
class ArtsParallax {
	constructor({
		target,
		factor,
		ScrollMagicController,
		SmoothScrollBarController,
	}) {
		this.scene = null;
		this.$target = target;
		this.factor = factor || 0.3;
		this.SMController = ScrollMagicController;
		this.SBController = SmoothScrollBarController;
		this.run();
	}

	run() {
		const self = this;

		this.$target.each(function () {
			const
				$el = $(this),
				$parallaxTarget = $el.find('> *').length ? $el.find('> *') : $el,
				distanceToY = $el.data('arts-parallax-y') || 0,
				distanceToX = $el.data('arts-parallax-x') || 0,
				factorEl = parseFloat($el.data('arts-parallax-factor')) || parseFloat(self.factor);

			let
				tl = new gsap.timeline(),
				factorScale = 1 + Math.abs(factorEl),
				factorTo = Math.abs(factorEl) * 100,
				factorFrom = -1 * Math.abs(factorEl) * 100,
				sceneDuration = window.innerHeight + $parallaxTarget.height() * (factorScale * 2);

			// wrong calculated height
			if (sceneDuration - window.innerHeight < 50) {
				sceneDuration = window.innerHeight + $el.parent().height() * (factorScale * 2);
			}

			if (!$parallaxTarget.length && !distanceToX && !distanceToY) {
				return;
			}

			if (factorFrom > 0) {
				factorScale = factorScale * factorScale;
				factorTo = self.factor * 100;
			}

			// normal element (no scale)
			if ($el.data('arts-parallax') === 'element') {
				tl = self._getParallaxTimeline({
					element: $el,
					toY: distanceToY,
					toX: distanceToX
				});
			} else { // background or <img> (do scale to prevent image edges exposing)
				tl = self._getParallaxTimeline({
					element: $parallaxTarget,
					fromX: '0%',
					fromY: factorFrom + '%',
					toY: factorTo + '%',
					toX: '0%',
					scale: factorScale
				});
			}

			this.scene = self._addSceneToScrollMagic({
				trigger: $el,
				duration: sceneDuration,
				timeline: tl
			});

			window.$window.one('arts/barba/transition/init/after arts/barba/transition/clone/before', () => {
				this.scene.update(true);
			});
		});
	}

	_getParallaxTimeline({
		element,
		fromY,
		fromX,
		toY,
		toX,
		scale
	}) {
		return new gsap.timeline().fromTo(element, {
			y: fromY || 0,
			x: fromX || 0,
			scale: scale || 1,
			transformOrigin: 'center center',
		}, {
			y: toY || 0,
			x: toX || 0,
			force3D: true,
			ease: 'linear.none',
		});
	}

	_addSceneToScrollMagic({
		trigger,
		duration,
		timeline,
	}) {
		return new ScrollMagic.Scene({
				triggerElement: trigger,
				triggerHook: 1,
				duration: duration
			})
			.setTween(timeline)
			.addTo(this.SMController)
			.update(true);
	}
}

/*!========================================================================
	44. Preloader
	======================================================================!*/
function Preloader({
  scope = window.$document,
  target = $('#js-preloader'),
  curtain = {
    element: $('#js-page-transition-curtain'),
    background: $('.section-masthead').attr('data-background-color')
  },
  cursor = {
    element: $('#js-cursor'),
    offset: {
      top: 0.0,
      left: 0.0
    }
  },
  counter = {
    easing: 'power4.out',
    duration: 25,
    start: 0,
    target: 100,
    prefix: '',
    suffix: ''
  }
}) {

  const self = this;
  this.$scope = scope;
  this.$target = target;

  // Preloader
  this.$header = this.$target.find('.preloader__header');
  this.$content = this.$target.find('.preloader__content');
  this.$wrapperCounter = this.$target.find('.preloader__counter');
  this.$counter = this.$target.find('.preloader__counter-current');
  this.$wrapperCircle = this.$target.find('.preloader__circle');

  // Cursor
  this.cursor = cursor;
  this.cursor.centerX = parseFloat(this.$wrapperCircle.innerWidth() / 2);
  this.cursor.centerY = parseFloat(this.$wrapperCircle.innerHeight() / 2);
  this.cursor.posX = 0;
  this.cursor.posY = 0;
  this.cursor.follower = {};
  this.cursor.follower.element = this.cursor.element.find('.cursor__follower');
  this.cursor.follower.inner = this.cursor.element.find('#inner');
  this.cursor.follower.outer = this.cursor.element.find('#outer');
  this.cursor.follower.size = {
    element: {
      width: this.cursor.follower.element.width(),
      height: this.cursor.follower.element.height()
    },
    inner: {
      cx: this.cursor.follower.inner.attr('cx'),
      cy: this.cursor.follower.inner.attr('cy'),
      r: this.cursor.follower.inner.attr('r')
    },
    outer: {
      cx: this.cursor.follower.outer.attr('cx'),
      cy: this.cursor.follower.outer.attr('cy'),
      r: this.cursor.follower.outer.attr('r')
    }
  }; // original circles dimensions

  // Mouse Coordinates
  this.mouseX = window.mouseX || window.innerWidth / 2;
  this.mouseY = window.mouseY || window.innerHeight / 2;

  // Curtain
  this.curtain = curtain;
  this.curtain.svg = this.curtain.element.find('.curtain-svg');
  this.curtain.rect = this.curtain.element.find('.curtain__rect');

  // Counter
  this.counter = counter;
  this.counter.val = 0;

  // Main Preloader Timeline
  this.timeline = new gsap.timeline({});

  // Animation Tweens
  this.tweens = {
    drawCircle: gsap.fromTo(this.cursor.follower.outer, {
      rotate: 90,
      drawSVG: '100% 100%',
      transformOrigin: 'center center',
    }, {
      drawSVG: '0% 100%',
      rotate: 0,
      transformOrigin: 'center center',
      ease: this.counter.easing,
      duration: this.counter.duration,
      paused: true,
    }),
    count: gsap.to(this.counter, {
      duration: this.counter.duration,
      val: this.counter.target,
      ease: this.counter.easing,
      paused: true,
      onUpdate: () => {
        const value = parseFloat(this.counter.val).toFixed(0);
        this.$counter.text(this.counter.prefix + value + this.counter.suffix);
      },
    }),
    followMouse: gsap.to({}, {
      paused: true,
      duration: 0.01,
      repeat: -1,
      onRepeat: () => {
        this.cursor.posX += (window.mouseX - this.cursor.posX);
        this.cursor.posY += (window.mouseY - this.cursor.posY - this.cursor.offset.top);
        gsap.to(this.cursor.element, {
          duration: 0.3,
          top: 0,
          left: 0,
          scale: (this.cursor.posX && this.cursor.posY) ? 1 : 0,
          autoAlpha: (this.cursor.posX && this.cursor.posY) ? 1 : 0,
          x: this.cursor.posX || window.innerWidth / 2,
          y: this.cursor.posY + this.cursor.offset.top || window.innerHeight / 2,
        });
      },
    })
  };

  _bindEvents();

  this.start = () => {
    window.dispatchEvent(new CustomEvent('arts/preloader/start'));

    if (!this.$target.length) {
      return;
    }

    window.$body.addClass('cursor-progress');

    if (this.cursor.element.length) {
      gsap.set(this.cursor.element, {
        display: 'block',
        top: '50%',
        left: '50%',
      });

      gsap.set(this.cursor.follower.element, {
        width: this.$wrapperCircle.innerWidth(),
        height: this.$wrapperCircle.innerHeight(),
      });

      gsap.set([this.cursor.follower.inner, this.cursor.follower.outer], {
        attr: {
          cx: this.cursor.centerX,
          cy: this.cursor.centerY,
          r: this.cursor.centerX - 1,
        }
      });
    }

    if (this.curtain.element.length) {
      gsap.set(this.curtain.svg, {
        fill: this.curtain.background
      });

      gsap.set(this.curtain.rect, {
        background: this.curtain.background
      });

      gsap.set(window.$pageContent, {
        autoAlpha: 0
      });
    }

    this.timeline.add([
      this.tweens.count.play(),
      this.tweens.drawCircle.play()
    ]);

  }

  this.finish = () => {
    return new Promise((resolve, reject) => {
      if (!this.$target.length) {
        window.dispatchEvent(new CustomEvent('arts/preloader/end'));
        resolve(true);
        return;
      }

      this.timeline
        .clear()
        .set(this.cursor.follower.outer, {
          attr: {
            transform: ''
          }
        })
        .to(this.cursor.follower.outer, {
          drawSVG: '0% 100%',
          rotate: 0,
          transformOrigin: 'center center',
          ease: 'expo.inOut',
          duration: 1.2
        }, 'start')
        .add([
          gsap.to(this.counter, {
            duration: 1.2,
            val: this.counter.target,
            ease: 'expo.inOut',
            onUpdate: () => {
              const value = parseFloat(this.counter.val).toFixed(0);
              this.$counter.text(this.counter.prefix + value + this.counter.suffix);
            }
          }),
        ], 'start')
        .add([
          this.tweens.followMouse.play(),
          gsap.to(this.cursor.follower.element, {
            width: this.cursor.follower.size.element.width,
            height: this.cursor.follower.size.element.height,
            ease: 'expo.out',
            duration: 1.2
          }),
          gsap.to(this.cursor.follower.inner, {
            attr: this.cursor.follower.size.inner,
            ease: 'expo.out',
            duration: 1.2,
          }),
          gsap.to(this.cursor.follower.outer, {
            attr: this.cursor.follower.size.outer,
            ease: 'expo.out',
            autoAlpha: 0,
            duration: 1.2,
          }),
        ])
        .add([
          gsap.effects.moveCurtain(this.curtain.element, {
            duration: 1.2
          }),
          gsap.to(this.$content, {
            y: -30,
            delay: 0.1,
            duration: 0.8,
            ease: 'power3.inOut',
          }),
          gsap.to(this.$target, {
            delay: 0.2,
            display: 'none',
            duration: 0.8,
            ease: 'power3.inOut',
          })
        ], '-=1.2')
        .set(window.$pageContent, {
          autoAlpha: 1
        })
        .to(this.curtain.element, {
          autoAlpha: 0,
          delay: 0.4,
          duration: 0.3
        })
        .set([this.$target, this.curtain.element], {
          y: '-100%',
          display: 'none',
        })
        .set(this.cursor.element, {
          clearProps: 'top,left',
          x: '-50%',
          y: '-50%'
        })
        .add(() => {
          window.dispatchEvent(new CustomEvent('arts/preloader/end'));
          window.$body.removeClass('cursor-progress');
          this.tweens.followMouse.kill();
          resolve(true);
        }, '-=0.6');

    });
  }

  function _bindEvents() {
    self.$scope.on('mousemove', (e) => {
      window.mouseX = e.clientX;
      window.mouseY = e.clientY;
    });
  }

}

/*!========================================================================
	45. Smooth Scroll
	======================================================================!*/
class SmoothScroll {
	constructor({
		target = $('.js-smooth-scroll'),
		adminBar,
		absoluteElements,
		fixedElements
	}) {
		this.$container = target;
		this.$WPadminBar = adminBar;
		this.$absoluteElements = absoluteElements;
		this.$fixedElements = fixedElements;

		this.run();

		try {
			this._handleAnchorsScrolling();
		} catch (error) {

		}
	}

	run() {

		if (
			typeof window.Scrollbar === 'undefined' ||
			!window.theme.smoothScroll.enabled ||
			!this.$container ||
			!this.$container.length ||
			typeof window.elementor !== 'undefined' || // don't launch in Elementor edit mode
			(window.Modernizr.touchevents && !this.$container.hasClass('js-smooth-scroll_enable-mobile')) || // don't launch on touch devices
			window.Modernizr.touchevents
		) {
			return false;
		}

		if (typeof window.SB !== 'undefined') {
			window.SB.destroy();
		}

		this._registerPlugins();
		this.$container.addClass('smooth-scroll');

		window.SB = window.Scrollbar.init(this.$container[0], window.theme.smoothScroll);

		this._emitNativeScrollEvents();

		if (typeof this.$WPadminBar !== 'undefined' && this.$WPadminBar.length) {
			this._correctWPAdminBar();
		}

		if (typeof this.$absoluteElements !== 'undefined' && this.$absoluteElements.length) {
			this._correctAbsolutePositionElements();
		}

		if (typeof this.$fixedElements !== 'undefined' && this.$fixedElements.length) {
			this._correctFixedPositionElements();
		}

	}

	_registerPlugins() {
		if (window.theme.smoothScroll.plugins.edgeEasing && typeof SoftscrollPlugin !== 'undefined') {
			window.Scrollbar.use(SoftscrollPlugin);
		}
	}

	_emitNativeScrollEvents() {
		const scrollEvt = new CustomEvent('scroll');

		window.SB.addListener((e) => {
			window.pageYOffset = e.offset.y;
			window.pageXOffset = e.offset.x;
			window.dispatchEvent(scrollEvt);
		});
	}

	_handleAnchorsScrolling() {
		$('.page-wrapper__content, #page-footer').find('a[href*="#"]:not([href="#"])').each(function () {
			const
				$current = $(this),
				url = $current.attr('href'),
				filteredUrl = url.substring(url.indexOf('#'));

			if (filteredUrl.length) {
				const $el = $(filteredUrl);

				if ($el.length) {
					$current.off('click').on('click', function (e) {
						e.preventDefault();
						Scroll.scrollTo({
							y: $el.offset().top,
							duration: 800
						});
					});
				}
			}
		});
	}

	_correctWPAdminBar() {
		if (this.$WPadminBar.length) {
			window.$html.css({
				overflow: 'hidden'
			});
		}
	}

	_correctAbsolutePositionElements() {
		const barHeight = (this.$WPadminBar.length && this.$WPadminBar.height()) || 0;

		gsap.to(this.$absoluteElements, {
			y: 0,
			duration: 0.3
		});

		this.$absoluteElements.each(function () {
			const $el = $(this);

			window.SB.addListener((scrollbar) => {
				gsap.set($el, {
					y: -scrollbar.offset.y + barHeight
				});
			});
		});
	}

	_correctFixedPositionElements() {
		const barHeight = (this.$WPadminBar.length && this.$WPadminBar.height()) || 0;

		gsap.to(this.$fixedElements, {
			y: 0,
			duration: 0.3
		});

		this.$fixedElements.each(function () {
			const $el = $(this);

			window.SB.addListener((scrollbar) => {
				gsap.set($el, {
					y: scrollbar.offset.y + barHeight
				});
			});
		});
	}
}

/*!========================================================================
	46. PSWP Album
	======================================================================!*/
class PSWPAlbum extends Pswp {
	constructor({
		scope,
		target,
		options
	}) {
		super({
			scope,
			target,
			options
		});

		this.hashData = this._photoswipeParseHash();
		if (this.$target.length && this.hashData.pid && this.hashData.gid) {
			this._openPhotoSwipe({
				index: this.hashData.pid,
				galleryElement: this.$target.eq(this.hashData.gid - 1),
				disableAnimation: true,
				fromURL: true
			});
		}
	}

	run($el) {
		this._bindClickAlbumLinks($el);
	}

	_bindClickAlbumLinks($gallery) {
		$gallery.on('click', (e) => {
			e.preventDefault();
			this._openPhotoSwipe({
				index: 0,
				galleryElement: $gallery
			});
		});
	}

	_getItems($galleryElement, activeIndex = 0) {
		const
			self = this,
			$items = $galleryElement.find('.js-album__items img'),
			items = [];

		$items.each(function (index) {
			const
				$el = $(this),
				src = $el.attr('data-album-src'),
				autoplay = $el.attr('data-autoplay') && activeIndex === index, // autoplay only currently active item
				media = self._getMediaTypeFromURL(src, null, autoplay),
				item = {
					w: $el.attr('width'),
					h: $el.attr('height'),
					title: $el.attr('data-title'),
				};

			switch (media.type) {
				case 'youtube':
					item.html = `<div class="pswp__wrapper-embed">${media.html}</div>`;
					break;
				case 'vimeo':
					item.html = `<div class="pswp__wrapper-embed">${media.html}</div>`;
					break;
				case 'video':
					item.html = `<div class="pswp__wrapper-embed">${media.html}</div>`;
					break;
				case 'image':
					item.el = $el.get(0);
					item.src = src;
					item.msrc = $el.find('img').attr('src');
					break;
				default: // iframe
					item.html = `<div class="pswp__wrapper-embed">${media.html}</div>`;
			}

			items.push(item);
		});

		return items;
	}
}

/*!========================================================================
	47. PSWP Gallery
	======================================================================!*/
class PSWPGallery extends Pswp {
	constructor({
		scope,
		target,
		options
	}) {
		super({
			scope,
			target,
			options
		});

		this.hashData = this._photoswipeParseHash();
		if (this.$target.length && !window.theme.ajax.enabled && this.hashData.pid && this.hashData.gid) {
			this._openPhotoSwipe({
				index: this.hashData.pid,
				galleryElement: this.$target.eq(this.hashData.gid - 1),
				disableAnimation: true,
				fromURL: true
			});
		}
	}

	run($el) {
		this._bindClickGalleryLinks($el);
	}

	_bindClickGalleryLinks($gallery) {
		const self = this,
			$links = $gallery.find('a');

		$links.on('click', function (e) {
			const
				tl = new gsap.timeline(),
				$el = $(this),
				$parallaxEl = $el.find('[data-arts-parallax] > *'),
				scale = gsap.getProperty($parallaxEl.get(0), 'scale'),
				index = $links.index($el);

			e.preventDefault();

			tl
				.add(() => {
					window.$body.addClass('pointer-events-none');
				})
				.set(self.$container, {
					transition: 'none'
				})
				.to($parallaxEl, {
					scale: 1,
					duration: 0.3,
				})
				.add(() => {
					self._openPhotoSwipe({
						index,
						galleryElement: $gallery
					});
				})
				.set($parallaxEl, {
					delay: 0.1,
					scale: scale,
					overwrite: 'all',
				})
				.set($el, {
					autoAlpha: 1
				})
				.add(() => {
					window.$body.removeClass('pointer-events-none');
				});
		});
	}
}

/*!========================================================================
	48. Scroll Down
	======================================================================!*/
class ScrollDown extends BaseComponent {
	constructor({
		target,
		scope,
		duration = 0.6
	}) {
		super({
			target,
			scope
		})

		this.duration = parseFloat(duration * 1000);
		this._bindEvents();
	}

	_bindEvents() {
		this.$target.on('click', (e) => {
			e.preventDefault();
			this._scrollDown();
		});
	}

	_scrollDown() {
		Scroll.scrollTo({
			x: 0,
			y: window.innerHeight,
			duration: this.duration
		});
	}
}

/*!========================================================================
	49. Section Content
	======================================================================!*/
class SectionContent extends ScrollAnimation {
	constructor({
		target,
		scope
	}) {
		super({
			target,
			scope
		});
	}
	set() {
		this.$headline = this.$el.find('.section__headline');
		this.$trigger = this.$el.find('.section-content__inner');
		this.$button = this.$el.find('.section-content__button');
		this.$imageInner = this.$el.find('.section-content__image');
		this.$socialItems = this.$el.find('.social__item');

		gsap.set(this.$headline, {
			scaleX: 0
		});

		gsap.set(this.$button, {
			y: 30,
			autoAlpha: 0
		});

		gsap.set(this.$imageInner, {
			scaleY: 1.5,
			y: '33%',
			transformOrigin: 'top center',
			autoAlpha: 0,
		});

		gsap.set(this.$socialItems, {
			y: 30,
			autoAlpha: 0
		});
	}
	run() {
		const tl = new gsap.timeline();

		tl
			.animateWords(this.$el, {
				ease: 'power3.out',
				duration: 1.2,
				stagger: 0.04,
			}, 'start')
			.to(this.$socialItems, {
				y: 0,
				autoAlpha: 1,
				stagger: 0.05,
				duration: 0.6
			}, '<0.2')
			.animateLines(this.$el, {
				excludeEl: '.js-change-text-hover__hover .split-text__line',
				ease: 'power3.out',
				duration: 1.2,
				stagger: 0.06,
			}, '<0.2')
			.animateHeadline(this.$headline, 'start')
			.to(this.$button, {
				duration: 0.6,
				y: 0,
				autoAlpha: 1
			}, '<0.2');

		this._createScene({
			element: this.$el,
			timeline: tl,
			customTrigger: this.$trigger
		});

		if (this.$imageInner && this.$imageInner.length) {
			const tlImage = new gsap.timeline();

			tlImage.to(this.$imageInner, {
				duration: 0.9,
				autoAlpha: 1,
				y: '0%',
				force3D: true,
				scaleY: 1,
				ease: 'power3.out',
			});

			this._createScene({
				element: this.$imageInner,
				triggerHook: 1,
				reveal: false,
				timeline: tlImage,
			});
		}
	}
}

/*!========================================================================
	50. Section Grid
	======================================================================!*/
class SectionGrid extends ScrollAnimation {
	constructor({
		scope,
		target
	}) {
		super({
			scope,
			target
		});
	}

	set() {

		this.$items = this.$el.find('.section-grid__item');
		this.$filter = this.$el.find('.js-filter');
		this.$filterUnderline = this.$filter.find('.filter__underline');
		this.$grid = this.$el.find('.js-grid');

		gsap.set(this.$items, {
			scaleY: 1.5,
			y: '33%',
			transformOrigin: 'top center',
			autoAlpha: 0,
		});

		gsap.set(this.$el, {
			autoAlpha: 1
		});

		gsap.set(this.$filterUnderline, {
			autoAlpha: 1
		});

		this._bindGridFilter();
	}

	run() {
		const
			masterTL = new gsap.timeline(),
			colsDesktop = parseInt(this.$el.data('grid-columns'), 10) || 1,
			colsTablet = parseInt(this.$el.data('grid-columns-tablet'), 10) || 1,
			colsMobile = parseInt(this.$el.data('grid-columns-mobile'), 10) || 1,
			lg = window.elementorFrontend ? window.elementorFrontend.config.breakpoints.lg - 1 : 1024,
			md = window.elementorFrontend ? window.elementorFrontend.config.breakpoints.md - 1 : 767;

		let cols = colsDesktop;

		masterTL.to(this.$filterUnderline, {
			autoAlpha: 1,
			duration: 1.2,
			ease: 'expo.inOut'
		});

		if (window.Modernizr.mq('(max-width: ' + lg + 'px)')) {
			cols = colsTablet;
		}

		if (window.Modernizr.mq('(max-width: ' + md + 'px)')) {
			cols = colsMobile;
		}

		for (var index = 0; index < this.$items.length; index = index + cols) {

			var
				$array = this.$items.slice(index, index + cols),
				tl = new gsap.timeline();

			tl
				.to($array, {
					duration: 0.9,
					autoAlpha: 1,
					y: '0%',
					force3D: true,
					scaleY: 1,
					ease: 'power3.out',
					stagger: 0.15
				}, 'start');

			this._createScene({
				element: $array[0],
				triggerHook: 0.95,
				timeline: tl,
				reveal: false
			});

		}

		this._createScene({
			element: this.$el,
			timeline: masterTL
		});
	}

	_bindGridFilter() {
		const
			self = this,
			event = new CustomEvent('arts/grid/filter');

		if (!this.$grid.length) {
			return;
		}

		this.filter = this._createFilter();
		this.grid = this._createGrid();

		if (this.$filter.length) {
			this.filter.setActiveItem(0);
			this.filter.$items.on('click', function (e) {
				const filterBy = $(this).data('filter');

				if (filterBy === '*') {
					self.$grid.removeClass('grid_filtered');
				} else {
					self.$grid.addClass('grid_filtered');
				}

				e.preventDefault();

				self.grid.isotope({
					filter: filterBy
				});
			});

			self.grid.on('arrangeComplete', () => {
				window.dispatchEvent(event);
			});
		}
	}

	_createFilter() {
		return new Filter({
			scope: this.$scope,
			target: this.$filter
		});
	}

	_createGrid() {
		return new Grid({
			target: this.$grid
		});
	}
}

/*!========================================================================
	51. Section List
	======================================================================!*/
class SectionList extends ScrollAnimation {
	constructor({
		target,
		scope
	}) {
		super({
			target,
			scope
		});
	}

	set() {
		// mouse trailing hover effect
		this.$listHoverContainer = this.$el.find('.js-list-hover');
		this.$listHoverLinks = this.$el.find('.js-list-hover__link');

		// albums thumbs hover reveal
		this.$listHoverThumbs = this.$el.find('.js-list-thumbs');
		this.$listHoverThumbsLinks = this.$el.find('.js-list-thumbs__link');

		this.$listItems = this.$el.find('.list-projects__item');
		this.$listImages = this.$el.find('.list-projects__cover img, .list-projects__thumbnail');
		this.$wrapperLinks = this.$el.find('.list-projects__wrapper-link');
		this.listHoverClass = 'list-projects_hover';
		this.canvas = this.$scope.find('.js-list-hover__canvas').get(0);
		this.listHoverOptions = {
			strength: this.$listHoverContainer.data('arts-hover-strength') || 0.0,
			scaleTexture: this.$listHoverContainer.data('arts-hover-scale-texture') || 1.8,
			scalePlane: this.$listHoverContainer.data('arts-hover-scale-plane') || 1.0
		};

		if (this.$listHoverContainer.length) {
			this._bindEventsHover();
			this._getHoverImagesEffect();

			// PJAX is active
			if (window.$barbaWrapper.length && !window.Modernizr.touchevents) {
				this._bindEventsClick();
			}
		}

		if (this.$listHoverThumbs.length) {
			this._bindEventsHover();
			this._bindEventsHoverCovers();
		}

		if (this._hasAnimationScene(this.$el)) {
			this._setAnimation();
			this._animate();
		}
	}

	_getHoverImagesEffect() {
		return new EffectStretch({
			target: this.$listHoverContainer,
			items: this.$listHoverLinks,
			canvas: this.canvas,
			options: this.listHoverOptions
		});
	}

	_bindEventsHover() {
		this.$listHoverLinks
			.on('mouseenter touchstart', () => {
				this.$listHoverContainer.addClass(this.listHoverClass);
			})
			.on('mouseleave touchend', () => {
				this.$listHoverContainer.removeClass(this.listHoverClass);
			});

		this.$listHoverThumbsLinks
			.on('mouseenter touchstart', () => {
				this.$listHoverThumbs.addClass(this.listHoverClass);
			})
			.on('mouseleave touchend', () => {
				this.$listHoverThumbs.removeClass(this.listHoverClass);
			});
	}

	_bindEventsClick() {
		const self = this;

		this.$listHoverLinks
			.on('click', function (e) {
				const $el = $(this),
					$img = $el.find('img'),
					$transformEl = $el.find('.js-transition-img__transformed-el'),
					aspect = $img[0].naturalWidth / $img[0].naturalHeight;

				let width, height;

				if (aspect > 1) { // landscape
					height = (window.innerHeight / 2 / aspect);
				} else { // portrait
					height = (window.innerHeight / 2 / (aspect + 1));
				}

				width = height * aspect;

				gsap.set($transformEl, {
					scale: Math.abs(self.listHoverOptions.scaleTexture + 0.05),
					transformOrigin: 'center center'
				});

				$el.data('coordinates', {
					top: e.clientY - height / 2, // mouse center Y
					left: e.clientX - width / 2, // mouse center X
					width,
					height,
				});
			});
	}

	_bindEventsHoverCovers() {
		const self = this;

		this.$listHoverThumbsLinks.each(function () {
			const
				$current = $(this),
				$covers = $(`.js-list-thumbs__cover[data-background-for="${$current.data('post-id')}"]`);

			$current
				.on('mouseenter touchstart', function () {
					$covers.each(function (index) {
						let
							$images = $(this).find('.list-projects__cover-wrapper'),
							offset = self._getRandomPosition(index, 20);

						gsap.to($images, {
							x: `${offset.x}%`,
							y: `${offset.y}%`,
							ease: 'power4.out',
							duration: 1.2,
							height: 'auto',
							stagger: 0.05
						});
					});
				})
				.on('mouseleave touchend', () => {
					gsap.to(self.$listHoverThumbs.find('.list-projects__cover-wrapper'), {
						ease: 'power4.out',
						duration: 1.2,
						height: 0,
						x: '0%',
						y: '0%'
					});
				});
		});
	}

	_getRandomPosition(index = 0, range = 20) {
		const res = [];

		switch (index) {
			case 0:
				res.x = gsap.utils.random(-range, 0);
				res.y = gsap.utils.random(-range, -range);
				break;
			case 1:
				res.x = gsap.utils.random(0, range);
				res.y = gsap.utils.random(-range, range);
				break;
			case 2:
				res.x = gsap.utils.random(-range, range);
				res.y = gsap.utils.random(-range, 0);
				break;
			default:
				res.x = gsap.utils.random(-range, range);
				res.y = gsap.utils.random(-range, range);
				break;
		}

		return res;
	}

	_setAnimation() {
		gsap.set(this.$listImages, {
			opacity: 0,
			scale: 1.1,
			transformOrigin: 'center center'
		});
	}

	_animate() {
		const self = this;

		self._createScene({
			element: this.$el
		});

		this.$listItems.each(function () {
			const
				$el = $(this),
				tl = new gsap.timeline(),
				$thumb = $el.find('.list-projects__cover img, .list-projects__thumbnail'),
				$heading = $el.find('.list-projects__heading'),
				offset = $thumb.is(':visible') ? '-=0.6' : '0';

			tl
				.to($thumb, {
					opacity: 1,
					scale: 1,
					duration: 1.2,
				})
				.add([
					gsap.effects.animateWords($heading, {
						duration: 0.9
					}),
					gsap.effects.animateLines($el, {
						excludeEl: '.js-change-text-hover__hover .split-text__line',
					})
				], offset);

			self._createScene({
				element: $el,
				timeline: tl,
				reveal: false
			});
		});
	}
}

/*!========================================================================
	52. Section Masthead
	======================================================================!*/
class SectionMasthead extends ScrollAnimation {
	constructor({
		target,
		scope
	}) {
		super({
			target,
			scope
		});
	}

	run() {
		this._fixedMasthead();
		if (this._hasAnimationScene(this.$el)) {
			this.setAnimation();
			this.animate();
		}
	}

	_fixedMasthead() {
		const
			$fixedMasthead = this.$el.filter('.section-masthead_fixed');

		if ($fixedMasthead.length) {
			const tl = new gsap.timeline();

			tl.fromTo($fixedMasthead, {
				autoAlpha: 1
			}, {
				autoAlpha: 0,
			});

			new $.ScrollMagic.Scene({
					triggerElement: $fixedMasthead.next(),
					triggerHook: 'onEnter',
					reverse: true,
					duration: window.innerHeight / 2
				})
				.setTween(tl)
				.setPin($fixedMasthead, {
					pushFollowers: false
				})
				.addTo(window.SMController);
		}
	}

	setAnimation() {
		this.$subheading = this.$el.find('.section-masthead__subheading');
		this.$heading = this.$el.find('.section-masthead__heading');
		this.$text = this.$el.find('.section-masthead__text');
		this.$bgWrapper = this.$el.find('.section-image__wrapper');
		this.$itemsMeta = this.$el.find('.section-masthead__meta-item');
		this.$headline = this.$el.find('.section__headline');
		this.$background = this.$el.find('.section-masthead__background:not(.js-cancel-animation)').find('.section-image__wrapper .lazy-bg');
		this.$bg = this.$el.find('.section-masthead__bg');
		this.$wrapperbutton = this.$el.find('.section-masthead__wrapper-button');
		this.$wrapperSD = this.$el.find('.section-masthead__wrapper-scroll-down');
		this.$overlay = this.$el.find('.section-masthead__background.js-cancel-animation').find('.section-masthead__overlay');

		gsap.set(this.$background, {
			scale: 1.05,
			transformOrigin: 'center center',
			autoAlpha: 0
		});

		gsap.set(this.$itemsMeta, {
			y: '100%',
			autoAlpha: 0
		});

		gsap.set(this.$bg, {
			scaleY: 0,
			transformOrigin: 'bottom center'
		});

		gsap.set(this.$overlay, {
			autoAlpha: 0
		});

		gsap.set(this.$headline, {
			scaleX: 0
		});

		gsap.set(this.$wrapperbutton, {
			y: 30,
			autoAlpha: 0
		});

		gsap.set(this.$wrapperSD, {
			y: 30,
			autoAlpha: 0
		});

		gsap.effects.hideChars(this.$el, {
			x: 0,
			y: '100%',
			autoAlpha: 1,
			duration: 0,
		});
	}

	animate() {
		const
			tl = new gsap.timeline(),
			$target = this.$el.filter('[data-arts-os-animation]'),
			from = getStaggerFrom($target);

		tl.to(this.$itemsMeta, {
			stagger: 0.2,
			duration: 0.6,
			autoAlpha: 1,
			y: '0%'
		}, 'start');

		if (this.$bg.length && this.$background.length) {
			tl.to(this.$bg, {
					duration: 1.2,
					scaleY: 1,
					ease: 'expo.inOut'
				}, 'start')
				.to(this.$background, {
					duration: 2.4,
					autoAlpha: 1,
					scale: 1
				}, '-=0.4');
		}

		if (this.$bg.length && !this.$background.length) {
			tl.to(this.$bg, {
				duration: 1.2,
				scaleY: 1,
				ease: 'expo.inOut'
			}, 'start');
		}

		if (!this.$bg.length && this.$background.length) {
			tl
				.to(this.$background, {
					duration: 2.4,
					autoAlpha: 1,
					scale: 1
				}, '<0.2');
		}

		if (this.$overlay.length) {
			tl.to(this.$overlay, {
				autoAlpha: 1,
				duration: 1.2
			}, '<0.2');
		}

		tl.animateChars($target, {
			duration: 1.2,
			stagger: distributeByPosition({
				from: from === 'center' ? 'start' : from,
				amount: 0.2
			})
		}, '<0.2');

		tl.animateWords($target, {
				ease: 'power3.out',
				duration: 1.2
			}, '<0.2')
			.animateLines($target, {
				ease: 'power3.out',
				duration: 1.2,
				stagger: 0.06,
			}, '<0.2')
			.to(this.$wrapperbutton, {
				duration: 0.6,
				y: 0,
				autoAlpha: 1
			}, '<0.2')
			.to(this.$wrapperSD, {
				duration: 0.6,
				y: 0,
				autoAlpha: 1
			}, '<0.2')
			.animateHeadline(this.$headline, {
				duration: 0.6
			}, '<0.2');

		this._createScene({
			element: $target,
			timeline: tl
		});
	}
}

/*!========================================================================
	53. Section Nav Projects
	======================================================================!*/
class SectionNavProjects extends ScrollAnimation {
	constructor({
		target,
		scope
	}) {
		super({
			target,
			scope
		});
		this.isClickedNext = false;
	}

	set() {
		this.$container = this.$el.find('.section-nav-projects__inner_actual');
		this.$circleButton = this.$el.find('.js-circle-button');
		this.$arcWrapper = this.$el.find('.circle-button__wrapper-label');
		this.$wrapperScroll = this.$el.find('.section-nav-projects__wrapper-scroll-down');
		this.$linkNext = this.$el.find('.section-nav-projects__link');
		this.$header = this.$el.find('.section-nav-projects__header');
		this.$subheading = this.$el.find('.section-nav-projects__subheading');
		this.$heading = this.$el.find('.section-nav-projects__heading');
		this.$nextImage = this.$el.find('.section-nav-projects__next-image');
		this.nextURL = this.$linkNext.attr('href');
		this.scene = null;
		this.scenePrefetch = null;

		this._setMeasures();
	}

	run() {
		if (this._hasAnimationScene(this.$el)) {

			if (window.theme.ajax.enabled) {
				this.scenePrefetch = this._createScene({
					element: this.$el,
					reveal: false,
					reverse: false,
					triggerHook: 'onEnter'
				}).on('start', () => {
					barba.prefetch(this.nextURL);
				});
			}

			this.scene = this._getScene();
			this._bindEvents();

			window.$window.on('resize', debounce(() => {
				this._setMeasures();
				this._bindEvents();
				window.SMController.removeScene(this.scene);
				this.scene = this._getScene();
			}, 500));
		}

	}

	_setMeasures() {
		this.elHeight = this.$container.height();
		this.offsetTop = this.$el.offset().top;
		this.sceneDuration = window.innerHeight;
	}

	_getScene() {
		return this._createScene({
			element: this.$el,
			timeline: this._getSceneTimeline(),
			duration: this.sceneDuration,
			reverse: true,
			triggerHook: 'onLeave'
		});
	}

	_bindEvents() {

		$(this.$circleButton).add(this.$header).off('click').on('click', (e) => {
			if (window.theme.ajax.enabled) {
				e.preventDefault();
				let offset = 0;

				if (typeof window.SB !== 'undefined') {
					offset = window.SB.limit.y + this.elHeight;
				} else {
					offset = document.body.scrollHeight - this.elHeight;
				}
				Scroll.scrollTo({
					x: 0,
					y: offset,
					duration: 1200
				});
			} else {
				this.$linkNext.get(0).click();
			}
		});
	}

	_getSceneTimeline() {
		const tl = new gsap.timeline({
			onStart: () => {
				this.scene.update(true);
				this.offsetTop = $(this.$el).offset().top;
			},
			onComplete: () => {
				if (!this.isClickedNext) {
					this.isClickedNext = true;
					window.SMController.removeScene(this.scene);
					window.SMController.removeScene(this.scenePrefetch);
					this.$linkNext.get(0).click();
				}
			},
			onUpdate: () => {
				this.scene.update(true);
				if (tl.progress() > 0.95) {
					tl.eventCallback('onUpdate', null);
					tl.progress(1);
				}
			}
		});

		tl
			.to(this.$container, {
				y: () => (window.pageYOffset - this.offsetTop + this.sceneDuration),
				duration: 1,
				ease: 'none',
			}, 'start')
			.fromTo(this.$header, {
				pointerEvents: 'initial',
				autoAlpha: 1,
				y: 0,
			}, {
				pointerEvents: 'none',
				duration: 0.75,
				autoAlpha: 0,
				y: -50,
				ease: 'linear.none',
			}, 'start')
			.fromTo(this.$nextImage, {
				ease: 'linear.none',
				autoAlpha: .1,
			}, {
				autoAlpha: 1,
				duration: 1,
				y: () => (window.pageYOffset - this.offsetTop),
			}, 'start')
			.fromTo(this.$arcWrapper, {
				rotation: 0,
				transformOrigin: 'center center'
			}, {
				duration: 1,
				rotation: 720,
			}, 'start')
			.to(this.$wrapperScroll, {
				y: -200,
				autoAlpha: 0,
				duration: 1,
			}, 'start');

		return tl;
	}
}

/*!========================================================================
	54. Section Scroll
	======================================================================!*/
class SectionScroll extends ScrollAnimation {
	constructor({
		target,
		scope
	}) {
		super({
			target,
			scope
		});
	}
	set() {
		const self = this;

		this.$el.each(function () {
			const
				$el = $(this),
				duration = $el.innerHeight(),
				defaultTheme = $el.data('arts-default-theme'),
				defaultColor = $el.data('arts-theme-text'),
				scrollTheme = $el.data('arts-scroll-theme'),
				scrollColor = $el.data('arts-scroll-theme-text'),
				offset = parseFloat($el.data('arts-scroll-offset')),
				triggerHook = parseFloat($el.data('arts-scroll-trigger-hook')),
				scene = self._createScene({
					element: $el,
					triggerHook,
					offset,
					duration
				});

			scene
				.on('enter', () => {
					$el.removeClass(defaultTheme).addClass(scrollTheme);
					$el.attr('data-arts-theme-text', scrollColor);
				})
				.on('leave', () => {
					$el.removeClass(scrollTheme).addClass(defaultTheme);
					$el.attr('data-arts-theme-text', defaultColor);
				});
		});

	}
	_createScene({
		element,
		duration = 0,
		offset = 0,
		triggerHook = 0
	}) {
		return new $.ScrollMagic.Scene({
				triggerElement: element,
				triggerHook,
				reverse: true,
				duration,
				offset
			})
			.addTo(window.SMController);
	}
}

/*!========================================================================
	55. Section Projects Slider
	======================================================================!*/
class SectionProjectsSlider extends ScrollAnimation {
	constructor({
		target,
		scope
	}) {
		super({
			target,
			scope
		});
	}
	set() {
		this.$slider = this.$el.find('.js-slider-fullscreen-projects');
		this.$sliderImg = this.$el.find('.slider-fullscreen-projects__images');
		this.$footer = this.$el.find('.slider-fullscreen-projects__footer');
		this.$canvasWrapper = this.$el.find('.slider__wrapper-canvas');
		this.$overlay = this.$el.find('.slider__overlay');
		this.$arrowLeft = this.$el.find('.slider__arrow_left .arrow-left');
		this.$arrowRight = this.$el.find('.slider__arrow_right .arrow-right');
		this.$counter = this.$el.find('.slider__wrapper-counter');

		this.slider = new SliderFullscreenProjects({
			scope: this.$scope,
			target: this.$slider
		});
		this.$activeSlide = this.$slider.find('.swiper-slide-active');
		this.$activeHeading = this.$activeSlide.find('.slider__heading');
		this.$activeSubheading = this.$activeSlide.find('.slider__subheading');
		this.$activeDescription = this.$activeSlide.find('.slider__text');
		this.$activeButton = this.$activeSlide.find('.slider__wrapper-button');
		this.$activeBg = this.$activeSlide.find('.slider__bg');
		this.activeBgScale = gsap.getProperty(this.$activeBg.get(0), 'scale') || 1;

		gsap.set(this.$canvasWrapper, {
			scale: 1.1,
			autoAlpha: 0,
			transformOrigin: 'center center'
		});

		gsap.set(this.$footer, {
			autoAlpha: 0,
			y: '100%'
		});

		gsap.set(this.$arrowLeft, {
			x: -50,
			autoAlpha: 0
		});

		gsap.set(this.$arrowRight, {
			x: 50,
			autoAlpha: 0
		});

		gsap.set(this.$counter, {
			autoAlpha: 0
		});

		gsap.effects.hideChars(this.$activeHeading, {
			x: 50,
			y: 0,
			duration: 0,
		});

		gsap.effects.hideChars(this.$activeSubheading, {
			x: 25,
			y: 0,
			duration: 0,
		});

		gsap.effects.hideLines(this.$activeDescription, {
			y: '100%',
			duration: 0
		});

		gsap.set(this.$activeButton, {
			y: 50,
			autoAlpha: 0
		});

		gsap.set(this.$activeBg, {
			scale: 1.1,
			autoAlpha: 0,
			transformOrigin: 'center center',
			transition: 'none'
		});
	}

	run() {
		const tl = new gsap.timeline(),
			from = getStaggerFrom(this.$activeSlide);

		tl
			.add([
				gsap.to(this.$canvasWrapper, {
					scale: 1,
					autoAlpha: 1,
					ease: 'power3.out',
					duration: 2.4,
					transformOrigin: 'center center'
				}),
				gsap.to(this.$activeBg, {
					scale: this.activeBgScale,
					autoAlpha: 1,
					ease: 'power3.out',
					duration: 2.4,
					transformOrigin: 'center center',
					transition: 'none',
					clearProps: 'transform'
				})
			])
			.animateChars(this.$activeHeading, {
				duration: 1.2,
				stagger: distributeByPosition({
					from: from === 'center' ? 'start' : from,
					amount: 0.4
				}),
				ease: 'power3.out',
			}, '-=2.0')
			.add([
				gsap.effects.animateChars(this.$activeSubheading, {
					duration: 1.2,
					stagger: distributeByPosition({
						from: from === 'center' ? 'start' : from,
						amount: 0.4
					}),
					ease: 'power3.out',
				}),
				gsap.effects.animateLines(this.$activeDescription, {
					duration: 1.2,
					ease: 'power3.out',
					stagger: {
						from: 'start',
						amount: 0.08
					}
				}),
				gsap.effects.animateLines(this.$slider.find('.slider__wrapper-button'), {
					excludeEl: '.js-change-text-hover__hover .split-text__line',
				})
			], '-=1.2')
			.to(this.$activeButton, {
				duration: 1.2,
				ease: 'power3.out',
				y: 0,
				autoAlpha: 1
			}, '-=1.2')
			.add([
				gsap.to(this.$footer, {
					duration: 1.2,
					autoAlpha: 1,
					y: '0%'
				}),
				gsap.to([this.$arrowLeft, this.$arrowRight, this.$counter], {
					autoAlpha: 1,
					duration: 1.2,
					x: '0%',
					y: '0%',
					stagger: 0.1,
				}),
			], '-=1.2')

		this._createScene({
			element: this.$el,
			timeline: tl
		});
	}
}

/*!========================================================================
	56. Section Slider Images
	======================================================================!*/
class SectionSliderImages extends ScrollAnimation {
	constructor({
		target,
		scope
	}) {
		super({
			target,
			scope
		});
	}
	set() {
		this.$slider = this.$el.find('.js-slider-images');
		this.$slides = this.$slider.find('.swiper-slide');
		this.slider = new SliderImages({
			target: this.$slider,
			scope: this.scope
		});

		gsap.set(this.$slides, {
			x: '33%',
			autoAlpha: 0,
			transformOrigin: 'right center'
		});
	}
	run() {
		const tl = new gsap.timeline();

		tl.to(this.$slides, {
			duration: 1.2,
			autoAlpha: 1,
			x: '0%',
			force3D: true,
			stagger: 0.1,
			ease: 'power3.out',
		});

		this._createScene({
			element: this.$el,
			timeline: tl,
		});
	}
}

/*!========================================================================
	57. Section Testimonials
	======================================================================!*/
class SectionTestimonials extends ScrollAnimation {
	constructor({
		target,
		scope
	}) {
		super({
			target,
			scope
		});
	}
	set() {
		this.$slider = this.$el.find('.js-slider-testimonials');
		this.slider = new SliderTestimonials({
			target: this.$slider,
			scope: this.scope
		});

		this.$activeSlide = this.$slider.find('.swiper-slide-active');
		this.$activeSign = this.$activeSlide.find('.figure-testimonial__sign');
		this.$activeDescription = this.$activeSlide.find('.slider-testimonials__text');

		gsap.set(this.$activeSign, {
			y: 50,
			autoAlpha: 0
		});

		gsap.effects.hideLines(this.$activeDescription, {
			y: '100%',
			duration: 0
		});
	}
	run() {
		const tl = new gsap.timeline();

		tl
			.add([
				gsap.to(this.$activeSign, {
					duration: 1.2,
					y: 0,
					autoAlpha: 1,
					ease: 'power3.out',
				}),
				gsap.effects.animateLines(this.$activeDescription, {
					duration: 1.2,
					ease: 'power3.out',
					delay: 0.2,
					stagger: {
						from: 'start',
						amount: 0.08
					}
				})
			]);

		this._createScene({
			element: this.$el,
			timeline: tl
		});
	}
}

/*!========================================================================
	58. Slider Images
	======================================================================!*/
class SliderImages extends Slider {
	constructor({
		scope,
		target
	}) {
		super({
			target,
			scope
		});
	}

	set() {

		this.$slider = this.$el.find('.js-slider-images__slider');

		// counter
		this.$counterCurrent = this.$el.find('.js-slider__counter-current');
		this.$counterTotal = this.$el.find('.js-slider__counter-total');
		this.counterStyle = this.$slider.data('counter-style') || 'roman';
		this.counterZeros = this.$slider.data('counter-add-zeros') || 0;

		// dragging
		this.dragMouse = this.$slider.data('drag-mouse') || false;
		this.dragCursor = this.$slider.data('drag-cursor') || false;
		this.dragClass = this.$slider.data('drag-class') || '';

		// dots
		this.$sliderDots = this.$el.find('.js-slider__dots');
	}

	run() {
		this.breakpoints = this._setBreakPoints();
		this.slider = this._getSlider();
		this.sliderCounter = this._getSliderCounter({
			slider: this.slider,
			counter: {
				current: this.$counterCurrent,
				total: this.$counterTotal,
				style: this.counterStyle,
				zeros: this.counterZeros
			}
		});

		// dots
		if (this.$sliderDots.length) {
			this._getSliderDots({
				slider: this.slider,
				container: this.$sliderDots
			});
		}

		// slider drag
		if (this.dragCursor) {
			this._emitDragEvents({
				slider: this.slider,
				target: document,
				customClass: this.dragClass
			});
		}

		// pause autoplay
		if (this.slider.params.autoplay.enabled) {
			this._pauseAutoplay({
				slider: this.slider,
			});
		}

		this._bindEvents();
	}

	_bindEvents() {
		// update height after images are loaded
		this.slider.on('lazyImageReady', () => {
			this.slider.update();
		});

		window.$window
			.on('arts/barba/transition/end', () => {
				this.slider.update();
			})
			.on('arts/preloader/end', () => {
				this.slider.update();
			});

		// update slider geometry as images load
		this.$el.imagesLoaded().progress({
			background: true
		}, (e) => {
			setTimeout(() => {
				this.slider.update();
			}, 300);
		});

		setTimeout(() => {
			this.slider.updateAutoHeight();
		}, 300);

	}

	_setBreakPoints() {
		const
			breakpoints = {},
			lg = window.elementorFrontend ? window.elementorFrontend.config.breakpoints.lg - 1 : 1024,
			md = window.elementorFrontend ? window.elementorFrontend.config.breakpoints.md - 1 : 767;

		breakpoints[lg] = {
			slidesPerView: this.$slider.data('slides-per-view') || 1,
			spaceBetween: this.$slider.data('space-between') || 0,
			centeredSlides: this.$slider.data('centered-slides') || false,
		};
		breakpoints[md] = {
			slidesPerView: this.$slider.data('slides-per-view-tablet') || 1.33,
			spaceBetween: this.$slider.data('space-between-tablet') || 20,
			centeredSlides: this.$slider.data('centered-slides-tablet') || true,
		};
		breakpoints[0] = {
			slidesPerView: this.$slider.data('slides-per-view-mobile') || 1.16,
			spaceBetween: this.$slider.data('space-between-mobile') || 10,
			centeredSlides: this.$slider.data('centered-slides-mobile') || true,
		};

		return breakpoints;
	}

	_getSlider() {
		return new Swiper(this.$slider[0], {
			simulateTouch: this.dragMouse ? true : false,
			autoHeight: this.$slider.data('auto-height'),
			speed: this.$slider.data('speed') || 1200,
			preloadImages: false,
			lazy: {
				loadPrevNext: true,
				loadPrevNextAmount: 3,
				loadOnTransitionStart: true
			},
			slideToClickedSlide: true,
			touchRatio: this.$slider.data('touch-ratio') || 2,
			observer: true,
			watchSlidesProgress: true,
			watchSlidesVisibility: true,
			centeredSlides: this.$slider.data('centered-slides') || false,
			slidesPerView: 1,
			autoplay: {
				disableOnInteraction: false,
				enabled: this.$slider.data('autoplay-enabled') || false,
				delay: this.$slider.data('autoplay-delay') || 6000,
			},
			spaceBetween: this.$slider.data('space-between') || 60,
			pagination: {
				el: this.$el.find('.js-slider__dots').get(0),
				type: 'bullets',
				bulletElement: 'div',
				clickable: true,
				bulletClass: 'slider__dot',
				bulletActiveClass: 'slider__dot_active'
			},
			navigation: {
				nextEl: this.$el.find('.js-slider__arrow-next'),
				prevEl: this.$el.find('.js-slider__arrow-prev'),
			},
			breakpoints: this.breakpoints,
			parallax: true,
			touchEventsTarget: 'container',
			keyboard: {
				enabled: true,
				onlyInViewport: true
			},
			mousewheel: this.$slider.data('mousewheel-enabled') ? {
				eventsTarged: this.$el.get(0),
				eventsTarget: this.$el.get(0),
				releaseOnEdges: true,
			} : false,
		});
	}
}

/*!========================================================================
	59. Slider Fullscreen Projects
	======================================================================!*/
class SliderFullscreenProjects extends Slider {
	constructor({
		scope,
		target
	}) {
		super({
			target,
			scope
		});
	}

	set() {
		// sliders
		this.$sliderImg = this.$target.find('.js-slider-fullscreen-projects__images');
		this.$sliderContent = this.$target.find('.js-slider-fullscreen-projects__content');
		this.$sliderFooter = this.$target.find('.js-slider-fullscreen-projects__footer');

		// canvas for WebGL effects
		this.$canvas = this.$target.find('.slider__canvas');
		this.$canvasWrapper = this.$target.find('.slider__wrapper-canvas-inner');

		// content
		this.$heading = this.$target.find('.slider__heading');
		this.$subheading = this.$target.find('.slider__subheading');
		this.$description = this.$target.find('.slider__text');
		this.$link = this.$target.find('.slider__wrapper-button');
		this.$images = this.$sliderImg.find('.slider__images-slide-inner');

		// params
		this.sliderSpeed = this.$sliderImg.data('speed') || 600;
		this.isSliderReveal = this.$target.hasClass('js-slider-reveal');
		this.revealClass = 'slider-fullscreen-projects__images_reveal';

		// dragging
		this.dragMouse = this.$sliderImg.data('drag-mouse') || false;
		this.dragCursor = this.$sliderImg.data('drag-cursor') || false;
		this.dragClass = this.$sliderImg.data('drag-class') || '';

		this.transitionEffect = this.$sliderImg.data('transition-effect');
		this.effectIntensity = this.$sliderImg.data('transition-effect-intensity') || 0.2;
		this.displacementImage = this.$sliderImg.data('transition-displacement-img') || '';
		this.aspectRatio = this.$sliderImg.data('aspect-ratio') || 1.5;

		// counter
		this.$counterCurrent = this.$target.find('.js-slider-fullscreen-projects__counter-current');
		this.$counterTotal = this.$target.find('.js-slider-fullscreen-projects__counter-total');
		this.counterStyle = this.$sliderImg.data('counter-style') || 'roman';
		this.counterZeros = this.$sliderImg.data('counter-add-zeros') || 0;

		// categories
		this.$sliderCategories = this.$target.find('.js-slider__categories');

		// dots
		this.$sliderDots = this.$target.find('.js-slider__dots');
	}

	run() {
		// Swiper instances
		this.sliderImg = this._getSliderImages();
		this.sliderContent = this._getSliderContent();
		this.sliderCounter = this._getSliderCounter({
			slider: this.sliderImg,
			counter: {
				current: this.$counterCurrent,
				total: this.$counterTotal,
				style: this.counterStyle,
				zeros: this.counterZeros
			}
		});
		this.sliderFooter = this._getSliderFooter();

		// distortion effect
		if (this._isDistortionEffect()) {
			this.distortionEffect = this._setSliderDistortionEffect();
		}

		// connect sliders
		this.sliderImg.controller.control.push(this.sliderContent);
		this.sliderContent.controller.control.push(this.sliderImg);

		// text transitions
		this._setSliderTextTransitions();

		// slider drag
		if (this.dragCursor) {
			this._emitDragEvents({
				slider: this.sliderImg,
				target: document,
				customClass: this.dragClass
			});
		}

		// pause autoplay
		if (this.sliderImg.params.autoplay.enabled) {
			this._pauseAutoplay({
				slider: this.sliderImg,
			});
		}

		// set reveal backgrounds
		if (this.isSliderReveal) {
			this._setSliderReveal();
		}

		// dots
		if (this.$sliderDots.length) {
			this._getSliderDots({
				slider: this.sliderImg,
				container: this.$sliderDots
			});
		}

		// categories indicator
		if (this.$sliderCategories.length) {
			this._getCategoriesSlider();
		}
	}

	_getSliderImages() {
		if (!this.$sliderImg.length) {
			return false;
		}

		return new Swiper(this.$sliderImg[0], {
			simulateTouch: this.dragMouse ? true : false,
			direction: this.$sliderImg.data('direction') || 'horizontal',
			slidesPerView: this.$sliderImg.data('slides-per-view') || 1,
			touchRatio: this._isDistortionEffect() ? 1 : this.$sliderImg.data('touch-ratio') || 1,
			effect: this.isSliderReveal ? 'fade' : 'slide',
			allowTouchMove: true,
			fadeEffect: {
				crossFade: true
			},
			centeredSlides: true,
			parallax: this._isDistortionEffect() ? false : true,
			speed: this.sliderSpeed,
			preloadImages: false,
			updateOnImagesReady: true,
			grabCursor: true,
			lazy: {
				loadPrevNextAmount: 4,
				loadPrevNext: true,
				loadOnTransitionStart: true
			},
			slideToClickedSlide: true,
			keyboard: {
				enabled: true,
				onlyInViewport: true
			},
			autoplay: {
				disableOnInteraction: false,
				enabled: this.$sliderImg.data('autoplay-enabled') || false,
				delay: this.$sliderImg.data('autoplay-delay') || 6000,
			},
			mousewheel: this.$sliderImg.data('mousewheel-enabled') ? {
				eventsTarged: this.$target.get(0),
				eventsTarget: this.$target.get(0),
				releaseOnEdges: true,
			} : false,
			pagination: {
				el: this.$el.find('.js-slider__dots').get(0),
				type: 'bullets',
				bulletElement: 'div',
				clickable: true,
				bulletClass: 'slider__dot',
				bulletActiveClass: 'slider__dot_active'
			},
			navigation: {
				nextEl: this.$el.find('.js-slider__arrow-next').get(0),
				prevEl: this.$el.find('.js-slider__arrow-prev').get(0),
			},
			controller: {
				control: [],
				by: 'container'
			}
		});
	}

	_getSliderContent() {
		if (!this.$sliderContent.length) {
			return false;
		}

		return new Swiper(this.$sliderContent[0], {
			// simulateTouch: this.dragMouse ? true : false,
			centeredSlides: true,
			nested: true,
			speed: this.sliderSpeed,
			autoHeight: true,
			effect: 'fade',
			fadeEffect: {
				crossFade: true
			},
			virtualTranslate: true,
			allowTouchMove: false,
			touchRatio: this._isDistortionEffect() ? 1 : this.$sliderImg.data('touch-ratio') || 1,
			watchSlidesProgress: true,
			controller: {
				control: [],
				by: 'container'
			}
		});
	}

	_getSliderFooter() {
		if (this.$sliderFooter.length) {
			const sliderFooter = new Swiper(this.$sliderFooter[0], {
				centeredSlides: true,
				speed: this.sliderSpeed,
				effect: 'fade',
				fadeEffect: {
					crossFade: true
				},
				allowTouchMove: false
			});

			this.sliderImg.controller.control.push(sliderFooter);
		}
	}

	_setSliderReveal() {
		return new SliderHoverBackgrounds({
			target: this.$sliderImg,
			scope: this.$scope,
			sliderImg: this.sliderImg,
			images: this.$images,
			links: this.$sliderContent.find('a'),
			hoverClass: this.revealClass
		})
	}

	_getCategoriesSlider() {
		return new SliderCategories({
			target: this.$sliderCategories,
			scope: this.$scope,
			sliderContent: this.sliderContent,
			links: this.$sliderContent.find('a')
		});
	}

	_setSliderDistortionEffect() {
		this.sliderImg.params.preloadImages = false;
		this.sliderImg.params.lazy = false;
		this.sliderImg.params.effect = 'fade';
		this.sliderImg.params.fadeEffect.crossFade = true;

		return new SliderDistortionEffect({
			scope: this.$scope,
			slider: this.sliderImg,
			target: this.$sliderImg,
			intensity: this.effectIntensity,
			aspectRatio: this.aspectRatio,
			canvas: this.$canvas,
			canvasWrapper: this.$canvasWrapper,
			displacementImage: this.displacementImage
		});
	}

	_setSliderTextTransitions() {
		return new SliderTextTransitions({
			slider: this.sliderContent,
			direction: this.sliderImg.params.direction,
			offset: 50,
			heading: this.$heading,
			subheading: this.$subheading,
			description: this.$description,
			link: this.$link
		});
	}

	_isDistortionEffect() {
		return this.transitionEffect === 'distortion';
	}
}

/*!========================================================================
	60. Slider Categories
	======================================================================!*/
class SliderCategories extends BaseComponent {
	constructor({
		target,
		scope,
		sliderContent,
		links,
		options
	}) {
		super({
			target,
			scope
		});

		this.sliderContent = sliderContent;

		// elements
		this.$links = links;
		this.$items = this.$target.find('[data-category]');
		this.$button = this.$target.find('[data-button]');

		// setup
		this.initialCategory = $(this.sliderContent.slides[this.sliderContent.realIndex]).data('category');
		this.$initialActiveItem = this.$target.find(`[data-category="${this.initialCategory}"]`);
		this.$slides = $(sliderContent.slides);
		this.timeline = new gsap.timeline();

		// options
		this.options = options || {
			duration: 0.4,
			ease: 'power4.out'
		};

		this._bindSliderEvents();
		this._bindHoverEvents();
		this._getTimelineShowItem(this.$initialActiveItem);

	}

	_bindSliderEvents() {
		this.sliderContent
			.on('slideChange', () => {
				const
					prevCategory = this.$slides.eq(this.sliderContent.previousIndex).data('category'),
					category = this.$slides.eq(this.sliderContent.realIndex).data('category'),
					$activeItem = this.$target.find(`[data-category="${category}"]`);

				if (!category.length) {
					this.timeline
						.clear()
						.hideLines(this.$items, {
							y: '100%',
							stagger: 0,
							duration: this.options.duration,
							ease: this.options.ease
						});
				}

				// don't animate if category of next current item is
				// the same as previous
				if ($activeItem.length && category !== prevCategory) {
					this.timeline.clear().add(this._getTimelineShowItem($activeItem));
				}

			});
	}

	_bindHoverEvents() {
		this.$links
			.on('mouseenter touchstart', () => {
				this.timeline.clear().add(this._getTimelineShowButton());
			})
			.on('mouseleave touchend', () => {

				const
					category = this.$slides.eq(this.sliderContent.realIndex).data('category'),
					$activeItem = this.$target.find(`[data-category="${category}"]`);

				if ($activeItem.length) {
					this.timeline.clear().add(this._getTimelineShowItem($activeItem));
				}
			});
	}

	_getTimelineShowButton() {
		return new gsap.timeline()
			.hideLines(this.$button, {
				y: '100%',
				duration: 0,
				stagger: 0
			})
			.add([
				gsap.effects.animateLines(this.$button, {
					duration: this.options.duration,
					stagger: 0,
					ease: this.options.ease
				}),
				gsap.effects.hideLines(this.$items, {
					y: '-100%',
					duration: this.options.duration,
					stagger: 0,
					ease: this.options.ease
				})
			]);
	}

	_getTimelineShowItem($activeItem) {
		return new gsap.timeline()
			.hideLines($activeItem, {
				y: '100%',
				duration: 0,
				stagger: 0
			})
			.add([
				gsap.effects.animateLines($activeItem, {
					duration: this.options.duration,
					stagger: 0,
					ease: this.options.ease
				}),
				gsap.effects.hideLines([this.$items.not($activeItem), this.$button], {
					y: '-100%',
					duration: this.options.duration,
					stagger: 0,
					ease: this.options.ease
				})
			]);
	}
}

/*!========================================================================
	61. Slider Counter
	======================================================================!*/
class SliderCounter {
	constructor({
		slider,
		sliderCounter,
		slideClass = '',
		total,
		style = 'roman',
		addZeros = 2
	}) {

		if (!slider || !sliderCounter || !$(slider).length || !$(sliderCounter).length) {
			return false;
		}

		this.slider = slider;
		this.sliderCounter = sliderCounter;
		this.slideClass = slideClass;
		this.numOfSlides = slider.slides.length;
		this.startSlides = parseInt(slider.params.slidesPerView, 10);
		this.romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX'];
		this.zeros = addZeros;
		this.style = style;
		this.total = total;

		switch (this.zeros) {
			case 0:
				this.prefixCurrent = '';
				this.prefixTotal = '';
				break;
			case 1:
				this.prefixCurrent = '0';
				this.prefixTotal = this.numOfSlides >= 10 ? '' : '0';
				break;
			case 2:
				this.prefixCurrent = '00';
				this.prefixTotal = this.numOfSlides >= 10 ? '0' : '00';
				break;
		}

		this._createSlider();
		this._renderCounter();
		this._renderTotal();
		this._bindEvents();

		return this.counter;
	}

	_createSlider() {
		this.counter = new Swiper(this.sliderCounter[0], {
			speed: this.slider.params.speed,
			direction: 'vertical',
			simulateTouch: false,
			allowTouchMove: false,
			on: {
				init: this.removeAllSlides
			}
		});
	}

	_renderCounter() {
		for (let index = this.startSlides; index <= this.numOfSlides; index++) {

			if (this.style === 'roman') {
				this.counter.appendSlide(this._getSlideTemplate({
					slideClass: this.slideClass,
					content: this.romanNumerals[index - 1]
				}));
			} else {
				const prefix = index >= 10 ? this.prefixCurrent = '0' : this.prefixCurrent;

				this.counter.appendSlide(this._getSlideTemplate({
					slideClass: this.slideClass,
					content: prefix + index
				}));
			}

		}
	}

	_renderTotal() {
		const $el = $(this.total);

		if ($el.length) {
			$el.html(this.style === 'roman' ? this.romanNumerals[this.numOfSlides - 1] : this.prefixTotal + this.numOfSlides);
		}
	}

	_getSlideTemplate({
		slideClass,
		content
	}) {
		return `<div class="swiper-slide"><div class="${slideClass}">${content}</div></div>`;
	}

	_bindEvents() {
		this.slider.on('slideChange', () => {
			this.counter.slideTo(this.slider.realIndex);
		});
	}
}

/*!========================================================================
	62. Slider Distortion Effect
	======================================================================!*/
class SliderDistortionEffect extends BaseComponent {
	constructor({
		scope,
		target,
		slider,
		intensity,
		aspectRatio = 1.5,
		canvasWrapper,
		canvas,
		displacementImage
	}) {
		super({
			scope,
			target
		});

		if (!this._isThreeLoaded()) {
			return false;
		}

		this.slider = slider;
		this.speed = parseFloat(slider.params.speed / 1000);
		this.intensity = intensity;
		this.aspectRatio = aspectRatio;
		this.timeline = new gsap.timeline();

		this.$wrapper = this.slider.$wrapperEl;
		this.$canvasWrapper = canvasWrapper;
		this.canvas = canvas.get(0);
		this.displacementImg = displacementImage;

		this.distortionEffect = this._getEffect();
		this._setSlider();
		this._bindEvents();
		this._hideSlider();
	}

	_setSlider() {
		this.slider.params.effect = 'fade';
		this.slider.params.fadeEffect.crossFade = true;
		this.slider.params.touchRatio = 4;
		this.slider.params.preventInteractionOnTransition = true;

		if (this.slider.params.mousewheel.enabled) {
			this.slider.mousewheel.disable();
		}

		if (this.slider.params.keyboard.enabled) {
			this.slider.keyboard.disable();
		}
	}

	_bindEvents() {
		this.slider.on('slideChange', () => {
			this.distortionEffect.change({
				from: this.slider.previousIndex,
				to: this.slider.realIndex,
				speed: this.speed,
				intensity: this.slider.realIndex < this.slider.previousIndex ? -this.intensity : this.intensity,
				ease: 'power2.inOut'
			});

			this.timeline
				.clear()
				.to(this.$canvasWrapper, {
					duration: this.speed,
					scale: 1.05,
					transformOrigin: 'center center',
					ease: 'power2.out'
				})
				.to(this.$canvasWrapper, {
					duration: this.speed * 2,
					scale: 1,
				});
		});
	}

	_isThreeLoaded() {
		return (typeof window.THREE === 'object');
	}

	_getImagesSources() {
		const sources = [];

		this.$target.find('.slider__bg').each(function () {
			let path = $(this).attr('data-background');

			// video poster
			if (!path) {
				path = $(this).attr('poster');
			}

			sources.push(path);
		});

		return sources;
	}

	_getEffect() {
		return new EffectDistortion({
			slider: this.slider,
			canvas: this.canvas,
			aspect: this.aspectRatio,
			displacementImage: this.displacementImg,
			items: $(this.slider.slides)
		});
	}

	_hideSlider() {
		if (typeof window.elementor !== 'undefined') {
			gsap.set(this.$wrapper, {
				display: 'none'
			});
		} else {
			gsap.set(this.$wrapper, {
				autoAlpha: 0
			});
		}
	}

}

/*!========================================================================
	63. Slider Dots
	======================================================================!*/
class SliderDots {
	constructor({
		slider,
		container
	}) {
		this.slider = slider;
		this.$container = container;
		this.$dots = this.$container.find('.slider__dot');
		this.delay = this.slider.params.autoplay.enabled ? parseFloat(this.slider.params.autoplay.delay / 1000) : parseFloat(this.slider.params.speed / 1000 / 2);
		this.timeline = new gsap.timeline();
		this.initialSetTimeline = new gsap.timeline();

		if (!this.$dots.length) {
			return false;
		}

		this.run();
	}

	run() {
		this._renderDots();
		this._prepare();
		this._bindEvents();
	}

	_renderDots() {
		this.$dots.append(this._getDotTemplate());
		this.$circles = this.$dots.find('.circle');
	}

	_prepare() {
		gsap.set(this.$circles, {
			strokeOpacity: 0,
			transformOrigin: 'center center',
			rotate: 180,
			drawSVG: '100% 100%',
		});

		const
			$currentDot = this.$dots.eq(0),
			$currentCircle = $currentDot.find('.circle');

		this.initialSetTimeline.fromTo($currentCircle, {
			strokeOpacity: 1,
			rotate: 0,
			transformOrigin: 'center center',
			drawSVG: '100% 100%',
			ease: 'power3.inOut',
		}, {
			strokeOpacity: 1,
			rotate: 180,
			transformOrigin: 'center center',
			duration: this.delay,
			drawSVG: '0% 100%',
		});
	}

	_bindEvents() {
		this.slider
			.on('autoplayStop', () => {
				this.timeline.pause();
			})
			.on('autoplayStart', () => {
				this.timeline.play();
			})
			.on('transitionStart', () => {
				this._setCurrentDot(this.slider.realIndex);
			});
	}

	_setCurrentDot(index = 0) {
		const
			$currentDot = this.$dots.eq(index),
			$currentCircle = $currentDot.find('.circle'),
			$otherCircles = this.$circles.not($currentCircle);

		this.timeline
			.clear()
			.add(() => {
				if (this.initialSetTimeline) {
					this.initialSetTimeline.kill();
				}
			})
			.to($otherCircles, {
				duration: this.delay / 10,
				transformOrigin: 'center center',
				drawSVG: '0% 0%',
				ease: 'expo.inOut',
			})
			.set($otherCircles, {
				strokeOpacity: 0,
			})
			.fromTo($currentCircle, {
				strokeOpacity: 1,
				rotate: 0,
				transformOrigin: 'center center',
				drawSVG: '100% 100%',
				ease: 'power3.inOut',
			}, {
				strokeOpacity: 1,
				rotate: 180,
				transformOrigin: 'center center',
				duration: this.delay,
				drawSVG: '0% 100%',
			});
	}

	_getDotTemplate() {
		return `
			<svg viewBox="0 0 152 152" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
				<g fill="none" fill-rule="evenodd"><g transform="translate(-134.000000, -98.000000)">
					<path class="circle" d="M135,174a75,75 0 1,0 150,0a75,75 0 1,0 -150,0"></path>
				</g>
			</svg>
		`;
	}
}

/*!========================================================================
	64. Slider Hover Backgrounds
	======================================================================!*/
class SliderHoverBackgrounds extends BaseComponent {
	constructor({
		target,
		scope,
		sliderImg,
		images,
		links,
		hoverClass
	}) {
		super({
			scope,
			target
		});

		this.$images = images;
		this.$links = links;
		this.hoverClass = hoverClass;

		if (!this.$links.length) {
			return false;
		}

		this._bindHoverEvents();
	}

	_bindHoverEvents() {
		const self = this;

		this.$links.each(function () {
			$(this)
				.on('mouseenter touchstart', () => {
					self.$target.addClass(self.hoverClass);
				})
				.on('mouseleave touchend', () => {
					self.$target.removeClass(self.hoverClass);
				});
		});
	}
}

/*!========================================================================
	65. Slider Text Transitions
	======================================================================!*/
class SliderTextTransitions {
	constructor({
		slider,
		direction,
		offset = 40,
		staggerHeadings = 0.3,
		staggerTexts = 0.2,
		heading,
		subheading,
		description,
		link
	}) {
		// slider
		this.slider = slider;
		this.$slides = $(this.slider.slides);

		// params
		this.offset = offset;
		this.direction = direction || this.slider.params.direction;
		this.speed = parseFloat(this.slider.params.speed / 1000);

		// elements
		this.$heading = heading;
		this.$subheading = subheading;
		this.$description = description;
		this.$link = link;
		this.elementsLength = this._countExistentElements();

		// animation
		this.timeline = new gsap.timeline();
		this.hideTimeline = new gsap.timeline();
		this.ease = 'power4.out';
		this.staggerHeadings = staggerHeadings;
		this.staggerTexts = staggerTexts;
		this.animationDirections = this._getAnimationDirections();
		this._initialSet();
		this._bindEvents();
	}

	_countExistentElements() {
		let length = 0;

		(this.$heading && this.$heading.length) ? length++ : '';
		(this.$subheading && this.$subheading.length) ? length++ : '';
		(this.$description && this.$description.length) ? length++ : '';
		(this.$link && this.$link.length) ? length++ : '';

		return length;
	}

	_bindEvents() {
		this.slider.on('slideChange', () => {
			if (this.slider.realIndex > this.slider.previousIndex) {
				this._slideChangeTransition({
					direction: 'next'
				});
			}

			if (this.slider.realIndex < this.slider.previousIndex) {
				this._slideChangeTransition({
					direction: 'prev'
				});
			}
		});
	}

	_initialSet() {
		const directions = this._getSlideAnimationDirections({
			direction: 'next'
		});

		if (this.$subheading && this.$subheading.length) {
			SetText.setChars({
				target: this.$subheading.not(this.$subheading.eq(0)),
				x: directions.in.x / 4,
				y: directions.in.y / 4,
			});
		}

		if (this.$heading && this.$heading.length) {
			SetText.setChars({
				target: this.$heading.not(this.$heading.eq(0)),
				x: directions.in.x,
				y: directions.in.y,
			});
		}

		if (this.$description && this.$description.length) {
			SetText.setLines({
				target: this.$description.not(this.$description.eq(0)),
				autoAlpha: 1,
				y: '100%',
			});
		}

		if (this.$link && this.$link.length) {
			gsap.set(this.$link.not(this.$link.eq(0)), {
				y: (this.animationDirections.offset.y.next.in || this.animationDirections.offset.x.next.in) / 2,
				autoAlpha: 0,
			});
		}
	}

	_slideChangeTransition({
		direction = 'next'
	}) {
		const
			self = this,
			directions = this._getSlideAnimationDirections({
				direction
			}),
			$prevSlide = this.$slides.eq(this.slider.previousIndex),
			$prevHeading = $prevSlide.find(this.$heading),
			$prevSubheading = $prevSlide.find(this.$subheading),
			$prevDescription = $prevSlide.find(this.$description),
			$prevLink = $prevSlide.find(this.$link),
			$activeSlide = this.$slides.eq(this.slider.realIndex),
			$activeHeading = $activeSlide.find(this.$heading),
			$activeSubheading = $activeSlide.find(this.$subheading),
			$activeDescription = $activeSlide.find(this.$description),
			$activeLink = $activeSlide.find(this.$link);

		this.timeline.clear();

		/**
		 * Animate out previous elements
		 * and set current elements
		 */
		if (this.$subheading && this.$subheading.length) {
			self.timeline.add([
				gsap.effects.hideChars(this.$subheading.not($activeSubheading), {
					duration: self.speed / 2,
					x: directions.out.x / 4,
					y: directions.out.y / 4,
					stagger: distributeByPosition({
						amount: self.staggerHeadings,
						from: directions.out.from
					}),
					ease: self.ease
				}),
				gsap.effects.hideChars($activeSubheading, {
					duration: 0,
					x: directions.in.x / 4,
					y: directions.in.y / 4,
				})
			], '0')
		}

		if (this.$heading && this.$heading.length) {
			self.timeline.add([
				gsap.effects.hideChars(this.$heading.not($activeHeading), {
					duration: self.speed,
					x: directions.out.x,
					y: directions.out.y,
					stagger: distributeByPosition({
						amount: self.staggerHeadings,
						from: directions.out.from
					}),
					ease: self.ease
				}),
				gsap.effects.hideChars($activeHeading, {
					duration: 0,
					x: directions.in.x,
					y: directions.in.y,
				})
			], '0');
		}

		if (this.$description && this.$description.length) {
			self.timeline.add([
				gsap.effects.hideLines(this.$description.not($activeDescription), {
					duration: self.speed,
					y: direction === 'next' ? '-100%' : '100%',
					stagger: distributeByPosition({
						from: direction === 'next' ? 'start' : 'end',
						amount: self.staggerTexts
					}),
					ease: self.ease,
				}),
				gsap.effects.hideLines($activeDescription, {
					duration: 0,
					y: direction === 'next' ? '100%' : '-100%',
				}),
			], '0')
		}

		if ($prevLink.length) {
			self.timeline.to($prevLink, {
				duration: self.speed,
				y: (self.animationDirections.offset.y.next.out || self.animationDirections.offset.x.next.out) / -2,
				autoAlpha: 0,
				ease: self.ease
			}, '0');
		}

		/**
		 * Set current elements
		 */

		if ($activeLink.length) {
			self.timeline.set($activeLink, {
				y: (self.animationDirections.offset.y.next.in || self.animationDirections.offset.x.next.in) / 2,
				autoAlpha: 0,
				ease: self.ease,
			}, '0');
		}

		/**
		 * All current elements are set
		 */
		self.timeline.addLabel('elementsSet');

		/**
		 * Animate in current elements
		 */
		if ($activeSubheading.length) {
			self.timeline.animateChars($activeSubheading, {
				duration: self.speed,
				stagger: distributeByPosition({
					amount: self.staggerHeadings,
					from: directions.in.from,
				}),
				ease: self.ease,
			}, `elementsSet-=${this.speed / 2}`);
		}

		if ($activeHeading.length) {
			self.timeline.animateChars($activeHeading, {
				duration: self.speed,
				stagger: distributeByPosition({
					amount: self.staggerHeadings,
					from: directions.in.from,
				}),
				ease: self.ease,
			}, `elementsSet-=${this.speed / 2}`);
		}

		if ($activeDescription.length) {
			self.timeline.animateLines($activeDescription, {
				duration: self.speed,
				autoAlpha: 1,
				stagger: distributeByPosition({
					amount: self.staggerTexts,
					from: direction === 'next' ? 'start' : 'end',
				}),
				ease: self.ease,
			}, `elementsSet-=${this.speed / 2}`);
		}

		if ($activeLink.length) {
			self.timeline.to($activeLink, {
				duration: self.speed,
				y: 0,
				autoAlpha: 1,
				ease: self.ease,
			}, `elementsSet-=${this.speed / 2}`);
		}

		this.timeline.timeScale(this.speed);

	}

	_getSlideAnimationDirections({
		direction = 'next'
	}) {
		const
			directions = {
				in: {
					x: 0,
					y: 0,
					from: 'start'
				},
				out: {
					x: 0,
					y: 0,
					from: 'start'
				},
			};
		if (direction === 'next') {
			// next in
			directions.in.x = this.animationDirections.offset.x.next.in;
			directions.in.y = this.animationDirections.offset.y.next.in;
			directions.in.from = this.animationDirections.from.next.in;

			// next out
			directions.out.x = this.animationDirections.offset.x.next.out;
			directions.out.y = this.animationDirections.offset.y.next.out;
			directions.out.from = this.animationDirections.from.next.out;
		}

		if (direction === 'prev') {
			// prev in
			directions.in.x = this.animationDirections.offset.x.prev.in;
			directions.in.y = this.animationDirections.offset.y.prev.in;
			directions.in.from = this.animationDirections.from.prev.in;

			// prev out
			directions.out.x = this.animationDirections.offset.x.prev.out;
			directions.out.y = this.animationDirections.offset.y.prev.out;
			directions.out.from = this.animationDirections.from.prev.out;
		}

		return directions;
	}

	_getAnimationDirections() {
		const textAlign = this.$heading ? this.$heading.css('text-align') : 'left';

		const directions = {
			offset: {
				x: {
					next: {
						in: 0,
						out: 0
					},
					prev: {
						in: 0,
						out: 0
					},
				},
				y: {
					next: {
						in: 0,
						out: 0
					},
					prev: {
						in: 0,
						out: 0
					},
				},
			},
			from: {
				next: {
					in: 'start',
					out: 'start'
				},
				prev: {
					in: 'end',
					out: 'end'
				},
			}
		};

		switch (textAlign) {
			case 'left':
				// text align left & slider horizontal
				if (this.direction === 'horizontal') {
					directions.offset.x.next.in = this.offset;
					directions.offset.x.next.out = -this.offset;
					directions.offset.x.prev.in = -this.offset;
					directions.offset.x.prev.out = this.offset;

					directions.from.next.in = 'start';
					directions.from.next.out = 'start';
					directions.from.prev.in = 'end';
					directions.from.prev.out = 'end';
				}
				// text align left & slider vertical
				if (this.direction === 'vertical') {
					directions.offset.y.next.in = this.offset;
					directions.offset.y.next.out = -this.offset;
					directions.offset.y.prev.in = -this.offset;
					directions.offset.y.prev.out = this.offset;

					directions.from.next.in = 'end';
					directions.from.next.out = 'start';
					directions.from.prev.in = 'start';
					directions.from.prev.out = 'end';
				}
				break;
			case 'center':
				// text align center & slider horizontal
				if (this.direction === 'horizontal') {
					directions.offset.x.next.in = -this.offset;
					directions.offset.x.next.out = this.offset;
					directions.offset.x.prev.in = this.offset;
					directions.offset.x.prev.out = -this.offset;

					directions.from.next.in = 'end';
					directions.from.next.out = 'end';
					directions.from.prev.in = 'start';
					directions.from.prev.out = 'start';
				}
				// text align left & slider vertical
				if (this.direction === 'vertical') {
					directions.offset.y.next.in = this.offset;
					directions.offset.y.next.out = -this.offset;
					directions.offset.y.prev.in = -this.offset;
					directions.offset.y.prev.out = this.offset;

					directions.from.next.in = 'center';
					directions.from.next.out = 'center';
					directions.from.prev.in = 'center';
					directions.from.prev.out = 'center';
				}
				break;
			case 'right':
				// text align right & slider horizontal
				if (this.direction === 'horizontal') {
					directions.offset.x.next.in = -this.offset;
					directions.offset.x.next.out = this.offset;
					directions.offset.x.prev.in = this.offset;
					directions.offset.x.prev.out = -this.offset;

					directions.from.next.in = 'end';
					directions.from.next.out = 'end';
					directions.from.prev.in = 'start';
					directions.from.prev.out = 'start';
				}
				// text align right & slider vertical
				if (this.direction === 'vertical') {

					directions.offset.y.next.in = -this.offset;
					directions.offset.y.next.out = this.offset;
					directions.offset.y.prev.in = this.offset;
					directions.offset.y.prev.out = -this.offset;

					directions.from.next.in = 'start';
					directions.from.next.out = 'end';
					directions.from.prev.in = 'end';
					directions.from.prev.out = 'start';
				}
				break;
		}

		return directions;
	}
}

/*!========================================================================
	66. Slider Testimonials
	======================================================================!*/
class SliderTestimonials extends Slider {
	constructor({
		scope,
		target
	}) {
		super({
			target,
			scope
		});
	}

	set() {
		// counter
		this.$counterCurrent = this.$target.find('.js-slider-testimonials__counter-current');
		this.$counterTotal = this.$target.find('.js-slider-testimonials__counter-total');
		this.counterStyle = this.$target.data('counter-style') || 'roman';
		this.counterZeros = this.$target.data('counter-add-zeros') || 0;
		this.$text = this.$target.find('.slider-testimonials__text');

		// params
		this.dragCursor = this.$target.data('drag-cursor') || false;
		this.dragClass = this.$target.data('drag-class') || '';

		// dots
		this.$sliderDots = this.$target.find('.js-slider__dots');
	}

	run() {
		this.breakpoints = this._setBreakPoints();
		this.slider = this._getSlider();

		// counter
		if (this.$counterCurrent.length) {
			this.sliderCounter = this._getSliderCounter({
				slider: this.slider,
				counter: {
					current: this.$counterCurrent,
					total: this.$counterTotal,
					style: this.counterStyle,
					zeros: this.counterZeros
				}
			});
		}

		// dots
		if (this.$sliderDots.length) {
			this._getSliderDots({
				slider: this.slider,
				container: this.$sliderDots
			});
		}

		// slider drag
		if (this.dragCursor) {
			this._emitDragEvents({
				slider: this.slider,
				target: document,
				customClass: this.dragClass
			});
		}

		// pause autoplay
		if (this.slider.params.autoplay.enabled) {
			this._pauseAutoplay({
				slider: this.slider,
			});
		}

		// text transitions
		this._setSliderTextTransitions();

		this._bindEvents();
	}

	_bindEvents() {
		// update height after images are loaded
		this.slider.on('lazyImageReady', () => {
			this.slider.update();
		});

		// update slider geometry as images load
		this.$target.imagesLoaded().progress({
			background: true
		}, (e) => {
			setTimeout(() => {
				this.slider.update();
			}, 300);
		});

	}

	_setBreakPoints() {
		const
			breakpoints = {},
			lg = window.elementorFrontend ? window.elementorFrontend.config.breakpoints.lg - 1 : 1024,
			md = window.elementorFrontend ? window.elementorFrontend.config.breakpoints.md - 1 : 767;

		breakpoints[lg] = {
			slidesPerView: this.$target.data('slides-per-view') || 1,
			spaceBetween: this.$target.data('space-between') || 0,
			centeredSlides: this.$target.data('centered-slides') || false,
		};
		breakpoints[md] = {
			slidesPerView: this.$target.data('slides-per-view-tablet') || 1.33,
			spaceBetween: this.$target.data('space-between-tablet') || 20,
			centeredSlides: this.$target.data('centered-slides-tablet') || true,
		};
		breakpoints[320] = {
			slidesPerView: this.$target.data('slides-per-view-mobile') || 1.16,
			spaceBetween: this.$target.data('space-between-mobile') || 10,
			centeredSlides: this.$target.data('centered-slides-mobile') || true,
		};

		return breakpoints;
	}

	_getSlider() {
		return new Swiper(this.$target[0], {
			effect: 'fade',
			fadeEffect: {
				crossFade: true
			},
			virtualTranslate: true,
			allowTouchMove: false,
			direction: 'horizontal',
			autoHeight: true,
			speed: this.$target.data('speed') || 1200,
			autoplay: {
				disableOnInteraction: false,
				enabled: this.$target.data('autoplay-enabled') || false,
				delay: this.$target.data('autoplay-delay') || 6000,
			},
			pagination: {
				el: this.$el.find('.js-slider__dots').get(0),
				type: 'bullets',
				bulletElement: 'div',
				clickable: true,
				bulletClass: 'slider__dot',
				bulletActiveClass: 'slider__dot_active'
			},
			navigation: {
				nextEl: this.$el.find('.js-slider__arrow-next').get(0),
				prevEl: this.$el.find('.js-slider__arrow-prev').get(0),
			},
			preloadImages: false,
			lazy: {
				loadPrevNext: true,
				loadPrevNextAmount: 3,
				loadOnTransitionStart: true
			},
		});
	}

	_setSliderTextTransitions() {
		return new SliderTextTransitions({
			slider: this.slider,
			offset: 50,
			description: this.$text
		});
	}
}

/*!========================================================================
	67. Mobile Bar Height
	======================================================================!*/
class MobileBarHeight {
	constructor() {
		this.vh = 0;
		this._createStyleElement();
		this._setVh();
		this._bindEvents();
	}

	_setVh() {
		this.vh = window.innerHeight * 0.01;
		$('#arts-fix-bar').html(`:root { --fix-bar-vh: ${this.vh}px; }`);
	}

	_bindEvents() {
		window.$window.on('resize', debounce(() => {
			this._setVh();
		}, 250));
	}

	_createStyleElement() {
		if (!$('#arts-fix-bar').length) {
			$('head').append('<style id="arts-fix-bar"></style>');
		}
	}
}

/*!========================================================================
	68. Debounce
	======================================================================!*/
function debounce(func, wait, immediate) {
	let timeout;

	return () => {

		let
			context = this,
			args = arguments;

		let later = () => {

			timeout = null;

			if (!immediate) {
				func.apply(context, args)
			};

		};

		let callNow = immediate && !timeout;

		clearTimeout(timeout);

		timeout = setTimeout(later, wait);

		if (callNow) {
			func.apply(context, args)
		}
	}
}

/*!========================================================================
	69. Distribute By Position
	======================================================================!*/
/*
pass in an object with any of the following optional properties (just like the stagger special object):
{
  amount: amount (in seconds) that should be distributed
  from: "center" | "end" | "start" | index value (integer)
  ease: any ease, like Power1.easeOut
  axis: "x" | "y" (or omit, and it'll be based on both the x and y positions)
}
*/
function distributeByPosition(vars) {
	let ease = vars.ease,
		from = vars.from || 0,
		base = vars.base || 0,
		axis = vars.axis,
		ratio = {
			center: 0.5,
			end: 1
		} [from] || 0,
		distances;
	return function (i, target, a) {
		let l = a.length,
			originX, originY, x, y, d, j, minX, maxX, minY, maxY, positions;
		if (!distances) {
			distances = [];
			minX = minY = Infinity;
			maxX = maxY = -minX;
			positions = [];
			for (j = 0; j < l; j++) {
				d = a[j].getBoundingClientRect();
				x = (d.left + d.right) / 2; //based on the center of each element
				y = (d.top + d.bottom) / 2;
				if (x < minX) {
					minX = x;
				}
				if (x > maxX) {
					maxX = x;
				}
				if (y < minY) {
					minY = y;
				}
				if (y > maxY) {
					maxY = y;
				}
				positions[j] = {
					x: x,
					y: y
				};
			}
			originX = isNaN(from) ? minX + (maxX - minX) * ratio : positions[from].x || 0;
			originY = isNaN(from) ? minY + (maxY - minY) * ratio : positions[from].y || 0;
			maxX = 0;
			minX = Infinity;
			for (j = 0; j < l; j++) {
				x = positions[j].x - originX;
				y = originY - positions[j].y;
				distances[j] = d = !axis ? Math.sqrt(x * x + y * y) : Math.abs((axis === "y") ? y : x);
				if (d > maxX) {
					maxX = d;
				}
				if (d < minX) {
					minX = d;
				}
			}
			distances.max = maxX - minX;
			distances.min = minX;
			distances.v = l = vars.amount || (vars.each * l) || 0;
			distances.b = (l < 0) ? base - l : base;
		}
		l = (distances[i] - distances.min) / distances.max;
		return distances.b + (ease ? ease.getRatio(l) : l) * distances.v;
	};
}

/*!========================================================================
	70. Get Stagger From
	======================================================================!*/
function getStaggerFrom($target) {
	if (!$target || !$target.length) {
		return;
	}

	const textAlign = $target.css('text-align');

	switch (textAlign) {
		case 'left':
			return 'start';
		case 'center':
			return 'center';
		case 'right':
			return 'end';
	}
}

/*!========================================================================
	71. Is Anchor
	======================================================================!*/
function checkIsAnchor($el) {
	const link = $el.attr('href');

	if ($el.length && link.length && link !== '#') {
		return true;
	} else {
		return false;
	}
}

/*!========================================================================
	72. Math
	======================================================================!*/
Number.prototype.map = function (in_min, in_max, out_min, out_max) {
	return ((this - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min
}

/*!========================================================================
	73. Run On High Performance GPU
	======================================================================!*/
function runOnHighPerformanceGPU() {
	const webGLCanvas = document.getElementById('js-webgl');

	if (typeof webGLCanvas !== 'undefined' && webGLCanvas !== null) {
		webGLCanvas.getContext('webgl', {
			powerPreference: 'high-performance'
		});
	}
}

/*!========================================================================
	74. Sync Attributes
	======================================================================!*/
function syncAttributes($sourceElement, $targetElement) {
	// single element
	if ($sourceElement.length === 1 && $targetElement.length === 1) {

		$targetElement.attr($sourceElement.getAllAttributes());

		// multiple elements
	} else if ($sourceElement.length > 1 && $targetElement.length > 1 && $sourceElement.length === $targetElement.length) {

		$.each($targetElement, function (index) {
			const
				$current = $(this),
				sourceAttributes = $sourceElement.eq(index).getAllAttributes();

			// source element doesn't have any attributes present
			if ($.isEmptyObject(sourceAttributes)) {
				// ... so remove all attributes from the target element
				[...this.attributes].forEach(attr => this.removeAttribute(attr.name));
			} else {
				$current.attr(sourceAttributes);
			}
		});
	}
}


})(jQuery);
