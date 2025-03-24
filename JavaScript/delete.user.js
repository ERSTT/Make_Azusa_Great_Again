// ==UserScript==
// @name         Azusa 种子列表添加删除按钮
// @namespace    https://github.com/ERSTT
// @icon         https://azusa.wiki/favicon.ico
// @version      0.5
// @description  Azusa 种子列表添加删除按钮
// @author       ERST
// @match        https://azusa.wiki/*
// @match        https://zimiao.icu/*
// @grant        none
// @run-at       document-body
// ==/UserScript==

(function() {
    'use strict';

    if (!window.location.href.includes('customBgUrl') && !window.location.href.includes('/torrents.php')) {
        return;
    }

    // 当 DOM 加载完成后执行
    window.addEventListener('load', function() {
        // 在页面中插入样式
        const style = document.createElement('style');
        style.textContent = `
        .preview-overlay {
            position: fixed; top: 0; left: 0;
            width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.2);
            backdrop-filter: blur(5px);
            z-index: 9999;
            opacity: 0; visibility: hidden;
            transition: opacity 0.3s ease, visibility 0.3s;
        }

        .preview-modal {
            position: fixed; top: 50%; left: 50%;
            max-width: 90%; max-height: 90%;
            min-width: 300px; min-height: 200px;
            background: rgba(255, 255, 255, 0.85);
            border-radius: 10px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 10000; padding: 15px;
            overflow-y: auto;
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 0; visibility: hidden;
            transition: opacity 0.3s ease, transform 0.3s ease, visibility 0.3s;
        }

        .preview-overlay.show {
            opacity: 1; visibility: visible;
        }

        .preview-modal.show {
            opacity: 1; visibility: visible;
            transform: translate(-50%, -50%) scale(1);
        }

        .preview-close {
        }

        .preview-close:hover { background: rgba(255, 255, 255, 0.9); }

        .preview-modal {
            scrollbar-width: none;
            -ms-overflow-style: none;
        }

        .preview-modal::-webkit-scrollbar {
            display: none;
        }
        `;
        document.head.appendChild(style);

        // 创建模态遮罩层和模态内容容器
        document.body.insertAdjacentHTML('beforeend',
        `<div class="preview-overlay"></div>
        <div class="preview-modal">
            <span class="preview-close"></span>
            <div id="preview-content"></div>
            <div id="peerlist"></div>
        </div>`
        );

        const modal = document.querySelector('.preview-modal'),
              overlay = document.querySelector('.preview-overlay');

        function closeModal() {
            modal.classList.remove('show');
            overlay.classList.remove('show');
            document.getElementById('preview-content').innerHTML = '';
            document.getElementById('peerlist').innerHTML = '';
        }

        overlay.addEventListener('click', function(e) {
            if(e.target === overlay) {
                closeModal();
            }
        });

        document.querySelector('.preview-close').addEventListener('click', closeModal);

        // 从页面中寻找其他位置的 csrf_token，用于表单里
        const csrfInput = document.querySelector('input[name="csrf_token"]');
        const commonCsrfToken = csrfInput ? csrfInput.value : '';

        // 遍历所有 <td class="rowfollow"> 节点
        const tdList = document.querySelectorAll('td.rowfollow');
        tdList.forEach(function(td) {
            const a = td.querySelector('a');
            if(a) {
                // 定位包含编辑图标的 <img> 元素
                const img = a.querySelector('img[src="/pic/edit.svg"]');
                if(img) {
                    // 从 a.href 中解析出 id 参数
                    let idValue = '';
                    try {
                        const url = new URL(a.href, window.location.origin);
                        idValue = url.searchParams.get('id') || '';
                    } catch(e) {
                        console.error("无法解析 URL: ", a.href);
                    }

                    // 创建新增的 SVG 元素
                    const svgNS = "http://www.w3.org/2000/svg";
                    const svg = document.createElementNS(svgNS, "svg");
                    svg.setAttribute("width", "15");
                    svg.setAttribute("height", "15");
                    svg.setAttribute("viewBox", "0 0 512 512");
                    svg.style.cursor = 'pointer';
                    svg.style.marginRight = '1px';
                    svg.innerHTML = `<path d="M200.4 33.9c-8.8 2.2-14.9 10.1-14.9 19.2 0 6.1 4.5 13.4 10 16.3 3.9 2.1 5.1 2.1 61.1 2.1 57 0 57 0 61.2-2.8 11.3-7.4 11.5-24.1.4-32.1-4.4-3.1-4.4-3.1-59.5-3.3-30.4-.1-56.6.2-58.3.6M72.5 110.5c-6.1 1.6-11.8 7.4-13.6 13.6-2.3 8.6 2.5 18.3 11 22.3 4.6 2.1 4.6 2.1 186.1 2.1 146.8 0 182.2-.2 185.2-1.3 6.9-2.4 12.8-11.4 12.8-19.2-.1-7.6-7.7-16.1-16-17.9-8.1-1.8-358.9-1.4-365.5.4m23 76.9c-1.6.7-4.3 2.5-5.8 4-6 5.6-5.7-.4-5.7 118.4 0 106.6 0 109 2.1 116.8 5.2 20 22.7 39.9 41.5 47 14.1 5.3 13.6 5.3 127.7 5.4 71.7 0 108.1-.4 112.9-1.1 26.7-4.1 48.4-22.4 57-47.9 2.3-6.5 2.3-6.5 2.6-117 .2-76.9 0-111.6-.8-114.2-4.4-15.1-27.2-17.4-35.5-3.6-2 3.2-2 5.9-2.5 111.8-.5 108.5-.5 108.5-3.4 114.3-3.6 7.4-8.4 12.3-15.5 15.6-5.6 2.6-5.6 2.6-113.6 2.6-101.8 0-108.3-.1-112.7-1.8-9.4-3.6-15.2-10-18.7-20.5-2.1-6-2.1-7.8-2.1-111.4 0-101.3-.1-105.5-1.9-109.5-2.8-6.1-8.7-9.6-16.5-10-3.7-.2-7.3.2-9.1 1.1"></path><path d="M185.5 225.2c-4 1.4-9.4 6.5-11.1 10.5-1.1 2.6-1.4 13.7-1.4 58.5 0 51.5.2 55.6 1.9 59.3 3.1 6.8 9.3 10.5 17.6 10.5s14.5-3.7 17.6-10.5c1.7-3.7 1.9-7.8 1.9-59.3 0-60.7.2-59-6.1-64.8-5.5-5.1-13.3-6.7-20.4-4.2m127 0c-1.6.6-4.4 2.4-6.2 4.1-6.5 6.1-6.3 3.9-6.3 64.8 0 53.5.1 55.4 2 59.5 2.8 5.8 8.7 9.6 15.4 10.2 9.4.8 16.4-2.9 19.7-10.2 1.7-3.8 1.9-7.7 1.9-59.4 0-60.7.2-59-6.1-64.8-5.5-5.1-13.3-6.7-20.4-4.2"></path>`;

                    // 将 SVG 添加到当前 td 中
                    td.appendChild(svg);

                    // 为 SVG 添加点击事件，弹出删除种子模态窗
                    svg.addEventListener('click', function(e) {
                        e.stopPropagation();
                        const formHtml = `
<form method="post" id="delete-form">
  <input type="hidden" name="csrf_token" value="${commonCsrfToken}">
  <input type="hidden" name="id" value="${idValue}">
  <table border="1" cellspacing="0" cellpadding="5">
    <tbody>
      <tr>
        <td class="colhead" align="left" style="padding-bottom: 3px" colspan="2"><b>删除种子</b> - 原因：</td>
      </tr>
      <tr>
        <td class="rowhead nowrap" valign="top" align="right">
          <input name="reasontype" type="radio" value="1">&nbsp;断种
        </td>
        <td class="rowfollow" valign="top" align="left">
          0 做种者 + 0 下载者 = 0 总同伴
        </td>
      </tr>
      <tr>
        <td class="rowhead nowrap" valign="top" align="right">
          <input name="reasontype" type="radio" value="2">&nbsp;重复
        </td>
        <td class="rowfollow" valign="top" align="left">
          <input type="text" style="width: 200px" name="reason[]">
        </td>
      </tr>
      <tr>
        <td class="rowhead nowrap" valign="top" align="right">
          <input name="reasontype" type="radio" value="3">&nbsp;劣质
        </td>
        <td class="rowfollow" valign="top" align="left">
          <input type="text" style="width: 200px" name="reason[]">
        </td>
      </tr>
      <tr>
        <td class="rowhead nowrap" valign="top" align="right">
          <input name="reasontype" type="radio" value="4">&nbsp;违规
        </td>
        <td class="rowfollow" valign="top" align="left">
          <input type="text" style="width: 200px" name="reason[]">(必填)
        </td>
      </tr>
      <tr>
        <td class="rowhead nowrap" valign="top" align="right">
          <input name="reasontype" type="radio" value="5">&nbsp;其他
        </td>
        <td class="rowfollow" valign="top" align="left">
          <input type="text" style="width: 200px" name="reason[]">(必填)
        </td>
      </tr>
      <tr>
        <td class="toolbox" colspan="2" align="center">
          <input type="submit" style="height: 25px" value="删除">
        </td>
      </tr>
    </tbody>
  </table>
</form>
`;
                        document.getElementById('preview-content').innerHTML = formHtml;
                        modal.classList.add('show');
                        overlay.classList.add('show');

                        // 拦截表单提交事件，使用 AJAX 发送请求
                        const deleteForm = document.getElementById('delete-form');
                        deleteForm.addEventListener('submit', function(event) {
                            event.preventDefault(); // 阻止默认表单提交

                            const formData = new FormData(deleteForm);
                            fetch('delete.php', {
                                method: 'POST',
                                body: formData
                            })
                            .then(response => response.text())
                            .then(data => {
                                // 处理响应数据
                                if (data.includes('成功删除种子')) {
                                    console.log('删除成功');
                                    td.innerHTML = '<span style="color: red;"><b>删除成功</b></span>';
                                    closeModal(); // 关闭模态窗
                                } else {
                                    console.error('删除失败');
                                    alert('删除失败');
                                }
                            })
                            .catch(error => {
                                console.error('删除请求失败:', error);
                                alert('删除请求失败: ' + error.message);
                            });
                        });
                    });
                }
            }
        });
    });
})();
