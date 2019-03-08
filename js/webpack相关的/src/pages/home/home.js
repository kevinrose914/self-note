import template from './home.html';

import router from '../../router';

import './home.less';

export default class {
    mount(parentNode) {
        document.title = 'home';
        parentNode.innerHTML = template;
        parentNode.querySelector('#go2list').addEventListener('click', function() {
            debugger;
            router.go('/list');
        });
    }
}