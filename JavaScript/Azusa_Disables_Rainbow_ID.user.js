// ==UserScript==
// @name         Azusa 禁用彩虹ID
// @namespace    https://github.com/ERSTT
// @icon         https://azusa.wiki/favicon.ico
// @version      1.1
// @description  Azusa 禁用彩虹ID
// @author       ERST
// @match        http*://azusa.wiki/*
// @match        http*://zimiao.icu/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/ERSTT/Make_Azusa_Great_Again/refs/heads/main/JavaScript/Azusa_Disables_Rainbow_ID.user.js
// @downloadURL  https://raw.githubusercontent.com/ERSTT/Make_Azusa_Great_Again/refs/heads/main/JavaScript/Azusa_Disables_Rainbow_ID.user.js
// @changelog    适配新彩虹ID
// ==/UserScript==

(function() {
    'use strict';

    ["rainbow-typewriter", "cat-prefix", "rainbow-cat-glow", "rainbow-cat", "rainbow-2", "rainbow-default"].forEach(cls => {
        document.querySelectorAll(`.${cls}`).forEach(el => el.classList.remove(cls));
    });
})();
