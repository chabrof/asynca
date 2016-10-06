define(["require", "exports"], function (require, exports) {
    "use strict";
    var Sgj_SmartList = (function () {
        function Sgj_SmartList(pItems, pcache) {
            this.cache = pcache;
            this.items = pItems;
            this._idxHistoryTab = [];
            this._allocatedFlg = [];
        }
        Sgj_SmartList.prototype._cache = function (itemIdx) {
            var cacheIdx;
            if (this._idxHistoryTab.length >= this.cache.length) {
                var cacheDelIdx = this.unallocStrategie(itemIdx);
                cacheIdx = this._idxHistoryTab[cacheDelIdx][1];
                this.unalloc(this._idxHistoryTab[cacheDelIdx][0], cacheIdx);
                this._allocatedFlg[this._idxHistoryTab[cacheDelIdx][0]] = false;
                this._idxHistoryTab.splice(cacheDelIdx, 1);
            }
            else {
                cacheIdx = this._idxHistoryTab.length;
            }
            this._idxHistoryTab.push([itemIdx, cacheIdx]);
            var promise = this.alloc(itemIdx, cacheIdx);
            var self = this;
            return promise.then(function (result) {
                self._allocatedFlg[itemIdx] = true;
                return result;
            });
        };
        Sgj_SmartList.prototype.unallocStrategie = function (itemIdx) {
            return 0;
        };
        Sgj_SmartList.prototype.get = function (itemHash) {
            if (this._allocatedFlg[itemHash] !== true) {
                return this._cache(itemHash);
            }
            else {
                return Promise.resolve(this.items[itemHash]);
            }
        };
        return Sgj_SmartList;
    }());
    exports.Sgj_SmartList = Sgj_SmartList;
});
//# sourceMappingURL=abstract_smart_list.js.map