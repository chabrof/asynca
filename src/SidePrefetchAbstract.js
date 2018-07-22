import { FifoCache } from "./FifoCache"

export class SidePrefetchAbstract extends FifoCache {

  /**
   * Get distance between items
   * distance > 0 distance to the right
   * distance < 0 distance to the left
   */
  getSignedMinDistance (itemOrigIdx, itemDestIdx, nbItems, cyclic = false) {
    let distance = itemDestIdx - itemOrigIdx

    if (cyclic) {
      if (distance > 0) {
        // We found a "left distance" ..accross 0 index
        if (nbItems - distance < distance) return -(nbItems - distance)
      } else {
        // We found a "right distance" ..accross last index
        if ((nbItems + distance) < -distance) return (nbItems + distance)
      }
    }

    return distance
  }
}
