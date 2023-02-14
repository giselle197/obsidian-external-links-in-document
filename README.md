# Obsidian Plugin: External Links in document
![demo](https://github.com/giselle197/obsidian-external-links-in-document/blob/master/media/demo.gif)

[English Doc](README.md) ｜ [中文文檔](README-ZH.md)

## Introduction
This is an obsidian plugin to display external links (in the current file) in a side-panel.

The intention is to list all external links in the current file and give a quick view to read and click them. Moreover, detect whether there are duplicates URLs.

There is status bar item showing the total number of external links. When the mouse hovers over it, the number of unique ones will show. Also, you can click it to access the panel.

## Feature
- show URL or webpage title (if it is in the content)
- show headings or not, and you can set the minimal level of headings.
- sort by URLs alphebatically (only work when the headings are not showed)
- set highlight color for internal links and duplicate exteral links

### Notice
Although internal links are also highlighted, they can't be click.

## Usage
The panel is activated by command "External Links: Open external links view for the current file" or click the "album" ribbon icon.

## Manually installing the plugin
Copy over `main.js`, `styles.css`, `manifest.json` to your vault `VaultFolder/.obsidian/plugins/obsidian-external-links-in-document/`.
