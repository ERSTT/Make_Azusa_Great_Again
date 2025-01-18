// ==UserScript==
// @name         Azusa 彩虹ID 打字机效果
// @namespace    https://github.com/ERSTT
// @icon         https://azusa.wiki/favicon.ico
// @version      0.3
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
                font-family: 'FusionPixelJA', 'FusionPixelZH', monospace;
                display: inline-block;
                overflow: hidden;
                white-space: nowrap;
                letter-spacing: .15em;
                vertical-align: middle;
                line-height: -1.0;
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
                modifyUserSpan();
            }
        });
    }

    function modifyUserSpan() {
        const userSpan = Array.from(document.querySelectorAll('td.bottom span.medium span.nowrap b span')).find(span => span.textContent.trim() !== '');

        if (userSpan) {
            const username = userSpan.textContent.trim();

            userSpan.textContent = '';

            userSpan.className = '';
            userSpan.classList.add('typewriter');
            userSpan.id = 'typewriter';

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

            function typeEffect() {
                const currentEmoticon = emoticons[emoticonIndex];
                const fullText = username + ' ' + currentEmoticon;

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
                    userSpan.innerHTML = spanText;

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
                    userSpan.innerHTML = spanText;

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
    }
})();
