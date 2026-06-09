function initMoviePlayer(streamUrl) {
  var video = document.getElementById('movieVideo');
  var overlay = document.getElementById('playOverlay');
  var hlsInstance = null;
  var initialized = false;

  function attachStream() {
    if (!video || initialized) {
      return;
    }
    initialized = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (window.Hls && Hls.isSupported()) {
      hlsInstance = new Hls({ enableWorker: true, lowLatencyMode: true });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  }

  function playNow() {
    attachStream();
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    video.controls = true;
    var result = video.play();
    if (result && typeof result.catch === 'function') {
      result.catch(function() {});
    }
  }

  if (overlay) {
    overlay.addEventListener('click', playNow);
  }

  if (video) {
    video.addEventListener('click', function() {
      if (!initialized || video.paused) {
        playNow();
      }
    });
    window.addEventListener('pagehide', function() {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
}
