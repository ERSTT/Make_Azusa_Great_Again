// ==UserScript==
// @name         Azusa 彩虹ID 波浪效果
// @namespace    https://github.com/ERSTT
// @icon         https://azusa.wiki/favicon.ico
// @version      0.1
// @description  Azusa 彩虹ID 波浪效果
// @author       ERST
// @match        https://azusa.wiki/*
// @match        https://zimiao.icu/*
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    const style = document.createElement('style');
    style.innerHTML = `
        .wave-text {
            font-family: sans-serif;
            font-weight: bold;
            display: inline-block;
            white-space: nowrap;
        }

        .wave-text span {
            display: inline-block;
            animation: wave 1.5s infinite ease-in-out, rainbow 1.5s infinite linear;
        }

        @keyframes wave {
            0%, 100% {
                transform: translateY(0);
            }
            50% {
                transform: translateY(-10px);
            }
        }

        @keyframes rainbow {
            0% {
                color: red;
            }
            14% {
                color: orange;
            }
            28% {
                color: yellow;
            }
            42% {
                color: green;
            }
            57% {
                color: blue;
            }
            71% {
                color: indigo;
            }
            85% {
                color: violet;
            }
            100% {
                color: red;
            }
        }
    `;
    document.head.appendChild(style);

    function addWaveEffect(element) {
        const text = element.innerText;
        element.innerText = '';
        for (let i = 0; i < text.length; i++) {
            const span = document.createElement('span');
            span.innerText = text[i];
            span.style.animationDelay = `${i * 0.15}s`;
            element.appendChild(span);
        }
    }

    function replaceWithWaveEffect() {
        const spans = document.querySelectorAll('span.rainbow-cat, span.rainbow-default, span.rainbow-2');
        spans.forEach(span => {
            const waveTextElement = document.createElement('div');
            waveTextElement.classList.add('wave-text');
            waveTextElement.innerText = span.innerText;
            addWaveEffect(waveTextElement);

            span.parentNode.replaceChild(waveTextElement, span);
        });
    }

    window.addEventListener('DOMContentLoaded', () => {
        replaceWithWaveEffect();
    });
})();
