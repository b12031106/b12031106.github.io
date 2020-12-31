const raf = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

window.rafSetInterval = (cb, interval) => {
    if (typeof cb !== 'function') {
        return;
    }
    interval = interval || 0;

    let stopFlag = false;
    let before = Date.now();
    let proxy = function() {

        if (stopFlag) {
            return;
        }

        let now = Date.now();
        if ((now - before) >= interval) {
            cb();
            before = now;
        }

        raf(proxy);
    }

    proxy();

    return {
        stop() {
            stopFlag = true;
        }
    }
};