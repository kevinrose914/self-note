<template>
    <div class="map-container">
        <el-amap
            ref="amap"
            vid="selfMap"
            :zoom="zoom"
            :amap-manager="amapManager"
            :events="events"
        ></el-amap>
        <div class="info">
            <div class="address">
                <span class="status"></span>
                <span class="start addr-name">{{start}}</span>
                <span class="status"></span>
                <span class="end addr-name">{{end}}</span>
            </div>
            <button @click="test">测试一下弹出框</button>
            <div>{{state}}</div>
        </div>
    </div>
</template>

<script>
import { lazyAMapApiLoaderInstance, AMapManager } from 'vue-amap'
const mapLoadedPromise = lazyAMapApiLoaderInstance.load()
import Test from './test.vue'
export default {
    name: 'selfMap',
    data: () => {
        return {
            zoom: 12,
            amapManager: new AMapManager(),
            events: {
                init(o) {
                    console.log(o, 'init')
                }
            },
            start: '天府创新中心中心中心',
            end: '双流国际机场凶的一笔',
            state: ''
        }
    },
    mounted() {
        mapLoadedPromise.then(() => {
            console.log('loaded', this.$refs.amap)
        })
    },
    methods: {
        test() {
            this.state = '弹框已打开'
            this.dom = this.$asynDialog({
                component: Test,
                data: {
                    name: 'rose'
                },
                config: {
                    closeCallback: () => {
                        this.state = '弹框已关闭'
                        console.log('close')
                    }
                }
            })
            console.log(this.dom, 'dom')
        }
    }
}
</script>

<style lang="less" scoped>
@import url('../../styles/constant.less');
.map-container {
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: relative;

    .info {
        position: absolute;
        width: 100%;
        height: 228 / @base;
        background: rgba(250, 250, 250, 0.85);
        top: 16 / @base;
        &::after {
            .border-1px-top(#e6e6e6);
        }
        &::before {
            .border-1px-bot(#e6e6e6);
        }

        .address {
            display: flex;
            align-items: center;
            height: 107 / @base;
            width: 100%;
            padding: 0 48 / @base;
            position: relative;

            &::before {
                .border-1px-bot(#e6e6e6);
            }

            .status {
                width: 12 / @base;
                height: 12 / @base;
                background: url('../../assets/icon_start@2x.png') no-repeat center;
                background-size: contain;
                margin-right: 8px;
                
                [data-dpr="1"] & {
                    background: url('../../assets/icon_start@1x.png') no-repeat center;
                    background-size: contain;
                }
                [data-dpr="3"] & {
                    background: url('../../assets/icon_start@3x.png') no-repeat center;
                    background-size: contain;
                }
            }

            .addr-name {
                flex: 1;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                text-align: left;
                font-size: 24px;
                color: #828282;
            }

            .start {
                margin-right: 16px;
            }
        }
    }
}
</style>
