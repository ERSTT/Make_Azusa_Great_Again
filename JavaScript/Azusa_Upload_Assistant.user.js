// ==UserScript==
// @name         Azusa Upload Assistant (No jQuery)
// @author       Beer
// @version      0.0.9
// @description  Assist with getting information while uploading torrents for Azusa, without jQuery.
// @match        https://azusa.wiki/*
// @icon         https://azusa.wiki/favicon.ico
// @run-at       document-end
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_openInTab
// @grant        GM_xmlhttpRequest
// @grant        GM_setClipboard
// @license      MIT
// @namespace    https://greasyfork.org/zh-CN/users/942532-beer
// ==/UserScript==

(() => {

    // 指定页面生效
    const url = new URL(window.location.href);

    // 判断页面
    const isCustom = url.href.includes('customBgUrl');
    const isUpload = url.pathname === '/upload.php';
    const isOffer = url.pathname === '/offers.php' && url.searchParams.get('add_offer') === '1';

    if (!isCustom && !isUpload && !isOffer) {
        return; // 非指定页面时直接停止执行
    }

    const entry = {
        title: '原名',
        chineseTitle: '中文名',
        author: '作者',
        complete: '是否完结',
        vol: 1,
        publisher: '出版商',
        img: '',
        desc: '',
        type: 0
    };

    /* utils */
    async function getWebInfo(url) {
        return new Promise((resolve) => {
            GM_xmlhttpRequest({
                method: "GET",
                url: url,
                onload: function (response) {
                    resolve(response.responseText);
                },
                onerror: function () {
                    resolve('');
                }
            });
        });
    }

    function getInfoKV(li) {
        const key = li.querySelector('span')?.textContent || '';
        let value = '';
        li.childNodes.forEach((node, idx) => {
            if (node.nodeType === 3 || idx !== 0) {
                value += node.textContent;
            }
        });
        value = value.replace('、', ' X ');
        return [key, value];
    }

    async function getInfo() {
        const url = document.querySelector('#bgmlink').value;
        if (!url.match(/https:\/\/bgm\.tv\/subject\/\d+/i)) {
            alert('请输入合法的链接');
            return;
        }

        const infoText = await getWebInfo(url);
        const parser = new DOMParser();
        const doc = parser.parseFromString(infoText, 'text/html');

        entry.title = doc.querySelector('.nameSingle a')?.textContent || '';

        const infobox = doc.querySelector('#infobox');
        if (infobox) {
            infobox.querySelectorAll('li').forEach(li => {
                const [key, value] = getInfoKV(li);
                if (key.includes('中文名')) entry.chineseTitle = value;
                else if (key.includes('作画') || key.includes('作者')) entry.author = value;
                else if (key.includes('册数')) entry.vol = value;
                else if (key.includes('出版社')) entry.publisher = value;
                else if (key.includes('游戏')) entry.type = 404;
            });
        }

        const cover = doc.querySelector('img.cover');
        if (cover) {
            entry.img = cover.src.replace('/r/400', '');
            entry.img = entry.img.replace('cover/c/', 'cover/l/');
        }

        entry.desc = doc.querySelector('#subject_summary')?.textContent || '';

        doc.querySelectorAll('.subject_tag_section a span').forEach(span => {
            const text = span.textContent;
            if (text.includes('已完结')) entry.complete = '完结';
            else if (text.includes('漫画')) entry.type = 402;
            else if (text.includes('小说')) entry.type = 403;
            else if (text.includes('画集')) entry.type = 407;
        });

        console.log(entry);

        let titleStr = '';
        if (entry.type === 402 || entry.type === 403) {
            titleStr = `[${entry.chineseTitle}][${entry.author}][Vol.01-Vol.卷数]`;
        } else {
            titleStr = `[${entry.chineseTitle}][${entry.author}]`;
        }

        const subtitleStr = `${entry.title} | ${entry.complete}`;
        const descStr = `[img]${entry.img}[/img]\n\n${entry.desc}`;

        document.querySelector('[name=name]').value = titleStr;
        document.querySelector('[name=small_descr]').value = subtitleStr;
        if (descField) descField.value = descStr;
        document.querySelector('[name=type]').value = entry.type;
        document.querySelector('[name=uplver]').checked = true;
    }

    /* key nodes */
    const form = document.querySelector('table');
    const torrentInput = document.querySelector('#torrent') || document.querySelector('#torrent_file');
    if (!torrentInput) return;
    const torrentTr = torrentInput.closest('tr');
    const titleField = document.querySelector('[name=name]');
    const subtitleField = document.querySelector('[name=small_descr]');
    const descField = document.querySelector('[name=descr]') || document.querySelector('[name=body]');
    const typeField = document.querySelector('[name=type]');
    const uplverField = document.querySelector('[name=uplver]');

    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td class="rowhead nowrap" valign="top" align="right">BGM链接</td>
        <td class="rowfollow" valign="top" align="left">
            <input type="text" style="width: 92%;" id="bgmlink" placeholder="https://bgm.tv/subject/123456"><br>
        </td>`;
    torrentTr.after(tr);
    // 创建警告文字
    const warning = document.createElement('span');
    warning.innerHTML = `<font color='red'>请上传种子后再辅助填写信息，否则标题可能被覆盖</font>`;

    const btn = document.createElement('input');
    btn.type = 'button';
    btn.value = '辅助填写';
    btn.addEventListener('click', getInfo);

    const bgmInput = tr.querySelector('#bgmlink');
    const br = document.createElement('br');
    bgmInput.after(br, btn, warning);

})();
