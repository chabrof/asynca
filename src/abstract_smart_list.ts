abstract class Sgj_SmartList {
  _prefixLog      :string
  items           :any[];
  cache           :any[];
  _historyTab  :any[];
  _itemIdxToCacheIdx   :number[];

  constructor (pItems :any[],  pcache :any[]) {
    this._prefixLog = "SgjFocus : "
    this.cache = pcache
    this.items = pItems
    this._historyTab = []
    this._itemIdxToCacheIdx = []
  }

  /**
   * meta method
   * use a Fifo unallocStrategy
   * [itemIdx] is the index of the iten in the items array
   */
  _cache(itemIdx) :Promise<any> {

    let oldItemIdx :number
    let oldCacheIdx :number
    let cacheIdx :number

    if (this._historyTab.length >= this.cache.length) {
      //
      // No more space in cache => unalloc one elem
      //

      // search in history withe uallocStrategie
      let historyIdx :number = this.unallocStrategie(itemIdx)
      oldItemIdx = this._historyTab[historyIdx].itemIdx
      oldCacheIdx = this._historyTab[historyIdx].cacheIdx
      console.log(this._prefixLog + 'get cacheIdx to recycle :' + oldCacheIdx)
      // unalloc the "good cache elt"
      this.unalloc(oldItemIdx, oldCacheIdx)
      this._itemIdxToCacheIdx[oldItemIdx] = undefined
      this._historyTab.splice(historyIdx, 1)

      // use the old cache idx as a new one for new item caching
      cacheIdx = oldCacheIdx
    } else {
      // get the cache Idx (the history tab is not full for the moment historyIdx and cacheIdx are the same)
      cacheIdx = this._historyTab.length // == historyIdx
    }

    // Put in cache
    this._historyTab.push({"itemIdx" : itemIdx, "cacheIdx" : cacheIdx})
    console.log(this._prefixLog + '_historyTab length is now :' + this._historyTab.length)
    let promise :Promise<any> = this.alloc(itemIdx, cacheIdx)
    this._itemIdxToCacheIdx[itemIdx] = cacheIdx
    let self = this
    return promise.then(
      function(result) {
        return result;
      })
  }

  /**
   * Defines the strategy for unallocate item in cache
   * By default Fifo
   * [itemIdx] is the index of the item
   * @return {number} index in the [_historyTab]
   */
  unallocStrategie(itemIdx) :number {
    return 0
  }

  /**
   * @abstract
   * [itemIdx] is the index in the list of items
   * [cacheIdx] is the index in the cache which is computed by the [_cache] method
   */
  abstract alloc(itemIdx, cacheIdx :number) :Promise<any>

  /**
   * @abstract
   * [itemIdx] is the index in the list of items
   * [cacheIdx] is the index in the cache which is computed by the [_cache] method
   */
  abstract unalloc(itemIdx, cacheIdx :number) :void

  /**
   * get a Promise to the wished item
   * uses or computes item in cache
   */
  get(itemIdx) : Promise<any> {

    if (this._itemIdxToCacheIdx[itemIdx] === undefined) {
      console.log(this._prefixLog, 'item(' + itemIdx + ') not cached => compute it')
      return this._cache(itemIdx)
    }
    else {
      console.log(this._prefixLog, 'item(' + itemIdx + ') already in cache => get it')
      return Promise.resolve(this.cache[this._itemIdxToCacheIdx[itemIdx]])
    }
  }
}
export default Sgj_SmartList
