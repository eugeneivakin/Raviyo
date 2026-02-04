(function () {
  'use strict';

  // Start playback when at least 33% of the section is visible and play to the end.
  var PLAY_VISIBILITY = 0.33;

  function initSectionVideo(section) {
    var video = section.querySelector('video');
    if (!video) return;

    // video is always muted in this project, set it and don't try to restore
    try { video.muted = true; } catch (e) {}

    // make sure video is prepared for inline autoplay
    video.playsInline = true;
    video.setAttribute('webkit-playsinline', '');
    video.preload = video.preload || 'auto';

    // flag to mark user-initiated pause (click). When user leaves the section we clear this flag so replay on return works.
    var userPaused = false;

    function startPlayback() {
      // don't auto-resume if user explicitly paused
      if (userPaused) return;

      // if already playing, nothing to do
      if (!video.paused && !video.ended) return;

      try { video.currentTime = 0; } catch (e) {}

      var playPromise = video.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.catch(function (err) {
          // autoplay blocked or other error
          console.warn('section-video: play() rejected', err);
        });
      }

      section.classList.remove('video--paused-by-user');
    }

    function stopAndReset() {
      // clear user pause on leave so that returning will auto-play
      userPaused = false;
      try {
        if (!video.paused) video.pause();
        // do NOT reset currentTime to avoid visual jump when leaving mid-play
      } catch (e) {}
      // remove user pause visual state on exit
      section.classList.remove('video--paused-by-user');
    }

    function onIntersection(entries) {
      entries.forEach(function (entry) {
        if (entry.intersectionRatio >= PLAY_VISIBILITY) {
          startPlayback();
        } else {
          stopAndReset();
        }
      });
    }

    // click to pause (only pause; do NOT resume on click)
    video.addEventListener('click', function () {
      if (!video.paused) {
        try { video.pause(); } catch (e) {}
        userPaused = true;
        section.classList.add('video--paused-by-user');
      }
    });

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(onIntersection, { threshold: [PLAY_VISIBILITY] });
      io.observe(section);
    } else {
      // fallback for older browsers: simple scroll/resize check that supports replay
      var checkVisibility = function () {
        var rect = section.getBoundingClientRect();
        var h = rect.height || section.offsetHeight;
        if (h <= 0) return;
        var visible = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0));
        var ratio = visible / h;
        if (ratio >= PLAY_VISIBILITY) {
          startPlayback();
        } else {
          stopAndReset();
        }
      };
      window.addEventListener('scroll', checkVisibility, { passive: true });
      window.addEventListener('resize', checkVisibility);
      setTimeout(checkVisibility, 50);
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