// ==UserScript==
// @name         Azusa 禁用发布页上传种子文件自动填写标题
// @namespace    https://github.com/ERSTT
// @icon         https://azusa.wiki/favicon.ico
// @version      1.0
// @description  Azusa 禁用发布页上传种子文件自动填写标题
// @author       ERST
// @match        https://azusa.wiki/*upload*
// @match        https://zimiao.icu/*upload*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/ERSTT/Files/refs/heads/main/JavaScript/Azusa_disables_automatic_title.user.js
// @downloadURL  https://raw.githubusercontent.com/ERSTT/Files/refs/heads/main/JavaScript/Azusa_disables_automatic_title.user.js
// @changelog    添加新域名
// ==/UserScript==

(function() {
    'use strict';

    // 定义一个空的 getname 函数，覆盖原有的 getname() 函数
    window.getname = function() {
        // 什么都不做，防止标题自动填写
    };
})();
