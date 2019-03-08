const routes = {
    '/list': () => import(/* webpackChunkName: 'list' */ './pages/list/list'),
    '/home': () => import(/* webpackChunkName: 'home' */ './pages/home/home'),
    '/detail': () => import(/* webpackChunkName: 'detail' */ './pages/detail/detail')
};

class Router {
    start() {
        window.addEventListener('popstate', () => {
            this.load(location.pathname);
        });
        this.load(location.pathname);
    }
    async load(path) {
        path = path === '/' ? '/home' : path;
        const View = (await new routes[path]()).default;
        const view = new View();
        view.mount(document.body);
    }
    go(path) {
        history.pushState({}, '', path);
        this.load(path);
    }
}

export default new Router();