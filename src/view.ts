import { ItemView, MarkdownRenderer, Setting, WorkspaceLeaf } from "obsidian";
import ExternalLinksPlugin from "main";

export const VIEW_TYPE_EXTERNAL_LINKS = "external-links-view";

export class ExternalLinksView extends ItemView {
  plugin: ExternalLinksPlugin;

  constructor(leaf: WorkspaceLeaf, plugin: ExternalLinksPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType() {
    return VIEW_TYPE_EXTERNAL_LINKS;
  }

  getDisplayText() {
    return "External Links";
  }

  getIcon() {
    return "album";
  }

  async onOpen() {
    const noteFile = this.app.workspace.getActiveFile();

    if (noteFile) {   // not null
      this.buttonDiv();
      this.render();
    } else {
      const { contentEl } = this;
      contentEl.empty();
    }
  }

  buttonDiv() {
    const { contentEl } = this;
    for (let i = 0; i < contentEl.childNodes.length; i++) {
      let child = <HTMLDivElement>contentEl.childNodes[i];
      if (child.className == "buttons") {
        contentEl.removeChild(child);
      }
    }

    var buttonsEl = contentEl.createEl("div");
    buttonsEl.className = "buttons";

    let buttons = new Setting(buttonsEl)
      .addButton(item => {
        item.setIcon("refresh-cw")
          .setTooltip("refresh")
          .onClick(() => {
            this.render();
          })
      })
      .addButton(item => {
        item.setIcon("library")
          .setTooltip("URL")
          .onClick(() => {
            this.plugin.settings.onlyUrl = !this.plugin.settings.onlyUrl;
            this.render();
          })
      })
      .addButton(item => {
        item.setIcon("hash")
          .setTooltip("toggle headings")
          .onClick(() => {
            this.plugin.settings.showHeadings = !this.plugin.settings.showHeadings;
            this.buttonDiv();
            this.render();
          })
      })

    if (!this.plugin.settings.showHeadings)
      buttons.addButton(item => {
        item.setIcon("list-video")
          .setTooltip("sort")
          .onClick(() => {
            this.plugin.settings.sorted = !this.plugin.settings.sorted;
            this.render();
          })
      })
    else
      buttons.addSlider(item => {
        item.setLimits(1, 6, 1)
          .setDynamicTooltip()
          .setValue(this.plugin.settings.minShowHeading)
          .onChange(() => {
            if (item.getValue() != this.plugin.settings.minShowHeading) {
              this.plugin.settings.minShowHeading = item.getValue();
              item.setValue(this.plugin.settings.minShowHeading)
              this.render();
            }
          })
      })
  }


  async render() {
    const { contentEl } = this;
    for (let i = 0; i < contentEl.childNodes.length; i++) {
      let child = <HTMLDivElement>contentEl.childNodes[i];
      if (child.className == "cont") {
        contentEl.removeChild(child);
      }
    }
    var contEl = contentEl.createEl("div");
    contEl.className = "cont";

    const noteFile = this.app.workspace.getActiveFile()!;
    const fileContent: string = await this.app.vault.read(noteFile);

    //ref:  https://www.programcreek.com/typescript/?code=OliverBalfour%2Fobsidian-pandoc%2Fobsidian-pandoc-master%2Frenderer.ts
    // Use Obsidian's markdown renderer to render to a hidden <div>
    const wrapper = document.createElement('div');
    await MarkdownRenderer.renderMarkdown(fileContent, wrapper, noteFile.path, this);  // not need the last two arguments here

    let elements;
    if (this.plugin.settings.showHeadings) {
      switch (this.plugin.settings.minShowHeading) {
        case 1:
          elements = wrapper.querySelectorAll("h1, p a.external-link"); // DOM
          break
        case 2:
          elements = wrapper.querySelectorAll("h1, h2, p a.external-link");
          break
        case 3:
          elements = wrapper.querySelectorAll("h1, h2, h3, p a.external-link");
          break
        case 4:
          elements = wrapper.querySelectorAll("h1, h2, h3, h4, p a.external-link");
          break
        case 5:
          elements = wrapper.querySelectorAll("h1, h2, h3, h4, h5, p a.external-link");
          break
        default:
          elements = wrapper.querySelectorAll("h1, h2, h3, h4, h5, h6, p a.external-link");
      }
    }
    else
      elements = wrapper.querySelectorAll(".external-link");

    const block = Array.from(elements);

    // make a dictionary of URLs (although in the headings) and the number of occurances to check if there are duplicate URLs
    // Code provided by OpenAI ChatGPT
    function countExternalLinks(block: Element[]): { [href: string]: number } {
      const hrefCounts: { [href: string]: number } = {};

      const searchLinks = (node: Element) => {
        if (node.classList.contains("external-link")) {
          const href = node.getAttribute("href");
          if (href)
            hrefCounts[href] = (hrefCounts[href] || 0) + 1;
        }
        node.childNodes.forEach(childNode => {
          if (childNode instanceof Element) {
            searchLinks(childNode);
          }
        });
      };

      block.forEach(node => {
        if (node instanceof Element) {
          searchLinks(node);
        }
      });

      return hrefCounts;
    }

    const hrefCounts_partial = countExternalLinks(block);
    const hrefCounts_all = countExternalLinks(Array.from(wrapper.querySelectorAll(".external-link")));

    if (this.plugin.settings.showDuplicateWarning) {
      // sum of values minus number of keys
      const diff = Object.values(hrefCounts_partial).reduce((a, b) => a + b, 0) - Object.keys(hrefCounts_partial).length;
      if (diff != 0) {
        let t = `There are ${diff} duplicate URL(s) !`;
        let tmp = contEl.createEl("p", { text: t });
        tmp.style.color = this.plugin.settings.duplicateUrlColor;
        tmp.style.fontStyle = "italic";
      }
    }
    // Status Bar
    const sum_value = Object.values(hrefCounts_all).reduce((a, b) => a + b, 0);
    const num_key = Object.keys(hrefCounts_all).length;
    this.plugin.numberUrls.empty();
    this.plugin.numberUrls.createDiv({
      text: `${sum_value} URLs`,
      attr: {
        "aria-label": `Unique: ${num_key}`,
        "aria-label-position": "top"
      }
    })

    // sort URLs alphebatically
    if (this.plugin.settings.sorted && !this.plugin.settings.showHeadings) {
      block.sort(function (a: Element, b: Element) {
        let nameA = a.getAttribute("href")!;
        let nameB = b.getAttribute("href")!;
        return (nameA < nameB) ? -1 : 1;
      });
    }

    let ul = document.createElement("ul");
    contEl.appendChild(ul);
    for (let i = 0; i < block.length; i++) {
      // console.log("block[i]", block[i]);
      if (block[i].tagName[0] == "H") {
        // console.log("block[i].childNodes", block[i].childNodes);

        const h = document.createElement(block[i].tagName);
        contEl.appendChild(h);
        h.textContent = block[i].textContent;
        h.innerHTML = block[i].innerHTML;

        // give internal links which are in the headings special color
        // Code provided by OpenAI ChatGPT
        let elements = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
        for (let element of Array.from(elements)) { // Type 'NodeListOf<Element>' must have a '[Symbol.iterator]()' method that returns an iterator.
          let links = element.querySelectorAll("a.internal-link");
          for (let link of Array.from(links))
            element.innerHTML = element.innerHTML.replace(link.outerHTML, `<span style="color: ${this.plugin.settings.internalLinkColor};">${link.textContent}</span>`);

          let links2 = element.querySelectorAll("a.external-link");
          for (let link2 of Array.from(links2))
            if ((this.plugin.settings.defDuplicate == "partial" && hrefCounts_partial[link2.getAttribute("href")!] > 1) || (this.plugin.settings.defDuplicate == "all" && hrefCounts_all[link2.getAttribute("href")!] > 1))
              element.innerHTML = element.innerHTML.replace(link2.innerHTML, `<span style="color: ${this.plugin.settings.duplicateUrlColor};">${link2.innerHTML}</span>`);
        }

      } else {  // make lists
        if (i > 0 && block[i - 1].tagName[0] == "H") {
          ul = document.createElement("ul");
          contEl.appendChild(ul);
        }

        const li = document.createElement("li");
        const a = document.createElement("a");

        if (this.plugin.settings.onlyUrl) {
          a.href = block[i].getAttribute("href")!;
          a.textContent = block[i].getAttribute("href")!;
        } else {
          a.href = block[i].getAttribute("href")!;
          a.textContent = block[i].innerHTML;
        }

        if ((this.plugin.settings.defDuplicate == "all" && hrefCounts_all[a.href] > 1) || (this.plugin.settings.defDuplicate == "partial" && hrefCounts_partial[a.href] > 1))
          a.style.color = this.plugin.settings.duplicateUrlColor;
        li.appendChild(a);
        ul.appendChild(li);
      }
    }
  }

  async onClose() {
    // Nothing to clean up.
  }
}