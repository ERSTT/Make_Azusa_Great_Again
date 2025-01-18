// ==UserScript==
// @name         Azusa 彩虹ID 打字机效果
// @namespace    https://github.com/ERSTT
// @icon         https://azusa.wiki/favicon.ico
// @version      0.2
// @description  彩虹ID 打字机效果
// @author       ERST
// @match        https://azusa.wiki/*
// @match        https://zimiao.icu/*
// @connect      githubusercontent.com
// @connect      github.com
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @run-at       document-end
// @changelog    初步测试
// ==/UserScript==

(function() {
    'use strict';

    // 获取字体文件的Base64数据
    const fontUrls = {
        'FusionPixelJA': 'https://github.com/ERSTT/Files/raw/refs/heads/main/font/fusion-pixel-12px-monospaced-ja.woff2',
        'FusionPixelZH': 'https://github.com/ERSTT/Files/raw/refs/heads/main/font/fusion-pixel-12px-monospaced-zh_hans.woff2'
    };

    function loadFont(url, fontName, callback) {
        GM_xmlhttpRequest({
            method: 'GET',
            url: url,
            responseType: 'arraybuffer',
            onload: function(response) {
                if (response.status === 200) {
                    const fontArrayBuffer = response.response;
                    const base64Font = arrayBufferToBase64(fontArrayBuffer);
                    callback(base64Font, fontName);
                }
            },
            onerror: function() {
                console.error(`无法加载字体: ${url}`);
            }
        });
    }

    function arrayBufferToBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    function injectFonts(base64Fonts) {
        const css = `
            @font-face {
                font-family: 'FusionPixelJA';
                src: url('data:font/woff2;base64,${base64Fonts['FusionPixelJA']}') format('woff2');
                font-weight: normal;
                font-style: normal;
            }

            @font-face {
                font-family: 'FusionPixelZH';
                src: url('data:font/woff2;base64,${base64Fonts['FusionPixelZH']}') format('woff2');
                font-weight: normal;
                font-style: normal;
            }

            .typewriter {
                font-family: 'FusionPixelJA', 'FusionPixelZH', monospace;
                display: inline-block;
                overflow: hidden;
                white-space: nowrap;
                letter-spacing: .15em;
                vertical-align: middle; /* 与其他文本底部对齐 */
                line-height: -1.0; /* 调整行高，使字体稍微降低 */
            }

            .typewriter::after {
                content: '|';
                font-weight: bold;
                animation: blink-caret 1.5s step-end infinite;
            }

            @keyframes blink-caret {
                from, to { color: transparent; }
                50% { color: orange; }
            }
        `;
        GM_addStyle(css); // 注入字体和样式
    }

    // 下载字体并注入样式
    const base64Fonts = {};
    let fontsLoaded = 0;

    for (const fontName in fontUrls) {
        loadFont(fontUrls[fontName], fontName, function(base64Font, fontName) {
            base64Fonts[fontName] = base64Font;
            fontsLoaded++;
            if (fontsLoaded === Object.keys(fontUrls).length) {
                injectFonts(base64Fonts); // 当所有字体加载完毕，注入样式
                modifyUserSpan(); // 字体加载完后，修改目标 span
            }
        });
    }

    function modifyUserSpan() {
        // 获取目标元素：通过文本内容选取包含用户名的 span 元素
        const userSpan = Array.from(document.querySelectorAll('td.bottom span.medium span.nowrap b span')).find(span => span.textContent.trim() !== ''); // 查找用户名所在的span元素

        if (userSpan) {
            const username = userSpan.textContent.trim(); // 获取用户名

            // 清空现有文本内容
            userSpan.textContent = '';

            // 清除旧的 class 名称，并添加新的 class 和 id
            userSpan.className = ''; // 清空所有现有的 class 名称
            userSpan.classList.add('typewriter'); // 添加打字机效果的类
            userSpan.id = 'typewriter'; // 设置新的 id

            // 添加打字机效果的脚本
            let emoticonIndex = 0;
            let charIndex = 0;
            let text = '';
            let isDeleting = false;
            const emoticons = ['QvQ', '=w=', 'OwO', 'UwU', '>w<'];

            function typeEffect() {
                const currentEmoticon = emoticons[emoticonIndex];
                const fullText = username + ' ' + currentEmoticon;

                if (!isDeleting) {
                    charIndex++;
                    text = fullText.substring(0, charIndex);
                    userSpan.textContent = text;

                    if (charIndex === fullText.length) {
                        setTimeout(() => isDeleting = true, 3200); // 完整显示后暂停1.5秒再删除
                    }
                } else {
                    charIndex--;
                    text = fullText.substring(0, charIndex);
                    userSpan.textContent = text;

                    if (charIndex === 0) {
                        setTimeout(() => {
                            isDeleting = false;
                            emoticonIndex = (emoticonIndex + 1) % emoticons.length;
                        }, 400); // 删除完后暂停1.5秒再显示下一个颜表情
                    }
                }

                const typingSpeed = isDeleting ? 50 : 100;
                setTimeout(typeEffect, typingSpeed);
            }

            typeEffect(); // 启动打字机效果
        }
    }
})();
