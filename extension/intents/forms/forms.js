import * as intentRunner from "../../background/intentRunner.js";
import * as content from "../../background/content.js";
import * as pageMetadata from "../../background/pageMetadata.js";
import * as browserUtil from "../../browserUtil.js";

intentRunner.registerIntent({
  name: "forms.dictate",
  async run(context) {
    const activeTab = await browserUtil.activeTab();
    await content.inject(activeTab.id, [
      "/js/vendor/fuse.js",
      "/intents/forms/formsContentScript.js",
    ]);
    await browser.tabs.sendMessage(activeTab.id, {
      type: "enterText",
      text: context.slots.text,
    });
  },
});

intentRunner.registerIntent({
  name: "forms.focusField",
  async run(context) {
    const activeTab = await browserUtil.activeTab();
    await content.inject(activeTab.id, [
      "/js/vendor/fuse.js",
      "/intents/forms/formsContentScript.js",
    ]);
    const label = context.slots.label;
    const result = await browser.tabs.sendMessage(activeTab.id, {
      type: "focusField",
      label,
    });
    if (!result) {
      const exc = new Error("No field found");
      exc.displayMessage = `No field matching "${label}" found`;
      throw exc;
    }
  },
});

intentRunner.registerIntent({
  name: "forms.focusNext",
  async run(context) {
    const activeTab = await browserUtil.activeTab();
    await content.inject(activeTab.id, [
      "/js/vendor/fuse.js",
      "/intents/forms/formsContentScript.js",
    ]);
    await browser.tabs.sendMessage(activeTab.id, { type: "focusNext" });
  },
});

intentRunner.registerIntent({
  name: "forms.formSubmit",
  async run(context) {
    const activeTab = await browserUtil.activeTab();
    await content.inject(activeTab.id, [
      "/js/vendor/fuse.js",
      "/intents/forms/formsContentScript.js",
    ]);
    await browser.tabs.sendMessage(activeTab.id, { type: "formSubmit" });
  },
});

intentRunner.registerIntent({
  name: "forms.focusPrevious",
  async run(context) {
    const activeTab = await browserUtil.activeTab();
    await content.inject(activeTab.id, [
      "/js/vendor/fuse.js",
      "/intents/forms/formsContentScript.js",
    ]);
    await browser.tabs.sendMessage(activeTab.id, { type: "focusPrevious" });
  },
});

intentRunner.registerIntent({
  name: "forms.turnSelectionIntoLink",
  async run(context) {
    const activeTab = await browserUtil.activeTab();
    const isGoogleDoc = new RegExp(/^https:\/\/docs.google.com\/document\/d\//);
    if (isGoogleDoc.test(activeTab.url)) {
      await content.inject(activeTab.id, "/background/googleContentScript.js");
      const selection = await browser.tabs.sendMessage(activeTab.id, {
        type: "getGoogleDocsSelection",
      });
      if (!selection || !selection.text) {
        const e = new Error("No text selected");
        e.displayMessage = "No text selected";
        throw e;
      }
      await browser.tabs.sendMessage(activeTab.id, {
        type: "clickGoogleSelectionToLinkButton",
      });
    } else {
      const selection = await pageMetadata.getSelection(activeTab.id);
      if (!selection || !selection.text) {
        const e = new Error("No text selected");
        e.displayMessage = "No text selected";
        throw e;
      }
      const newTab = await browserUtil.createTabGoogleLucky(selection.text, {
        hide: true,
      });
      const url = newTab.url;
      const text = selection.text;
      await browser.tabs.remove(newTab.id);
      await content.inject(activeTab.id, [
        "/js/vendor/fuse.js",
        "/intents/forms/formsContentScript.js",
      ]);
      await browser.tabs.sendMessage(activeTab.id, {
        type: "turnSelectionIntoLink",
        url,
        text,
      });
    }
  },
});
