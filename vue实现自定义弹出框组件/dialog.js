import Toast from './dialog-component.js'

export class Dialog {
    constructor() {
        this.defaultOptions = {
            msg: 'xxxxx',
            duration: 200000,
            msgType: 'right',
            type: 'big'
        }
        this.toast = null;
    }
    openDialog(options) {
        this.defaultOptions = { ...this.defaultOptions, ...options }
        this.toast = Toast(this.defaultOptions)
        return this.toast
    }
}