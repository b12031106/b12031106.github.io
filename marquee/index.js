const body = document.body;
const bodyStyle = getComputedStyle(body);
const drawingZoneEl = document.getElementById('drawing-zone');
const resultZoneEl = document.getElementById('result-zone');

const GIF_CHUNKS_COUNT = 4;
const SQUARE_SIZE = 64;
const CANVAS_HEIGHT = SQUARE_SIZE;
const CANVAS_WIDTH = GIF_CHUNKS_COUNT * SQUARE_SIZE;

const FONT_COLOR = '#000';
const BACKGROUND_COLOR = '#fff';

// 禎數
const FPS = 30;
// 整個動畫長度
const ANIMATION_DURATION = 5000;

const FRAME_DURATION = 1000 / FPS;
const TOTAL_FRAMES = ANIMATION_DURATION / FRAME_DURATION;

const TEXT = '自卑與自信都是自己給自己的';
const FONT_SIZE = '60px';
const FONT_FAMILY = bodyStyle.fontFamily;

//

let canvases = [];

// functions

const createCanvas = (idx, size) => {
    let el = document.createElement('canvas');
    let ctx = el.getContext('2d');
    el.id = `canvas-${idx}`;
    el.height = size;
    el.width = size;

    // 預設的 context 設定
    ctx.textBaseline= 'middle';
    ctx.font = `${FONT_SIZE} ${FONT_FAMILY}`;

    return el;
}

const clearCanvas = () => {
    canvases.forEach(canvas => {
        canvas.ctx.fillStyle = BACKGROUND_COLOR;
        canvas.ctx.fillRect(0, 0, SQUARE_SIZE, SQUARE_SIZE);
    })
}

const drawText = (posX) => {
    clearCanvas();
    canvases.forEach((canvas, idx) => {
        let shiftPos = idx * SQUARE_SIZE;
        // 繪製畫面到 canvas
        canvas.ctx.fillStyle = FONT_COLOR;
        canvas.ctx.fillText(TEXT, posX - shiftPos, SQUARE_SIZE / 2);
        // 將 canvas 的畫面加入 gif 的一個 frame
        canvas.gif.addFrame(canvas.ctx, {
            copy: true,
            delay: FRAME_DURATION,
        });
    });
}

const getMeasureTextWidth = (ctx, text) => {
    let textMertric = ctx.measureText(text);
    return textMertric.width;
};

const generateFileDownloadLink = (canvas, idx) => {
    canvas.gif.on('finished', blob => {
        let url = URL.createObjectURL(blob);
        let el = document.getElementById(`result-${idx}`);
        let img = document.createElement('img');
        img.src = url;
        el.appendChild(img);
        el.href = url;
        el.download = `gif-${idx}.gif`;
        console.log('finished', idx);
    });
    console.log('render');
    canvas.gif.render();
};

const startAnimation = () => {
    // 起點，canvas 的總寬度
    let startPositionX = CANVAS_WIDTH;
    // 終點，文字總長度 * -1，拿第一個 canvas dom 來算就好
    let endPositionX = getMeasureTextWidth(canvases[0].ctx, TEXT) * -1;
    let positionX = startPositionX;

    // 移動總距離
    const moveDistance = startPositionX - endPositionX;
    // 每 frame 移動的距離
    const movePerFrame = Math.round(moveDistance / TOTAL_FRAMES);

    console.log(startPositionX, endPositionX);
    let interval = rafSetInterval(() => {
        drawText(positionX);
        if (positionX <= endPositionX) {
            console.log('end');
            interval.stop();

            resultZoneEl.innerHTML = '';
            for (let i = 0; i < GIF_CHUNKS_COUNT; i += 1) {
                let container = document.createElement('a');
                container.id = `result-${i}`;
                resultZoneEl.appendChild(container);
                generateFileDownloadLink(canvases[i], i);
            }
            return;
        }
        positionX -= movePerFrame;
    }, FRAME_DURATION);
}

const initialize = () => {

    // 建立足夠數量的 canvas element
    let fragment = document.createDocumentFragment();
    for (let idx = 0; idx < GIF_CHUNKS_COUNT; idx += 1) {
        let canvasEl = createCanvas(idx, SQUARE_SIZE);
        fragment.appendChild(canvasEl);
        canvases.push({
            dom: canvasEl,
            ctx: canvasEl.getContext('2d'),
            gif: new GIF({
                workers: 2,
                quality: 10,
                workerScript: '/assets/js/gif/gif.worker.js',
                debug: true,
                width: SQUARE_SIZE,
                height: SQUARE_SIZE,
            })
        });
    }
    drawingZoneEl.appendChild(fragment);

    startAnimation();
}

initialize();