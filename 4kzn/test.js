function init(cfg) {}
function home(filter) {
    return JSON.stringify({
        class: [{ type_name: '测试', type_id: 'test' }],
        filters: {}
    });
}
function homeVod() {
    return JSON.stringify({ list: [] });
}
function category(tid, pg, filter, extend) {
    return JSON.stringify({ list: [], page: 1 });
}
function search(wd, quick, pg) {
    return JSON.stringify({ list: [] });
}
function detail(id) {
    return JSON.stringify({ list: [] });
}
function play(flag, id, flags) {
    return JSON.stringify({ url: '' });
}
