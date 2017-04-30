class TableModel {
	constructor(numCols=10, numRows=10) {
		this.numCols = numCols;
		this.numRows = numRows;
		this.data = {};
		this.sums = {}; //feature-sum branch, stores { col: j, val: sum } objects
	}

	_getCellId(location) {
		return `${location.col}:${location.row}`;
	}

	getValue(location) {
		return this.data[this._getCellId(location)];
	}

	setValue(location, value) {
		this.data[this._getCellId(location)] = value;
	}

	getSum(col) {
		return this.sums[col];
	}

	setSum(col, sum) {
		this.sums[col] = sum;
	}
}

module.exports = TableModel;