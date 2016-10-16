var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "./abstract_smart_list"], function (require, exports, abstract_smart_list_1) {
    "use strict";
    var Sgj_SideSmartList = (function (_super) {
        __extends(Sgj_SideSmartList, _super);
        function Sgj_SideSmartList(pItems, pCache, cachesSize, rightCacheSize, cyclic) {
            if (rightCacheSize === void 0) { rightCacheSize = -1; }
            if (cyclic === void 0) { cyclic = false; }
            var _this = _super.call(this, pItems, pCache) || this;
            _this._cyclic = cyclic;
            _this._nbItems = pItems.length;
            _this._leftCacheSize = cachesSize;
            _this._rightCacheSize = (rightCacheSize !== -1) ? rightCacheSize : cachesSize;
            _this._sideCacheOffOnce = false;
            _this._prefetchingOn = true;
            return _this;
        }
        Sgj_SideSmartList.prototype.alloc = function (itemIdx, bufferIdx) {
            console.log('meta alloc');
            return new Promise(function (ok, ko) { });
        };
        Sgj_SideSmartList.prototype.unalloc = function (itemIdx, bufferIdx) {
        };
        Sgj_SideSmartList.prototype.unallocStrategie = function (itemIdx) {
            for (var ct = 0; ct < this._idxHistoryTab.length; ct++) {
                var distance = this.getSignedMinDistance(this._curItemIdx, this._idxHistoryTab[ct][0], this._nbItems, this._cyclic);
                if (distance > this._rightCacheSize ||
                    (0 - distance) > this._leftCacheSize) {
                    return ct;
                }
            }
            return _super.prototype.unallocStrategie.call(this, itemIdx);
        };
        Sgj_SideSmartList.prototype.getSignedMinDistance = function (itemOrig, itemDest, nbItems, cyclic) {
            if (cyclic === void 0) { cyclic = false; }
            var distance = itemDest - itemOrig;
            if (cyclic) {
                if (distance > 0) {
                    if (nbItems - distance < distance)
                        return -(nbItems - distance);
                }
                else {
                    if ((nbItems + distance) < -distance)
                        return (nbItems + distance);
                }
            }
            return distance;
        };
        Sgj_SideSmartList.prototype.prefetchingOff = function () {
            this._prefetchingOn = false;
        };
        Sgj_SideSmartList.prototype.prefetchingOn = function () {
            this._prefetchingOn = true;
        };
        Object.defineProperty(Sgj_SideSmartList.prototype, "lastIndentationFlag", {
            get: function () {
                return this._lastIndentation;
            },
            enumerable: true,
            configurable: true
        });
        Sgj_SideSmartList.prototype.get = function (itemIdx) {
            this._curItemIdx = itemIdx;
            this._lastIndentation = false;
            var ret = _super.prototype.get.call(this, itemIdx);
            if (this._prefetchingOn) {
                for (var tmpItemIdx = itemIdx - this._leftCacheSize; tmpItemIdx <= itemIdx - 1; tmpItemIdx++) {
                    if (tmpItemIdx < 0) {
                        if (this._cyclic) {
                            _super.prototype.get.call(this, this.items.length + tmpItemIdx);
                        }
                    }
                    else
                        _super.prototype.get.call(this, tmpItemIdx);
                }
                for (var tmpItemIdx = itemIdx + 1, ct = 0; ct < this._rightCacheSize; tmpItemIdx++, ct++) {
                    if (ct === this._rightCacheSize - 1)
                        this._lastIndentation = true;
                    if (tmpItemIdx >= this.items.length) {
                        if (this._cyclic) {
                            _super.prototype.get.call(this, tmpItemIdx - this.items.length);
                        }
                    }
                    else
                        _super.prototype.get.call(this, tmpItemIdx);
                }
            }
            this._sideCacheOffOnce = false;
            return ret;
        };
        return Sgj_SideSmartList;
    }(abstract_smart_list_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Sgj_SideSmartList;
});
//# sourceMappingURL=side_smart_list.js.map