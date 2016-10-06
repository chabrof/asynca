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

  constructor(pItems :any[], pCacheBuffer :any[], sideCachesSize :number, rightSideCacheSize? :number, cyclic? :boolean)

  alloc(itemHash, bufferIdx :number) :Promise<any>

  unalloc(itemHash, bufferIdx :number) :void

  unallocStrategie(itemIdx :number) :number

  getSignedMinDistance(itemOrig :number, itemDest :number, nbItems :number, cyclic :boolean = false) :number
  sideCacheOffOnce() :void
}
