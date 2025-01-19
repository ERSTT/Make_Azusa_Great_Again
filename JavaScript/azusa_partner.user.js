// ==UserScript==
// @name        azusa_partner
// @namespace   https://greasyfork.org/users/1396048-moeruotaku
// @version     2024.12.1.1264
// @description add bgm info to azusa
// @author      moeruotaku
// @license     MIT
// @match       https://azusa.wiki/torrents.php*
// @match       https://zimiao.icu/torrents.php*
// @icon        https://bgm.tv/img/favicon.ico
// @grant       GM_xmlhttpRequest
// @connect     greasyfork.org
// ==/UserScript==

(function () {
    'use strict';

    // 扩宽页面。如果不需要该功能，请删除或注释掉这段代码。
    // let mainouter = document.getElementsByClassName('mainouter')[0];
    // let main = document.getElementsByClassName('main')[0];
    // if (mainouter && main && mainouter.parentNode.offsetWidth - mainouter.clientWidth > 600) main.width = (parseInt(main.width, 10) + 400).toString();

    let set_html = (e, h) => e.innerHTML === h || (e.innerHTML = h);
    let bgm_icon = (b_id, style) => `<a href="https://bgm.tv/subject/${b_id}" target="_blank"><div style="display: inline-block; background-image: url('https://bgm.tv/img/favicon.ico'); background-repeat: no-repeat; background-position: 0 -4px; width: 16px; height: 12px; ${style}"></div></a>`;
    let go = (d) => {
        let torrents = Array.from(document.querySelectorAll('.torrents > tbody > tr'));
        for (let i = 0; i < torrents.length; ++i) {
            let tr = torrents[i];

            let add_cover = tr.querySelector('td[name=cover]');
            if (!add_cover) {
                add_cover = document.createElement('td');
                add_cover.setAttribute('name', 'cover');
                tr.insertBefore(add_cover, tr.children[1]); // 添加封面。如果不需要该功能，请删除或注释掉这行代码。
            }

            if (i === 0) {
                add_cover.className = 'colhead';
                add_cover.innerHTML = '封面';
                continue;
            }
            add_cover.className = 'rowfollow nowrap';
            add_cover.valign = 'middle';
            add_cover.style.padding = '0px';

            let a = tr.querySelector('a[href^="details.php"]');
            if (!a) continue;
            let a_id = new URL(a.href, location.href).searchParams.get('id');
            if (!a_id) continue;
            let tds = Array.from(tr.querySelectorAll('.torrentname > tbody > tr > td'));
            if (tds.length === 0) continue;

            let b_id = d.bgm_a2b?.[a_id];
            if (!b_id) continue;

            let b_cover = d.bgm_covers?.[b_id];
            if (b_cover) {
                set_html(add_cover, `<a href="https://bgm.tv/subject/${b_id}" target="_blank"><img class="nexus-lazy-load preview" src="https://lain.bgm.tv/r/400/pic/cover/l/${b_cover}" style="max-width: 46px; max-height: 46px"></a>`);
            }

            let b_score = d.bgm_scores?.[b_id];
            if (b_score !== undefined) {
                let add_score = tr.querySelector('td[name=score]');
                if (!add_score) {
                    add_score = document.createElement('td');
                    add_score.setAttribute('name', 'score');
                    add_score.className = 'embedded';
                    add_score.style.width = '20px';
                    tds[tds.length - 1].parentNode.insertBefore(add_score, tds[tds.length - 1]); // 添加评分。如果不需要该功能，请删除或注释掉这行代码。
                }
                set_html(add_score, `${bgm_icon(b_id, 'margin: 0px 2px 2px 2px')}<div style="padding-top: 4px; text-align: center">${b_score > 0 ? b_score.toFixed(1) : 'N/A'}</div>`);
            }

            let b_tags = d.bgm_tags?.[b_id];
            if (b_tags) {
                let add_tags = tr.querySelector('div[name=tags]');
                if (!add_tags) {
                    add_tags = document.createElement('div');
                    add_tags.setAttribute('name', 'tags');
                    let td_status = tds[0].querySelector('div');
                    td_status ? tds[0].insertBefore(add_tags, td_status) : tds[0].append(add_tags); // 添加标签。如果不需要该功能，请删除或注释掉这行代码。
                }
                set_html(add_tags, `${bgm_icon(b_id, 'vertical-align: text-bottom')}${b_tags}`);
            }
        }
    };

    let now = Date.now();
    let v2t = (v) => ((vs) => new Date(`${vs[0]}-${vs[1]}-${vs[2]}`).setMinutes(vs[3], 0, 0))(v.split('.').map((e) => parseInt(e, 10)));
    let GM_fetch = (url) => new Promise((resolve, reject) => GM_xmlhttpRequest({ method: 'GET', url, onload: resolve, onerror: reject })).then((response) => response.responseText);
    let get_version = async (url) => GM_fetch(url).then((text) => /^.*@version +([^\/]+)\/\/.*$/.exec(text.replace(/\n/g, ''))?.[1] || '');
    let get_version_data = async (url) => GM_fetch(url).then((text) => ((r) => (r ? [r[1], JSON.parse(r[2].replace(/([0-9]+):/g, '"$1":'))] : ['', {}]))(/^.*@version +([^\/]+)\/\/.*const [\w]+ = (.*);$/.exec(text.replace(/\n/g, ''))));
    let refresh_data = async (n, uid, fid) => {
        let um = `https://update.greasyfork.org/scripts/${uid}/azusa_partner_library_${n}_updates.meta.js?_=${now}`;
        let ur = `https://update.greasyfork.org/scripts/${uid}/azusa_partner_library_${n}_updates.js?_=${now}`;
        let fr = `https://update.greasyfork.org/scripts/${fid}/azusa_partner_library_${n}.js?_=${now}`;
        let d = JSON.parse(localStorage.getItem(n) || '{}');
        let v = d.version;
        if (!v) {
            let [fv, fd] = await get_version_data(fr);
            fd.version = fv;
            localStorage.setItem(n, JSON.stringify(fd));
            return [n, fd];
        } else {
            let uv = await get_version(um);
            if (uv === v) return [n, d];
            return [
                n,
                d,
                (v2t(uv) - v2t(v) <= 5 * 24 * 60 * 60 * 1000 //
                    ? get_version_data(ur).then(([uv, ud]) => ({ ...d, ...ud, version: uv }))
                    : get_version_data(fr).then(([fv, fd]) => ({ ...fd, version: fv }))
                ).then((d) => {
                    localStorage.setItem(n, JSON.stringify(d));
                    return [n, d];
                }),
            ];
        }
    };

    Promise.all([
        refresh_data('bgm_a2b', '519040', '517523'), //
        refresh_data('bgm_covers', '519041', '517524'),
        refresh_data('bgm_scores', '519042', '517525'),
        refresh_data('bgm_tags', '519043', '517533'),
    ]).then(async (rets) => {
        go(Object.fromEntries(rets.map(([n, d, p]) => [n, d])));
        if (rets.some(([n, d, p]) => p)) go(Object.fromEntries(await Promise.all(rets.map(([n, d, p]) => p ?? Promise.resolve([n, d])))));
    });

    if (localStorage.hasOwnProperty('bgm_version')) localStorage.removeItem('bgm_version');
})();
