(function () {
    'use strict';

    const defaultPaths = {
        "included": [
            "*",
            "/torrents.php",
            "/torrent-waterfall.php"
        ],
        "excluded": []
    };

    const savedPaths = GM_getValue('azusa_expand_the_page_width_settings', defaultPaths);

    const currentPath = window.location.pathname;

    const shouldExclude = savedPaths.excluded.includes(currentPath);

    if ((!shouldExclude && (savedPaths.included.includes('*') || savedPaths.included.some(path => currentPath.includes(path)))) ) {
        let mainouter = document.querySelector('.mainouter');
        let main = document.querySelector('.main');

        if (mainouter && main) {
            const adjustWidth = () => {
                let parentWidth = mainouter.parentNode.offsetWidth;
                main.style.width = `${parentWidth * 0.9}px`;
                main.style.maxWidth = '999999px';
                main.style.margin = '0 auto';
            };

            adjustWidth();

            window.addEventListener('resize', adjustWidth);
        }
    }

    const modalHTML = `
        <div id="azusa_expand_the_page_width_settings_modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); z-index: 10000; justify-content: center; align-items: center;">
            <div style="background: white; padding: 20px; border-radius: 5px; width: 400px; max-width: 90%; text-align: center;">
                <h3>设置页面</h3>

                <div id="save-status" style="display: none; color: #ff0000; font-size: 16px; margin-top: 20px;">
                    已保存
                </div>

                <p>请选择启用脚本的页面：</p>

                <div>
                    <input type="checkbox" id="torrents-checkbox" ${savedPaths.excluded.includes('/torrents.php') ? '' : 'checked'}>
                    <label for="torrents-checkbox">列表种子页</label>
                </div>
                <div>
                    <input type="checkbox" id="torrent-waterfall-checkbox" ${savedPaths.excluded.includes('/torrent-waterfall.php') ? '' : 'checked'}>
                    <label for="torrent-waterfall-checkbox">瀑布流种子页</label>
                </div>
                <div>
                    <input type="checkbox" id="exclude-other-pages-checkbox" ${savedPaths.included.includes('*') ? 'checked' : ''}>
                    <label for="exclude-other-pages-checkbox">其他页面</label>
                </div>

                <div>
                    <button id="save-settings" style="padding: 10px 20px; background-color: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">保存</button>
                    <button id="close-modal" style="padding: 10px 20px; background-color: #f44336; color: white; border: none; border-radius: 5px; cursor: pointer;">关闭</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const style = document.createElement('style');
    style.innerHTML = `
        #azusa_expand_the_page_width_settings_button {
            border: none;
            background: none;
            padding: 0;
            text-decoration: none;
            outline: none;
            cursor: pointer;
        }
    `;
    document.head.appendChild(style);

    const modal = document.getElementById('azusa_expand_the_page_width_settings_modal');
    const torrentsCheckbox = document.getElementById('torrents-checkbox');
    const torrentWaterfallCheckbox = document.getElementById('torrent-waterfall-checkbox');
    const excludeOtherPagesCheckbox = document.getElementById('exclude-other-pages-checkbox');
    const saveButton = document.getElementById('save-settings');
    const closeButton = document.getElementById('close-modal');
    const saveStatus = document.getElementById('save-status');

    // 使用 MutationObserver 来监视 DOM 的变化
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            const moduleCheckbox = document.getElementById('module-3-4');

            // 确保目标元素存在
            if (moduleCheckbox) {
                // 获取 `module-3-4` 的父元素，并找到上一个兄弟元素
                const targetDiv = moduleCheckbox.closest('div[style="margin-bottom: 5px; font-size: 14px; display: flex; align-items: center; justify-content: space-between; white-space: nowrap;"]');

                if (targetDiv) {
                    // 检查按钮是否已经存在
                    const existingButton = targetDiv.querySelector('#azusa_expand_the_page_width_settings_button');
                    if (!existingButton) {
                        const settingsButton = document.createElement('button');
                        settingsButton.id = 'azusa_expand_the_page_width_settings_button';
                        settingsButton.textContent = '设置页面';

                        // 插入设置按钮到目标 div
                        targetDiv.querySelector('div[style="font-size: 12px; margin-left: 10px; white-space: nowrap;"]').appendChild(settingsButton);

                        settingsButton.addEventListener('click', () => {
                            modal.style.display = 'flex';
                        });
                    }

                    observer.disconnect(); // 停止监听
                }
            }
        });
    });

    // 开始监听整个 body 中的变化
    observer.observe(document.body, { childList: true, subtree: true });

    saveButton.addEventListener('click', () => {
        const includedPaths = [];
        const excludedPaths = [];

        if (excludeOtherPagesCheckbox.checked) {
            includedPaths.push('*');
        } else {
            const index = includedPaths.indexOf('*');
            if (index > -1) {
                includedPaths.splice(index, 1);
            }
        }

        if (torrentsCheckbox.checked) {
            if (!includedPaths.includes('/torrents.php')) {
                includedPaths.push('/torrents.php');
            }
            const index = excludedPaths.indexOf('/torrents.php');
            if (index > -1) excludedPaths.splice(index, 1);
        } else {
            const index = includedPaths.indexOf('/torrents.php');
            if (index > -1) includedPaths.splice(index, 1);
            if (!excludedPaths.includes('/torrents.php')) excludedPaths.push('/torrents.php');
        }

        if (torrentWaterfallCheckbox.checked) {
            if (!includedPaths.includes('/torrent-waterfall.php')) {
                includedPaths.push('/torrent-waterfall.php');
            }
            const index = excludedPaths.indexOf('/torrent-waterfall.php');
            if (index > -1) excludedPaths.splice(index, 1);
        } else {
            const index = includedPaths.indexOf('/torrent-waterfall.php');
            if (index > -1) includedPaths.splice(index, 1);
            if (!excludedPaths.includes('/torrent-waterfall.php')) excludedPaths.push('/torrent-waterfall.php');
        }

        const newPaths = {
            included: includedPaths,
            excluded: excludedPaths
        };

        GM_setValue('azusa_expand_the_page_width_settings', newPaths);

        saveStatus.style.display = 'block';

        setTimeout(() => {
            saveStatus.style.display = 'none';
        }, 1500);
    });

    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

})();
