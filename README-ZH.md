# Obsidian Plugin: External Links in document
![demo](https://github.com/giselle197/obsidian-external-links-in-document/blob/master/media/demo.gif)

[English Doc](README.md) ｜ [中文文檔](README-ZH.md)

## 簡介
這是一款 Obsidan 插件，在側面板中顯示(當前文件的)外部鏈接。

設計初衷是 將當前文件的所有外部鏈接列在側面板以供快速查看、點擊。此外，也檢測是否有重複的網址。

在左下角 status bar 有一格顯示出當前文件的外部鏈接總數(包含H1~H6標題中、內文中)，游標移上去會額外顯示共有幾個不重複的網址。點擊此格會跳至面板。

## 功能
- 顯示網址或網頁標題名稱 (如果內文中有的話)
- 選擇是否顯示H1~H6標題，並設定最小顯示標題
- 依照網址字典排序 (此功能只在**沒有**顯示標題時有效)
- 自行設定 內部鏈接、重複的外部鏈接 的高亮顏色

### 注意
雖然內部鏈接在面板中也有高亮顯示，但無法點擊。

## 使用
輸入指令 "External Links: Open external links view for the current file" 或點選位在 ribbon 的 "album" 圖標，即可啟動此插件。

## 安裝
將 `main.js`, `styles.css`, `manifest.json` 複製到vault的插件資料夾 `VaultFolder/.obsidian/plugins/obsidian-external-links-in-document/`.
