export abstract class Sgj_SmartList {
  items           :any[];
  cache           :any[];
  _idxHistoryTab  :any[];
  _allocatedFlg   :any[];

  constructor (pItems :any[],  pcache :any[]) {
    this.cache = pcache;
    this.items = pItems;
    this._idxHistoryTab = [];
    this._allocatedFlg = [];
  }

  /**
   * meta method
   * use a Fifo unallocStrategy
   * [itemIdx] is the index of the iten in the items array
   */
  _cache(itemIdx) :Promise<any> {

    let cacheIdx :number

    if (this._idxHistoryTab.length >= this.cache.length) {
      // No more space in cache => unalloc one elem
      let cacheDelIdx :number = this.unallocStrategie(itemIdx)
      cacheIdx = this._idxHistoryTab[cacheDelIdx][1]
      this.unalloc(this._idxHistoryTab[cacheDelIdx][0], cacheIdx)
      this._allocatedFlg[this._idxHistoryTab[cacheDelIdx][0]] = false
      this._idxHistoryTab.splice(cacheDelIdx, 1)
    } else {
      cacheIdx = this._idxHistoryTab.length
    }

    // Put in cache
    this._idxHistoryTab.push([itemIdx, cacheIdx])
    let promise :Promise<any> = this.alloc(itemIdx, cacheIdx)
    let self = this
    return promise.then(
      function(result) {
        self._allocatedFlg[itemIdx] = true
        return result;
      })
  }

  /**
   * Defines the strategy for unallocate item in cache
   * By default Fifo 
   * [itemIdx] is the index of the item
   * @return {number} index in the [_idxHistoryTab]
   */
  unallocStrategie(itemIdx) :number {
    return 0
  }

  /**
   * @abstract
   * [itemIdx] is the index in the list of items
   * [cacheIdx] is the index in the cache which is computed by the [_cache] method 
   */
  abstract alloc(itemIdx, cacheIdx :number) :Promise<any>;

  /**
   * @abstract
   * [itemIdx] is the index in the list of items
   * [cacheIdx] is the index in the cache which is computed by the [_cache] method 
   */
  abstract unalloc(itemHash, cacheIdx :number) :void;

  /**
   * get a Promise to the wished item 
   * uses or computes item in cache
   */
  get(itemHash) : Promise<any> {

    if (this._allocatedFlg[itemHash] !== true) {
      return this._cache(itemHash)
    }
    else {
      return Promise.resolve(this.items[itemHash])
    }
  }
}
