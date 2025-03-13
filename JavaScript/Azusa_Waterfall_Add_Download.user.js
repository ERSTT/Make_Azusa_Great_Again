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
