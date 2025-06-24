// ==UserScript==
// @name         Azusa 一键翻转所有卡片
// @namespace    https://github.com/ERSTT
// @icon         https://azusa.wiki/favicon.ico
// @version      1.4
// @description  Azusa 一键翻转所有卡片
// @author       ERST
// @match        https://zimiao.icu/*lottery.php*action=lottery*
// @match        https://zimiao.icu/*lottery.php*action=lottery*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/ERSTT/Files/refs/heads/main/JavaScript/Azusa_Turn_all_cards.user.js
// @downloadURL  https://raw.githubusercontent.com/ERSTT/Files/refs/heads/main/JavaScript/Azusa_Turn_all_cards.user.js
// @changelog    适配新版网页布局
// ==/UserScript==

(function () {
    'use strict';

    if (!window.location.href.includes('customBgUrl') && !window.location.href.includes('/lottery.php')) {
        return;
    }

    function replaceAllCardContent() {
        const cards = document.querySelectorAll('[class^="project ani"]');
        const newHTML = `<div class="mask flex flex-col relative" style="width: 222px; height: 300px;">
            <div class="back">
                <div style="display: flex; flex-direction: column;">
                    <p style="font-size: 20px; font-weight: bold;">手气不佳</p>
                    <p style="font-size: 14px;">抱歉，梓喵娘抛弃了你</p>
                </div>
            </div>
            <div class="justify-center py-1 absolute left-0 w-full flex" style="bottom: -18px; font-size: 12pt;"></div>
            <div class="front"><span></span></div>
        </div>`;

        cards.forEach(card => {
            card.innerHTML = newHTML;
        });

        console.log(`已将 ${cards.length} 个卡牌内容替换为指定内容。`);
    }

    function addTriggerButton() {
        if (document.getElementById('trigger-all-cards-button')) return;

        const triggerButton = document.createElement('button');
        triggerButton.textContent = '翻转所有卡片';
        triggerButton.style.margin = '10px 0';
        triggerButton.className = 'el-button el-button--danger is-circle';
        triggerButton.id = 'trigger-all-cards-button';

        triggerButton.dataset.flipped = 'false';
        triggerButton.dataset.clickCount = '0';

        triggerButton.addEventListener('click', () => {
            if (triggerButton.disabled) return; // 禁用期间禁止点击

            let count = parseInt(triggerButton.dataset.clickCount, 10) || 0;
            count++;
            triggerButton.dataset.clickCount = count.toString();

            if (triggerButton.dataset.flipped === 'false') {
                const fronts = document.querySelectorAll('.front');
                fronts.forEach(front => front.click());
                triggerButton.dataset.flipped = 'true';
                console.log('已翻转所有卡片，后续将切换 showli 类。');
            } else {
                const cards = document.querySelectorAll('[class^="project ani"]');
                cards.forEach(card => card.classList.toggle('showli'));
                console.log('已切换 showli 类。');
            }

            if (count === 18) {
                triggerButton.disabled = true; // 禁用按钮
                setTimeout(() => {
                    replaceAllCardContent();
                    triggerButton.disabled = false; // 替换完毕恢复可点击
                }, 900);
            }

            console.log(`按钮点击次数: ${count}`);
        });

        const targetDiv = document.getElementById('projects');
        if (targetDiv) {
            targetDiv.appendChild(triggerButton);
            console.log('按钮已添加到 #projects 元素下，并重置状态和计数器。');
        } else {
            console.error('未找到 #projects 元素。');
        }
    }

    function monitorConfirmButton() {
        const confirmButton = document.querySelector('.el-message-box__btns .el-button--primary');
        if (confirmButton) {
            confirmButton.addEventListener('click', () => {
                console.log('点击了确定按钮，1秒后尝试生成按钮。');
                setTimeout(() => {
                    addTriggerButton();
                }, 800);
            });
        }
    }

    const observer = new MutationObserver(() => {
        addTriggerButton();
        monitorConfirmButton();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();
