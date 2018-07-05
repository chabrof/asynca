module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// object to store loaded and loading wasm modules
/******/ 	var installedWasmModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// object with all compiled WebAssembly.Modules
/******/ 	__webpack_require__.w = {};
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "../../src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "../../src/Abstract.js":
/*!*************************************************!*\
  !*** /home/g179735/temp/asynca/src/Abstract.js ***!
  \*************************************************/
/*! exports provided: Abstract */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Abstract", function() { return Abstract; });
class Abstract {

  init() {
    if (!this._items) return;
    this._prefixLog = "asynca : ";

    this._history = [];
    this._itemIdxToCacheIdx = [];
  }

  /**
   * meta method
   * use a Fifo unallocStrategy
   * [itemIdx] is the index of the iten in the items array
   */
  async _cache(itemIdx) {
    let oldItemIdx;
    let oldCacheIdx;
    let cacheIdx;
    let unallocPromise;

    if (this._history.length >= this.cache.length) {
      //
      // No more space in cache => unalloc one elem
      //

      // search in history withe uallocStrategie
      let historyIdx = this.unallocStrategie(itemIdx);
      oldItemIdx = this._history[historyIdx].itemIdx;
      oldCacheIdx = this._history[historyIdx].cacheIdx;

      // unalloc the "good cache elt"
      console.log(this._prefixLog, ` get cacheIdx to recycle : ${oldCacheIdx}  => free item : ${oldItemIdx}`);
      this.cache[oldCacheIdx] = undefined;
      this._itemIdxToCacheIdx[oldItemIdx] = undefined;
      this._history.splice(historyIdx, 1);
      unallocPromise = this.free(oldItemIdx);

      // use the old cache idx as a new one for new item caching
      cacheIdx = oldCacheIdx;
    } else {
      // get the cache Idx (the history tab is not full for the moment historyIdx and cacheIdx are the same)
      cacheIdx = this._history.length; // == historyIdx
    }

    // Put in cache
    this._history.push({ "itemIdx": itemIdx, "cacheIdx": cacheIdx });
    this.cache[cacheIdx] = this._items[itemIdx];
    this._itemIdxToCacheIdx[itemIdx] = cacheIdx;
    console.log(this._prefixLog, ` use cacheIdx : ${cacheIdx}  => alloc item : ${itemIdx}`);
    return unallocPromise ? unallocPromise.then(() => this._itemIdxToCacheIdx[itemIdx] !== undefined ? this.alloc(itemIdx) : null) : this.alloc(itemIdx);
  }

  /**
   * Defines the strategy for unallocate item in cache
   * [itemIdx] is the index of the item
   * @return {number} index in the [_history]
   */
  unallocStrategie(itemIdx) {
    console.assert(false, 'This method must be overriden');
  }

  /**
   * @abstract
   * [itemIdx] is the index in the list of items which must be computed
   */
  alloc(itemIdx) {
    console.assert(false, 'This method must be overriden');
  }

  /**
   * @abstract
   * [itemIdx] is the index in the list of items which must be free (un-computed)
   */
  free(itemIdx) {
    console.assert(false, 'This method must be overriden');
  }

  /**
   * Get a Promise to the wished item
   * it uses precomputed item in cache (if available) or ask for a computation
   */
  getAsync(itemIdx) {
    if (this._itemIdxToCacheIdx[itemIdx] === undefined) {
      console.log(this._prefixLog, 'item(' + itemIdx + ') not cached => compute it');
      return this._cache(itemIdx);
    } else {
      console.log(this._prefixLog, 'item(' + itemIdx + ') already in cache => get it');
      return Promise.resolve(this._items[itemIdx]);
    }
  }

  /**
   * Get Item which has been computed or .. not !
   * uses precomputed item in cache (if available) or ask for a computation
   */
  get(itemIdx) {
    // First of all, call the whole machinery
    this.getAsync(itemIdx);
    // ... and simply return the item
    return this._items[itemIdx];
  }

  /**
   * Push one item in list of items
   */
  push(value) {
    console.assert(this._items && this._items.length, 'items is not initialysed');

    this._items.push(value);
    return this;
  }

  forEach(cbk) {
    this._items.forEach(cbk);
    return this;
  }

  map(cbk) {
    return this._items.map(cbk);
  }

  reduce(cbk) {
    return this._items.reduce(cbk);
  }

  //
  // Getters/Setters
  //

  cache(value) {
    value = typeof value === 'number' ? new Array(value) : value;
    return this._manageSetGet('_cache', value);
  }

  items(value) {
    return this._manageSetGet('_items', value);
  }

  _manageSetGet(attrib, value) {
    if (!value) return this[attrib];

    this[attrib] = value;

    this.init();

    return this;
  }
}

/***/ }),

/***/ "../../src/FifoCache.js":
/*!**************************************************!*\
  !*** /home/g179735/temp/asynca/src/FifoCache.js ***!
  \**************************************************/
/*! exports provided: FifoCache */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FifoCache", function() { return FifoCache; });
/* harmony import */ var _Abstract__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Abstract */ "../../src/Abstract.js");


class FifoCache extends _Abstract__WEBPACK_IMPORTED_MODULE_0__["Abstract"] {

  /**
   * Defines the strategy for unallocate item in cache
   * We implement a very very hard to understand complex strategy
   *   => we choose to unallocate the oldest computed item (first item idx in the history : 0)
   * [itemIdx] is the index of the item
   * @return {number} index in the [_history]
   */
  unallocStrategie(itemIdx) {
    return 0;
  }
}

/***/ }),

/***/ "../../src/SidePrefetch.js":
/*!*****************************************************!*\
  !*** /home/g179735/temp/asynca/src/SidePrefetch.js ***!
  \*****************************************************/
/*! exports provided: SidePrefetch */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SidePrefetch", function() { return SidePrefetch; });
/* harmony import */ var _SidePrefetchAbstract__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./SidePrefetchAbstract */ "../../src/SidePrefetchAbstract.js");


class SidePrefetch extends _SidePrefetchAbstract__WEBPACK_IMPORTED_MODULE_0__["SidePrefetchAbstract"] {

  init() {
    super.init();

    if (this._items) return;

    this._cyclic = this._cyclic || false;
    this._nbItems = this._items.length;
    this._rightPrefetchSize = this._rightPrefetchSize !== undefined ? this._rightPrefetchSize : this._leftPrefetchSize;
    this._sidePrefetchOffOnce = false;
    this._prefetchingOn = true;
  }

  /**
   * Returns the index ([int]) of the item to be unallocated in the [_history]
   * overrides meta method
   * computes distance and get the right item to unallocate
   */
  unallocStrategie(itemIdx) {
    //  We do NOT use the arg [itemIdx] but _curItemIdx (which represents the "wished" item and not the right of left precomputed items)
    for (let ct = 0; ct < this._history.length; ct++) {
      let distance = this.getSignedMinDistance(this._curItemIdx, this._history[ct].itemIdx, this._nbItems, this._cyclic);

      if (distance > this._rightPrefetchSize || 0 - distance > this._leftPrefetchSize) {
        return ct;
      }
    }

    // By default, we use the FifoCache method, wich unallocate the "oldest" cached item
    return super.unallocStrategie(itemIdx);
  }

  /**
   * Main method to get an item
   * computes cache and prefetch automaticaly
   */
  get(itemIdx) {
    this._curItemIdx = itemIdx;

    // Current item
    console.group(this._prefixLog, 'Get current : ', itemIdx);
    console.log(this._prefixLog, '/////////////////////////////////');

    let ret = super.get(itemIdx);

    // Prefetch
    if (this._prefetchingOn) {
      // Left items
      for (let tmpItemIdx = itemIdx - this._leftPrefetchSize; tmpItemIdx <= itemIdx - 1; tmpItemIdx++) {
        if (tmpItemIdx < 0) {
          if (this._cyclic) {
            let modTmpItemIdx = this.items.length + tmpItemIdx;
            console.log(this._prefixLog, '/////////////////');
            console.log(this._prefixLog, 'Prefetch left : ', modTmpItemIdx);
            super.get(modTmpItemIdx);
          }
        } else {
          console.log(this._prefixLog, '/////////////////');
          console.log(this._prefixLog, 'Prefetch left : ', tmpItemIdx);
          super.get(tmpItemIdx);
        }
      }
      // Right items
      for (let tmpItemIdx = itemIdx + 1, ct = 0; ct < this._rightPrefetchSize; tmpItemIdx++, ct++) {
        if (tmpItemIdx >= this.items.length) {
          if (this._cyclic) {
            let modTmpItemIdx = tmpItemIdx - this.items.length;
            console.log(this._prefixLog, '/////////////////');
            console.log(this._prefixLog, 'Prefetch right :', modTmpItemIdx);
            super.get(modTmpItemIdx);
          }
        } else {
          console.log(this._prefixLog, '/////////////////');
          console.log(this._prefixLog, 'Prefetch right :', tmpItemIdx);
          super.get(tmpItemIdx);
        }
      }
    }
    console.groupEnd();

    return ret;
  }

  prefetchSideSize(value) {
    this._manageSetGet('_leftPrefetchSize', value);
  }

  leftPrefetchSideSize(value) {
    this._manageSetGet('_leftPrefetchSize', value);
  }

  rightPrefetchSideSize(value) {
    this._manageSetGet('_rightPrefetchSize', value);
  }
}

/***/ }),

/***/ "../../src/SidePrefetchAbstract.js":
/*!*************************************************************!*\
  !*** /home/g179735/temp/asynca/src/SidePrefetchAbstract.js ***!
  \*************************************************************/
/*! exports provided: SidePrefetchAbstract */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SidePrefetchAbstract", function() { return SidePrefetchAbstract; });
/* harmony import */ var _FifoCache__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./FifoCache */ "../../src/FifoCache.js");


class SidePrefetchAbstract extends _FifoCache__WEBPACK_IMPORTED_MODULE_0__["FifoCache"] {

  /**
   * Get distance between items
   * distance > 0 distance to the right
   * distance < 0 distance to the left
   */
  getSignedMinDistance(itemOrigIdx, itemDestIdx, nbItems, cyclic = false) {
    let distance = itemDestIdx - itemOrigIdx;

    if (cyclic) {
      if (distance > 0) {
        // We found a "left distance" ..accross 0 index
        if (nbItems - distance < distance) return -(nbItems - distance);
      } else {
        // We found a "right distance" ..accross last index
        if (nbItems + distance < -distance) return nbItems + distance;
      }
    }

    return distance;
  }

  /**
   *  you can unactivate prefetch
   *  use this, before the get call
   */
  prefetchingOff() {
    this._prefetchingOn = false;
  }

  /**
   *  you can reactivate prefetch
   *  use this, before the get call
   */
  prefetchingOn() {
    this._prefetchingOn = true;
  }
}

/***/ }),

/***/ "../../src/index.js":
/*!**********************************************!*\
  !*** /home/g179735/temp/asynca/src/index.js ***!
  \**********************************************/
/*! exports provided: Abstract, FifoCache, SidePrefetch */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Abstract", function() { return Abstract; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FifoCache", function() { return FifoCache; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SidePrefetch", function() { return SidePrefetch; });
/* harmony import */ var _Abstract__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Abstract */ "../../src/Abstract.js");
/* harmony import */ var _FifoCache__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./FifoCache */ "../../src/FifoCache.js");
/* harmony import */ var _SidePrefetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./SidePrefetch */ "../../src/SidePrefetch.js");




const Abstract = _Abstract__WEBPACK_IMPORTED_MODULE_0__["Abstract"];
const FifoCache = _FifoCache__WEBPACK_IMPORTED_MODULE_1__["FifoCache"];
const SidePrefetch = _SidePrefetch__WEBPACK_IMPORTED_MODULE_2__["SidePrefetch"];

/***/ })

/******/ });
//# sourceMappingURL=asynca.debug.js.map