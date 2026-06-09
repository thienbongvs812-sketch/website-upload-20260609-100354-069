import { H as Hls } from './hls-vendor.js';

var player = document.querySelector('[data-player]');
var video = player ? player.querySelector('[data-video]') : null;
var overlay = player ? player.querySelector('[data-play-overlay]') : null;
var data = document.getElementById('play-data');
var hls = null;
var loaded = false;
var streamUrl = '';

if (data) {
    try {
        streamUrl = JSON.parse(data.textContent || '{}').url || '';
    } catch (error) {
        streamUrl = '';
    }
}

function bindStream() {
    if (!video || !streamUrl || loaded) {
        return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
    } else if (Hls && Hls.isSupported()) {
        hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
    } else {
        video.src = streamUrl;
    }

    loaded = true;
}

async function startPlayback() {
    if (!player || !video) {
        return;
    }

    bindStream();
    player.classList.add('is-playing');
    video.controls = true;

    try {
        await video.play();
    } catch (error) {
        video.controls = true;
    }
}

if (overlay) {
    overlay.addEventListener('click', startPlayback);
}

if (video) {
    video.addEventListener('click', function () {
        if (!loaded || video.paused) {
            startPlayback();
        }
    });
}

window.addEventListener('pagehide', function () {
    if (hls) {
        hls.destroy();
        hls = null;
    }
});
