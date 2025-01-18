// ==UserScript==
// @name         Azusa 种子页删除已做种种子
// @namespace    https://github.com/ERSTT
// @icon         https://azusa.wiki/favicon.ico
// @version      1.0
// @description  Azusa 种子页删除已做种种子
// @author       ERST
// @match        https://azusa.wiki/*torrents*
// @match        https://zimiao.icu/*torrents*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/ERSTT/Files/refs/heads/main/JavaScript/Azusa_remove_seeding.user.js
// @downloadURL  https://raw.githubusercontent.com/ERSTT/Files/refs/heads/main/JavaScript/Azusa_remove_seeding.user.js
// @changelog    添加新域名
// ==/UserScript==

(function() {
    'use strict';

    // 删除已做种种子
    let divElements = document.querySelectorAll('div[title="seeding 100%"]');
    divElements.forEach(divElement => {
        let trElement = divElement.closest('tr');
        if (trElement) {
            let parentTrElement = trElement.parentNode.closest('tr');
            if (parentTrElement) {
                parentTrElement.remove();
            }
            trElement.remove();
        }
    });
})();
