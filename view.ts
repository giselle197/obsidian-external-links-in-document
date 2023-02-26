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

  // Code provided by OpenAI ChatGPT 
  detectUrlsInParagraph(paragraph: any) { // type: string
    const urlRegex = /((http(s)?:\/\/)|(www\.))[^\s]+/gi;
    const urls = paragraph.match(urlRegex);

    return urls;
  }

  async render() {
    const { contentEl } = this;
    // console.log("contentEl.childNodes", contentEl.childNodes);

    // clear old output
    const temp = document.getElementsByClassName("cont");
    Array.from(temp).forEach((x) => {
      x.empty();
      contentEl.removeChild(x);
    })

    const noteFile = this.app.workspace.getActiveFile()!;
    const fileContent: string = await this.app.vault.read(noteFile);

    if (this.plugin.settings.showMetadata) {
      // metadata
      let met = contentEl.createEl("h2", { text: "Metadata" });
      let metEl = contentEl.createEl("div");
      met.className = "cont";
      metEl.className = "cont";

      const ul_metadata = document.createElement("ul");   // metadata ul, outermost layer
      // ul_metadata.className = "cont";  // error
      metEl.appendChild(ul_metadata);

      // ref: https://obsidian-snippets.pages.dev/tags/development/
      const metadata = this.app.metadataCache.getFileCache(noteFile)
      if (metadata) {

        for (const k in metadata.frontmatter) {
          if (k == "position") continue;

          const values = metadata.frontmatter[k]

          if (typeof (values) == 'string') {  // there is single URL in this field OR there is a paragraph including several URLs
            const urls = this.detectUrlsInParagraph(values);
            if (urls == null) continue;

            if (urls.length == 1) {
              const li_fieldname = document.createElement("li");

              // make fieldname and link in the same line
              const title = document.createElement('span');
              title.innerText = k + ":\t";
              title.classList.add('metadata-title');
              li_fieldname.appendChild(title);

              const a = document.createElement("a");
              a.href = urls[0];
              a.textContent = urls[0];

              li_fieldname.appendChild(a);
              ul_metadata.appendChild(li_fieldname);

            }
            else {

              const li_fieldname = document.createElement("li");
              li_fieldname.textContent = k;
              const ul_inner = document.createElement("ol");   // inner layer
              li_fieldname.appendChild(ul_inner);   // li > ol

              for (const x in urls) {

                const lli = document.createElement("li");
                const a = document.createElement("a");
                a.href = urls[x];
                a.textContent = urls[x];

                ul_inner.appendChild(lli);  // ol > li
                lli.appendChild(a);
                ul_metadata.appendChild(li_fieldname);
              }

            }
          }
          else {  // typeof (values) is 'object'  // there are several URLs in this field

            const li_fieldname = document.createElement("li");
            li_fieldname.textContent = k;
            const ul_inner = document.createElement("ol");   // inner layer

            for (const i in values) {
              const urls = this.detectUrlsInParagraph(values[i]);

              li_fieldname.appendChild(ul_inner);   // li > ol

              for (const x in urls) {
                const lli = document.createElement("li");
                const a = document.createElement("a");
                a.href = urls[x];
                a.textContent = urls[x];

                ul_inner.appendChild(lli);  // ol > li
                lli.appendChild(a);
                ul_metadata.appendChild(li_fieldname);
              }
            }
          }

        }
      }


    }



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

    if (elements.length > 0 && this.plugin.settings.showMetadata) {
      // content, context
      let cont = contentEl.createEl("h2", { text: "Content" });
      cont.className = "cont";
    }
    // content, context
    let contEl = contentEl.createEl("div");
    contEl.className = "cont";

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

        // Code provided by OpenAI ChatGPT
        const h = block[i].cloneNode(true);
        contEl.appendChild(h);

        // give internal links which are in the headings special color
        // Code provided by OpenAI ChatGPT
        let elements = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
        for (let element of Array.from(elements)) { // Type 'NodeListOf<Element>' must have a '[Symbol.iterator]()' method that returns an iterator.
          let links = element.querySelectorAll("a.internal-link");
          for (let link of Array.from(links)) {
            // Code provided by OpenAI ChatGPT 
            link.replaceWith(
              Object.assign(document.createElement('span'), {
                textContent: link.textContent,
                style: `color: ${this.plugin.settings.internalLinkColor};`
              })
            );
          }

          let links2 = element.querySelectorAll("a.external-link");
          for (let link2 of Array.from(links2))
            if ((this.plugin.settings.defDuplicate == "partial" && hrefCounts_partial[link2.getAttribute("href")!] > 1) || (this.plugin.settings.defDuplicate == "all" && hrefCounts_all[link2.getAttribute("href")!] > 1))
              link2.replaceWith(
                Object.assign(document.createElement('a'), {
                  textContent: link2.textContent,
                  href: link2.getAttribute("href")!,
                  style: `color: ${this.plugin.settings.duplicateUrlColor};`
                })
              );
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