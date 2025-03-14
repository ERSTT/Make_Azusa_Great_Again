// 瀑布流卡片添加一些按钮
(function () {
    'use strict';

    if (!window.location.href.includes('customBgUrl') && !window.location.href.includes('/torrent-waterfall.php')) {
        return;
    }

    let bookmarkIndex = 0;

    function createDownloadButton(torrentId) {
        const button = document.createElement('a');
        button.href = `download.php?id=${torrentId}`;
        button.classList.add('download-button');
        button.innerHTML = '<img class="download" src="pic/trans.gif" alt="download" title="下载本种">';
        return button;
    }

    function createBookmarkButton(torrentId, index) {
        const button = document.createElement('a');
        button.id = `bookmark${index}`;
        button.href = `javascript: bookmark(${torrentId},${index});`;
        button.classList.add('bookmark-button');
        button.innerHTML = '<img class="delbookmark" src="pic/trans.gif" alt="Unbookmarked" title="收藏">';
        return button;
    }

    function addButtons() {
        document.querySelectorAll('.torrent-card').forEach(card => {
            if (card.querySelector('.download-button') || card.querySelector('.bookmark-button')) return;

            const titleLink = card.querySelector('.torrent-cover-container a[href*="id="]');
            if (!titleLink) return;

            const match = titleLink.href.match(/id=(\d+)/);
            if (!match) return;

            card.style.position = 'relative';
            const downloadButton = createDownloadButton(match[1]);
            const bookmarkButton = createBookmarkButton(match[1], bookmarkIndex++);

            const tagsContainer = card.querySelector('.torrent-tags');
            if (tagsContainer) {
                const buttonContainer = document.createElement('div');
                buttonContainer.classList.add('button-container');
                buttonContainer.appendChild(bookmarkButton);
                buttonContainer.appendChild(downloadButton);
                tagsContainer.appendChild(buttonContainer);
            } else {
                card.appendChild(bookmarkButton);
                card.appendChild(downloadButton);
            }
        });
    }

    function debounce(fn, delay) {
        let timer;
        return function () {
            clearTimeout(timer);
            timer = setTimeout(fn, delay);
        };
    }

    const style = document.createElement('style');
    style.textContent = `
        .torrent-tags {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .button-container {
            display: flex;
            gap: 5px;
            margin-left: auto;
        }
        .download-button, .bookmark-button {
            display: inline-block;
        }
        .download-button img, .bookmark-button img {
            vertical-align: middle;
        }
    `;
    document.head.appendChild(style);

    window.addEventListener('load', addButtons);

    const observer = new MutationObserver(debounce(addButtons, 300));
    observer.observe(document.body, { childList: true, subtree: true });
})();

// 瀑布流自定义每行卡片数量

(function() {
    'use strict';

    if (!window.location.href.includes('customBgUrl') && !window.location.href.includes('/torrent-waterfall.php')) {
        return;
    }

    const modifyCSS = () => {
        [...document.styleSheets].forEach(sheet => {
            try {
                [...sheet.cssRules || sheet.rules].forEach(rule => {
                    if (rule.selectorText?.includes('.grid-item')) {
                        rule.style.width = "calc(100% / var(--grid-cols, 5) - 10px)";
                    }
                });
            } catch (e) {
            }
        });
    };

    const setGridCols = value => {
        GM_setValue("gridCols", value);
        document.documentElement.style.setProperty("--grid-cols", value);
        loadTorrents(true);
    };

    const createSettingUI = () => {
        const buttonGroup = document.querySelector('.button-group');
        if (!buttonGroup) return;

        const container = document.createElement("div");

        const label = document.createElement("label");
        label.textContent = "每行数量: ";
        label.style.marginRight = "5px";

        const input = document.createElement("input");
        input.type = "number";
        input.min = 1;
        input.style.width = "50px";
        input.title = "设置列数";

        const savedValue = GM_getValue("gridCols", 5);
        input.value = savedValue;
        setGridCols(savedValue);

        input.oninput = () => {
            const newValue = parseInt(input.value, 10) || 5;
            setGridCols(newValue);
        };

        container.appendChild(label);
        container.appendChild(input);
        buttonGroup.prepend(container);
    };

    modifyCSS();
    createSettingUI();
})();
