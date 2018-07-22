import { SidePrefetchAbstract } from "./SidePrefetchAbstract"

export class SidePrefetch extends SidePrefetchAbstract {

  _init () {
    super._init()

    this._cyclic = this._cyclic || false
    this._leftPrefetchSideSize = (this._leftPrefetchSideSize !== undefined ? this._leftPrefetchSideSize : this._leftPrefetchSideSize)
    this._sidePrefetchOffOnce = false
  }

  /**
   * See meta method for documentation
   */
  unallocStrategie (curItemIdx, curItem, allocItemIdx, allocItem) {
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
    return super.unallocStrategie(curItemIdx, curItem, allocItemIdx, allocItem)
  }

  /**
   * See meta method for documentation
   */
  _get (itemIdx) {
    // Current item
    console.group(this._prefixLog, 'Get current : ', itemIdx)

    let ret = super._get(itemIdx)

    // Prefetch
    if (this._prefetching) {
      // Left items
      for (let tmpItemIdx = itemIdx - this._leftPrefetchSideSize; tmpItemIdx <= itemIdx - 1; tmpItemIdx++) {
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
      console.log('right : ', this._rightPrefetchSideSize)
      for (let tmpItemIdx = itemIdx + 1, ct = 0; ct < this._rightPrefetchSideSize; tmpItemIdx++, ct++) {
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
    return this._manageSetGet('_leftPrefetchSideSize', value)
  }

  leftPrefetchSideSize (value) {
    return this._manageSetGet('_leftPrefetchSideSize', value)
  }

  rightPrefetchSideSize (value) {
    return this._manageSetGet('_rightPrefetchSideSize', value)
  }

  cyclic (value) {
    return this._manageSetGet('_cyclic', value)
  }
}
