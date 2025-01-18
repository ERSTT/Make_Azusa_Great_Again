// ==UserScript==
// @name         猫站种子页删除已做种种子
// @namespace    https://github.com/ERSTT
// @icon         https://pterclub.com/favicon.ico
// @version      0.1
// @description  猫站种子页删除已做种种子
// @author       ERST
// @match        https://pterclub.com/*torrents*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 删除已做种种子
    let divElements = document.querySelectorAll('div[style="margin-top: 4px; display: flex;"]');
    divElements.forEach(divElement => {
        let imgElements = divElement.querySelectorAll('img.progbargreen');
        imgElements.forEach(imgElement => {
            let trElement = imgElement.closest('tr');
            if (trElement) {
                let parentTrElement = trElement.parentNode.closest('tr');
                if (parentTrElement) {
                    parentTrElement.remove();
                }
                trElement.remove();
            }
        });
    });
})();
