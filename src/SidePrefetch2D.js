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
      for (let tmpItemIdx = itemIdx - this._leftPrefetchSideSize; tmpItemIdx <= itemIdx - 1; tmpItemIdx++) {
        if (tmpItemIdx < 0) {
          if (this._cyclic) {
            let modTmpItemIdx = this._items.length + tmpItemIdx
            console.log(this._prefixLog, '/////////////////')
            console.log(this._prefixLog, 'Prefetch square: ', modTmpItemIdx)
            super._get(modTmpItemIdx)
          }
        } else {
          console.log(this._prefixLog, '/////////////////')
          console.log(this._prefixLog, 'Prefetch left : ', tmpItemIdx)
          super._get(tmpItemIdx)
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
    this._xyItems[x] = this._xyItems || {}

    // pre
    console.assert(!this._xyItems[x][y], '(x, y) coords are already used by another item')

    this._xyItems[x][y] = item
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
    return this._manageSetGet('_leftPrefetchSideSize', value)
  }
}
