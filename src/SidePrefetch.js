import { SidePrefetchAbstract } from "./SidePrefetchAbstract"

export class SidePrefetch extends SidePrefetchAbstract {

  init () {
    super.init()

    this._cyclic = this._cyclic || false
    this._rightPrefetchSize = (this._rightPrefetchSize !== undefined ? this._rightPrefetchSize : this._leftPrefetchSize)
    this._sidePrefetchOffOnce = false
    this._prefetchingOn = true
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

      if (distance > this._rightPrefetchSize ||
         (0 - distance) > this._leftPrefetchSize) {
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
    if (this._prefetchingOn) {
      // Left items
      for (let tmpItemIdx = itemIdx - this._leftPrefetchSize; tmpItemIdx <= itemIdx - 1; tmpItemIdx++) {
        if (tmpItemIdx < 0) {
          if (this._cyclic) {
            let modTmpItemIdx = this._items.length + tmpItemIdx
            console.log(this._prefixLog, '/////////////////')
            console.log(this._prefixLog, 'Prefetch left : ', modTmpItemIdx)
            super._get(modTmpItemIdx)
          }
        } else {
          console.log(this._prefixLog, '/////////////////')
          console.log(this._prefixLog, 'Prefetch left : ', tmpItemIdx)
          super._get(tmpItemIdx)
        }
      }
      // Right items
      console.log('right : ', this._rightPrefetchSize)
      for (let tmpItemIdx = itemIdx + 1, ct = 0; ct < this._rightPrefetchSize; tmpItemIdx++, ct++) {
        if (tmpItemIdx >= this._items.length) {
          if (this._cyclic) {
            let modTmpItemIdx = tmpItemIdx - this._items.length
            console.log(this._prefixLog, '/////////////////')
            console.log(this._prefixLog, 'Prefetch right :', modTmpItemIdx)
            super._get(modTmpItemIdx)
          }
        } else {
          console.log(this._prefixLog, '/////////////////')
          console.log(this._prefixLog, 'Prefetch right :', tmpItemIdx)
          super._get(tmpItemIdx)
        }
      }
    }
    console.groupEnd()

    return ret
  }

  prefetchSideSize (value) {
    return this._manageSetGet('_leftPrefetchSize', value)
  }

  leftPrefetchSideSize (value) {
    return this._manageSetGet('_leftPrefetchSize', value)
  }

  rightPrefetchSideSize (value) {
    return this._manageSetGet('_rightPrefetchSize', value)
  }

  cyclic (value) {
    return this._manageSetGet('_cyclic', value)
  }
}
