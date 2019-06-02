class WebsearchJob extends HTMLElement {
  constructor() {
    super();
    let template = document.getElementById('job');
    let templateContent = template.content;
    this.attachShadow({mode: 'open'})
      .appendChild(templateContent.cloneNode(true));
  }
  async connectedCallback() {
    this.currentTabId = (await browser.tabs.query(
      {
        active: true,
        windowId: browser.windows.WINDOW_ID_CURRENT
      })
    )[0].id;
    console.log('connectedCallback', this.currentTabId);
    const buttons = this.shadowRoot.querySelectorAll('button[type="button"]');
    buttons.forEach(b => {
      b.addEventListener('click', this.toggleSelectorFor.bind(this, b.name));
    });
    browser.tabs.onActivated.addListener(this.resetSelector.bind(this));
    const submitButton = this.shadowRoot.querySelector('button[type="submit"]');
    submitButton.addEventListener('click', this.save.bind(this));
    this.resetSelector();
  }
  // Ensure that only one instance of the selector is running at a time
  // Avoid being too leaky by injecting in every tabs and letting it run
  async resetSelector(activeInfo) {
    if (this.selector && this.selector.started) {
      console.log('resetting', activeInfo)
      this.selector.stop(activeInfo.previousTabId);
      this.currentTabId = activeInfo.tabId;
    }
    this.selector = new Selector(browser.tabs);
  }
  async toggleSelectorFor(elementName) {
    const elInput = `*[name="${elementName}"]`;
    const elInputPath = `*[name="${elementName}_selector"]`;
    const el = this.shadowRoot.querySelector(elInput);
    const elPath = this.shadowRoot.querySelector(elInputPath);
    if (this.selector.started) { this.selector.stop(this.currentTabId); }
    try {
      const selected = await this.selector.start(this.currentTabId);
      el.value = selected.value;
      elPath.value = selected.path;
    } catch (e) {
      console.log('rejected', e);
    } finally {
      this.selector.stop(this.currentTabId);
    }
  }
  async save() {
    const inputs = this.shadowRoot.querySelectorAll('input');
    let payload = {};
    inputs.forEach((input) => {
      payload[input.name] = input.value;
    });
    payload.addedAt = new Date();
    const currentTab = (await browser.tabs.query({active: true, windowId: browser.windows.WINDOW_ID_CURRENT}))[0];
    await this.addOrReplace(currentTab.url, payload);
  }
  async addOrReplace(url, payload) {
    let list = [];
    try {
      list = (await browser.storage.local.get('jobs')).jobs;
      const jobIndex = list.findIndex(job => job.url === url);
      if (jobIndex > -1) list.splice(jobIndex, 1);
    }
    catch(e) {
      list = [];
    }
    list.push({ url, ...payload });
    await browser.storage.local.set({ jobs: list });
  }
  reset() {
    const inputs = this.shadowRoot.querySelectorAll('input');
    inputs.forEach((input) => {
      input.value = '';
    });
  }
}

customElements.define('webs-job', WebsearchJob)

// Note: that would really benefit from Typescript if we were to automate generation of the fields
// i.e. title -> String -> text field; price -> Number -> number field
// class Job {
//   title = '';
//   compensations = '';
//   salary = 0;
//   company = '';
//   url = '';
//   addedAt = Date.now();
//   createdAt = Date.now();
//   lastUpdateAt = Date.now();
//   selectors = {
//     title: '',
//     compensations: '',
//     salary: '',
//     createdAt: '',
//   };
// };
