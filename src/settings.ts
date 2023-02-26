import ExternalLinksPlugin from "src/main";
import { App, PluginSettingTab, Setting } from "obsidian";
import { ExternalLinksView, VIEW_TYPE_EXTERNAL_LINKS } from "src/view";

export class ExternalLinksPluginSettingTab extends PluginSettingTab {
  plugin: ExternalLinksPlugin;

  constructor(app: App, plugin: ExternalLinksPlugin) {
    super(app, plugin);

    this.plugin = plugin;
  }

  display() {

    let view: ExternalLinksView;
    let leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_EXTERNAL_LINKS);
    if (leaves.length) {
      let leaf = leaves[0];
      view = <ExternalLinksView>leaf.view;
    }

    const { containerEl } = this;

    containerEl.empty();
    containerEl.createEl("h2", { text: "External Links - Settings" });

    new Setting(containerEl)
      .setName("Show URLs from frontmatter values")
      .setDesc("⚠️ URLs from frontmatter values are not included in the count")
      .addToggle((toggle) => {
        toggle.setTooltip(("default: true"))
          .setValue(this.plugin.settings.showMetadata)
          .onChange(async (value) => {
            this.plugin.settings.showMetadata = value;
            this.plugin.saveSettings();
            view.onOpen();
          })
      });

    new Setting(containerEl)
      .setName("Show number of duplicate URLs")
      .addToggle((toggle) => {
        toggle.setTooltip(("default: true"))
          .setValue(this.plugin.settings.showDuplicateWarning)
          .onChange(async (value) => {
            this.plugin.settings.showDuplicateWarning = value;
            this.plugin.saveSettings();
            view.onOpen();
          })
      });

    new Setting(containerEl)
      .setName("Color for duplicate URLs")
      .addColorPicker(color => color
        .setValue(this.plugin.settings.duplicateUrlColor)
        .onChange(async (value) => {
          this.plugin.settings.duplicateUrlColor = value;
          this.plugin.saveSettings();
          view.onOpen();
        })
      );

    new Setting(containerEl)
      .setName("Color for internal links")
      .setDesc("⚠️ internal links can't be clicked")
      .addColorPicker(color => color
        .setValue(this.plugin.settings.internalLinkColor)
        .onChange(async (value) => {
          this.plugin.settings.internalLinkColor = value;
          this.plugin.saveSettings();
          view.onOpen();
        })
      );

    new Setting(containerEl)
      .setName("Definition of \"duplicate\"")
      .setDesc("make difference when there is URL in hidden headings")
      .addDropdown(dropdown => dropdown
        .addOptions({ "all": "all in current file", "partial": "only shown in view" })
        .setValue(this.plugin.settings.defDuplicate)
        .onChange(async (value) => {
          this.plugin.settings.defDuplicate = value;
          this.plugin.saveSettings();
          view.onOpen();
        })
      );

  }

}
