// ==UserScript==
// @name         Azusa 一键翻转所有卡片
// @namespace    https://github.com/ERSTT
// @icon         https://azusa.wiki/favicon.ico
// @version      1.3
// @description  Azusa 一键翻转所有卡片
// @author       ERST
// @match        https://zimiao.icu/*lottery.php*action=lottery*
// @match        https://zimiao.icu/*lottery.php*action=lottery*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/ERSTT/Files/refs/heads/main/JavaScript/Azusa_Turn_all_cards.user.js
// @downloadURL  https://raw.githubusercontent.com/ERSTT/Files/refs/heads/main/JavaScript/Azusa_Turn_all_cards.user.js
// @changelog    适配新版网页
// ==/UserScript==

(function() {
    'use strict';

    // 函数：添加触发按钮
    function addTriggerButton() {
        // 创建按钮
        const triggerButton = document.createElement('button');
        triggerButton.textContent = '翻转所有卡片';
        triggerButton.style.marginLeft = '10px'; // 设置按钮的左边距
        triggerButton.className = 'el-button el-button--danger is-circle'; // 添加样式类
        triggerButton.id = 'trigger-all-cards-button'; // 设置按钮 ID

        // 按钮点击事件
        triggerButton.addEventListener('click', () => {
            // 获取所有的 .front 元素
            const fronts = document.querySelectorAll('.front');

            // 遍历每个 .front 元素并触发点击事件
            fronts.forEach(front => {
                front.click(); // 模拟点击事件
            });
        });

        // 查找目标 div
        const targetDiv = document.querySelector('div[style="margin-top: 25px;"]');
        if (targetDiv) {
            // 检查按钮是否已经存在
            if (!document.getElementById('trigger-all-cards-button')) {
                targetDiv.appendChild(triggerButton); // 将按钮添加到页面中
                console.log('按钮已添加到指定的 div 元素。');
            }
        } else {
            console.error('未找到指定的 div 元素。');
        }
    }

    // 函数：监控点击确定按钮
    function monitorConfirmButton() {
        // 选择确定按钮
        const confirmButton = document.querySelector('.el-message-box__btns .el-button--primary');

        // 如果找到了按钮，添加点击事件
        if (confirmButton) {
            confirmButton.addEventListener('click', () => {
                console.log('点击了确定按钮，1秒后尝试生成一次。');
                setTimeout(() => {
                    addTriggerButton(); // 1秒后尝试添加按钮
                }, 1000);
            });
        } else {
            console.error('未找到确定按钮。');
        }
    }

    // 每隔一段时间检查页面变化
    const observer = new MutationObserver(() => {
        addTriggerButton(); // 尝试添加按钮
        monitorConfirmButton(); // 尝试监控确定按钮
    });

    // 开始观察页面变化
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();
