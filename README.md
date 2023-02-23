# Obsidian Plugin: External Links in document
![demo](https://github.com/giselle197/obsidian-external-links-in-document/blob/master/media/demo.gif)

[English Doc](README.md) ｜ [中文文檔](README-ZH.md)

## Introduction
This is an obsidian plugin to display external links (in the current file) in a side-panel.

The intention is to list all external links in the current file and give a quick view to read and click them. Moreover, detect whether there are duplicates URLs.

There is status bar item showing the total number of external links. When the mouse hovers over it, the number of unique ones will show. Also, you can click it to access the panel.

## Feature
- show URL or webpage title (if it is in the content)
- show headings or not, and you can set the minimal level of headings
- sort by URLs alphebatically (only work when the headings are not showed)
- set highlight color for internal links and duplicate exteral links
- [v1.1.0] extract URLs from frontmatter values

### Notice
- Although internal links are also highlighted, they can't be clicked.
- [v1.1.0] URL(s) in frontmatter value **must** have a space at the end if they are inside the paragraph.

## Usage
The panel is activated by command "External Links: Open external links view for the current file" or click the "album" ribbon icon.

## Manually installing the plugin
Copy over `main.js`, `styles.css`, `manifest.json` to your vault `VaultFolder/.obsidian/plugins/obsidian-external-links-in-document/`.

## Update log

### v1.0.0
basic features -- show URL or title, show headings or not, and sort URLs

### v1.1.0
inspired from https://github.com/giselle197/obsidian-external-links-in-document/issues/1, thanks for [@mnaoumov](https://github.com/mnaoumov)'s adivice! 

Add feature: extract URLs from frontmatter values

1. URLs in YAML can't be assigned title.
2. URLs in YAML don't participate in sorting.
3. URLs from frontmatter values are not included in the count. Since they are separated from content region, counting will cause chaos.
4. I assume users write metadata with care, and the order is meaningful.