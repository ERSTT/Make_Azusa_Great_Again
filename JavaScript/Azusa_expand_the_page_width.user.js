// ==UserScript==
// @name        Azusa 扩宽页面
// @namespace   https://greasyfork.org/users/1396048-moeruotaku
// @version     2024.12.1.1264
// @author      moeruotaku
// @match       https://azusa.wiki/*
// @match       https://zimiao.icu/*
// @icon         https://azusa.wiki/favicon.ico
// @license     MIT
// ==/UserScript==

(function () {
    'use strict';

    let mainouter = document.getElementsByClassName('mainouter')[0];
    let main = document.getElementsByClassName('main')[0];
    if (mainouter && main && mainouter.parentNode.offsetWidth - mainouter.clientWidth > 600) main.width = (parseInt(main.width, 10) + 400).toString();
})();
