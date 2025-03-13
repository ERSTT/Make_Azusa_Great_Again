(function () {
    'use strict';

    // 仅在特定页面生效
    if (!window.location.href.includes('customBgUrl') && !window.location.href.includes('/torrent-waterfall.php')) {
        return;
    }

    function createDownloadButton(torrentId) {
        const button = document.createElement('a');
        button.href = `download.php?id=${torrentId}`;
        button.classList.add('download-button');
        button.innerHTML = '<img class="download" src="pic/trans.gif" alt="download" title="下载本种">';
        return button;
    }

    function addDownloadButtons() {
        document.querySelectorAll('.torrent-card').forEach(card => {
            if (card.querySelector('.download-button')) return;

            const titleLink = card.querySelector('.torrent-title a[href*="id="]');
            if (!titleLink) return;

            const match = titleLink.href.match(/id=(\d+)/);
            if (!match) return;

            card.style.position = 'relative';
            const downloadButton = createDownloadButton(match[1]);
            card.appendChild(downloadButton);
        });
    }

    function debounce(fn, delay) {
        let timer;
        return function () {
            clearTimeout(timer);
            timer = setTimeout(fn, delay);
        };
    }

    // 样式优化，减少内联 CSS
    const style = document.createElement('style');
    style.textContent = `
        .download-button {
            position: absolute;
            top: 5px;
            right: 5px;
            z-index: 10;
        }
        .download-button img {
            padding-bottom: 2px;
        }
    `;
    document.head.appendChild(style);

    // 确保在 DOM 加载完成后运行
    window.addEventListener('load', addDownloadButtons);

    // 监听动态变化（适用于 AJAX 加载），防止频繁触发
    const observer = new MutationObserver(debounce(addDownloadButtons, 300));
    observer.observe(document.body, { childList: true, subtree: true });

})();
