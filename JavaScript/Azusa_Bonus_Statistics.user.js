(function () {
    'use strict';

    if (!window.location.href.includes('customBgUrl') && !window.location.href.includes('/userdetails.php')) {
        return;
    }

    const bonus_statistics_loadScript = function (src) {
        return new Promise(function (resolve, reject) {
            const script = document.createElement('script');
            script.src = src;
            script.onload = function () {
                resolve();
            };
            script.onerror = function (error) {
                reject(error);
            };
            document.body.appendChild(script);
        });
    };

    bonus_statistics_loadScript('https://code.jquery.com/jquery-3.6.0.min.js')
        .then(function () {
            return bonus_statistics_loadScript('https://cdn.datatables.net/1.11.5/js/jquery.dataTables.min.js');
        })
        .then(function () {
            bonus_statistics_main();
        })
        .catch(function (error) {
            console.error('加载脚本失败:', error);
        });

    function bonus_statistics_main() {
        GM_addStyle(`
            .hidden-content { display: none; }
            .toggle-btn { display: inline-flex; align-items: center; gap: 5px; margin-bottom: 10px;color: black;text-decoration: underline;cursor: pointer; }
            .toggle-btn img { width: 12px; height: 12px; }
            .toggle-btn:hover { color: orange; text-decoration: underline; cursor: pointer; }
            .checkbox-container { display: flex; flex-wrap: nowrap; gap: 15px; justify-content: flex-start; }
            .checkbox-wrapper { display: flex; align-items: center; margin-bottom: 5px; width: auto; }
            .checkbox-wrapper input[type="checkbox"] { margin-right: 5px; }
            .filter-row { display: flex; gap: 10px; margin-top: 10px; align-items: center; flex-wrap: nowrap; }
            .filter-row label, .filter-row input { font-size: 14px; }
            table#magicStatsTable { width: 100%; margin-top: 10px; }
            table#magicStatsTable th, table#magicStatsTable td { text-align: center; vertical-align: middle; }
        `);

        const targetTextarea = document.querySelector('textarea[readonly][disabled]');
        if (!targetTextarea) return;
        targetTextarea.style.display = 'none';

        const statsDiv = document.createElement('div');

        // 创建显示/隐藏按钮
        const toggleBtn = document.createElement('div');
        toggleBtn.className = 'toggle-btn';

        const toggleIcon = document.createElement('img');
        toggleIcon.src = 'pic/trans.gif';
        toggleIcon.className = 'plus';
        toggleIcon.alt = 'Show/Hide';
        toggleIcon.title = '显示/隐藏';
        toggleIcon.style.width = "9px";
        toggleIcon.style.height = "9px";

        const toggleText = document.createElement('span');
        toggleText.textContent = '[显示/隐藏]';

        toggleBtn.append(toggleIcon, toggleText);
        statsDiv.appendChild(toggleBtn);

        // 统计内容容器
        const statsContent = document.createElement('div');
        statsContent.id = 'statsContent';
        statsContent.className = 'hidden-content';
        statsDiv.appendChild(statsContent);

        const rawData = targetTextarea.value.trim();
        if (!rawData) {
            statsContent.textContent = '框体描述为空，无法生成统计数据';
        } else {
            const records = bonus_statistics_parseData(rawData);
            statsContent.append(
                bonus_statistics_createTitle('魔力统计'),
                bonus_statistics_createSummaryDiv(records),
                bonus_statistics_createFilterDiv(records),
                bonus_statistics_createTable(records)
            );

            bonus_statistics_initDataTable(records);
            bonus_statistics_updateSummary(records);
        }

        targetTextarea.parentNode.insertBefore(statsDiv, targetTextarea);

        // 切换显示/隐藏
        toggleBtn.addEventListener('click', function () {
            if (statsContent.style.display === 'none' || statsContent.style.display === '') {
                statsContent.style.display = 'block';
                toggleIcon.className = 'minus';

                // 重新调整 DataTables 的列宽
                setTimeout(() => {
                    if ($.fn.DataTable.isDataTable('#magicStatsTable')) {
                        $('#magicStatsTable').DataTable().columns.adjust().draw();
                    }
                }, 50);
            } else {
                statsContent.style.display = 'none';
                toggleIcon.className = 'plus';
            }
        });
    }


    function bonus_statistics_createTitle(text) {
        const title = document.createElement('h3');
        title.textContent = text;
        return title;
    }

    function bonus_statistics_parseData(rawData) {
        const lines = rawData.split('\n');

        return lines.map(function (line, index) {
            const parts = line.split('|');

            if (parts.length !== 7) {
                return null;
            }

            const [time, , project, before, spent, after, content] = parts;

            let correctedSpent = spent.replace(/--/g, '-');
            let spentValue = parseInt(correctedSpent.replace(/,/g, ''), 10);

            if (spent.includes('--') || spent.startsWith('-')) {
                spentValue = -Math.abs(spentValue);
            }

            return {
                time: time.trim(),
                project: project.trim(),
                before: parseInt(before.replace(/,/g, ''), 10),
                spent: spentValue,
                after: parseInt(after.replace(/,/g, ''), 10),
                content: content.trim()
            };
        }).filter(record => record !== null);
    }

    function bonus_statistics_createSummaryDiv(records) {
        const summaryDiv = document.createElement('div');
        summaryDiv.id = 'summaryDiv';

        const totalSpent = records.reduce(function (sum, record) {
            return sum + (record.spent < 0 ? Math.abs(record.spent) : 0);
        }, 0);
        const totalEarned = records.reduce(function (sum, record) {
            return sum + (record.spent > 0 ? record.spent : 0);
        }, 0);

        const summaryContainer = bonus_statistics_createContainer('summary-container', 'flex', 'flex-start', '10px');
        summaryContainer.appendChild(bonus_statistics_createSummaryItem('总共消耗魔力值', totalSpent));
        summaryContainer.appendChild(bonus_statistics_createSummaryItem('总共获得魔力值', totalEarned));
        summaryDiv.appendChild(summaryContainer);

        const currentStatsDiv = bonus_statistics_createContainer('current-stats-container', 'flex', 'flex-start', '10px');
        currentStatsDiv.appendChild(bonus_statistics_createSummaryItem('当前消耗魔力值', 0, 'current-spent'));
        currentStatsDiv.appendChild(bonus_statistics_createSummaryItem('当前获得魔力值', 0, 'current-earned'));
        summaryDiv.appendChild(currentStatsDiv);

        return summaryDiv;
    }

    function bonus_statistics_createContainer(className, display, justifyContent, gap) {
        const div = document.createElement('div');
        div.className = className;
        div.style.display = display;
        div.style.justifyContent = justifyContent;
        div.style.gap = gap;
        return div;
    }

    function bonus_statistics_createSummaryItem(text, value, className = '') {
        const div = document.createElement('div');
        div.className = className;
        div.textContent = `${text}: ${value.toLocaleString()}`;
        return div;
    }

    function bonus_statistics_createFilterDiv(records) {
        const filterDiv = document.createElement('div');
        filterDiv.id = 'filterDiv';
        filterDiv.style.marginTop = '10px';
        filterDiv.innerHTML = `
            <div id="projectSearch" class="checkbox-container"><label>项目:</label></div>
            <div class="filter-row">
                <label for="minDate">起始时间:</label><input type="date" id="minDate">
                <label for="maxDate">结束时间:</label><input type="date" id="maxDate">
                <label for="contentSearch">描述:</label><input type="text" id="contentSearch" placeholder="输入描述关键词">
            </div>
        `;

        const projectContainer = filterDiv.querySelector('#projectSearch');
        const projects = [...new Set(records.map(function (record) { return record.project; }))];
        projects.forEach(function (project) {
            const checkboxWrapper = document.createElement('div');
            checkboxWrapper.classList.add('checkbox-wrapper');
            checkboxWrapper.appendChild(bonus_statistics_createCheckbox(project));
            checkboxWrapper.appendChild(bonus_statistics_createCheckboxLabel(project));
            projectContainer.appendChild(checkboxWrapper);
        });

        // Add the export button
        const exportButton = document.createElement('button');
        exportButton.textContent = '导出所有数据到CSV';
        exportButton.style.marginLeft = '20px';
        exportButton.addEventListener('click', function () {
            bonus_statistics_exportToCSV(records);
        });
        filterDiv.querySelector('.filter-row').appendChild(exportButton);

        return filterDiv;
    }

    function bonus_statistics_createCheckbox(project) {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = project;
        checkbox.id = `project-${project}`;
        return checkbox;
    }

    function bonus_statistics_createCheckboxLabel(project) {
        const label = document.createElement('label');
        label.setAttribute('for', `project-${project}`);
        label.textContent = project;
        return label;
    }

    function bonus_statistics_createTable(records) {
        const table = document.createElement('table');
        table.id = 'magicStatsTable';
        table.style.marginTop = '10px';
        table.style.width = '100%';
        table.className = 'display';

        const thead = document.createElement('thead');
        const headers = ['时间', '项目', '触发前魔力', '花费/获得魔力', '触发后魔力', '描述'];
        const headerRow = document.createElement('tr');
        headers.forEach(function (header) {
            headerRow.appendChild(bonus_statistics_createTableHeader(header));
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        records.forEach(function (record) {
            tbody.appendChild(bonus_statistics_createTableRow(record));
        });
        table.appendChild(tbody);

        return table;
    }

    function bonus_statistics_createTableHeader(header) {
        const th = document.createElement('th');
        th.textContent = header;
        return th;
    }

    function bonus_statistics_createTableRow(record) {
        const row = document.createElement('tr');

        const spentValue = record.spent >= 0 ? `+${record.spent}` : record.spent;

        [record.time, record.project, record.before, spentValue, record.after, record.content].forEach(function (value) {
            const td = document.createElement('td');
            td.textContent = value;
            row.appendChild(td);
        });
        return row;
    }

    function bonus_statistics_initDataTable(records) {
        const interval = setInterval(function () {
            if (typeof $ !== 'undefined' && $.fn.dataTable) {
                const tableInstance = $('#magicStatsTable').DataTable({ paging: false, ordering: true, info: false, dom: 't', pageLength: -1, order: [[0, 'desc']] });
                $.fn.dataTable.ext.search.push(function (settings, data) {
                    return bonus_statistics_filterData(data);
                });
                $('#minDate, #maxDate, #projectSearch, #contentSearch').on('change keyup', function () {
                    tableInstance.draw();
                    bonus_statistics_updateSummary(tableInstance.rows({ filter: 'applied' }).data().toArray());
                });
                clearInterval(interval);
                bonus_statistics_updateSummary(records);
            }
        }, 100);
    }

    function bonus_statistics_filterData(data) {
        const min = $('#minDate').val();
        const max = $('#maxDate').val();
        const selectedProjects = $('#projectSearch input:checked').map(function () { return this.value; }).get();
        const content = $('#contentSearch').val().toLowerCase();
        const date = data[0];
        const projectName = data[1].toLowerCase();
        const description = data[5].toLowerCase();
        const isProjectMatch = selectedProjects.length === 0 || selectedProjects.includes(projectName);
        return (!min || date >= min) && (!max || date <= max) && isProjectMatch && (!content || description.includes(content));
    }

    function bonus_statistics_updateSummary(filteredData) {
        let totalSpent = 0, totalEarned = 0, currentSpent = 0, currentEarned = 0;

        filteredData.forEach(function (row) {
            const spent = parseInt(row.spent !== undefined ? row.spent : row[3], 10);
            if (!isNaN(spent)) {
                if (spent < 0) currentSpent += Math.abs(spent);
                else currentEarned += spent;
            }
        });

        totalSpent = filteredData.reduce(function (sum, row) {
            const spent = parseInt(row.spent !== undefined ? row.spent : row[3], 10);
            return spent < 0 ? sum + Math.abs(spent) : sum;
        }, 0);

        totalEarned = filteredData.reduce(function (sum, row) {
            const spent = parseInt(row.spent !== undefined ? row.spent : row[3], 10);
            return spent > 0 ? sum + spent : sum;
        }, 0);

        const summaryDiv = document.querySelector('#summaryDiv');
        if (!summaryDiv) return;

        const currentStatsDiv = summaryDiv.querySelector('.current-stats-container');
        if (!currentStatsDiv) return;

        currentStatsDiv.querySelector('.current-spent').textContent = `当前消耗魔力值: ${currentSpent.toLocaleString()}`;
        currentStatsDiv.querySelector('.current-earned').textContent = `当前获得魔力值: ${currentEarned.toLocaleString()}`;
    }

    function bonus_statistics_exportToCSV(records) {
        const csvHeaders = ['时间', '项目', '触发前魔力', '花费/获得魔力', '触发后魔力', '描述'];
        const csvRows = records.map(record => [
            record.time,
            record.project,
            record.before,
            record.spent,
            record.after,
            record.content
        ]);

        const csvContent = [
            '\uFEFF', // 添加 BOM 字节
            csvHeaders.join(','),
            ...csvRows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = '魔力统计.csv';
        link.click();
    }
})();
