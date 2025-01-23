// ==UserScript==
// @name         禁用徽章显示
// @namespace    https://github.com/ERSTT
// @icon         https://azusa.wiki/favicon.ico
// @version      0.1
// @description  禁用徽章显示
// @author       ERST
// @match        https://azusa.wiki/*
// @match        https://zimiao.icu/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const elements = document.querySelectorAll('.nexus-username-medal.preview');

    elements.forEach(element => {
        element.remove();
    });

    console.log(`${elements.length} 个 徽章已禁用显示`);
})();
