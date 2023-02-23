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
- [v1.1.0] 擷取metadata中的URLs

### 注意
- 雖然內部鏈接在面板中也有高亮顯示，但無法點擊。
- [v1.1.0] 如果 metadata的欄位是一個段落，裡面有 URL(s)，則需要在 URL 的結尾處加上空格

## 使用
輸入指令 "External Links: Open external links view for the current file" 或點選位在 ribbon 的 "album" 圖標，即可啟動此插件。

## 安裝
將 `main.js`, `styles.css`, `manifest.json` 複製到vault的插件資料夾 `VaultFolder/.obsidian/plugins/obsidian-external-links-in-document/`.

## 更新記錄

### v1.0.0
基本功能 -- 顯示URL或網頁標題、顯示或不顯示標題、對URL進行排序

### v1.1.0
功能來自 https://github.com/giselle197/obsidian-external-links-in-document/issues/1 ，感謝[@mnaoumov](https://github.com/mnaoumov)的建議! 

增加功能：從metadata中提取URLs

1. YAML中的URL不能被賦予標題。
2. YAML中的URLs不參與排序。
3. YAML中的URLs不包括在計數中。因為它們與正文區域分開，計數會造成混亂。
4. 我假設使用者在寫metadata時很謹慎，並且順序是有意義的。