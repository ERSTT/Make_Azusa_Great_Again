(function () {
    'use strict';

    function cleanCards() {
        const charaArray = Array.from(document.querySelectorAll('.myChara'));
        let removedCount = 0;

        charaArray.forEach(chara => {
            const textEl = chara.querySelector('.card-count span');
            if (textEl && textEl.textContent.trim() === '已选0/1张') {
                // 确保删除后至少留一个
                if (document.querySelectorAll('.myChara').length - removedCount > 1) {
                    chara.remove();
                    removedCount++;
                }
            }
        });
    }

    // 初始执行一次
    cleanCards();

    // 监听整个页面 DOM 变化
    const observer = new MutationObserver(() => {
        cleanCards();
    });
    observer.observe(document.body, {
        childList: true, // 监听子节点的增加/删除
        subtree: true,   // 递归监听整个 DOM 树
        characterData: true // 监听文本变化（比如 0/4 → 0/1）
    });
})();
