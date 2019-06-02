// TODO: that's fucked up
try {
  new SelectorClient();
} catch(e) {
  console.log('err', e)
  class SelectorClient {
    constructor(){
      this.clickListener = function (event) {
        event.preventDefault();
        document.removeEventListener('click', this.escapeListener, { capture: true });
        this.resolve({ value: event.target.innerText, path: this.getDomPath(event.target).join(' ') });
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
          case 'stop':
            return this.cleanup();
            break;
          default:
            return this.cleanup();
        }
      });
    }
    elementClicked(resolve, reject) {
      this.resolve = resolve;
      this.reject = reject;
      document.addEventListener('click', this.clickListener.bind(this), { capture: true, once: true });
      document.addEventListener('keydown', this.escapeListener.bind(this), { capture: true, once: true });
    }
    cleanup() {
      document.removeEventListener('click', this.clickListener, { capture: true });
      document.removeEventListener('click', this.escapeListener, { capture: true });
      return this.reject();
    }
    // From : https://stackoverflow.com/questions/5728558/get-the-dom-path-of-the-clicked-a
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
        if ( sibCount > 1 ) {
          stack.unshift(nodeName + ':nth-of-type(' + (sibIndex + 1) + ')');
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
