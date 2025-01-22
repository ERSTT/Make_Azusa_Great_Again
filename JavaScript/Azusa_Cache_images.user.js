// ==UserScript==
// @name         Azusa Cache images
// @namespace    https://github.com/ERSTT
// @icon         https://azusa.wiki/favicon.ico
// @version      1.0
// @description  缓存网页图片到本地存储
// @author       ERST
// @match        https://azusa.wiki/*
// @match        https://zimiao.icu/*
// @connect      ptpimg.me
// @connect      s3.leaves.red
// @connect      azusa.wiki
// @connect      img.azusa.wiki
// @grant        GM_xmlhttpRequest
// @run-at       document-body
// ==/UserScript==

(function () {
    'use strict';

    const DB_NAME = 'AzusaCacheDB';
    const DB_STORE_NAME = 'images';

    // 设置一个过滤规则：只有包含特定域名的图片 URL 会被缓存
    const allowedDomains = [
        'azusa.wiki',
        'zimiao.icu',
        'img.azusa.wiki',
        'ptpimg.me',
        's3.leaves.red',
    ];

    // 打开或创建 IndexedDB 数据库
    function openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, 1);
            request.onupgradeneeded = function (event) {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(DB_STORE_NAME)) {
                    db.createObjectStore(DB_STORE_NAME, { keyPath: 'url' });
                }
            };
            request.onsuccess = function (event) {
                resolve(event.target.result);
            };
            request.onerror = function (event) {
                reject(event.target.error);
            };
        });
    }

    // 保存图片到 IndexedDB
    function saveImage(db, url, blob) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(DB_STORE_NAME, 'readwrite');
            const store = transaction.objectStore(DB_STORE_NAME);
            const request = store.put({ url, blob });
            request.onsuccess = resolve;
            request.onerror = reject;
        });
    }

    // 从 IndexedDB 加载图片
    function loadImage(db, url) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(DB_STORE_NAME, 'readonly');
            const store = transaction.objectStore(DB_STORE_NAME);
            const request = store.get(url);
            request.onsuccess = function (event) {
                resolve(event.target.result);
            };
            request.onerror = reject;
        });
    }

    // 使用 GM_xmlhttpRequest 进行图片下载
    function downloadImage(url) {
        return new Promise((resolve, reject) => {
            let headers = {};
            // 如果图片来自 img.azusa.wiki，则添加 Referer 头部
            if (url.includes('img.azusa.wiki')) {
                headers['Referer'] = 'https://azusa.wiki';
            }

            GM_xmlhttpRequest({
                method: 'GET',
                url: url,
                responseType: 'blob',
                headers: headers,
                onload: function (response) {
                    resolve(response.response);
                },
                onerror: function (err) {
                    reject(err);
                }
            });
        });
    }

    // 判断图片 URL 是否符合条件
    function isAllowedImage(url) {
        return allowedDomains.some(domain => url.includes(domain));
    }

    // 主函数
function cacheImages() {
    openDB().then(db => {
        const images = document.querySelectorAll('img');

        images.forEach(img => {
            const src = img.src;

            if (isAllowedImage(src)) {
                loadImage(db, src).then(cached => {
                    if (cached) {
                        // 如果缓存存在，从缓存中加载图片
                        const blobUrl = URL.createObjectURL(cached.blob);
                        img.src = blobUrl;
                    } else {
                        // 如果没有缓存，下载并存储图片
                        downloadImage(src).then(blob => {
                            saveImage(db, src, blob).then(() => {
                                const blobUrl = URL.createObjectURL(blob);
                                img.src = blobUrl;
                            }).catch(err => console.error('保存图片时出错:', err));
                        }).catch(err => console.error('下载图片时出错:', err));
                    }
                }).catch(err => console.error('加载图片时出错:', err));
            }
        });
    }).catch(err => console.error('打开数据库时出错:', err));
}

    // 运行缓存逻辑
    cacheImages();
})();
