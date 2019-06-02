let myWindowId;
let selector;

/*
Make the content box editable as soon as the user mouses over the sidebar.
*/
window.addEventListener("mouseover", () => {
  //contentBox.setAttribute("contenteditable", true);
});

/*
When the user mouses out, save the current contents of the box.
*/
window.addEventListener("mouseout", () => {
  // contentBox.setAttribute("contenteditable", false);
  // browser.tabs.query({windowId: myWindowId, active: true}).then((tabs) => {
  //   let contentToStore = {};
  //   contentToStore[tabs[0].url] = contentBox.textContent;
  //   browser.storage.local.set(contentToStore);
  // });
});


function updateContent(e) {
  if (selector.started) { selector.stop(e.previousTabId); }
  selector.currentTabId = e.tabId;
  assignSelector();
}

function assignSelector() {
  const listForm = document.querySelector('webs-list');
  const jobForm = document.querySelector('webs-job');
  listForm.selector = selector;
  jobForm.selector = selector;
}
/*
Update content when a new tab becomes active.
*/
browser.tabs.onActivated.addListener(updateContent);

/*
Update content when a new page is loaded into a tab.
*/
// browser.tabs.onUpdated.addListener(updateContent);

/*
Setup the different listeners of the interface
*/
browser.windows.getCurrent({populate: true}).then((windowInfo) => {
  myWindowId = windowInfo.id;
  selector = new Selector(browser.tabs);
  browser.tabs.query({windowId: myWindowId, active: true})
    .then((tabs) => {
      const currentTab = tabs[0];
      selector.currentTabId = currentTab.id;
      assignSelector();
    });
});
