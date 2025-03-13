(function() {
    'use strict';

    if (!window.location.href.includes('customBgUrl') && !window.location.href.includes('/torrent-waterfall.php')) {
        return;
    }

    const modifyCSS = () => {
        [...document.styleSheets].forEach(sheet => {
            try {
                [...sheet.cssRules || sheet.rules].forEach(rule => {
                    if (rule.selectorText?.includes('.grid-item')) {
                        rule.style.width = "calc(100% / var(--grid-cols, 5) - 10px)";
                    }
                });
            } catch (e) {
            }
        });
    };

    const setGridCols = value => {
        GM_setValue("gridCols", value);
        document.documentElement.style.setProperty("--grid-cols", value);
        loadTorrents(true);
    };

    const createSettingUI = () => {
        const buttonGroup = document.querySelector('.button-group');
        if (!buttonGroup) return;

        const container = document.createElement("div");

        const label = document.createElement("label");
        label.textContent = "每行数量: ";
        label.style.marginRight = "5px";

        const input = document.createElement("input");
        input.type = "number";
        input.min = 1;
        input.style.width = "50px";
        input.title = "设置列数";

        const savedValue = GM_getValue("gridCols", 5);
        input.value = savedValue;
        setGridCols(savedValue);

        input.oninput = () => {
            const newValue = parseInt(input.value, 10) || 5;
            setGridCols(newValue);
        };

        container.appendChild(label);
        container.appendChild(input);
        buttonGroup.prepend(container);
    };

    modifyCSS();
    createSettingUI();
})();
