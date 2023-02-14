import ExternalLinksPlugin from "main";
import { App, PluginSettingTab, Setting } from "obsidian";
import { ExternalLinksView, VIEW_TYPE_EXTERNAL_LINKS } from "view";

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
    containerEl.createEl("h1", { text: "My Plugin Settings" });

    new Setting(containerEl)
      .setName("Show number of duplicate URLs")
      .addToggle((toggle) => {
        toggle.setTooltip(("default: true"))
          .setValue(true)
          .onChange(async (value) => {
            this.plugin.settings.showDuplicateWarning = value;
            this.plugin.saveSettings();
            view.onOpen();
          })
      });

    new Setting(containerEl)
      .setName("Color for duplicate URLs")
      .addColorPicker(color => color
        .setValue("#ff0000")
        .onChange(async (value) => {
          this.plugin.settings.duplicateUrlColor = value;
          this.plugin.saveSettings();
          view.onOpen();
        })
      );

    new Setting(containerEl)
      .setName("Color for internal links")
      .setDesc("internal links can't be clicked")
      .addColorPicker(color => color
        .setValue("#0000ff")
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
        .setValue("all")
        .onChange(async (value) => {
          this.plugin.settings.defDuplicate = value;
          this.plugin.saveSettings();
          view.onOpen();
        })
      );

  }

}