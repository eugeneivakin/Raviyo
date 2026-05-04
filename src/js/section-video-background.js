(function () {
  'use strict';

  // Start playback when at least 33% of the section is visible and play to the end.
  var PLAY_VISIBILITY = 0.33;


  function getCurrentVideo(section) {
    var isMobile = window.innerWidth <= 768;
    var videoMobile = section.querySelector('video[data-device="mobile"]');
    var videoDesktop = section.querySelector('video[data-device="desktop"]');
    if (isMobile && videoMobile) return videoMobile;
    if (!isMobile && videoDesktop) return videoDesktop;
    // fallback: if we don’t have what we need, we take any
    return section.querySelector('video');
  }

  function prepareVideo(video) {
    if (!video) return;
    try { video.muted = true; } catch (e) {}
    video.playsInline = true;
    video.setAttribute('webkit-playsinline', '');
    video.preload = video.preload || 'auto';
  }

  function initSectionVideo(section) {
    var videoMobile = section.querySelector('video[data-device="mobile"]');
    var videoDesktop = section.querySelector('video[data-device="desktop"]');
    if (videoMobile) prepareVideo(videoMobile);
    if (videoDesktop) prepareVideo(videoDesktop);

    var userPaused = false;
    var currentVideo = getCurrentVideo(section);

    function startPlayback() {
      var v = getCurrentVideo(section);
      if (!v) return;
      if (userPaused) return;
      if (!v.paused && !v.ended) return;
      try { v.currentTime = 0; } catch (e) {}
      var playPromise = v.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.catch(function (err) {
          console.warn('section-video: play() rejected', err);
        });
      }
      section.classList.remove('video--paused-by-user');
    }

    function stopAndReset() {
      userPaused = false;
      var v = getCurrentVideo(section);
      if (!v) return;
      try {
        if (!v.paused) v.pause();
        // do not reset currentTime so that there is no jump
      } catch (e) {}
      section.classList.remove('video--paused-by-user');
    }

    function pauseAllExceptCurrent() {
      var v = getCurrentVideo(section);
      [videoMobile, videoDesktop].forEach(function (vid) {
        if (vid && vid !== v) {
          try { vid.pause(); } catch (e) {}
        }
      });
    }

    function onIntersection(entries) {
      entries.forEach(function (entry) {
        if (entry.intersectionRatio >= PLAY_VISIBILITY) {
          pauseAllExceptCurrent();
          startPlayback();
        } else {
          stopAndReset();
          pauseAllExceptCurrent();
        }
      });
    }

    // click to pause (pause only, do not launch on click)
    [videoMobile, videoDesktop].forEach(function (vid) {
      if (!vid) return;
      vid.addEventListener('click', function () {
        if (!vid.paused) {
          try { vid.pause(); } catch (e) {}
          userPaused = true;
          section.classList.add('video--paused-by-user');
        }
      });
    });

    // resize processing: if the video type changes, switch
    var lastIsMobile = window.innerWidth <= 768;
    function onResize() {
      var isMobile = window.innerWidth <= 768;
      if (isMobile !== lastIsMobile) {
        pauseAllExceptCurrent();
        userPaused = false;
        startPlayback();
        lastIsMobile = isMobile;
      }
    }

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(onIntersection, { threshold: [PLAY_VISIBILITY] });
      io.observe(section);
    } else {
      var checkVisibility = function () {
        var rect = section.getBoundingClientRect();
        var h = rect.height || section.offsetHeight;
        if (h <= 0) return;
        var visible = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0));
        var ratio = visible / h;
        if (ratio >= PLAY_VISIBILITY) {
          pauseAllExceptCurrent();
          startPlayback();
        } else {
          stopAndReset();
          pauseAllExceptCurrent();
        }
      };
      window.addEventListener('scroll', checkVisibility, { passive: true });
      window.addEventListener('resize', checkVisibility);
      setTimeout(checkVisibility, 50);
    }
    window.addEventListener('resize', onResize);

    // --- Adding .section-content commit handling ---
    var sectionContent = section.querySelector('.section-content');
    if (sectionContent) {
      function updateFixedClass() {
        var sectionRect = section.getBoundingClientRect();
        var contentRect = sectionContent.getBoundingClientRect();
        var contentHeight = sectionContent.offsetHeight;
        var sectionHeight = section.offsetHeight;
        var windowHeight = window.innerHeight;

        // Resetting classes and inline styles
        function resetAll() {
          sectionContent.classList.remove('fixed');
          sectionContent.classList.remove('sticky--bottom');
          sectionContent.style.top = '';
        }

        // We process only if the section is at least partially visible
        if (sectionRect.bottom <= 0 || sectionRect.top >= windowHeight) {
          resetAll();
          return;
        }

        // sticky-logic:
        // 1. If the top of the section >= 0 -reset
        if (sectionRect.top >= 0) {
          resetAll();
          return;
        }

        // 2. If bottom .section-content >= bottom of section -sticky--bottom
        if (contentRect.bottom >= sectionRect.bottom && sectionRect.bottom <= windowHeight) {
          sectionContent.classList.remove('fixed');
          sectionContent.classList.add('sticky--bottom');
          sectionContent.style.top = (sectionHeight - contentHeight) + 'px';
          return;
        }

        // 3. If top .section-content <= 0 -fixed
        if (contentRect.top <= 0) {
          sectionContent.classList.add('fixed');
          sectionContent.classList.remove('sticky--bottom');
          sectionContent.style.top = '0px';
          return;
        }

        // 4. In other cases -reset
        resetAll();
      }
      window.addEventListener('scroll', updateFixedClass, { passive: true });
      window.addEventListener('resize', updateFixedClass);
      setTimeout(updateFixedClass, 50);
    }
  }

  function initAll() {
    var sections = document.querySelectorAll(".section-video-background");
    if (!sections || sections.length === 0) return;
    sections.forEach(function (section) { initSectionVideo(section); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();

