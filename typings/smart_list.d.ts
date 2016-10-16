declare class Sgj_SideSmartList {
  _nbItemsInLeftSideCache   :number
  _nbItemsInRightSideCache  :number
  _curItemIdx               :number
  _nbItems                  :number
  _cyclic                   :boolean
  _sideCacheOffOnce         :boolean
  _lastIndentation          :boolean
  items                     :any[]
  cache                     :any[]
  _prefetchingOn            :boolean
  constructor(pItems :any[], pCacheBuffer :any[], sideCachesSize :number, rightSideCacheSize? :number, cyclic? :boolean)

  alloc(itemIdx :number, bufferIdx :number) :Promise<any>

  unalloc(itemIdx :number, bufferIdx :number) :void

  unallocStrategie(itemIdx :number) :number
  prefetchingOn() :void
  prefetchingOff() :void
  getSignedMinDistance(itemOrig :number, itemDest :number, nbItems :number, cyclic? :boolean) :number
  sideCacheOffOnce() :void
  get(itemIdx :number) : Promise<any>
}

interface Sgj_SideSmartList {
  new(pItems :any[], pCacheBuffer :any[], sideCachesSize :number, rightSideCacheSize? :number, cyclic? :boolean) :Sgj_SideSmartList
}
