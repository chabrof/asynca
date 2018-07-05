import { SidePrefetch } from "../src/SidePrefetch"

let containerDomElt // the container div
let cacheViewDomElt // this div to view the cache in action
let nbLines = 10
let nbColumns = 10
let divItems = [] // the items intended to be displayed in the container

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

let columns = []
let lines = []

for (let idxV = 0; idxV < nbLines; idxV++) {
  let curLine = []
  for (let idxH = 0; idxH < nbColumns; idxH++) {
    columns[idxH] = columns[idxH] || []
    let item = _createItem(idxH + ',' + idxV)
    console.log('item', item)
    curLine.push(item)
    columns[idxH].push(item)
  }
  lines.push(curLine)
}

console.log('columns', columns)
console.log('lines', lines)

let nbSimulatedRessources = 4
let simulatedRessources = []
let cache = new Array(nbSimulatedRessources) // Cache with 5 free spaces (5 ressources of computing)

/**
 * Create our implementation of SidePrefetch class
 */
class TestSidePrefeth extends SidePrefetch {

  alloc (itemIdx) {
    let divItem = divItems[itemIdx]
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
    let divItem = divItems[itemIdx]
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

let asyncaTest = new TestSidePrefeth(divItems, cache, 1, 2) // AsyncaTest class instance


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
    divItems.push(item)
    containerDomElt.appendChild(asyncaTest.get(idxToAdd))
  }
}

function init () {
  containerDomElt = document.getElementById('container')
  cacheViewDomElt = document.getElementById('cacheView')

  document.getElementById('btnAdd').addEventListener('click', _add3Items)

  divItems.forEach((item, idx) => containerDomElt.appendChild(asyncaTest.get(idx)))
}

window.addEventListener('load', init)
