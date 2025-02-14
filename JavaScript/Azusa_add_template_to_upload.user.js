// ==UserScript==
// @name         Azusa 上传界面添加预设模板
// @namespace    https://github.com/ERSTT
// @icon         https://azusa.wiki/favicon.ico
// @version      0.1
// @description  Azusa 上传界面添加预设模板
// @author       ERST
// @match        https://azusa.wiki/*
// @match        https://zimiao.icu/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/ERSTT/Make_Azusa_Great_Again/refs/heads/main/JavaScript/Azusa_add_template_to_upload.user.js
// @downloadURL  https://raw.githubusercontent.com/ERSTT/Make_Azusa_Great_Again/refs/heads/main/JavaScript/Azusa_add_template_to_upload.user.js
// @changelog    初始发布
// ==/UserScript==

(function() {
    'use strict';

    const urlPatterns = [
        /^https:\/\/azusa.wiki\/offers\.php.*/,
        /^https:\/\/zimiao.icu\/offers\.php.*/,
        /^https:\/\/azusa.wiki\/upload\.php.*/,
        /^https:\/\/zimiao.icu\/upload\.php.*/
    ];

    const currentURL = window.location.href;
    const isMatchingURL = urlPatterns.some(pattern => pattern.test(currentURL));
    if (!isMatchingURL) {
        return;
    }

    const templates = [
        { name: "自购 bangumi", content: "此处替换为 bangumi BBcode\n提取脚本\nhttps://greasyfork.org/zh-CN/scripts/25925-bangumi-info-export\n游戏需发候选 不可直接发布\n\n注：\n暂无\n\n[spoiler=自购证明][img]这里替换自购证明图片URL[/img][/spoiler]" },
        { name: "自购 自填", content: "[img]替换为 漫画/画集/轻小说/音乐/游戏 的封面图URL[/img]\n\n[b]简介 : [/b]\n替换为 漫画/画集/轻小说/音乐/游戏 的简介内容\n游戏需发候选 不可直接发布\n\n注：\n暂无\n\n[spoiler=自购证明][img]替换为 自购证明 的图片URL[/img][/spoiler]" },
        { name: "转种 bangumi", content: "此处替换为 bangumi BBcode\n提取脚本\nhttps://greasyfork.org/zh-CN/scripts/25925-bangumi-info-export\n游戏需发候选 不可直接发布\n\n注：\n暂无\n\n[quote]此处填写转钟信息[/quote]" },
        { name: "转种 自填", content: "[img]替换为 漫画/画集/轻小说/音乐/游戏 的封面图URL[/img]\n\n[b]简介 : [/b]\n替换为 漫画/画集/轻小说/音乐/游戏 的简介内容\n游戏需发候选 不可直接发布\n\n注：\n暂无\n\n[quote]此处填写转钟信息[/quote]" },
    ];

    function insertTemplate(content) {
        const textarea = document.getElementById("descr");
        if (textarea) {
            textarea.value = content;
        }
    }

    function createButton(template) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "embedded";
        button.style.marginRight = "5px";
        button.innerText = template.name;
        button.addEventListener("click", () => insertTemplate(template.content));
        return button;
    }

    window.addEventListener("load", () => {
        // Find the rows for "简介" and "NFO文件"
        const rows = document.querySelectorAll("tbody > tr");
        let descriptionRow, nfoRow;

        rows.forEach(row => {
            const label = row.querySelector("td.rowhead");
            if (label) {
                if (label.innerText.includes("简介")) {
                    descriptionRow = row;
                } else if (label.innerText.includes("NFO文件")) {
                    nfoRow = row;
                }
            }
        });

        if (descriptionRow) {
            const newRow = document.createElement("tr");

            const leftCell = document.createElement("td");
            leftCell.className = "rowhead nowrap";
            leftCell.vAlign = "top";
            leftCell.align = "right";
            leftCell.innerText = "简介模板";

            const rightCell = document.createElement("td");
            rightCell.className = "rowfollow";
            rightCell.vAlign = "top";
            rightCell.align = "left";

            const buttonContainer = document.createElement("div");

            templates.forEach(template => {
                const button = createButton(template);
                buttonContainer.appendChild(button);
            });

            rightCell.appendChild(buttonContainer);

            newRow.appendChild(leftCell);
            newRow.appendChild(rightCell);

            descriptionRow.parentNode.insertBefore(newRow, descriptionRow);
        }

        if (nfoRow) {
            nfoRow.parentNode.removeChild(nfoRow);
        }
    });
})();
