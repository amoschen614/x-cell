const { getLetterRange } = require('./array-util');
const { removeChildren, createTR, createTH, createTD } = require('./dom-util');

class TableView {
  constructor(model) {
    this.model = model;
  }
  init() {
    this.initDomReferences();
    this.initCurrentCell();
    this.renderTable();
    this.attachEventHandlers();
  }
  initDomReferences() {
    this.headerRowEl = document.querySelector('THEAD TR');
    this.sheetBodyEl = document.querySelector('TBODY');
    this.formulaBarEl = document.querySelector('#formula-bar');
    this.footerRowEl = document.querySelector('TFOOT TR');
    this.addRowEl = document.querySelector('#add-row');
    this.addColEl = document.querySelector('#add-col');
  }

  initCurrentCell() {
    this.currentCellLocation = { col: 0, row: 0 };
    this.renderFormulaBar();
  }

  normalizeValueForRendering(value) {
    return value || '';
  }

  renderFormulaBar() {
    const currentCellValue = this.model.getValue(this.currentCellLocation);
    this.formulaBarEl.value = this.normalizeValueForRendering(currentCellValue);
    this.formulaBarEl.focus();
  }

  renderTable() {
    this.renderTableHeader();
    this.renderTableBody();
    this.renderTableFooter();
  }

  renderTableHeader() {
    removeChildren(this.headerRowEl);
    getLetterRange('A', this.model.numCols).map(colLabel => createTH(colLabel)).forEach(th => this.headerRowEl.appendChild(th));
  }

  renderTableFooter() {
    removeChildren(this.footerRowEl);
    for (let col = 0; col < this.model.numCols; col++) {
      let colVals = [];
      for (let row = 0; row < this.model.numRows; row++) {
        colVals.push(Number(this.model.getValue({ col: col, row: row })));
      }
      colVals = colVals.filter(el => Number.isInteger(Number(el)));
      let label = '';
      if (colVals.length > 0) {
        label = String(colVals.reduce((sum, val) => sum + val, 0));
      }
      this.footerRowEl.appendChild(createTD(label));
    }
  }

  renderTableBody() {
    const fragment = document.createDocumentFragment();
    for (let row = 0; row < this.model.numRows; row++) {
      const tr = createTR();
      for (let col = 0; col < this.model.numCols; col++) {
        const position = {col: col, row: row};
        const value = this.model.getValue(position);
        const td = createTD(value);
        if (this.isCurrentCell(col, row)) {
          td.className = 'current-cell';
        }
        tr.appendChild(td);
      }
      fragment.appendChild(tr);
    }
    removeChildren(this.sheetBodyEl);
    this.sheetBodyEl.appendChild(fragment);
  }

  isCurrentCell(col, row) {
    return this.currentCellLocation.col === col && this.currentCellLocation.row === row;
  }

  attachEventHandlers() {
    this.sheetBodyEl.addEventListener('click', this.handleSheetClick.bind(this));
    this.formulaBarEl.addEventListener('keyup', this.handleFormulaBarChange.bind(this));
    this.addRowEl.addEventListener('click', this.handleAddRowClick.bind(this));
    this.addColEl.addEventListener('click', this.handleAddColClick.bind(this));
  }

  handleFormulaBarChange(evt) {
    const value = this.formulaBarEl.value;
    if (value === '' && this.model.getValue(this.currentCellLocation) !== undefined) {
      this.model.removeValue(this.currentCellLocation);
    } else {
      this.model.setValue(this.currentCellLocation, value);
      this.renderTableBody();
      this.renderTableFooter();
    }
  }

  handleSheetClick(evt) {
    const col = evt.target.cellIndex;
    const row = evt.target.parentElement.rowIndex - 1;
    this.currentCellLocation = { col: col, row: row };
    this.renderTableBody();
    this.renderTableFooter();
    this.renderFormulaBar();
  }

  handleAddRowClick(evt) {
    this.model.addRow();
    this.renderTableBody();
  }

  handleAddColClick(evt) {
    this.model.addCol();
    this.renderTableHeader();
    this.renderTableBody();
    this.renderTableFooter();
  }
}

module.exports = TableView;