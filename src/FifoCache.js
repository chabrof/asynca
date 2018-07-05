import { Abstract } from "./Abstract"

export class FifoCache extends Abstract {

  /**
   * Defines the strategy for unallocate item in cache
   * We implement a very very hard to understand complex strategy
   *   => we choose to unallocate the oldest computed item (first item idx in the history : 0)
   * [itemIdx] is the index of the item
   * @return {number} index in the [_history]
   */
  unallocStrategie (itemIdx) {
    return 0
  }
}
