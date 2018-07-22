import { SidePrefetchAbstract } from "./SidePrefetchAbstract"

export class SidePrefetch2D extends SidePrefetchAbstract {

  _init () {
    super._init()

    this._x = this._x || ((item) => item.x)
    this._y = this._y || ((item) => item.y)

    this._sidePrefetchOffOnce = false
    this._prefetching = true
  }

  /**
   * Returns the index ([int]) of the item to be unallocated in the [_history]
   * overrides meta method
   * computes distance and get the right item to unallocate
   */
  unallocStrategie (curItemIdx, allocItemIdx) {
    console.warn('itemIdx', allocItemIdx, 'curItemIdx', curItemIdx)

    let nbItems = this._items.length
    //  We do NOT use the arg [itemIdx] but _curItemIdx (which represents the "wished" item and not the right or left precomputed items)
    for (let ct = 0; ct < this._history.length; ct++) {
      let distance = this.getSignedMinDistance(curItemIdx, this._history[ct].itemIdx, nbItems, this._cyclic)

      if (distance > this._rightPrefetchSideSize ||
         (0 - distance) > this._leftPrefetchSideSize) {
        return ct
      }
    }

    // By default, we use the FifoCache method, wich unallocate the "oldest" cached item
    return super.unallocStrategie(curItemIdx, allocItemIdx)
  }

  /**
   * Main method to get an item
   * computes cache and prefetch automaticaly
   */
  _get (itemIdx) {
    // Current item
    console.group(this._prefixLog, 'Get current : ', itemIdx)

    let ret = super._get(itemIdx)

    // Prefetch
    if (this._prefetching) {
      // Items available in the square centered arround current item
      const curX = this._x(this._items[itemIdx])
      const curY = this._y(this._items[itemIdx])
      const minX = curX - this._prefetchSideSize
      const maxX = curX + this._prefetchSideSize
      const minY = curY - this._prefetchSideSize
      const maxY = curY + this._prefetchSideSize

      for (let x = minX; x <= maxX; x++) {
        for (let y = minY; y <= maxY; y++) {
          let prefetchItemIdx
          // Prefetch x, y around cur item
          if (this.xyItemIdxs[x] && (prefetchItemIdx = this.xyItemIdxs[x][y])) super.get(prefetchItemIdx)
        }
      }
    }
    console.groupEnd()

    return ret
  }

  /**
   * x and y are used as keys for an internal 2d hashMap
   * See meta method for further documentation
   */
  push (item) {
    let x = this._x(item)
    let y = this._y(item)
    this.xyItemIdxs[x] = this.xyItemIdxs || {}

    // pre
    console.assert(!this.xyItemIdxs[x][y], '(x, y) coords are already used by another item')

    this.xyItemIdxs[x][y] = this._items.length
    // meta
    return super.push(item)
  }

  x (value) {
    return this._manageSetGet('_x', value)
  }

  y (value) {
    return this._manageSetGet('_y', value)
  }

  prefetchSideSize (value) {
    return this._manageSetGet('_prefetchSideSize', value)
  }
}
