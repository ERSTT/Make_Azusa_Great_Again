// ==UserScript==
// @name         Azusa 卡片标记
// @namespace    https://github.com/ERSTT
// @icon         https://azusa.wiki/favicon.ico
// @version      2.0
// @description  Azusa 卡片标记
// @author       ERST
// @match        https://azusa.wiki/*lottery*
// @match        https://zimiao.icu/*lottery*
// @grant        GM_xmlhttpRequest
// @updateURL    https://raw.githubusercontent.com/ERSTT/Files/refs/heads/main/JavaScript/Azusa_card_marking.user.js
// @downloadURL  https://raw.githubusercontent.com/ERSTT/Files/refs/heads/main/JavaScript/Azusa_card_marking.user.js
// @changelog    此更新仅为适配新安全参数, 未做BUG修复，稍后此脚本会更新为 未拥有卡片添加未拥有角标 功能的脚本
// ==/UserScript==

(function() {
    'use strict';

    // 获取当前页面的域名
    var currentDomain = window.location.hostname;

    // 获取URL中的csrf_token参数
    var urlParams = new URLSearchParams(window.location.search);
    var csrfToken = urlParams.get('csrf_token');

    // 动态构建 URL
    var url1 = `https://${currentDomain}/lotterySettingSave.php?csrf_token=${csrfToken}&action=userCharacterCards`;
    var url2 = `https://${currentDomain}/lotterySettingSave.php?csrf_token=${csrfToken}&action=specialExchangeCharacterCardsPool`;
    var url3 = `https://${currentDomain}/lotterySettingSave.php?csrf_token=${csrfToken}&action=exchangeCharacterCardsPool`;
    var url4 = `https://${currentDomain}/lotterySettingSave.php?csrf_token=${csrfToken}&action=lotteryCharacterCardsPool`;

    var combinedResult = [];
    var ownedCardIds = [];

    // 初次获取数据并进行对比
    function fetchDataAndMark() {
        GM_xmlhttpRequest({
            method: "GET",
            url: url1,
            responseType: "json",
            onload: function(response1) {
                ownedCardIds = response1.response.data.map(item => item.card_id);

                Promise.all([fetchCards(url2, ownedCardIds), fetchCards(url3, ownedCardIds), fetchCards(url4, ownedCardIds)])
                    .then(results => {
                        combinedResult = results.flat();

                        // 定期渲染标记
                        setInterval(() => {
                            markCards(combinedResult, "red");  // 只使用缓存数据
                            markCards(response1.response.data, "green"); // 只使用缓存数据
                        }, 500);
                    });
            }
        });
    }

    // 获取其他卡片数据并排除已拥有的卡片
    function fetchCards(url, excludeIds) {
        return new Promise(resolve => {
            GM_xmlhttpRequest({
                method: "GET",
                url: url,
                responseType: "json",
                onload: function(response) {
                    var data = response.response.data;
                    var ids = data.map(item => item.id || item.card_id);
                    var idsToKeep = ids.filter(id => !excludeIds.includes(id));
                    var filteredData = data.filter(item => idsToKeep.includes(item.id || item.card_id));
                    resolve(filteredData);
                }
            });
        });
    }

    // 标记卡片
    function markCards(cards, color) {
        cards.forEach(function(item) {
            var elements = document.querySelectorAll('img[src="' + item.pic + '"]');
            elements.forEach(function(element) {
                element.parentNode.style.backgroundColor = color;
            });
        });
    }

    // 动态监听按钮点击事件
    document.addEventListener('click', function (event) {
        const target = event.target;

        // 检查按钮的 class 或其他属性
        if (target.closest('.el-button--danger.is-circle') && !target.id) {
            refreshData();
        }

        // 检查是否点击了指定的按钮
        if (target.closest('.exchange_btn .el-button') && !target.id) {
            refreshData();
        }
    });

    // 刷新数据并重新标记
    function refreshData() {
        // 重新调用 fetchDataAndMark() 更新缓存数据和重新标记
        fetchDataAndMark();
    }

    // 初始化时获取数据并进行渲染
    fetchDataAndMark();
})();
