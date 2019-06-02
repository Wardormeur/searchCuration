class Selector {
  constructor(Tabs) {
    this.css = { file: '/selector/index.css' };
    this.js = { file: '/selector/client.js' };
    this.tabs = Tabs;
    this.started = false;
    this.currentTabId;
    console.log('selector init')
    this.tabs.executeScript(this.js);
  }
  start() {
    const message = {
      action: 'select'
    };
    this.tabs.insertCSS(this.css);
    this.started = true;
    return browser.tabs.sendMessage(this.currentTabId, message);
  }
  stop() {
    const message = {
      action: 'stop'
    };
    this.tabs.removeCSS(this.css);
    this.started = false;
    try {
      browser.tabs.sendMessage(this.currentTabId, message);
    } catch(e) {
      // Expected throw, because I can't design a proper API
    }
  }
}
