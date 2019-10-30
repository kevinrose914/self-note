(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.PipCanvas = factory());
}(this, (function () { 'use strict';

    class PipCanvas {
        constructor({
            el,
            imgList = [],
            radio = 1,
            index = 0,
            scale = 0.99,
            scaleReturn = 0.8,
            w = 750,
            h = 1206,
            gif_timer = null,
            gifImgs = [],
        }) {
            this.imgList = imgList;
            this.radio = radio;
            this.index = index; // 当前浏览图片的下标
            this.scale = scale;
            this.scaleReturn = scaleReturn;
            this.w = w;
            this.h = h;
            this.gif_timer = gif_timer;
            this.gifImgs = gifImgs;
            this.canvas = $(el)[0];
            this.ctx = this.canvas.getContext('2d');
        }
        loadGifImg() {
            const loadPromises = this.gifImgs.map(
                item =>
                    new Promise((resolve, reject) => {
                        const img = new Image();
                        img.src = item;
                        img.onload = () => resolve(img);
                        img.onerror = () => reject();
                    }),
            );
            return Promise.all(loadPromises);
        }
        loadPageImg() {
            const loadPromises = this.imgList.map(
                (item, index) =>
                    new Promise((resolve, reject) => {
                        const img = new Image();
                        img.src = item.link;
                        img.i = index;
                        img.name = index;
                        img.className = 'item';
                        item.image = img;
                        img.onload = () => {
                            $('.collection').append(item.image);
                            resolve();
                        };
                        img.onerror = () => reject();
                    }),
            );
            return Promise.all(loadPromises);
        }
        async init() {
            console.log('init', new Date().getTime());
            await this.loadPageImg();
            if (this.gifImgs.length > 0) {
                await this.loadGifImg();
            }
            console.log('loadimg', new Date().getTime());
            this.domList = $('.collection .item').sort(function(i, t) {
                return i.name - t.name;
            });
            this.containerImage = this.domList[this.index + 1];
            this.innerImage = this.domList[this.index];
            this.draw();
            document.addEventListener('touchstart', this.touchHandler.bind(this));
            document.addEventListener('touchend', this.touchendHandler.bind(this));
        }
        touchHandler(e) {
            e.stopPropagation();
            // e.preventDefault();
            const render = () => {
                this.radio = this.radio * this.scale;
                this.timer = requestAnimationFrame(render);
                this.draw();
            };
            cancelAnimationFrame(this.timer);
            this.willPause = false;
            // clearInterval(this.gif_timer);
            this.timer = requestAnimationFrame(render);
        }
        touchendHandler(e) {
            e.stopPropagation();
            // e.preventDefault();
            if (this.imgList[this.index + 1] && this.imgList[this.index + 1].gif) {
                // 当遇到有gif图时，暂停
                this.willPause = true;
            } else {
                this.willPause = false;
                cancelAnimationFrame(this.timer);
            }
        }
        draw() {
            // 当前浏览的图片不是最后一张
            debugger;
            if (this.index + 1 != this.imgList.length) {
                if (
                    this.radio <
                    this.imgList[this.index + 1].areaW / this.imgList[this.index + 1].imgW
                ) {
                    if (this.willPause) {
                        this.radio =
                            this.imgList[this.index + 1].areaW / this.imgList[this.index + 1].imgW;
                        cancelAnimationFrame(this.timer);
                    }
                    this.index++;
                    this.radio = 1;
                    if (!this.imgList[this.index + 1]) {
                        this.showEnd();
                    }
                }
                // 下一张图片
                this.imgNext = this.imgList[this.index + 1];
                // 当前预览的图片
                this.imgCur = this.imgList[this.index];
                // 下一张图片所在dom
                this.containerImage = this.domList[this.index + 1];
                // 当前预览图片所在的dom
                this.innerImage = this.domList[this.index];
                // this.drawImgOversize(
                //     this.containerImage, // i
                //     this.imgNext.imgW, // t 每张图的像素大小
                //     this.imgNext.imgH, // e 每张图的像素大小
                //     this.imgNext.areaW, // a 小图的宽高
                //     this.imgNext.areaH, // s 小图的宽高
                //     this.imgNext.areaL, // n 小图在大图中的偏移位置
                //     this.imgNext.areaT, // g 小图在大图中的偏移位置
                //     this.radio, // r
                // );
                this.drawImgMinisize(
                    this.innerImage, // i
                    this.imgCur.imgW, // t
                    this.imgCur.imgH, // e
                    this.imgNext.imgW, // a
                    this.imgNext.imgH, // s
                    this.imgNext.areaW, // n
                    this.imgNext.areaH, // g
                    this.imgNext.areaL, // r
                    this.imgNext.areaT, // m
                    this.radio, // h
                );
            }
        }
        showEnd() {
            console.log('end');
        }
        drawImgOversize(i, t, e, a, s, n, g, r) {
            /**
             * 根据公式：初始偏移值/初始大小图宽度差 = 现有偏移值/现有宽度差
             * 故：n / (t-a) = 现有偏移值 / (a / r -a)
             * 故：现有偏移值 = (a / r - a) * (n / (t - a))
             * 故：drawImage第二个参数sx = 上一次的位置 - 现有偏移值 = n - (a / r - a) * (n / (t - a))
             * sy与上同理
             */
            this.ctx.drawImage(
                i,
                n - (a / r - a) * (n / (t - a)),
                g - (s / r - s) * (g / (e - s)),
                a / r,
                s / r,
                0,
                0,
                750,
                1206,
            );
        }
        drawImgMinisize(i, t, e, a, s, n, g, r, m, h) {
            /**
             * 根据公式：初始偏移量 / 大小图宽度差 = 此次偏移量 / 现有宽度查
             * 故：r/(a-n) = 此次偏移量/(n/h - n)  
             * 故：此次偏移量 = r/(a-n) * (n/h - n)
             * 根据公式：大图相对于小图的偏移量（此次偏移量）/ 小图画布偏移量 = 初始偏移量 / 小图画布宽度
             * 故：r/(a-n) * (n/h - n) / 小图画布偏移量 = n / h * 750
             * 故：dx = r/(a-n) * (n/h - n) * h * 750 / n
             */
            this.ctx.drawImage(
                i,
                0,
                0,
                t,
                e,
                ((n / h - n) * (r / (a - n)) * h * 750) / n,
                ((g / h - g) * (m / (s - g)) * h * 1206) / g,
                750 * h,
                1206 * h,
            );
        }
        drawSprite(i, t, e, a, s, n, g) {
            var r = s[a];
            this.ctx.drawImage(i, r[0], r[1], r[2], r[3], t, e, n, g);
        }
    }

    return PipCanvas;

})));
