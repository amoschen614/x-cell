const fs = require('fs');
const TableModel = require('../table-model');
const TableView = require('../table-view');

describe('table-view', () => {
  beforeEach(() => {
    const fixturePath = './client/js/test/fixtures/sheet-container.html';
    const html = fs.readFileSync(fixturePath, 'utf8');
    document.documentElement.innerHTML = html;
  });
  describe('formula bar', () => {
    it('updates value of bar from value of current cell', () => {
      const model = new TableModel(3, 3);
      const view = new TableView(model);
      model.setValue({ col: 2, row: 1 }, '123');
      view.init();
      const formulaBarEl = document.querySelector('#formula-bar');
      expect(formulaBarEl.value).toBe('');
      const trs = document.querySelectorAll('TBODY TR');
      trs[1].cells[2].click();
      expect(formulaBarEl.value).toBe('123');
    });
    it('updates value of currently selected cell from formula bar', () => {
      const model = new TableModel(3, 3);
      const view = new TableView(model);
      view.init();
      let trs = document.querySelectorAll('TBODY TR');
      let td = trs[0].cells[0];
      expect(td.textContent).toBe('');
      document.querySelector('#formula-bar').value = '123';
      view.handleFormulaBarChange();
      trs = document.querySelectorAll('TBODY TR');
      expect(trs[0].cells[0].textContent).toBe('123');
    });
  });
  describe('table body', () => {
    it('highlights the current cell when clicked', () => {
      const model = new TableModel(10, 5);
      const view = new TableView(model);
      view.init();
      let trs = document.querySelectorAll('TBODY TR');
      let td = trs[2].cells[3];
      expect(td.className).toBe('');
      td.click();
      trs = document.querySelectorAll('TBODY TR');
      td = trs[2].cells[3];
      expect(td.className).not.toBe('');
    });
    it('has the right size', () => {
      const numCols = 6;
      const numRows = 10;
      const model = new TableModel(numCols, numRows);
      const view = new TableView(model);
      view.init();
      let ths = document.querySelectorAll('THEAD TH');
      expect(ths.length).toBe(numCols);
    });
    it('fills in values from the model', () => {
      const model = new TableModel(3, 3);
      const view = new TableView(model);
      model.setValue({col: 2, row: 1}, '123');
      view.init();
      const trs = document.querySelectorAll('TBODY TR');
      expect(trs[1].cells[2].textContent).toBe('123');
    });
  });
  describe('table header', () => {
    it('has valid column header labels', () => {
      const numCols = 6;
      const numRows = 10;
      const model = new TableModel(numCols, numRows);
      const view = new TableView(model);
      view.init();
      let ths = document.querySelectorAll('THEAD TH');
      expect(ths.length).toBe(numCols);
      let labelTexts = Array.from(ths).map(el => el.textContent);
      expect(labelTexts).toEqual(['A', 'B', 'C', 'D', 'E', 'F']);
    });
  });
  describe('sum row', () => {
    it('sums positive integers', () => {
      const model = new TableModel(5, 5);
      const view = new TableView(model);
      view.init();
      expect(view.footerRowEl.textContent).toBe('');
      for (let r = 0; r < model.numRows; r++) {
        view.currentCellLocation = { col: 0, row: r };
        document.querySelector('#formula-bar').value = '' + (r + 1);
        view.handleFormulaBarChange();
      }
      expect(view.footerRowEl.textContent).toBe('15');
    });
    it('sums negative integers', () => {
      const model = new TableModel(5, 5);
      const view = new TableView(model);
      view.init();
      expect(view.footerRowEl.textContent).toBe('');
      for (let r = 0; r < model.numRows; r++) {
        view.currentCellLocation = { col: 0, row: r };
        document.querySelector('#formula-bar').value = '' + (-r - 1);
        view.handleFormulaBarChange();
      }
      expect(view.footerRowEl.textContent).toBe('-15');
    });
    it('records sum of zero if only cell entry is 0', () => {
      const model = new TableModel(1, 3);
      const view = new TableView(model);
      view.init();
      expect(view.footerRowEl.textContent).toBe('');
      view.currentCellLocation = { col: 0, row: 1 };
      document.querySelector('#formula-bar').value = '' + 0;
      view.handleFormulaBarChange();
      expect(view.footerRowEl.textContent).toBe('0');
    });
    it('skips non-numeric entries and blank cells', () => {
      const model = new TableModel(1, 5);
      const view = new TableView(model);
      view.init();
      expect(view.footerRowEl.textContent).toBe('');
      view.currentCellLocation = { col: 0, row: 0 };
      document.querySelector('#formula-bar').value = '1.5';
      view.handleFormulaBarChange();
      view.currentCellLocation = { col: 0, row: 1 };
      document.querySelector('#formula-bar').value = 'str';
      view.handleFormulaBarChange();
      view.currentCellLocation = { col: 0, row: 2 };
      document.querySelector('#formula-bar').value = '-1';
      view.handleFormulaBarChange();
      view.currentCellLocation = { col: 0, row: 3 };
      document.querySelector('#formula-bar').value = '';
      view.handleFormulaBarChange();
      view.currentCellLocation = { col: 0, row: 4 };
      document.querySelector('#formula-bar').value = 'true';
      view.handleFormulaBarChange();
      expect(view.footerRowEl.textContent).toBe('-1');
    });
  });
  describe('add row button', () => {
    it('has the right size', () => {
      const model = new TableModel(4, 4);
      const view = new TableView(model);
      view.init();
      expect(model.numRows).toBe(4);
      document.querySelector('#add-row').click();
      expect(model.numRows).toBe(5);      
    });
  });
  describe('add column button', () => {
    it('has the right size', () => {
      const model = new TableModel(4, 4);
      const view = new TableView(model);
      view.init();
      expect(model.numCols).toBe(4);
      document.querySelector('#add-col').click();
      expect(model.numCols).toBe(5);
    });
    it('has valid column header labels', () => {
      const model = new TableModel(4, 4);
      const view = new TableView(model);
      view.init();
      let ths = document.querySelectorAll('THEAD TH');
      let labelTexts = Array.from(ths).map(el => el.textContent);
      expect(labelTexts).toEqual(['A', 'B', 'C', 'D']);
      document.querySelector('#add-col').click();
      ths = document.querySelectorAll('THEAD TH');
      labelTexts = Array.from(ths).map(el => el.textContent);
      expect(labelTexts).toEqual(['A', 'B', 'C', 'D', 'E']);
    });
    it('has valid sum row labels', () => {
      const model = new TableModel(4, 4);
      const view = new TableView(model);
      view.init();
      for (let r = 0; r < model.numRows; r++) {
        view.currentCellLocation = { col: 0, row: r };
        document.querySelector('#formula-bar').value = '' + (r + 1);
        view.handleFormulaBarChange();
      }
      let sums = document.querySelector('TFOOT TR');
      let labelTexts = [];
      for (let i = 0; i < model.numCols; i++) {
        labelTexts.push(sums.childNodes[i].textContent);
      }
      expect(labelTexts).toEqual(['10', '', '', '']);
      document.querySelector('#add-col').click();
      view.renderTableFooter();
      sums = document.querySelector('TFOOT TR');
      labelTexts = [];
      for (let i = 0; i < model.numCols; i++) {
        labelTexts.push(sums.childNodes[i].textContent);
      }
      expect(labelTexts).toEqual(['10', '', '', '', '']);
    });
  });
});