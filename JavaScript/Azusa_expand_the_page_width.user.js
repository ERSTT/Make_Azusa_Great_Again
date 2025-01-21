// ==UserScript==
// @name        Azusa 自适应宽度页面
// @namespace   https://greasyfork.org/users/1396048-moeruotaku
// @version     2024.12.1.1266
// @author      moeruotaku
// @match       https://azusa.wiki/*
// @match       https://zimiao.icu/*
// @icon        https://azusa.wiki/favicon.ico
// @license     MIT
// ==/UserScript==

(function () {
    'use strict';

    let mainouter = document.querySelector('.mainouter');
    let main = document.querySelector('.main');

    if (mainouter && main) {
        const adjustWidth = () => {
            let parentWidth = mainouter.parentNode.offsetWidth;
            main.style.width = `${parentWidth * 0.9}px`;
            main.style.maxWidth = '999999px';
            main.style.margin = '0 auto';
        };

        adjustWidth();

        window.addEventListener('resize', adjustWidth);
    }
})();
