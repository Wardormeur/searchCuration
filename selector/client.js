// TODO: that's fucked up
try {
  new SelectorClient();
} catch(e) {
  class SelectorClient {
    constructor(){
      this.clickListener = function (event) {
        event.preventDefault();
        document.removeEventListener('click', this.escapeListener, { capture: true });
        this.resolve(this.DOMElementFormat(event.target));
      };
      this.escapeListener = function (event) {
        event.preventDefault();
        if (event.key === 'Escape') {
          document.removeEventListener('click', this.clickListener, { capture: true });
          this.reject();
        }
      };
      this.startListeners();
    }
    startListeners() {
      browser.runtime.onMessage.addListener(request => {
        switch(request.action) {
          case 'select':
            return new Promise(this.elementClicked.bind(this));
            break;
          case 'selectAll':
            return new Promise(this.selectAll.bind(this, request.target));
            break;
          case 'stop':
            return this.cleanup();
            break;
          default:
            return this.cleanup();
        }
      });
    }
    DOMElementFormat(DOMElement) {
      const formatted = { value: DOMElement.innerText, path: this.getDomPath(DOMElement).join(' ') };
      if (DOMElement.url) formatted.url = DOMElement.url;
      return formatted;
    }
    elementClicked(resolve, reject) {
      this.resolve = resolve;
      this.reject = reject;
      document.addEventListener('click', this.clickListener.bind(this), { capture: true, once: true });
      document.addEventListener('keydown', this.escapeListener.bind(this), { capture: true, once: true });
    }
    selectAll(target, resolve, reject) {
      this.resolve = resolve;
      this.reject = reject;
      const elems = document.querySelectorAll(target);
      resolve(Array.from(elems).map((elem) => {
        const href = this.selectNearest('a', elem);
        return this.DOMElementFormat.bind(this)({ ...elem, url: href.attributes.href });
      }));
    }
    selectNearest(tag, elem) {
      const closest = elem.closest(tag);
      if (closest) return closest;
      return elem.querySelector('a');
    }
    cleanup() {
      document.removeEventListener('click', this.clickListener, { capture: true });
      document.removeEventListener('click', this.escapeListener, { capture: true });
      return this.reject();
    }
    // From : https://stackoverflow.com/questions/5728558/get-the-dom-path-of-the-clicked-a
    // TODO: set a max depth to have a more generic selector ?
    getDomPath(el) {
      if (!el) {
        return;
      }
      var stack = [];
      var isShadow = false;
      while (el.parentNode != null) {
        var sibCount = 0;
        var sibIndex = 0;
        // get sibling indexes
        for ( var i = 0; i < el.parentNode.childNodes.length; i++ ) {
          var sib = el.parentNode.childNodes[i];
          if ( sib.nodeName == el.nodeName ) {
            if ( sib === el ) {
              sibIndex = sibCount;
            }
            sibCount++;
          }
        }
        var nodeName = el.nodeName.toLowerCase();
        if (isShadow) {
          nodeName += "::shadow";
          isShadow = false;
        }
        if ( sibCount > 1 && el.classList.length > 0 ) {
          // stack.unshift(nodeName + ':nth-of-type(' + (sibIndex + 1) + ')');
          stack.unshift(`${nodeName}.${Array.from(el.classList).join('.')}`);
        } else {
          stack.unshift(nodeName);
        }
        el = el.parentNode;
        if (el.nodeType === 11) { // for shadow dom, we
          isShadow = true;
          el = el.host;
        }
      }
      stack.splice(0,1); // removes the html element
      return stack;
    }
  }
  new SelectorClient();
}
