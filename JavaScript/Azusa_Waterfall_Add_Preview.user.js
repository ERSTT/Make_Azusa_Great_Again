(function () {
    'use strict';

    // 仅在特定页面生效
    if (!window.location.href.includes('customBgUrl') && !window.location.href.includes('/torrent-waterfall.php')) {
        return;
    }

    GM_addStyle(`
        .preview-overlay, .preview-modal {
            position: fixed; top: 50%; left: 50%;
            transform: translate(-50%, -50%);
        }
        .preview-overlay {
            width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.2);
            z-index: 9999; display: none;
            backdrop-filter: blur(5px);
        }
        .preview-modal {
            width: 60%; height: 80%;
            background: rgba(255, 255, 255, 0.85);
            border-radius: 10px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 10000; padding: 15px;
            overflow-y: auto; display: none;
        }
        .preview-close {
            position: absolute; top: 5px; right: 10px;
            cursor: pointer; font-size: 18px;
            font-weight: bold; background: rgba(255, 255, 255, 0.6);
            padding: 5px 10px; border-radius: 50%;
        }
        .preview-close:hover { background: rgba(255, 255, 255, 0.9); }
        .preview-modal {
            scrollbar-width: none;
            -ms-overflow-style: none;
        }
        .preview-modal::-webkit-scrollbar {
            display: none;
        }
    `);

    document.body.insertAdjacentHTML('beforeend', `
        <div class="preview-overlay"></div>
        <div class="preview-modal">
            <span class="preview-close">✖</span>
            <div id="preview-content">加载中...</div>
        </div>
    `);

    const modal = document.querySelector('.preview-modal'),
          overlay = document.querySelector('.preview-overlay');

    document.body.addEventListener('click', function (event) {
        if (event.target.matches('.preview-close, .preview-overlay')) {
            modal.style.display = overlay.style.display = 'none';
            return;
        }

        let link = event.target.closest('.torrent-title a');
        if (!link) return;

        event.preventDefault();
        GM_xmlhttpRequest({
            method: 'GET', url: link.href,
            onload: function (response) {
                let doc = new DOMParser().parseFromString(response.responseText, 'text/html');
                let descTd = [...doc.querySelectorAll('.rowhead')].find(td => td.textContent.includes('简介'));
                document.getElementById('preview-content').innerHTML = descTd ? descTd.nextElementSibling.innerHTML : '无法加载简介';
                modal.style.display = overlay.style.display = 'block';
                modal.scrollTop = 0;
            }
        });
    });
})();
