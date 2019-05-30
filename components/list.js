
class WebsearchList extends HTMLElement {
  constructor() {
    super();
    let template = document.getElementById('list');
    let templateContent = template.content;

    const shadowRoot = this.attachShadow({mode: 'open'})
      .appendChild(templateContent.cloneNode(true));
  }
}
customElements.define('webs-list', WebsearchList)
