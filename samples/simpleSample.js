import { SidePrefetch } from "../src/SidePrefetch"

let containerDomElt // the container div
let cacheViewDomElt // this div to view the cache in action
let nbItems = 14

let nbSimulatedRessources = 4
let simulatedRessources = []
let cache = new Array(nbSimulatedRessources) // Cache with 5 free spaces (5 ressources of computing)

/**
 * Create our implementation of SidePrefetch class
 */
class TestSidePrefeth extends SidePrefetch {

  alloc (itemIdx) {
    let divItem = this._items[itemIdx]
    divItem.toBeComputed = true
    if (simulatedRessources.length > nbSimulatedRessources - 1) {
      simulatedRessources.shift()
    }
    let upperResolve

    let promise = new Promise((resolve, reject) => { upperResolve = resolve })
    console.info(`Alloc called for ${itemIdx}`, divItem)
    simulatedRessources.push(window.setTimeout(
      () => {
        if (!divItem.toBeComputed) return upperResolve() // ==>

        divItem.style.backgroundColor = "darkGreen"
        divItem.innerHTML = `item <b>${itemIdx}<br>:)</b>`
        console.info(`Alloc Finished ! : ${itemIdx}`)
        upperResolve()
      }, 300))
    return promise
  }

  free (itemIdx) {
    let divItem = this._items[itemIdx]
    divItem.toBeComputed = false
    console.info(`Free called for ${itemIdx}`)
    let async =
      (resolve, reject) => {
        window.setTimeout(
          () => {
            if (divItem.toBeComputed) return resolve()// ==>
            console.info(`Free Finished ! : ${itemIdx}`)
            divItem.style.backgroundColor = "darkRed"
            divItem.innerHTML = `item <b>${itemIdx}<br/>:(</b>`
            resolve()
          }, 100)
      }
    return new Promise(async)
  }
}

function _createItem (idx) {
  let item = document.createElement('div')
  item.setAttribute('id', `div_${idx}`)
  item.setAttribute('class', `item`)
  item.setAttribute('data-idx', idx)
  item.style.backgroundColor = "darkGrey"
  item.addEventListener('mouseover', mouseOverItem)
  item.innerHTML = `item <b>${idx}<br/>:|</b>`
  return item
}


let asyncaTest = new TestSidePrefeth()
  .cache(cache)
  .leftPrefetchSideSize(1)
  .rightPrefetchSideSize(2)

for (let idx = 0; idx < nbItems; idx++) {
  let item = _createItem(idx)
  console.log('item', item)
  asyncaTest.push(item)
}

console.log('Asyncatest', asyncaTest)

function mouseOverItem (e) {
  let domElem = e.target
  while (domElem.getAttribute('data-idx') === null) {
    domElem = domElem.parentNode
  }
  let itemIdxToGet = domElem.getAttribute('data-idx') * 1
  asyncaTest.get(itemIdxToGet)
  _displayCache()
}


function _displayCache () {
  cacheViewDomElt.innerHTML = cache.reduce((acc, divItem) => acc.concat((divItem ? divItem.getAttribute('data-idx') : '--') + ' '), 'Items in cache : ')
}

function _add3Items () {
  for (let ct = 0; ct < 3; ct++) {
    nbItems++
    let idxToAdd = nbItems - 1
    let item = _createItem(idxToAdd)
    asyncaTest.push(item)
    containerDomElt.appendChild(asyncaTest.get(idxToAdd))
  }
}

function init () {
  containerDomElt = document.getElementById('container')
  cacheViewDomElt = document.getElementById('cacheView')

  document.getElementById('btnAdd').addEventListener('click', _add3Items)

  asyncaTest.forEach((item, idx) => containerDomElt.appendChild(asyncaTest.get(idx)))
}

window.addEventListener('load', init)
