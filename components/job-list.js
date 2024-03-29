
class WebsearchJobList extends HTMLElement {
  constructor() {
    super();
    let template = document.getElementById('job-list');
    let templateContent = template.content;
    this.limit = 2;

    const shadowRoot = this.attachShadow({mode: 'open'})
      .appendChild(templateContent.cloneNode(true));
    browser.storage.onChanged.addListener(this.render.bind(this));
  }
  connectedCallback() {
    this.render();
  }
  async render() {
    await this.loadList();
    let ulElement = this.shadowRoot.querySelector('.job-list');
    // Empty
    const range = document.createRange();
    range.selectNodeContents(ulElement);
    range.deleteContents();
    // Recreate
    this.list.slice(-this.limit).forEach(job => {
      let li = this.createJobListElement(job);
      ulElement.appendChild(li);
    });
  }
  createJobListElement(job) {
    // Create structure, because I'm too lazy to use webcomponents inside webcomponents
    // Sue me
    const base = this.shadowRoot.ownerDocument;
    const li = base.createElement('LI');
    const link = base.createElement('A');
    const jobName = base.createElement('H4');
    const details = base.createElement('H5');
    const location = base.createElement('SPAN');
    const salary = base.createElement('SPAN');

    location.innerText = job.location;
    jobName.innerText = job.title;
    salary.innerText = job.salary;
    link.href = job.url;

    details.appendChild(location);
    details.appendChild(salary);
    link.appendChild(jobName);
    link.appendChild(details);
    li.appendChild(link);
    return li;
  }

  async loadList() {
    let list = [];
    try {
      list = await browser.storage.local.get('jobs');
      list = list.jobs || [];
    } catch(e) {
      list = [];
    }
    this.list = list;
  }
}
customElements.define('webs-job-list', WebsearchJobList)
