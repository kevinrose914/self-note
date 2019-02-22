// vue中如何知道v-for渲染的dom已经渲染完成？
this.$nextTick(() => {
    // callback
})

// vue-router在跳转过程中，如何做到不在历史中纪录？
this.$router.replace()

// 微信授权
wx.login({
    success: res => {
        // 获取code
    }
})

// 移动端等比缩放自适应方案-rem
/**
 * 公式：物理像素 = 屏幕分辨率 / (dpr * scale)
 * 以iphone7为例， 屏幕分辨率750， dpr为2， scale缩放假设为1， 物理像素就是375px
 * rem等比缩放的目的就是让物理像素等于屏幕分辨率，此时要让iphone7的物理像素等于屏幕分辨率，那么scale就要等于0.5
 * 同理可得scale就等于1/dpr
 * 综上，根据不同dpr，使用不同的meta标签
 * dpr为1：<meta name="viewport" content="width=device-width, initial-scale=1.0" />
 * dpr为2：<meta name="viewport" content="width=device-width, initial-scale=0.5" />
 * dpr为3：<meta name="viewport" content="width=device-width, initial-scale=0.33" />
 */
/**
 * 如何计算html的font-size
 * 将屏幕宽度分成10分，每一份的宽度就作为html的font-size
 * 以iphone7为例：750 / 10 = 75px， 此时1rem=75px
 */