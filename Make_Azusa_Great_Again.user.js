// ==UserScript==
// @name         Make Azusa Great Again DEV
// @namespace    https://github.com/ERSTT
// @icon         https://azusa.wiki/favicon.ico
// @version      1.2.2
// @description  Make Azusa Great Again
// @author       ERST
// @match        https://azusa.wiki/*
// @match        https://zimiao.icu/*
// @connect      githubusercontent.com
// @connect      github.com
// @connect      greasyfork.org
// @connect      ptpimg.me
// @connect      s3.leaves.red
// @connect      azusa.wiki
// @connect      img.azusa.wiki
// @updateURL    https://raw.githubusercontent.com/ERSTT/Make_Azusa_Great_Again/refs/heads/main/Make_Azusa_Great_Again.user.js
// @downloadURL  https://raw.githubusercontent.com/ERSTT/Make_Azusa_Great_Again/refs/heads/main/Make_Azusa_Great_Again.user.js
// @require      https://cdn.jsdelivr.net/npm/chart.js
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @require      https://cdn.datatables.net/1.11.5/js/jquery.dataTables.min.js
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// @grant        unsafeWindow
// @run-at       document-body
// ==/UserScript==

(function() {
    'use strict';

    if (window.top !== window.self) {
        return;
    }

    const jsonConfigUrl = 'https://raw.githubusercontent.com/ERSTT/Make_Azusa_Great_Again/refs/heads/main/data.json';
    let modulesConfig = [];
    const scriptVersion = GM_info.script.version;

    function fetchModulesConfig() {
        GM_xmlhttpRequest({
            method: 'GET',
            url: jsonConfigUrl,
            onload: function(response) {
                const config = JSON.parse(response.responseText);
                const newModulesConfig = config.menu;
                const remoteMagaVersion = config['maga-version'];

                if (JSON.stringify(newModulesConfig) !== JSON.stringify(modulesConfig)) {
                    modulesConfig = newModulesConfig;
                    createControlPanel();
                    updateControlPanel();
                    loadAndExecuteModules();
                }

                if (remoteMagaVersion && remoteMagaVersion !== scriptVersion) {
                    alertNewVersion(remoteMagaVersion);
                }
            }
        });
    }

    function alertNewVersion(remoteMagaVersion) {
        const newVersionAlert = document.getElementById('new-version-alert');

        const remoteVersionNumber = parseFloat(remoteMagaVersion);
        const scriptVersionNumber = parseFloat(scriptVersion);

        if (remoteVersionNumber !== scriptVersionNumber) {
            if (newVersionAlert) {
                newVersionAlert.style.display = 'block';
                newVersionAlert.innerText = `检测到MAGA新版本, 最新版本为 ${remoteMagaVersion}`;
            }
        } else {
            if (newVersionAlert) {
                newVersionAlert.style.display = 'none';
            }
        }
    }

    function loadAndExecuteModules() {
        modulesConfig.forEach((menu) => {
            menu.modules.forEach((module) => {
                if (getModuleState(menu.id, module.id) || module.auto === 1) {
                    loadAndExecuteModule(menu.id, module.id, true);
                }
            });
        });
    }

    function loadAndExecuteModule(menuId, moduleId, forceUpdate = false) {
        const module = getModuleById(menuId, moduleId);

        if (forceUpdate) {
            fetchAndUpdateModule(menuId, moduleId, module);
        } else {
            const localVersion = getModuleLocalVersion(menuId, moduleId);
            const onlineVersion = module.version;

            if (localVersion === onlineVersion) {
                const cachedScript = getModuleScript(menuId, moduleId);
                if (cachedScript) {
                    try {
                        executeInNamespace(menuId, moduleId, cachedScript);
                        return;
                    } catch (e) {}
                }
            }

            fetchAndUpdateModule(menuId, moduleId, module);
        }
    }

    function fetchAndUpdateModule(menuId, moduleId, module) {
        GM_xmlhttpRequest({
            method: 'GET',
            url: module.url,
            onload: function(response) {
                try {
                    const scriptContent = response.responseText;
                    saveModuleScript(menuId, moduleId, scriptContent);
                    executeInNamespace(menuId, moduleId, scriptContent);
                    setModuleLocalVersion(menuId, moduleId, module.version);
                    updateVersionDisplay(menuId, moduleId);
                } catch (e) {
                    const cachedScript = getModuleScript(menuId, moduleId);
                    if (cachedScript) {
                        try {
                            executeInNamespace(menuId, moduleId, cachedScript);
                        } catch (e) {}
                    }
                }
            },
            onerror: function() {
                const cachedScript = getModuleScript(menuId, moduleId);
                if (cachedScript) {
                    try {
                        executeInNamespace(menuId, moduleId, cachedScript);
                    } catch (e) {}
                }
            }
        });
    }

    function executeInNamespace(menuId, moduleId, scriptContent) {
        const namespace = `module_${menuId}_${moduleId}`;
        const wrappedScript = `(function(${namespace}) { ${scriptContent} })({});`;
        eval(wrappedScript);
    }

    function getModuleById(menuId, moduleId) {
        const menu = modulesConfig.find(menu => menu.id === menuId);
        return menu.modules.find(module => module.id === moduleId);
    }

    function saveModuleScript(menuId, moduleId, scriptContent) {
        const scriptParts = splitScriptIntoParts(scriptContent);
        scriptParts.forEach((part, partIndex) => {
            GM_setValue(`module_${menuId}_${moduleId}_script_part_${partIndex}`, part);
        });
    }

    function splitScriptIntoParts(scriptContent) {
        const partLength = 5000;
        const parts = [];
        for (let i = 0; i < scriptContent.length; i += partLength) {
            parts.push(scriptContent.substring(i, i + partLength));
        }
        return parts;
    }

    function getModuleScript(menuId, moduleId) {
        let scriptContent = '';
        let partIndex = 0;
        while (true) {
            const part = GM_getValue(`module_${menuId}_${moduleId}_script_part_${partIndex}`);
            if (!part) break;
            scriptContent += part;
            partIndex++;
        }
        return scriptContent;
    }

    function createControlPanel() {
        const panel = document.createElement('div');
        panel.id = 'script-control-panel';
        panel.style.position = 'fixed';
        panel.style.top = '10px';
        panel.style.right = '10px';
        panel.style.zIndex = '9999';
        panel.style.backgroundColor = '#fff';
        panel.style.padding = '10px';
        panel.style.border = '1px solid #ccc';
        panel.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';
        panel.style.maxWidth = '500px';
        panel.style.fontFamily = 'Arial, sans-serif';

        const title = document.createElement('h4');
        title.innerText = 'Make Azusa Great Again !';
        title.style.margin = '0 0 10px 0';
        title.style.textAlign = 'center';
        panel.appendChild(title);

        const hideText = document.createElement('span');
        hideText.innerHTML = '[隐藏]';
        hideText.style.position = 'absolute';
        hideText.style.top = '10px';
        hideText.style.right = '10px';
        hideText.style.color = 'grey';
        hideText.style.cursor = 'pointer';
        hideText.style.fontSize = '14px';
        hideText.addEventListener('click', () => {
            panel.style.display = 'none';
            floatingButton.style.display = 'block';
            GM_setValue('panel_hidden', true);
        });
        panel.appendChild(hideText);

        const clearStorageButton = document.createElement('span');
        clearStorageButton.innerHTML = '[清空数据]';
        clearStorageButton.style.position = 'absolute';
        clearStorageButton.style.top = '10px';
        clearStorageButton.style.left = '10px';
        clearStorageButton.style.color = 'grey';
        clearStorageButton.style.cursor = 'pointer';
        clearStorageButton.style.fontSize = '14px';
        clearStorageButton.addEventListener('click', () => {
            if (confirm('确定要清空MAGA本地存储的数据吗？\n清空后会自动刷新网页\n建议只在有问题的情况下清空本地数据')) {
                clearLocalStorage();
                location.reload();
            }
        });
        panel.appendChild(clearStorageButton);

        const panelContent = document.createElement('div');
        panelContent.id = 'panel-content';
        panel.appendChild(panelContent);

        modulesConfig.forEach((menu) => {
            const menuTitle = document.createElement('h5');
            menuTitle.innerText = menu.name;
            menuTitle.style.fontSize = '18px';
            menuTitle.style.margin = '0';
            menuTitle.style.textAlign = 'center';
            panelContent.appendChild(menuTitle);

            menu.modules.forEach((module) => {
                const checkboxContainer = document.createElement('div');
                checkboxContainer.style.marginBottom = '5px';
                checkboxContainer.style.fontSize = '14px';
                checkboxContainer.style.display = 'flex';
                checkboxContainer.style.alignItems = 'center';
                checkboxContainer.style.justifyContent = 'space-between';
                checkboxContainer.style.whiteSpace = 'nowrap';

                const leftContainer = document.createElement('div');
                leftContainer.style.display = 'flex';
                leftContainer.style.alignItems = 'center';
                leftContainer.style.whiteSpace = 'nowrap';

                const checkbox = createSwitch(menu.id, module.id);
                checkbox.checked = getModuleState(menu.id, module.id);

                const label = document.createElement('label');
                label.innerText = module.name;
                label.style.marginLeft = '5px';
                label.style.whiteSpace = 'nowrap';

                leftContainer.appendChild(checkbox);
                leftContainer.appendChild(label);

                const authorContainer = document.createElement('div');
                authorContainer.style.fontSize = '12px';
                authorContainer.style.marginLeft = '10px';
                authorContainer.innerHTML = module.author;
                authorContainer.style.whiteSpace = 'nowrap';

                const versionContainer = document.createElement('div');
                versionContainer.style.display = 'flex';
                versionContainer.style.justifyContent = 'space-between';
                versionContainer.style.alignItems = 'center';
                versionContainer.style.marginLeft = '20px';
                versionContainer.style.whiteSpace = 'nowrap';

                const versionDisplay = document.createElement('span');
                versionDisplay.id = `version-display-${menu.id}-${module.id}`;
                const localVersion = getModuleLocalVersion(menu.id, module.id);
                const onlineVersion = module.version;
                versionDisplay.innerHTML = `本地版本: ${localVersion} | 在线版本: ${onlineVersion}`;

                const updateButton = document.createElement('button');
                updateButton.id = `update-button-${menu.id}-${module.id}`;
                updateButton.innerHTML = '升级';
                updateButton.style.marginLeft = '10px';
                updateButton.style.padding = '5px 10px';
                updateButton.style.borderRadius = '4px';
                updateButton.style.backgroundColor = '#333';
                updateButton.style.color = 'white';
                updateButton.style.border = 'none';
                updateButton.style.cursor = 'pointer';
                updateButton.style.fontSize = '12px';
                updateButton.disabled = (localVersion === onlineVersion);
                updateButton.style.backgroundColor = (localVersion === onlineVersion) ? '#bbb' : '#333';

                updateButton.addEventListener('click', () => updateModule(menu.id, module.id));

                versionContainer.appendChild(versionDisplay);
                versionContainer.appendChild(updateButton);

                checkboxContainer.appendChild(leftContainer);
                checkboxContainer.appendChild(authorContainer);
                panelContent.appendChild(checkboxContainer);
                panelContent.appendChild(versionContainer);
            });
        });

        document.body.appendChild(panel);

        const emptyLine = document.createElement('div');
        emptyLine.style.height = '10px';
        panelContent.appendChild(emptyLine);

        const extraEmptyLine = document.createElement('div');
        extraEmptyLine.style.height = '10px';
        panelContent.appendChild(extraEmptyLine);

        const authorInfo = document.createElement('div');
        authorInfo.style.position = 'absolute';
        authorInfo.style.bottom = '10px';
        authorInfo.style.left = '10px';
        authorInfo.style.fontSize = '12px';
        authorInfo.style.textAlign = 'left';
        authorInfo.textContent = '作者: ERST';
        panel.appendChild(authorInfo);

        const versionInfo = document.createElement('div');
        versionInfo.id = 'script-version-info';
        versionInfo.style.position = 'absolute';
        versionInfo.style.bottom = '10px';
        versionInfo.style.right = '10px';
        versionInfo.style.fontSize = '12px';
        versionInfo.style.textAlign = 'right';
        versionInfo.textContent = `版本: ${scriptVersion}`;
        panel.appendChild(versionInfo);

        const newVersionAlert = document.createElement('div');
        newVersionAlert.id = 'new-version-alert';
        newVersionAlert.style.position = 'absolute';
        newVersionAlert.style.bottom = '10px';
        newVersionAlert.style.left = '50%';
        newVersionAlert.style.transform = 'translateX(-50%)';
        newVersionAlert.style.fontSize = '12px';
        newVersionAlert.style.textAlign = 'center';
        newVersionAlert.style.color = 'red';
        newVersionAlert.style.display = 'none';
        newVersionAlert.style.whiteSpace = 'nowrap';
        newVersionAlert.innerText = '(新版本可用)';
        panel.appendChild(newVersionAlert);

        const floatingButton = document.createElement('div');
        floatingButton.id = 'floating-button';
        floatingButton.style.position = 'fixed';
        floatingButton.style.top = '10px';
        floatingButton.style.right = '10px';
        floatingButton.style.width = '50px';
        floatingButton.style.height = '50px';
        floatingButton.style.borderRadius = '50%';
        floatingButton.style.backgroundImage = 'url(https://raw.githubusercontent.com/ERSTT/Make_Azusa_Great_Again/refs/heads/main/img/floating.png)';
        floatingButton.style.backgroundSize = 'cover';
        floatingButton.style.cursor = 'pointer';
        floatingButton.style.zIndex = '9999';
        floatingButton.style.display = 'none';
        floatingButton.addEventListener('click', () => {
            panel.style.display = 'block';
            floatingButton.style.display = 'none';
            GM_setValue('panel_hidden', false);
        });
        document.body.appendChild(floatingButton);

        if (GM_getValue('panel_hidden', false)) {
            panel.style.display = 'none';
            floatingButton.style.display = 'block';
        }
    }
    function createSwitch(menuId, moduleId) {
        const switchLabel = document.createElement('label');
        switchLabel.classList.add('switch');

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.id = `module-${menuId}-${moduleId}`;
        input.checked = getModuleState(menuId, moduleId);
        input.addEventListener('change', (event) => toggleModuleState(menuId, moduleId, event.target));

        const slider = document.createElement('span');
        slider.classList.add('slider');

        switchLabel.appendChild(input);
        switchLabel.appendChild(slider);

        return switchLabel;
    }

    function getModuleState(menuId, moduleId) {
        return GM_getValue(`module_${menuId}_${moduleId}_enabled`, false);
    }

    function getModuleLocalVersion(menuId, moduleId) {
        return GM_getValue(`module_${menuId}_${moduleId}_version`, '未安装');
    }

    function setModuleState(menuId, moduleId, state) {
        GM_setValue(`module_${menuId}_${moduleId}_enabled`, state);
    }

    function setModuleLocalVersion(menuId, moduleId, version) {
        GM_setValue(`module_${menuId}_${moduleId}_version`, version);
    }

    function updateVersionDisplay(menuId, moduleId) {
        const versionDisplay = document.getElementById(`version-display-${menuId}-${moduleId}`);
        const localVersion = getModuleLocalVersion(menuId, moduleId);
        const onlineVersion = modulesConfig.find(menu => menu.id === menuId).modules.find(module => module.id === moduleId).version;
        versionDisplay.innerHTML = `本地版本: ${localVersion} | 在线版本: ${onlineVersion}`;

        const updateButton = document.getElementById(`update-button-${menuId}-${moduleId}`);
        const buttonDisabled = (localVersion === onlineVersion);
        updateButton.disabled = buttonDisabled;
        updateButton.style.backgroundColor = buttonDisabled ? '#bbb' : '#333';
    }

    function toggleModuleState(menuId, moduleId, checkbox) {
        const currentState = getModuleState(menuId, moduleId);
        const newState = !currentState;
        setModuleState(menuId, moduleId, newState);
        checkbox.checked = newState;
        if (newState) {
            loadAndExecuteModule(menuId, moduleId);
            const module = getModuleById(menuId, moduleId);
            setModuleLocalVersion(menuId, moduleId, module.version);
        }
        updateVersionDisplay(menuId, moduleId);
    }

    function updateControlPanel() {
        modulesConfig.forEach((menu) => {
            menu.modules.forEach((module) => {
                const checkbox = document.querySelector(`#module-${menu.id}-${module.id}`);
                const versionDisplay = checkbox ? checkbox.parentElement.nextElementSibling.querySelector('span') : null;
                if (versionDisplay) {
                    const localVersion = getModuleLocalVersion(menu.id, module.id);
                    const onlineVersion = module.version;
                    versionDisplay.innerHTML = `本地版本: ${localVersion} | 在线版本: ${onlineVersion}`;
                    updateVersionDisplay(menu.id, module.id);
                }
            });
        });
    }

    function updateModule(menuId, moduleId) {
        const module = getModuleById(menuId, moduleId);
        GM_xmlhttpRequest({
            method: 'GET',
            url: module.url,
            onload: function(response) {
                try {
                    const scriptContent = response.responseText;
                    saveModuleScript(menuId, moduleId, scriptContent);
                    executeInNamespace(menuId, moduleId, scriptContent);
                    setModuleLocalVersion(menuId, moduleId, module.version);
                    updateVersionDisplay(menuId, moduleId);
                } catch (e) {}
            },
            onerror: function() {}
        });
    }

    function clearLocalStorage() {
        GM_listValues().forEach((key) => {
            GM_deleteValue(key);
        });
    }

    GM_addStyle(`
        .switch {
            position: relative;
            display: inline-block;
            width: 34px;
            height: 20px;
        }

        .switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }

        .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            transition: .4s;
            border-radius: 20px;
        }

        .slider:before {
            position: absolute;
            content: "";
            height: 12px;
            width: 12px;
            left: 4px;
            bottom: 4px;
            background-color: white;
            transition: .4s;
            border-radius: 50%;
        }

        input:checked + .slider {
            background-color: #2196F3;
        }

        input:checked + .slider:before {
            transform: translateX(14px);
        }

        #new-version-alert {
            display: none;
        }
    `);

    fetchModulesConfig();
})();
