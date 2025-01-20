// ==UserScript==
// @name         Azusa 彩虹ID 打字机效果修复
// @namespace    https://github.com/ERSTT
// @icon         https://azusa.wiki/favicon.ico
// @version      0.1
// @description  修复特效
// @author       ERST
// @match        https://azusa.wiki/*
// @match        https://zimiao.icu/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const elementsToModify = document.querySelectorAll('.rainbow-typewriter');

    elementsToModify.forEach(element => {
        const username = element.textContent.trim();

        if (username) {
            element.textContent = '';
            element.classList.add('typewriter');

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

            function calculateTextWidth(text) {
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                context.font = '14px "FusionPixelJA", "FusionPixelZH", monospace';
                const letterSpacing = 2.0;
                let width = 0;
                for (let i = 0; i < text.length; i++) {
                    width += context.measureText(text[i]).width + letterSpacing;
                }
                return width;
            }

            function typeEffect() {
                const currentEmoticon = emoticons[emoticonIndex];
                const fullText = username + ' ' + currentEmoticon;

                const textWidth = calculateTextWidth(fullText);
                element.style.width = `${textWidth}px`;

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
                    element.innerHTML = spanText;

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
                    element.innerHTML = spanText;

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
})();
