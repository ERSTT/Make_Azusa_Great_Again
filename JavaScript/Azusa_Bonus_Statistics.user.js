// ==UserScript==
// @name         Azusa 魔力统计
// @namespace    https://github.com/ERSTT
// @icon         https://azusa.wiki/favicon.ico
// @version      1.1
// @description  Azusa 个人页魔力统计改为表格形式
// @author       ERST
// @match        https://azusa.wiki/*userdetails*
// @match        https://zimiao.icu/*userdetails*
// @grant        GM_xmlhttpRequest
// @updateURL    https://raw.githubusercontent.com/ERSTT/Files/refs/heads/main/JavaScript/Azusa_Bonus_Statistics.user.js
// @downloadURL  https://raw.githubusercontent.com/ERSTT/Files/refs/heads/main/JavaScript/Azusa_Bonus_Statistics.user.js
// @changelog    适配MAGA
// ==/UserScript==

(function () {
    'use strict';

    const loadScript = (src) => {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
        });
    };

    const initializeScripts = async () => {
        try {
            await loadScript('https://code.jquery.com/jquery-3.6.0.min.js');
            await loadScript('https://cdn.datatables.net/1.11.5/js/jquery.dataTables.min.js');
            window.addEventListener('load', main);
        } catch (error) {
            console.error('加载脚本失败:', error);
        }
    };

    initializeScripts();

    function main() {
        const targetTextarea = document.querySelector('textarea[readonly][disabled]');
        if (!targetTextarea) {
            return;
        }

        targetTextarea.style.display = 'none';

        const statsDiv = document.createElement('div');
        const title = document.createElement('h3');
        statsDiv.appendChild(title);

        const rawData = targetTextarea.value.trim();
        if (!rawData) {
            statsDiv.textContent = '框体描述为空，无法生成统计数据';
            return;
        }

        const records = parseData(rawData);
        const totalSpent = records.reduce((sum, record) => sum + Math.abs(record.spent), 0);

        statsDiv.appendChild(createProjectStats(records));
        statsDiv.appendChild(createSummaryDiv(totalSpent, records));
        statsDiv.appendChild(createFilterDiv());
        statsDiv.appendChild(createTable(records));

        targetTextarea.parentNode.insertBefore(statsDiv, targetTextarea);
        initDataTable();
    }

    function parseData(rawData) {
        return rawData.split('\n').map(line => {
            const [time, , project, before, spent, after, content] = line.split('|');
            return {
                time: time.trim(),
                project: project.trim(),
                before: parseInt(before.replace(/,/g, ''), 10),
                spent: Math.abs(parseInt(spent.replace(/,/g, ''), 10)),
                after: parseInt(after.replace(/,/g, ''), 10),
                content: content.trim()
            };
        });
    }

    function createSummaryDiv(totalSpent, records) {
        const summaryDiv = document.createElement('div');

        const totalSpentDiv = document.createElement('div');
        totalSpentDiv.textContent = `总共消耗魔力值: ${totalSpent.toLocaleString()}`;

        const showAllLink = document.createElement('span');
        showAllLink.className = 'toggle-link';
        showAllLink.textContent = '查看所有详情►';
        showAllLink.style.color = '#007bff';  // 设置链接颜色为蓝色
        showAllLink.style.cursor = 'pointer';
        showAllLink.style.textDecoration = 'underline';
        showAllLink.onclick = () => {
            const filters = $('#filterDiv');
            const table = $('#magicStatsTable');
            if (filters.is(':visible')) {
                filters.fadeOut(500);
                table.fadeOut(500);
                showAllLink.textContent = '查看所有详情►';
            } else {
                filters.hide().fadeIn(500);
                table.hide().fadeIn(500);
                showAllLink.textContent = '收起所有详情▼';
            }
        };

        summaryDiv.appendChild(totalSpentDiv);
        summaryDiv.appendChild(showAllLink);

        return summaryDiv;
    }

    function createProjectStats(records) {
        const projectStatsDiv = document.createElement('div');

        const projectStats = records.reduce((stats, record) => {
            if (!stats[record.project]) {
                stats[record.project] = { single: 0, ten: 0, other: 0, totalSpent: 0, details: [] };
            }
            if (record.spent === 5000) {
                stats[record.project].single += 1;
            } else if (record.spent === 50000) {
                stats[record.project].ten += 1;
            } else {
                stats[record.project].other += 1;
            }
            stats[record.project].totalSpent += Math.abs(record.spent);
            stats[record.project].details.push(record);
            return stats;
        }, {});

        for (const project in projectStats) {
            const { single, ten, other, totalSpent, details } = projectStats[project];

            let projectInfoText = '';
            const totalDraws = Math.round(totalSpent / 5000);

            if (project === '抽卡') {
                projectInfoText += `抽卡：`;
                if (single > 0) {
                    projectInfoText += `单抽${single}次，`;
                }
                if (ten > 0) {
                    projectInfoText += `10连${ten}次，`;
                }
                projectInfoText += `总花费魔力 ${totalSpent.toLocaleString()}（${totalDraws}抽）`;
            } else if (project === '购买勋章') {
                projectInfoText += `购买勋章：购买了${other}个徽章，总花费魔力 ${totalSpent.toLocaleString()}`;
            } else if (project === '购买邀请') {
                projectInfoText += `购买邀请：购买了${other}个邀请，总花费魔力 ${totalSpent.toLocaleString()}`;
            } else {
                projectInfoText += `${project}：消费了${other}次，总花费魔力 ${totalSpent.toLocaleString()}`;
            }

            const projectInfoDiv = document.createElement('div');
            projectInfoDiv.textContent = projectInfoText;
            projectStatsDiv.appendChild(projectInfoDiv);

            const detailsLink = document.createElement('span');
            detailsLink.className = 'toggle-link';
            detailsLink.textContent = '查看详情►';
            detailsLink.style.color = '#007bff';  // 设置链接颜色为蓝色
            detailsLink.style.cursor = 'pointer';
            detailsLink.style.textDecoration = 'underline';
            projectStatsDiv.appendChild(detailsLink);

            const detailsContainer = document.createElement('div');
            detailsContainer.style.display = 'none';
            detailsContainer.style.paddingLeft = '20px';

            const filterDiv = document.createElement('div');
            filterDiv.style.marginTop = '10px';
            filterDiv.style.display = 'flex';
            filterDiv.style.gap = '10px';
            filterDiv.innerHTML = `
                <label for="childMinDate">起始时间:</label>
                <input type="date" class="childMinDate">
                <label for="childMaxDate">结束时间:</label>
                <input type="date" class="childMaxDate">
                <label for="childSearch">查找目标:</label>
                <input type="text" class="childSearch" placeholder="输入关键词">
            `;
            detailsContainer.appendChild(filterDiv);

            const detailsTable = document.createElement('table');
            detailsTable.className = 'project-details';
            detailsTable.style.width = '100%';
            const detailsThead = document.createElement('thead');
            const detailsHeaders = ['时间', '消费前魔力', '花费魔力', '消费后魔力', '描述'];
            const detailsHeaderRow = document.createElement('tr');
            detailsHeaders.forEach(header => {
                const th = document.createElement('th');
                th.textContent = header;
                detailsHeaderRow.appendChild(th);
            });
            detailsThead.appendChild(detailsHeaderRow);
            detailsTable.appendChild(detailsThead);

            const detailsTbody = document.createElement('tbody');
            details.forEach(record => {
                const row = document.createElement('tr');
                [record.time, record.before, record.spent, record.after, record.content].forEach(value => {
                    const td = document.createElement('td');
                    td.textContent = value;
                    row.appendChild(td);
                });
                detailsTbody.appendChild(row);
            });
            detailsTable.appendChild(detailsTbody);
            detailsContainer.appendChild(detailsTable);

            projectStatsDiv.appendChild(detailsContainer);

            detailsLink.onclick = () => {
                if (detailsContainer.style.display === 'none') {
                    detailsContainer.style.display = 'block';
                    detailsLink.textContent = '收起详情▼';
                } else {
                    detailsContainer.style.display = 'none';
                    detailsLink.textContent = '查看详情►';
                }
                if (detailsContainer.style.display === 'block' && !$.fn.dataTable.isDataTable(detailsTable)) {
                    const childTableInstance = $(detailsTable).DataTable({
                        paging: false,
                        ordering: true,
                        info: false,
                        dom: 't',
                        pageLength: -1,
                        order: [[0, 'desc']]
                    });

                    const childMinDate = filterDiv.querySelector('.childMinDate');
                    const childMaxDate = filterDiv.querySelector('.childMaxDate');
                    const childSearch = filterDiv.querySelector('.childSearch');

                    $.fn.dataTable.ext.search.push((settings, data) => {
                        if (settings.nTable !== detailsTable) return true;

                        const min = childMinDate.value;
                        const max = childMaxDate.value;
                        const date = data[0];
                        return (!min || date >= min) && (!max || date <= max);
                    });

                    childMinDate.addEventListener('change', () => childTableInstance.draw());
                    childMaxDate.addEventListener('change', () => childTableInstance.draw());
                    childSearch.addEventListener('keyup', () => {
                        childTableInstance.search(childSearch.value).draw();
                    });
                }
            };
        }

        return projectStatsDiv;
    }

    function createFilterDiv() {
        const filterDiv = document.createElement('div');
        filterDiv.id = 'filterDiv';
        filterDiv.style.display = 'none';
        filterDiv.style.marginTop = '10px';
        filterDiv.innerHTML = `
            <label for="minDate">起始时间:</label>
            <input type="date" id="minDate">
            <label for="maxDate">结束时间:</label>
            <input type="date" id="maxDate">
            <label for="projectSearch">查找目标:</label>
            <input type="text" id="projectSearch" placeholder="输入关键词">
        `;
        return filterDiv;
    }

    function createTable(records) {
        const table = document.createElement('table');
        table.setAttribute('id', 'magicStatsTable');
        table.style.marginTop = '10px';
        table.style.width = '100%';
        table.className = 'display';
        table.style.display = 'none';

        const thead = document.createElement('thead');
        const headers = ['时间', '项目', '消费前魔力', '花费魔力', '消费后魔力', '描述'];
        const headerRow = document.createElement('tr');
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        records.forEach(record => {
            const row = document.createElement('tr');
            [record.time, record.project, record.before, record.spent, record.after, record.content].forEach(value => {
                const td = document.createElement('td');
                td.textContent = value;
                row.appendChild(td);
            });
            tbody.appendChild(row);
        });
        table.appendChild(tbody);

        return table;
    }

    function initDataTable() {
        const interval = setInterval(() => {
            if (typeof $ !== 'undefined' && $.fn.dataTable) {
                const tableInstance = $('#magicStatsTable').DataTable({
                    paging: false,
                    ordering: true,
                    info: false,
                    dom: 't',
                    pageLength: -1,
                    order: [[0, 'desc']]
                });

                $.fn.dataTable.ext.search.push((settings, data) => {
                    const min = $('#minDate').val();
                    const max = $('#maxDate').val();
                    const date = data[0];
                    return (!min || date >= min) && (!max || date <= max);
                });

                $('#minDate, #maxDate').on('change', () => tableInstance.draw());
                $('#projectSearch').on('keyup change', function () {
                    tableInstance.search(this.value).draw();
                });

                clearInterval(interval);
            }
        }, 100);
    }
})();
