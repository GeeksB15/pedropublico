
Geeks.ERP.DataSource = function (currentContainer) {
    var _dataSource = function () {
        function _recordSet() {
            this._position = 0;
            this._records = null;

            this.BOF = false;
            this.EOF = false;

            this.MoveNext = function () {
                this._position++;
                this.BOF = false;

                if (this._position > this._records.Length - 1) {
                    this._position = this._records.Length - 1;
                    this.EOF = true;
                }
            };

            this.MovePrevious = function () {
                this._position--;
                this.EOF = false;

                if (this._position < 0) {
                    this._position = 0;
                    this.BOF = true;
                }
            };
        }

        return {
            Recordset: null,
            Open: function (sql) {
                var result = Geeks.ERP.Core.Connection.ExecuteSQL(sql);
                var records = result.Records[0];

                for (var col in records) {
                    if (records.hasOwnProperty(col)) {
                        var propName = col.toString();
                        var get = Function("return this._records[this._position]['" + propName + "']");
                        var set = Function("newValue", "this._records[this._position]['" + propName + "'] = newValue;");
                        var handler = { 'get': get, 'set': set, enumerable: true, configurable: true };

                        Object.defineProperty(_recordSet.prototype, propName, handler);
                    }
                };

                this.Recordset = new _recordSet();
                this.Recordset._records = result.Records;
            }
        }
    };

    return new _dataSource;
};



