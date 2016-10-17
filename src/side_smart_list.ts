declare let require :(moduleId :string) => any
import Sgj_SmartList from "./abstract_smart_list"

export default class Sgj_SideSmartList extends Sgj_SmartList {
  _leftCacheSize   :number
  _rightCacheSize  :number
  _curItemIdx               :number
  _nbItems                  :number
  _cyclic                   :boolean
  _sideCacheOffOnce         :boolean
  _lastIndentation          :boolean
  _prefetchingOn            :boolean
  /**
   * Constructor
   *
   *    [pItems] is the list of items
   *    [pCache] is a {any[]} cache buffer (with limited num of items)
   *    [cachesSize] number max of items to be prefetched to the left (or both if rightCacheSize ommited)
   *    [rightCacheSize] number max of items to be prefetched to the right
   *    [cyclic] boolean
   */
  constructor(pItems :any[], pCache :any[], cachesSize :number, rightCacheSize :number = -1, cyclic :boolean = false) {

    super(pItems, pCache)
    this._cyclic = cyclic
    this._nbItems = pItems.length
    this._leftCacheSize = cachesSize
    this._rightCacheSize = (rightCacheSize !== -1) ? rightCacheSize : cachesSize
    this._sideCacheOffOnce = false
    this._prefetchingOn = true
  }

  alloc(itemIdx :number, bufferIdx :number) :Promise<any> {
    console.assert(false, 'This method must be overriden')
    return new Promise<any>(function(ok, ko) {});
  }


  unalloc(itemIdx :number, bufferIdx :number) :void {
    console.assert(false, 'This method must be overriden')
  }


  /**
   * Returns the index ([int]) of the item to be unallocated in the [_historyTab]
   * overrides meta method
   * computes distance and get the right item to unallocate
   */
  unallocStrategie(itemIdx :number) :number {

    //  We do NOT use the arg [itemIdx] but _curItemIdx (which represents the "wished" item and not the right of left precomputed items)
    for (let ct = 0; ct < this._historyTab.length; ct++) {
      let distance = this.getSignedMinDistance(this._curItemIdx, this._historyTab[ct].itemIdx, this._nbItems, this._cyclic)

      if (distance > this._rightCacheSize ||
         (0 - distance) > this._leftCacheSize ) {
        return ct
      }
    }

    // By default, we use the meta class method, wich unallocate the "oldest" cached item (FIFO) : _historyTab first item
    return super.unallocStrategie(itemIdx)
  }


  /**
   * Get distance between items
   * distance > 0 distance to the right
   * distance < 0 distance to the left
   */
  getSignedMinDistance(itemOrig :number, itemDest :number, nbItems :number, cyclic :boolean = false) :number {

    let distance :number = itemDest - itemOrig

    if (cyclic) {
      if (distance > 0) {
        // We found a "right distance"
        if (nbItems - distance < distance)
          return - (nbItems - distance)
      }
      else {
        // We found a "right distance"
        if ((nbItems + distance) < - distance)
          return (nbItems + distance)
      }
    }

    return distance
  }

  /**
   *  you can unactivate prefetch
   *  use this, before the get call
   */
  prefetchingOff() :void {
    this._prefetchingOn = false
  }

  /**
   *  you can reactivate prefetch
   *  use this, before the get call
   */
  prefetchingOn() :void {
    this._prefetchingOn = true
  }


  /**
   * Main method to get an item
   * computes cache and prefetch automaticaly
   */
  get(itemIdx) :Promise<any> {

    this._curItemIdx = itemIdx

    // Current item
    console.group()
    console.log(this._prefixLog, '/////////////////////////////////')
    console.log(this._prefixLog, 'Get current : ', itemIdx)

    let ret :Promise<any> = super.get(itemIdx);

    // Prefetch
    if (this._prefetchingOn) {
      // Left items
      for (let tmpItemIdx :number = itemIdx - this._leftCacheSize; tmpItemIdx <= itemIdx - 1; tmpItemIdx++) {
        if (tmpItemIdx < 0) {
          if (this._cyclic) {
            let modTmpItemIdx = this.items.length + tmpItemIdx
            console.log(this._prefixLog, '/////////////////')
            console.log(this._prefixLog, 'Prefetch left : ', modTmpItemIdx)
            super.get(modTmpItemIdx)
          }
        }
        else {
          console.log(this._prefixLog, '/////////////////')
          console.log(this._prefixLog, 'Prefetch left : ', tmpItemIdx)
          super.get(tmpItemIdx)
        }
      }
      // Right items
      for (let tmpItemIdx :number = itemIdx + 1, ct = 0; ct < this._rightCacheSize; tmpItemIdx++, ct++) {
        if (tmpItemIdx >= this.items.length) {
          if (this._cyclic) {
            let modTmpItemIdx = tmpItemIdx - this.items.length
            console.log(this._prefixLog, '/////////////////')
            console.log(this._prefixLog, 'Prefetch right :', modTmpItemIdx)
            super.get(modTmpItemIdx)
          }
        }
        else {
          console.log(this._prefixLog, '/////////////////')
          console.log(this._prefixLog, 'Prefetch right :', tmpItemIdx)
          super.get(tmpItemIdx)
        }
      }
    }
    console.groupEnd()
    return ret;
  }
}
