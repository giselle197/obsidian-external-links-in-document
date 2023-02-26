import { Plugin } from "obsidian";
import { ExternalLinksPluginSettingTab } from "src/settings";
import { ExternalLinksView, VIEW_TYPE_EXTERNAL_LINKS } from "./view";

interface ExternalLinksPluginSettings {
  onlyUrl: boolean;
  sorted: boolean;
  showHeadings: boolean;
  minShowHeading: number;
  showDuplicateWarning: boolean;
  duplicateUrlColor: string;
  internalLinkColor: string;
  defDuplicate: string;
  showMetadata: boolean;
}

const DEFAULT_SETTINGS: Partial<ExternalLinksPluginSettings> = {
  onlyUrl: false,
  sorted: false,
  showHeadings: false,
  minShowHeading: 2,
  showDuplicateWarning: true,
  duplicateUrlColor: "#ff0000",
  internalLinkColor: "#0000ff",
  defDuplicate: "all",
  showMetadata: true,
}


export default class ExternalLinksPlugin extends Plugin {
  settings: ExternalLinksPluginSettings;
  numberUrls: HTMLElement;

  async loadSettings() {
    // load data from data.json
    let data = await this.loadData();
    this.settings = Object.assign({}, DEFAULT_SETTINGS, data);
  }

  async saveSettings() {
    this.saveData(this.settings);
  }

  async onload() {
    await this.loadSettings();

    this.addSettingTab(new ExternalLinksPluginSettingTab(this.app, this));

    this.registerView(
      VIEW_TYPE_EXTERNAL_LINKS,
      (leaf) => new ExternalLinksView(leaf, this)
    );
    this.addRibbonIcon("album", "External Links view", () => {
      this.activateView();
    });

    // when the view is already open, reload view if active file changed
    // ref: https://github.com/SkepticMystic/breadcrumbs/blob/master/src/main.ts#L67
    this.registerEvent(this.app.workspace.on('file-open', () => {

      // If there is a view (leaf), not detach it and then create a new one, just update it 
      let leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_EXTERNAL_LINKS);
      if (leaves.length) {
        let leaf = leaves[0];
        let view = <ExternalLinksView>leaf.view;
        this.numberUrls.empty();
        view.onOpen();
      }
    }));

    // This adds a simple command that can be triggered when the user is in an editor
    this.addCommand({
      id: 'open-external-links-view',
      name: 'Open external links view for the current file',
      editorCallback: () => {
        this.activateView();
      }
    });

    // Make a clickable status bar item
    // ref: https://github.com/st3v3nmw/obsidian-spaced-repetition/blob/master/src/main.ts#L82
    this.numberUrls = this.addStatusBarItem();
    this.numberUrls.classList.add("mod-clickable");
    this.numberUrls.addEventListener("click", async () => {
      // put this view in foreground
      this.app.workspace.revealLeaf(
        this.app.workspace.getLeavesOfType(VIEW_TYPE_EXTERNAL_LINKS)[0]
      );
    });

  }

  async onunload() {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_EXTERNAL_LINKS);
  }

  async activateView() {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_EXTERNAL_LINKS);

    await this.app.workspace.getRightLeaf(false).setViewState({
      type: VIEW_TYPE_EXTERNAL_LINKS,
      active: true,
    });

    this.app.workspace.revealLeaf(
      this.app.workspace.getLeavesOfType(VIEW_TYPE_EXTERNAL_LINKS)[0]
    );
  }
}