var columnDefs = [
    {headerName: 'Url', field: 'url'},
    {headerName: 'Selector', field: 'listing_link_selector'},
];

var gridOptions = {
    defaultColDef: {
        editable: true
    },
    columnDefs: columnDefs,
    rowData: [],
    components:{
        boldRenderer: function(params) {
            return '<b>' + params.value.name + '</b>';
        }
    }
};

function onFilterTextBoxChanged() {
    gridOptions.api.setQuickFilter(document.getElementById('filter-text-box').value);
}

async function loadList() {
  let list = [];
  try {
    list = await browser.storage.local.get('jobList');
    list = list.jobList || [];
  } catch(e) {
    list = [];
  }
  return list;
}
async function render() {
  gridOptions.rowData = await loadList();
  gridOptions.api.refreshCells();
}
document.addEventListener("DOMContentLoaded", async () => {
    const myGrid = document.querySelector('#myGrid');
    document.querySelector('#filter-text-box').addEventListener('input', onFilterTextBoxChanged);
    browser.storage.onChanged.addListener(render);
    gridOptions.rowData = await loadList();
    myGrid.gridOptions = gridOptions;
});
