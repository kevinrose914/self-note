import template from './list.html';

import router from '../../router';

import './list.less';

export default class {
    mount(parentNode) {
        document.title = 'list';
        parentNode.innerHTML = template;
        parentNode.querySelector('#go2detail').addEventListener('click', function() {
            router.go('/detail');
        });
    }
}