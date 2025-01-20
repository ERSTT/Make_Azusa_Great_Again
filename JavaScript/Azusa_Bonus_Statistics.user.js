(function () {
    'use strict';

    const bonus_statistics_loadScript = function (src) {
        return new Promise(function (resolve, reject) {
            console.log(`正在加载脚本: ${src}`);
            const script = document.createElement('script');
            script.src = src;
            script.onload = function () {
                console.log(`脚本加载成功: ${src}`);
                resolve();
            };
            script.onerror = function (error) {
                console.error(`脚本加载失败: ${src}`, error);
                reject(error);
            };
            document.body.appendChild(script);
        });
    };

    console.log('开始加载 jQuery 和 DataTables');
    bonus_statistics_loadScript('https://code.jquery.com/jquery-3.6.0.min.js')
        .then(function () {
            console.log('jQuery 加载成功，开始加载 DataTables');
            return bonus_statistics_loadScript('https://cdn.datatables.net/1.11.5/js/jquery.dataTables.min.js');
        })
        .then(function () {
            console.log('DataTables 加载成功，开始执行魔力统计主逻辑');
            bonus_statistics_main(); // 在两个脚本都加载完成后直接调用 bonus_statistics_main
        })
        .catch(function (error) {
            console.error('加载脚本失败:', error);
        });

    function bonus_statistics_main() {
        console.log('页面加载完毕，开始执行魔力统计主逻辑');
        GM_addStyle(`
            .checkbox-container { display: flex; flex-wrap: nowrap; gap: 15px; justify-content: flex-start; }
            .checkbox-wrapper { display: flex; align-items: center; margin-bottom: 5px; width: auto; }
            .checkbox-wrapper input[type="checkbox"] { margin-right: 5px; }
            .filter-row { display: flex; gap: 10px; margin-top: 10px; align-items: center; flex-wrap: nowrap; }
            .filter-row label, .filter-row input { font-size: 14px; }
            table#magicStatsTable { width: 100%; margin-top: 10px; }
            table#magicStatsTable th, table#magicStatsTable td { text-align: center; vertical-align: middle; }
        `);

        const targetTextarea = document.querySelector('textarea[readonly][disabled]');
        if (!targetTextarea) {
            console.log('没有找到目标文本框，无法继续执行');
            return;
        }
        console.log('找到了目标文本框，开始处理数据');
        targetTextarea.style.display = 'none';

        const statsDiv = document.createElement('div');
        statsDiv.appendChild(bonus_statistics_createTitle('魔力统计'));

        const rawData = targetTextarea.value.trim();
        if (!rawData) {
            statsDiv.textContent = '框体描述为空，无法生成统计数据';
            console.log('框体描述为空，无法生成统计数据');
            return;
        }

        console.log('开始解析数据');
        const records = bonus_statistics_parseData(rawData);
        statsDiv.appendChild(bonus_statistics_createSummaryDiv(records));
        statsDiv.appendChild(bonus_statistics_createFilterDiv(records));
        statsDiv.appendChild(bonus_statistics_createTable(records));

        targetTextarea.parentNode.insertBefore(statsDiv, targetTextarea);
        console.log('魔力统计内容已插入页面');

        bonus_statistics_initDataTable(records);
        bonus_statistics_updateSummary(records);
    }

    function bonus_statistics_createTitle(text) {
        const title = document.createElement('h3');
        title.textContent = text;
        console.log(`创建标题: ${text}`);
        return title;
    }

    function bonus_statistics_parseData(rawData) {
        console.log('开始解析数据');
        
        // 分割每一行数据并开始解析
        const lines = rawData.split('\n');
        console.log(`数据分为 ${lines.length} 行进行解析`);
        
        return lines.map(function (line, index) {
            console.log(`正在处理第 ${index + 1} 行: ${line.trim()}`);
            
            const parts = line.split('|');
            
            if (parts.length !== 7) {
                console.warn(`第 ${index + 1} 行格式不正确，跳过: ${line.trim()}`);
                return null;
            }
            
            const [time, , project, before, spent, after, content] = parts;
            console.log(`提取的字段: 时间 = ${time}, 项目 = ${project}, 消费前魔力 = ${before}, 花费魔力 = ${spent}, 消费后魔力 = ${after}, 描述 = ${content}`);
            
            let correctedSpent = spent.replace(/--/g, '-');
            let spentValue = parseInt(correctedSpent.replace(/,/g, ''), 10);
            
            console.log(`修正后的花费魔力: ${spent} -> ${spentValue}`);
            
            if (spent.includes('--') || spent.startsWith('-')) {
                spentValue = -Math.abs(spentValue);
                console.log(`检测到负值标志，修正后的花费魔力为负: ${spentValue}`);
            }

            console.log(`解析数据: ${time.trim()}, ${project.trim()}, ${before}, ${spentValue}, ${after}, ${content.trim()}`);
            
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
        console.log('创建统计摘要');
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
        console.log(`创建容器: ${className}`);
        return div;
    }

    function bonus_statistics_createSummaryItem(text, value, className = '') {
        const div = document.createElement('div');
        div.className = className;
        div.textContent = `${text}: ${value.toLocaleString()}`;
        console.log(`创建统计项: ${text} ${value.toLocaleString()}`);
        return div;
    }

    function bonus_statistics_createFilterDiv(records) {
        console.log('创建筛选项');
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
        console.log('创建数据表格');
        const table = document.createElement('table');
        table.id = 'magicStatsTable';
        table.style.marginTop = '10px';
        table.style.width = '100%';
        table.className = 'display';

        const thead = document.createElement('thead');
        const headers = ['时间', '项目', '消费前魔力', '花费魔力', '消费后魔力', '描述'];
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
        [record.time, record.project, record.before, record.spent, record.after, record.content].forEach(function (value) {
            const td = document.createElement('td');
            td.textContent = value;
            row.appendChild(td);
        });
        return row;
    }

    function bonus_statistics_initDataTable(records) {
        console.log('初始化 DataTable');
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
                console.log('DataTable 初始化完毕');
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
        console.log('更新统计摘要');
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
})();
