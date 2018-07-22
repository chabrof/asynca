export class Abstract {

  constructor () {
    this.init()
  }

  init () {
    this._items = this._items || []
    this._prefixLog = "asynca : "

    this._history = []
    this._itemIdxToCacheIdx = []
    this._prefetching = true
  }

  /**
   * meta method
   * use a Fifo unallocStrategy
   * [itemIdx] is the index of the iten in the items array
   */
  async _manageCache (itemIdx) {
    let oldItemIdx
    let oldCacheIdx
    let cacheIdx
    let unallocPromise

    if (this._history.length >= this._cache.length) {
      //
      // No more space in cache => unalloc one elem
      //

      // search in history withe uallocStrategie
      let historyIdx = this.unallocStrategie(this._curItemIdx, this._items[this._curItemIdx], itemIdx, this._items[itemIdx])
      oldItemIdx = this._history[historyIdx].itemIdx
      oldCacheIdx = this._history[historyIdx].cacheIdx

      // unalloc the "good cache elt"
      console.log(this._prefixLog, ` get cacheIdx to recycle : ${oldCacheIdx}  => free item : ${oldItemIdx}`)
      this._cache[oldCacheIdx] = undefined
      this._itemIdxToCacheIdx[oldItemIdx] = undefined
      this._history.splice(historyIdx, 1)
      unallocPromise = this._free(oldItemIdx, this._items[oldItemIdx])

      // use the old cache idx as a new one for new item caching
      cacheIdx = oldCacheIdx
    } else {
      // get the cache Idx (the history tab is not full for the moment historyIdx and cacheIdx are the same)
      cacheIdx = this._history.length // == historyIdx
    }

    // Put in cache
    this._history.push({"itemIdx" : itemIdx, "cacheIdx" : cacheIdx})
    const item = this._items[itemIdx]
    this._cache[cacheIdx] = item
    this._itemIdxToCacheIdx[itemIdx] = cacheIdx
    console.log(this._prefixLog, ` use cacheIdx : ${cacheIdx}  => alloc item : ${itemIdx}`)
    return unallocPromise ? unallocPromise.then(() => this._itemIdxToCacheIdx[itemIdx] !== undefined ? this._alloc(itemIdx, item) : null) : this._alloc(itemIdx, item)
  }

  /**
   * Defines the strategy for unallocate item in cache
   * [curItemIdx] the index of the current item (that is wished by user)
   * [curItem] The item which is whished by user
   * [allocItemIdx] the index of the item which will be allocated now (and which needs an unalloc process to free a space for its future allocation)
   * [allocItem] the item which will be allocated now (and which needs an unalloc process to free a space for its future allocation)
   * @return {number} index in the [_history]
   */
  unallocStrategie (curItemIdx, curItem, allocItemIdx, allocItem) {
    console.assert(false, 'This method must be overriden')
  }

  /**
   * @abstract
   * [itemIdx] is the index in the list of items which must be computed
   */
  _alloc (itemIdx, item) {
    console.assert(false, "This method must be overriden : you must call the 'alloc' setter/getter")
  }

  /**
   * @abstract
   * [itemIdx] is the index in the list of items which must be free (un-computed)
   */
  _free (itemIdx, item) {
    console.assert(false, "This method must be overriden : you must call the 'free' setter/getter")
  }

  /**
   * Get a Promise to the wished item
   * it uses precomputed item in cache (if available) or ask for a computation
   */
  getAsync (itemIdx) {
    this._curItemIdx = itemIdx
    return this._getAsync(itemIdx)
  }

  _getAsync (itemIdx) {
    if (this._itemIdxToCacheIdx[itemIdx] === undefined) {
      console.log(this._prefixLog, 'item(' + itemIdx + ') not cached => compute it')
      return this._manageCache(itemIdx)
    } else {
      console.log(this._prefixLog, 'item(' + itemIdx + ') already in cache => get it')
      return Promise.resolve(this._items[itemIdx])
    }
  }

  /**
   * Get Item which has been computed or .. not !
   * uses precomputed item in cache (if available) or ask for a computation
   */
  get (itemIdx) {
    this._curItemIdx = itemIdx
    return this._get(itemIdx)
  }

  _get (itemIdx) {
    // First of all, call the whole machinery
    this._getAsync(itemIdx)
    // ... and simply return the item
    return this._items[itemIdx]
  }

  /**
   * Push one item in list of items
   */
  push (value) {
    console.assert(this._items, 'items is not initialised')

    this._items.push(value)
    return this
  }

  forEach (cbk) {
    this._items.forEach(cbk)
    return this
  }

  map (cbk) {
    return this._items.map(cbk)
  }

  reduce (cbk) {
    return this._items.reduce(cbk)
  }

  //
  // Getters/Setters
  //

  cache (value = undefined) {
    value = typeof value === 'number' ? new Array(value) : value
    return this._manageSetGet('_cache', value)
  }

  items (value = undefined) {
    if (value === undefined) return this._items

    // pre
    console.assert(value && value.length, 'items must be an array')

    value.forEach((item) => this.push(item))

    return this
  }

  alloc (value) {
    return this._manageSetGet('_alloc', value)
  }

  free (value) {
    return this._manageSetGet('_free', value)
  }

  prefetching (value) {
    return this._manageSetGet('_prefetching', value)
  }

  _manageSetGet (attrib, value) {
    if (value === undefined) return this[attrib]

    this[attrib] = value

    this.init()

    return this
  }
}
