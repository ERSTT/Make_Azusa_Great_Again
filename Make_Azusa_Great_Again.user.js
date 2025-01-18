// ==UserScript==
// @name         Make Azusa Great Again
// @namespace    https://github.com/ERSTT
// @icon         https://azusa.wiki/favicon.ico
// @version      1.0
// @description  Make Azusa Great Again
// @author       ERST
// @match        https://azusa.wiki/*
// @match        https://zimiao.icu/*
// @connect      githubusercontent.com
// @connect      github.com
// @connect      greasyfork.org
// @updateURL    https://raw.githubusercontent.com/ERSTT/Make_Azusa_Great_Again/refs/heads/main/Make_Azusa_Great_Again.user.js
// @downloadURL  https://raw.githubusercontent.com/ERSTT/Make_Azusa_Great_Again/refs/heads/main/Make_Azusa_Great_Again.user.js
// @require      https://cdn.jsdelivr.net/npm/chart.js
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @require      https://cdn.datatables.net/1.11.5/js/jquery.dataTables.min.js
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-idle
// @changelog    初始发布
// ==/UserScript==

(function() {
    'use strict';

    if (window.top !== window.self) {
        return;
    }

    const jsonConfigUrl = 'https://raw.githubusercontent.com/ERSTT/Make_Azusa_Great_Again/refs/heads/main/data.json';
    let modulesConfig = [];

    function fetchModulesConfig() {
        GM_xmlhttpRequest({
            method: 'GET',
            url: jsonConfigUrl,
            onload: function(response) {
                try {
                    const newModulesConfig = JSON.parse(response.responseText);
                    if (JSON.stringify(newModulesConfig) !== JSON.stringify(modulesConfig)) {
                        modulesConfig = newModulesConfig;
                        createControlPanel();
                        updateControlPanel();
                        loadAndExecuteModules();
                    }
                } catch (e) {}
            },
            onerror: function() {}
        });
    }

    function loadAndExecuteModules() {
        modulesConfig.menu.forEach((menu, menuIndex) => {
            menu.modules.forEach((module, index) => {
                if (getModuleState(menuIndex, index)) {
                    loadAndExecuteModule(menuIndex, index);
                }
            });
        });
    }

    function loadAndExecuteModule(menuIndex, index) {
        const module = getModuleByIndex(menuIndex, index);
        const localVersion = getModuleLocalVersion(menuIndex, index);
        const onlineVersion = module.version;

        if (localVersion === onlineVersion) {
            const cachedScript = getModuleScript(menuIndex, index);
            if (cachedScript) {
                try {
                    eval(cachedScript);
                    return;
                } catch (e) {}
            }
        }

        GM_xmlhttpRequest({
            method: 'GET',
            url: module.url,
            onload: function(response) {
                try {
                    const scriptContent = response.responseText;
                    saveModuleScript(menuIndex, index, scriptContent);
                    eval(scriptContent);
                    setModuleLocalVersion(menuIndex, index, module.version);
                    updateControlPanel();
                } catch (e) {}
            },
            onerror: function() {}
        });
    }

    function getModuleByIndex(menuIndex, index) {
        return modulesConfig.menu[menuIndex].modules[index];
    }

    function saveModuleScript(menuIndex, index, scriptContent) {
        const scriptParts = splitScriptIntoParts(scriptContent);
        scriptParts.forEach((part, partIndex) => {
            GM_setValue(`module_${menuIndex}_${index}_script_part_${partIndex}`, part);
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

    function getModuleScript(menuIndex, index) {
        let scriptContent = '';
        let partIndex = 0;
        while (true) {
            const part = GM_getValue(`module_${menuIndex}_${index}_script_part_${partIndex}`);
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
        title.innerText = 'Make Azusa Great Again';
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
            GM_setValue('panel_hidden', true); // Save the hidden state
        });
        panel.appendChild(hideText);

        const panelContent = document.createElement('div');
        panelContent.id = 'panel-content';
        panel.appendChild(panelContent);

        modulesConfig.menu.forEach((menu, menuIndex) => {
            const menuTitle = document.createElement('h5');
            menuTitle.innerText = menu.name;
            menuTitle.style.fontSize = '18px';
            menuTitle.style.margin = '0';
            menuTitle.style.textAlign = 'center';
            panelContent.appendChild(menuTitle);

            menu.modules.forEach((module, index) => {
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

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = `module-${menuIndex}-${index}`;
                checkbox.checked = getModuleState(menuIndex, index);
                checkbox.addEventListener('change', (event) => toggleModuleState(menuIndex, index, event.target));

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
                const localVersion = getModuleLocalVersion(menuIndex, index);
                const onlineVersion = module.version;
                versionDisplay.innerHTML = `本地版本: ${localVersion} | 在线版本: ${onlineVersion}`;

                const updateButton = document.createElement('button');
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

                updateButton.addEventListener('click', () => updateModule(menuIndex, index));

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

        const scriptVersion = GM_info.script.version;

        const authorInfo = document.createElement('div');
        authorInfo.style.position = 'absolute';
        authorInfo.style.bottom = '10px';
        authorInfo.style.left = '10px';
        authorInfo.style.fontSize = '12px';
        authorInfo.style.textAlign = 'left';
        authorInfo.textContent = `作者: ERST`;
        panel.appendChild(authorInfo);

        const versionInfo = document.createElement('div');
        versionInfo.style.position = 'absolute';
        versionInfo.style.bottom = '10px';
        versionInfo.style.right = '10px';
        versionInfo.style.fontSize = '12px';
        versionInfo.style.textAlign = 'right';
        versionInfo.textContent = `版本: ${scriptVersion}`;
        panel.appendChild(versionInfo);

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
            GM_setValue('panel_hidden', false); // Save the hidden state
        });
        document.body.appendChild(floatingButton);

        // Restore the hidden state
        if (GM_getValue('panel_hidden', false)) {
            panel.style.display = 'none';
            floatingButton.style.display = 'block';
        }
    }

    function getModuleState(menuIndex, index) {
        return GM_getValue(`module_${menuIndex}_${index}_enabled`, false);
    }

    function getModuleLocalVersion(menuIndex, index) {
        return GM_getValue(`module_${menuIndex}_${index}_version`, '未安装');
    }

    function setModuleState(menuIndex, index, state) {
        GM_setValue(`module_${menuIndex}_${index}_enabled`, state);
    }

    function setModuleLocalVersion(menuIndex, index, version) {
        GM_setValue(`module_${menuIndex}_${index}_version`, version);
    }

    function toggleModuleState(menuIndex, index, checkbox) {
        const currentState = getModuleState(menuIndex, index);
        const newState = !currentState;
        setModuleState(menuIndex, index, newState);
        checkbox.checked = newState;
        updateControlPanel();
        if (newState) {
            loadAndExecuteModule(menuIndex, index);
        }
    }

    function updateControlPanel() {
        modulesConfig.menu.forEach((menu, menuIndex) => {
            menu.modules.forEach((module, index) => {
                const checkbox = document.querySelector(`#module-${menuIndex}-${index}`);
                const versionDisplay = checkbox ? checkbox.parentElement.nextElementSibling.querySelector('span') : null;
                if (versionDisplay) {
                    const localVersion = getModuleLocalVersion(menuIndex, index);
                    const onlineVersion = module.version;
                    versionDisplay.innerHTML = `本地版本: ${localVersion} | 在线版本: ${onlineVersion}`;
                }
            });
        });
    }

    function updateModule(menuIndex, index) {
        const module = getModuleByIndex(menuIndex, index);
        GM_xmlhttpRequest({
            method: 'GET',
            url: module.url,
            onload: function(response) {
                try {
                    const scriptContent = response.responseText;
                    saveModuleScript(menuIndex, index, scriptContent);
                    eval(scriptContent);
                    setModuleLocalVersion(menuIndex, index, module.version);
                    updateControlPanel();
                } catch (e) {}
            },
            onerror: function() {}
        });
    }

    fetchModulesConfig();

})();
