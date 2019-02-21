<template>
    <div>
        <h1 @click="close">qqq</h1>
        <h2 @click="test">aaa</h2>
        <div>{{name}}</div>
    </div>
</template>

<script>
export default {
    name: 'test',
    props: {
        name: {
            type: String,
            default: ''
        }
    },
    created() {
        console.log(this)
    },
    methods: {
        close() {
            console.log(this)
            this.$close()
        },
        test() {
            console.log('test')
        }
    }
}
</script>

