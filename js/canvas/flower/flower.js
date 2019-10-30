/**
 * 公共配置
 */
let config = {
    width: 960, // canvas宽
    height: 600, // canvas高
    skyColor: 'hsla({hue}, 60%, {lightness}%, 0.2)', // 天空颜色
    fireworkTime:{min: 8,max: 15}, // 烟花刷新时间
    //烟花参数本身有默认值 传入undefined则使用默认参数
    fireworkOpt:{
        x: undefined,
        y: undefined,
        xEnd: undefined,
        yEnd: 100, // 粒子上升最大高度
        count: 300,   //炸裂后粒子数
        wait: undefined,  // 粒子上升到最高后，消失 => 炸裂  等待时间
    }
};

/**
 * 炸裂后的粒子
 */
class Particle {
    constructor({ x, y, size = 0.5 } = {}) {
        this.x = x; // 粒子x坐标
        this.y = y; // 粒子y坐标
        this.size = size; // 粒子半径
        this.v = Math.random(); // 粒子速度（随机）
        this.angle = Math.random() * 2 * Math.PI; // 粒子偏移角度（随机）
        this.vx = Math.cos(this.angle) * this.v; // 粒子x方向速度
        this.vy = Math.sin(this.angle) * this.v; // 粒子y方向速度
    }

    // 移动
    move() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.02; // 考虑重力加速度
        this.vx *= 0.98; // 考虑空气阻力
        this.vy *= 0.98; // 考虑空气阻力
    }

    // 渲染粒子
    render(ctx) {
        this.move();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI, false);
        ctx.fill();
    }
}

/**
 * 未炸裂时的父粒子
 */
class Firework {
    constructor({ x, y = config.height, xEnd, yEnd, count = 300, wait } = {}) {
        this.x = x || Math.random() * config.width; // 粒子x坐标，或者随机
        this.y = y;
        this.xEnd = xEnd || this.x; // 粒子上升到最高点的x坐标
        this.yEnd = yEnd || Math.random() * config.height; // 粒子上升到最高点的y坐标
        this.size = 2; // 粒子半径
        this.v = -10; // 粒子上升速度，由于上升过程y在变小，所以为负值
        this.opacity= 0.8; // 粒子透明度
        this.wait = wait || 30 + Math.random() * 30; // 粒子上升到最高点后，到炸裂时的等待时间
        this.count = count; // 粒子炸裂后生成的子级粒子个数
        this.particles = []; // 存放子级粒子的实例
        this.status = 1; // 粒子的状态(1: 上升阶段， 2：等到炸裂阶段， 3：炸裂后渲染子级粒子阶段)
        this.hue = 360 * Math.random() || 0; // 粒子的色调
        this.color = `hsla(${this.hue},80%,60%,1)`; // 粒子的渲染颜色
        this.createParticles();
    }

    createParticles() {
        for (var i  =0; i< this.count; i++) {
            this.particles.push(new Particle({ x:this.xEnd, y:this.yEnd }));
        }
    }

    rise() {
        this.y += this.v;
        this.v += 0.05; // 速度逐渐减小
        if (this.y - this.yEnd <= 50) {
            this.opacity = (this.y - this.yEnd) / 50;
        }
        if (this.y <= this.yEnd || this.v >= 0) {
            this.status = 2;
        }
    }

    // 用于点亮天空
    getNextSkyColor() {
        return {
            opacity: this.status === 3 ? this.opacity : 0, // 只有在炸裂的时候才会点亮天空
            hue: this.hue
        }
    }

    render(ctx) {
        switch(this.status) {
            case 1: // 上升阶段
                ctx.save(); // 保存画布状态
                ctx.beginPath();
                ctx.globalCompositeOperation = 'lighter';
                ctx.globalAlpha = this.opacity;
                ctx.fillStyle = this.color;
                ctx.translate(this.x, this.y);
                ctx.scale(0.5, 2.0); // 将烟花处理成长椭圆形状
                ctx.translate(-this.x, -this.y);
                ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI, false);
                ctx.fill();
                ctx.restore();
                this.rise();
                return true;
                break;
            case 2: // 等待炸裂阶段
                if (--this.wait <= 0) {
                    this.opacity = 1; // ?
                    this.status = 3;
                }
                return true;
                break;
            case 3: // 炸裂，渲染子微粒阶段
                ctx.save();
                ctx.beginPath();
                ctx.globalCompositeOperation = 'lighter';
                ctx.globalAlpha = this.opacity;
                ctx.fillStyle = this.color;
                for (var i = 0; i < this.particles.length; i++) {
                    this.particles[i].render(ctx);
                }
                ctx.restore();
                this.opacity -= 0.01;
                return this.opacity > 0;
                break;
            default:
                return false;
                break;
        }
    }
}

class Flower {
    constructor({ options = {}, wrapper } = {}) {
        config = Object.assign(config, options);
        this.wrapper = wrapper;
        this.fireworks = []; // 存储当前烟花个数
        // 各个烟花生成的间隔时间
        this.fireworkTime = this.time;
        // 天空颜色
        this.skyColor = this.initSkyColor;
    }

    // 各个烟花生成的间隔时间
    get time() {
        return config.fireworkTime.min + Math.random() * (config.fireworkTime.max-config.fireworkTime.min);
    }
    get initSkyColor() {
        return {
            opacity: 0.2, // 透明度
            hue: 210 // 色调
        }
    }

    _createCanvas({ width = 960, height = 600, id } = {}) {
        const canvas = document.createElement('canvas');
        canvas.setAttribute('id', id);
        canvas.height = height;
        canvas.width = width;
        return canvas;
    }

    // 创建画布
    createCtx() {
        const bg = this._createCanvas({ width: config.width, height: config.height, id: 'flower-bg' });
        const ctx = this._createCanvas({ width: config.width, height: config.height, id: 'flower' });
        ctx.setAttribute('style', 'position: absolute; top: 0; left: 0');
        this.bg = bg.getContext('2d');
        this.ctx = ctx.getContext('2d');
        this.wrapper.appendChild(bg);
        this.wrapper.appendChild(ctx);
    }

    // 渲染画布背景
    renderBg() {
        this.bg.fillStyle = 'hsla(210, 60%, 5%, 0.9)';
        this.bg.fillRect(0, 0, config.width, config.height);
    }

    // 渲染烟花
    renderFirework() {
        requestAnimationFrame(this.renderFirework.bind(this));
        // 这里，可以直接清空画布，也可以用一个透明的矩形盖住之前所绘制的
        // this.ctx.clearRect(0, 0, config.width, config.height);
        this.ctx.fillStyle = `hsla(${this.skyColor.hue}, 60%, ${this.skyColor.opacity*15}%, 0.2)`;
        this.ctx.fillRect(0, 0, config.width, config.height);
        // 这里要重置一下天空颜色，避免其opacity一直为1
        this.skyColor = this.initSkyColor;
        // 添加烟花
        if (--this.fireworkTime <= 0) {
            this.fireworks.push(new Firework(config.fireworkOpt));
            // 重置时间
            this.fireworkTime = this.time;
        }
        // 渲染烟花
        for (var i = 0; i < this.fireworks.length; i++) {
            const current = this.fireworks[i];
            // 炸裂过程中，选择最亮的烟花颜色，来改变天空颜色
            this.skyColor = this.skyColor.opacity
                > current.getNextSkyColor().opacity
                ? this.skyColor
                : current.getNextSkyColor();
            // 烟花炸裂完成直至opacity<=0后，将其移除
            !current.render(this.ctx) && this.fireworks.splice(i, 1);
        }
    }

    render() {
        this.createCtx();
        this.renderBg();
        this.renderFirework();
    }

    clear() {
        this.ctx.clearRect(0, 0, config.width, config.height);
    }
}

window.Flower = Flower;