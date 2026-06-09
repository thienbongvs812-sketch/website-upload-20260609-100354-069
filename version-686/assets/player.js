(function () {
  function init(options) {
    var video = document.getElementById(options.videoId);
    var button = document.getElementById(options.buttonId);
    var errorBox = document.getElementById(options.errorId);
    var source = options.source;
    var hls = null;
    var loaded = false;

    function showError(message) {
      if (!errorBox) {
        return;
      }
      errorBox.textContent = message;
      errorBox.hidden = false;
    }

    function hideError() {
      if (errorBox) {
        errorBox.hidden = true;
        errorBox.textContent = '';
      }
    }

    function loadVideo() {
      if (loaded || !video || !source) {
        return;
      }
      loaded = true;
      hideError();
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            showError('视频加载失败，请稍后重试');
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            showError('视频暂时无法播放');
            hls.destroy();
          }
        });
      } else {
        showError('视频暂时无法播放');
      }
    }

    function playVideo() {
      if (!video) {
        return;
      }
      loadVideo();
      if (button) {
        button.classList.add('is-hidden');
      }
      video.controls = true;
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          showError('点击播放器后可继续播放');
        });
      }
    }

    if (!video) {
      return;
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });

    video.addEventListener('play', function () {
      hideError();
      if (button) {
        button.classList.add('is-hidden');
      }
    });

    video.addEventListener('error', function () {
      showError('视频加载失败，请稍后重试');
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.MoviePlayer = {
    init: init
  };
})();
