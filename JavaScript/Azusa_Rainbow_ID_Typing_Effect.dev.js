// ==UserScript==
// @name         Azusa 彩虹ID 打字机效果
// @namespace    https://github.com/ERSTT
// @icon         https://azusa.wiki/favicon.ico
// @version      0.5
// @description  彩虹ID 打字机效果
// @author       ERST
// @match        https://azusa.wiki/*
// @match        https://zimiao.icu/*
// @connect      githubusercontent.com
// @connect      github.com
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @run-at       document-end
// @changelog    添加彩虹效果
// ==/UserScript==

(function() {
    'use strict';

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
                font-family: 'FusionPixelZH', 'FusionPixelJA', monospace;
                display: inline-block;
                overflow: visible;
                white-space: nowrap;
                letter-spacing: .10em;
                font-size: 14px;
                text-align: left;
                position: relative;
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
        GM_addStyle(css);
    }

    const base64Fonts = {};
    let fontsLoaded = 0;

    for (const fontName in fontUrls) {
        loadFont(fontUrls[fontName], fontName, function(base64Font, fontName) {
            base64Fonts[fontName] = base64Font;
            fontsLoaded++;
            if (fontsLoaded === Object.keys(fontUrls).length) {
                injectFonts(base64Fonts);
                modifyUserSpans();
            }
        });
    }

    function modifyUserSpans() {
        const spansToModify = document.querySelectorAll('span.rainbow-cat, span.rainbow-default, span.rainbow-2');

        spansToModify.forEach(span => {
            const username = span.textContent.trim();

            if (username) {
                span.textContent = '';
                span.className = ''; // 清除现有的类名
                span.classList.add('typewriter'); // 添加打字机特效类名

                let emoticonIndex = 0;
                let charIndex = 0;
                let text = '';
                let isDeleting = false;
                let charColors = [];
                const emoticons = ['QvQ', '=w=', 'OwO', 'UwU', '>w<'];

                function getRandomColor() {
                    const r = Math.floor(Math.random() * 256);
                    const g = Math.floor(Math.random() * 256);
                    const b = Math.floor(Math.random() * 256);
                    return `rgb(${r}, ${g}, ${b})`;
                }

                // 修改后的 calculateTextWidth 函数，考虑字间距
                function calculateTextWidth(text) {
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    context.font = '14px "FusionPixelJA", "FusionPixelZH", monospace'; // 使用相同的字体和大小
                    const letterSpacing = 2.0; // 使用和CSS中相同的字间距
                    let width = 0;

                    // 累加每个字符的宽度，并加上字间距
                    for (let i = 0; i < text.length; i++) {
                        width += context.measureText(text[i]).width + letterSpacing;
                    }

                    return width;
                }

                function typeEffect() {
                    const currentEmoticon = emoticons[emoticonIndex];
                    const fullText = username + ' ' + currentEmoticon;

                    // 动态计算文本宽度并设置宽度
                    const textWidth = calculateTextWidth(fullText);
                    span.style.width = `${textWidth}px`; // 设置span宽度

                    if (!isDeleting) {
                        charIndex++;
                        text = fullText.substring(0, charIndex);

                        if (!charColors.length) {
                            charColors = Array.from(fullText).map(() => getRandomColor());
                        }

                        const spanText = Array.from(text).map((char, index) => {
                            const color = charColors[index];
                            return `<span style="color: ${color}">${char}</span>`;
                        }).join('');
                        span.innerHTML = spanText;

                        if (charIndex === fullText.length) {
                            setTimeout(() => {
                                isDeleting = true;
                                typeEffect();
                            }, 3200);
                            return;
                        }
                    } else {
                        charIndex--;
                        text = fullText.substring(0, charIndex);

                        const spanText = Array.from(text).map((char, index) => {
                            const color = charColors[index];
                            return `<span style="color: ${color}">${char}</span>`;
                        }).join('');
                        span.innerHTML = spanText;

                        if (charIndex === 0) {
                            setTimeout(() => {
                                isDeleting = false;
                                emoticonIndex = (emoticonIndex + 1) % emoticons.length;
                                charColors = [];
                                typeEffect();
                            }, 400);
                            return;
                        }
                    }

                    const typingSpeed = isDeleting ? 50 : 100;
                    setTimeout(typeEffect, typingSpeed);
                }

                typeEffect();
            }
        });
    }
})();
