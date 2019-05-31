class WebsearchJob extends HTMLElement {
  constructor() {
    super();
    let template = document.getElementById('job');
    let templateContent = template.content;
    this.selector = new Selector(browser.tabs);

    const shadowRoot = this.attachShadow({mode: 'open'})
      .appendChild(templateContent.cloneNode(true));
    const buttons = this.shadowRoot.querySelectorAll('button[type="button"]');
    buttons.forEach(b => {
      b.addEventListener('click', this.toggleSelectorFor.bind(this, b.name));
    });
    const submitButton = this.shadowRoot.querySelector('button[type="submit"]');
    submitButton.addEventListener('click', this.save.bind(this));
  }
  async toggleSelectorFor(elementName) {
    const elInput = `*[name="${elementName}"]`;
    const elInputPath = `*[name="${elementName}_selector"]`;
    const el = this.shadowRoot.querySelector(elInput);
    const elPath = this.shadowRoot.querySelector(elInputPath);
    const currentTabId = (await browser.tabs.query({active: true, windowId: browser.windows.WINDOW_ID_CURRENT}))[0].id;
    if (this.selector.started) { this.selector.stop(currentTabId); }
    try {
      const selected = await this.selector.start(currentTabId);
      el.value = selected.value;
      elPath.value = selected.path;
    } catch (e) {
      console.log('rejected', e);
    } finally {
      this.selector.stop(currentTabId);
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
