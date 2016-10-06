import Sgj_SmartList from "./abstract_smart_list"

export default class Sgj_SideSmartList extends Sgj_SmartList {

  _leftCacheSize   :number;
  _rightCacheSize  :number;
  _curItemIdx               :number;
  _nbItems                  :number;
  _cyclic                   :boolean;
  _sideCacheOffOnce         :boolean;
  _lastIndentation          :boolean;

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

    super(pItems, pCache);
    this._cyclic = cyclic;
    this._nbItems = pItems.length;
    this._leftCacheSize = cachesSize;
    this._rightCacheSize = (rightCacheSize !== -1) ? rightCacheSize : cachesSize;
    this._sideCacheOffOnce = false;
  }

  alloc(itemHash, bufferIdx :number) :Promise<any> {
    return new Promise<any>(function(ok, ko) {});
  }


  unalloc(itemHash, bufferIdx :number) :void {
  }


  /**
   * Returns the index ([int]) of the item to be unallocated in the [_idxHistoryTab]
   * overrides meta method
   * computes distance and get the right item to unallocate
   */
  unallocStrategie(itemIdx :number) :number {

    //  We do NOT use the arg [itemIdx] but _curItemIdx (which represents the "wished" item and not the right of left precomputed items)
    for (let ct = 0; ct < this._idxHistoryTab.length; ct++) {
      let distance = this.getSignedMinDistance(this._curItemIdx, this._idxHistoryTab[ct][0], this._nbItems, this._cyclic)

      if (distance > this._rightCacheSize ||
         (0 - distance) > this._leftCacheSize ) {
        return ct
      }
    }

    // By default, we use the meta class method, wich unallocate the "oldest" cached item (FIFO)
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
   *  you can get an item without prefetching the others 
   *  use this, before the get call
   */
  sideCacheOffOnce() :void {
    this._sideCacheOffOnce = true
  }

  get lastIndentationFlag() :boolean {
    return this._lastIndentation
  }


  /**
   * Main method to get an item
   * computes cache and prefetch automaticaly
   */
  get(itemIdx) :Promise<any> {

    this._curItemIdx = itemIdx;
    this._lastIndentation = false;

    // Current item
    let ret :Promise<any> = super.get(itemIdx);

    // Prefetch
    if (! this._sideCacheOffOnce) {
      // Left items
      for (let tmpItemIdx :number = itemIdx - this._leftCacheSize; tmpItemIdx <= itemIdx - 1; tmpItemIdx++) {
        if (tmpItemIdx < 0) {
          if (this._cyclic) {
            super.get(this.items.length + tmpItemIdx);
          }
        }
        else
          super.get(tmpItemIdx);
      }
      // Right items
      for (let tmpItemIdx :number = itemIdx + 1, ct = 0; ct < this._rightCacheSize; tmpItemIdx++, ct++) {
        if (ct === this._rightCacheSize - 1)
            this._lastIndentation = true;
        if (tmpItemIdx >= this.items.length) {
          if (this._cyclic) {
            super.get(tmpItemIdx - this.items.length);
          }
        }
        else
          super.get(tmpItemIdx);
      }
    }
    this._sideCacheOffOnce = false;
    return ret;
  }
}
