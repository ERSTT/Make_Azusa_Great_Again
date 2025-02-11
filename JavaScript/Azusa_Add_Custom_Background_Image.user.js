// ==UserScript==
// @name         添加自定义背景图片功能
// @namespace    https://github.com/ERSTT
// @icon         https://azusa.wiki/favicon.ico
// @version      0.3
// @description  添加自定义背景图片功能
// @author       ERST
// @match        https://azusa.wiki/*
// @match        https://zimiao.icu/*
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function() {
    'use strict';

    let bgUrl = GM_getValue('customBgUrl', 'https://azusa.wiki/random_image.php');

    function applyBackground(url) {
        GM_addStyle(`
            body {
                background-image: url("${url}") !important;
                background-size: cover;
                background-attachment: fixed;
            }
        `);
    }
    applyBackground(bgUrl);

    if (window.location.pathname === '/usercp.php' && new URLSearchParams(window.location.search).get('action') === 'tracker') {
        const rows = document.querySelectorAll("tr");
        let styleRow = null;
        let fontSizeRow = null;

        for (let row of rows) {
            if (row.textContent.includes('界面风格')) {
                styleRow = row;
            }
            if (row.textContent.includes('字体大小')) {
                fontSizeRow = row;
            }
        }

        if (styleRow && fontSizeRow) {
            const newRow = document.createElement("tr");

            const labelCell = document.createElement("td");
            labelCell.className = "rowhead nowrap";
            labelCell.style.textAlign = "right";
            labelCell.textContent = "自定义背景";

            const inputCell = document.createElement("td");
            inputCell.className = "rowfollow";

            const inputBox = document.createElement("input");
            inputBox.type = "text";
            inputBox.value = bgUrl;
            inputBox.placeholder = "输入背景图片URL";
            inputBox.style.width = "600px";

            const saveButton = document.createElement("button");
            saveButton.textContent = "保存";
            saveButton.style.marginLeft = "5px";

            saveButton.addEventListener("click", function() {
                GM_setValue('customBgUrl', inputBox.value);
                applyBackground(inputBox.value);
            });

            inputCell.appendChild(inputBox);
            inputCell.appendChild(saveButton);
            newRow.appendChild(labelCell);
            newRow.appendChild(inputCell);

            styleRow.parentNode.insertBefore(newRow, fontSizeRow);
        }
    }
})();
