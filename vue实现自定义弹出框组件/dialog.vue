<template>
    <transition name="toast">
        <div class="self-dialog-box" v-if="visible" :class="{big: type === 'big'}">
            <div class="icon" :class="{'error': msgType === 'error', 'right': msgType === 'right'}"></div>
            <div class="msg">{{msg}}</div>
        </div>
    </transition>
</template>

<script>
export default {
    props: {
        type: {
            type: String,
            default: 'small' // small, big
        },
        msgType: {
            type: String,
            default: 'error' // error, right
        },
        duration: {
            type: Number,
            default: 2000 // 为-1时，取消自动关闭
        },
        msg: {
            type: String,
            default: 'xxxxx'
        }
    },
    data() {
        return {
            visible: false
        };
    },
    methods: {
    }
}
</script>

<style lang="less" scoped>
@import url('../styles/constant.less');
.self-dialog-box {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.6);
    height: 80 / @base;
    width: 120 / @base;
    border-radius: 5px;
    color: #fff;
    padding: 0 10 / @base;
    display: flex;
    flex-direction: column;
    align-items: center;

    &.big {
        width: auto;
        max-width: 100%;
    }

    .icon {
        width: 22 / @base;
        height: 22 / @base;
        margin-top: 16 / @base;

        &.error {
            .dpr-img('/common/delete');
        }

        &.right {
            .dpr-img('/common/right');
        }
    }

    .msg {
        color: #fff;
        line-height: 14 / @base;
        .dpr-font(12px, 14px, 16px);
        margin-top: 12 / @base;
        white-space: nowrap;
    }
}
.toast-enter, .toast-leave-to {
    opacity: 0;
}
.toast-enter-active, .toast-leave-active {
    transition: opacity .5s;
}
</style>
