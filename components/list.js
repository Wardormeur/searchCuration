
class WebsearchList extends HTMLElement {
  constructor() {
    super();
    let template = document.getElementById('list');
    let templateContent = template.content;
    this.selector = null;
    this.storageKey = 'jobList';

    const shadowRoot = this.attachShadow({mode: 'open'})
      .appendChild(templateContent.cloneNode(true));
  }
  async connectedCallback() {
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
    if (this.selector.started) { this.selector.stop(); }
    try {
      const selected = await this.selector.start();
      el.value = selected.value;
      elPath.value = selected.path;
      // TODO : try to generalize the path and ensure it ends with a "a" tag
      // Select all corresponding paths
      // OR let the user select 2 of them and generalize from tehre
    } catch (e) {
      console.log('rejected', e);
    } finally {
      this.selector.stop();
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
    // Specific to this element
    const jobsListing = await this.selectJobs(payload.listing_link_selector);
    await Promise.all(
      jobsListing.map(j => {
        // Horrible hack :)))
        return this.addOrReplace.bind({ storageKey: 'jobs' })(j.url, { title: j.value });
      }));
  }
  async selectJobs(selector) {
    return this.selector.selectAll(selector);
  }
  async addOrReplace(url, payload) {
    let list = [];
    try {
      list = (await browser.storage.local.get(this.storageKey)).jobs;
      const jobIndex = list.findIndex(job => job.url === url);
      if (jobIndex > -1) list.splice(jobIndex, 1);
    }
    catch(e) {
      list = [];
    }
    list.push({ url, ...payload });
    await browser.storage.local.set({ [this.storageKey]: list });
  }
}
customElements.define('webs-list', WebsearchList)
