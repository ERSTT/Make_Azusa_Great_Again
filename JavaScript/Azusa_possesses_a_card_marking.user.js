// ==UserScript==
// @name         Azusa 拥有卡片标绿
// @namespace    https://github.com/ERSTT
// @icon         https://azusa.wiki/favicon.ico
// @version      0.1
// @description  Azusa 拥有卡片标绿
// @author       ERST
// @match        https://azusa.wiki/*lottery*
// @grant        GM_xmlhttpRequest
// @updateURL    https://github.com/ERSTT/Files/raw/main/JavaScript/Azusa_possesses_a_card_marking.user.js
// @downloadURL  https://github.com/ERSTT/Files/raw/main/JavaScript/Azusa_possesses_a_card_marking.user.js
// ==/UserScript==

(function() {
    'use strict';

    var url1 = "https://azusa.wiki/lotterySettingSave.php?action=userCharacterCards";

    var ownedCardIds = [];

    // 获取用户已拥有的卡片数据
    GM_xmlhttpRequest({
        method: "GET",
        url: url1,
        responseType: "json",
        onload: function(response) {
            ownedCardIds = response.response.data.map(item => item.card_id);

            // 在页面上标记用户已拥有的卡片
            setTimeout(function() {
                markOwnedCards(response.response.data);
            }, 1000);
        }
    });

    // 在页面上标记用户已拥有的卡片函数
    function markOwnedCards(cards) {
        cards.forEach(function(item) {
            var elements = document.querySelectorAll('img[src="' + item.pic + '"]');
            elements.forEach(function(element) {
                element.parentNode.style.backgroundColor = "green";
            });
        });
    }
})();





