import template from './detail.html';

// import router from '../../router';

export default class {
    mount(parentNode) {
        document.title = 'detail';
        parentNode.innerHTML = template;
    }
}