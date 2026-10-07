/**
 * 4K指南 (https://4kzn.cc) CatVod JS Spider for MiraPlay
 * 4K蓝光资源分享站 - 网盘链接聚合
 */

var host = 'https://4kzn.cc';
var UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

// 兼容不同的 HTTP 请求 API
function httpGet(url) {
    // 尝试多种可能的请求函数
    if (typeof request !== 'undefined') {
        try {
            var r = request(url, { headers: { 'User-Agent': UA } });
            return typeof r === 'string' ? r : (r.body || r.content || '');
        } catch (e) {}
    }
    if (typeof fetch !== 'undefined') {
        try {
            var resp = fetch(url, { headers: { 'User-Agent': UA } });
            // 同步 fetch (某些运行时支持)
            return resp.text ? resp.text() : '';
        } catch (e) {}
    }
    if (typeof http !== 'undefined' && http.get) {
        try {
            return http.get(url, { 'User-Agent': UA });
        } catch (e) {}
    }
    return '';
}

function init(cfg) {
    try {
        var ext = JSON.parse(cfg.ext || '{}');
        if (ext.host) host = ext.host;
    } catch (e) {}
}

function home(filter) {
    return JSON.stringify({
        class: [
            { type_name: '最新资源', type_id: 'zuixin' },
            { type_name: '最新剧集', type_id: 'zuixin-juji' },
            { type_name: '喜剧', type_id: 'xiju' },
            { type_name: '系列合集', type_id: 'xiliehj' }
        ],
        filters: {}
    });
}

function parseList(html) {
    var videos = [];
    var re = /<a[^>]*class="item-image"[^>]*href="(https:\/\/4kzn\.cc\/book\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
    var m;
    while ((m = re.exec(html)) !== null) {
        var href = m[1];
        var inner = m[2];
        var imgM = inner.match(/data-src="([^"]+)"|src="([^"]+)"/);
        var pic = imgM ? (imgM[1] || imgM[2]) : '';
        var altM = inner.match(/alt="([^"]*)"/);
        var title = altM ? altM[1] : '';
        if (title) {
            videos.push({
                vod_id: href,
                vod_name: title,
                vod_pic: pic,
                vod_remarks: ''
            });
        }
    }
    return videos;
}

function homeVod() {
    try {
        var html = httpGet(host + '/books/zuixin');
        return JSON.stringify({ list: parseList(html) });
    } catch (e) {
        return JSON.stringify({ list: [] });
    }
}

function category(tid, pg, filter, extend) {
    try {
        pg = parseInt(pg) || 1;
        var url = pg <= 1 ? host + '/books/' + tid : host + '/books/' + tid + '/page/' + pg;
        var html = httpGet(url);
        return JSON.stringify({ list: parseList(html), page: pg });
    } catch (e) {
        return JSON.stringify({ list: [] });
    }
}

function search(wd, quick, pg) {
    try {
        var url = host + '/?post_type=book&s=' + encodeURIComponent(wd);
        var html = httpGet(url);
        return JSON.stringify({ list: parseList(html) });
    } catch (e) {
        return JSON.stringify({ list: [] });
    }
}

function detail(id) {
    try {
        var url = id;
        if (!/^https?:\/\//.test(url)) {
            url = host + '/book/' + url + '.html';
        }
        var html = httpGet(url);
        var titleM = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
        var title = titleM ? titleM[1].trim() : '未知';
        var descM = html.match(/<meta name="description" content="([^"]*)"/);
        var desc = descM ? descM[1] : '';
        var picM = html.match(/<article[\s\S]*?<img[^>]*data-src="([^"]+)"/);
        var pic = picM ? picM[1] : '';
        var linkRe = /href="(https?:\/\/[^"]+)"[^>]*><span class="b-name">([^<]+)<\/span>/g;
        var lm, seen = {}, uniq = [];
        while ((lm = linkRe.exec(html)) !== null) {
            if (!seen[lm[1]]) {
                seen[lm[1]] = 1;
                uniq.push({ name: lm[2].trim(), url: lm[1] });
            }
        }
        var vod = {
            vod_id: url,
            vod_name: title,
            vod_pic: pic,
            vod_content: desc,
            type_name: '网盘资源'
        };
        if (uniq.length > 0) {
            var names = [];
            var urls = [];
            for (var i = 0; i < uniq.length; i++) {
                names.push(uniq[i].name);
                urls.push(uniq[i].name + '$' + uniq[i].url);
            }
            vod.vod_play_from = names.join('$$$');
            vod.vod_play_url = urls.join('#');
            var linkText = [];
            for (var j = 0; j < uniq.length; j++) {
                linkText.push(uniq[j].name + ': ' + uniq[j].url);
            }
            vod.vod_content = (desc + '\n\n【网盘链接】\n' + linkText.join('\n')).trim();
        } else {
            vod.vod_play_from = '暂无';
            vod.vod_play_url = '暂无$none';
        }
        return JSON.stringify({ list: [vod] });
    } catch (e) {
        return JSON.stringify({ list: [] });
    }
}

function play(flag, id, flags) {
    if (!id || id === 'none') {
        return JSON.stringify({ jx: 0, parse: 0, playUrl: '', url: '' });
    }
    return JSON.stringify({ jx: 0, parse: 0, playUrl: '', url: id });
}
