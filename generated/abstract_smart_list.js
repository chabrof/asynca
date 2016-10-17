define(["require", "exports"], function (require, exports) {
    "use strict";
    var Sgj_SmartList = (function () {
        function Sgj_SmartList(pItems, pcache) {
            this._prefixLog = "SgjFocus : ";
            this.cache = pcache;
            this.items = pItems;
            this._historyTab = [];
            this._itemIdxToCacheIdx = [];
        }
        Sgj_SmartList.prototype._cache = function (itemIdx) {
            var oldItemIdx;
            var oldCacheIdx;
            var cacheIdx;
            if (this._historyTab.length >= this.cache.length) {
                var historyIdx = this.unallocStrategie(itemIdx);
                oldItemIdx = this._historyTab[historyIdx].itemIdx;
                oldCacheIdx = this._historyTab[historyIdx].cacheIdx;
                console.log(this._prefixLog + 'get cacheIdx to recycle :' + oldCacheIdx);
                this.unalloc(oldItemIdx, oldCacheIdx);
                this._itemIdxToCacheIdx[oldItemIdx] = undefined;
                this._historyTab.splice(historyIdx, 1);
                cacheIdx = oldCacheIdx;
            }
            else {
                cacheIdx = this._historyTab.length;
            }
            this._historyTab.push({ "itemIdx": itemIdx, "cacheIdx": cacheIdx });
            console.log(this._prefixLog + '_historyTab length is now :' + this._historyTab.length);
            var promise = this.alloc(itemIdx, cacheIdx);
            this._itemIdxToCacheIdx[itemIdx] = cacheIdx;
            var self = this;
            return promise.then(function (result) {
                return result;
            });
        };
        Sgj_SmartList.prototype.unallocStrategie = function (itemIdx) {
            return 0;
        };
        Sgj_SmartList.prototype.get = function (itemIdx) {
            if (this._itemIdxToCacheIdx[itemIdx] === undefined) {
                console.log(this._prefixLog, 'item(' + itemIdx + ') not cached => compute it');
                return this._cache(itemIdx);
            }
            else {
                console.log(this._prefixLog, 'item(' + itemIdx + ') already in cache => get it');
                return Promise.resolve(this.cache[this._itemIdxToCacheIdx[itemIdx]]);
            }
        };
        return Sgj_SmartList;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Sgj_SmartList;
});
//# sourceMappingURL=abstract_smart_list.js.map