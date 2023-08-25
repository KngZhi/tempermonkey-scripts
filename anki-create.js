// ==UserScript==
// @name         Anki Card Creator
// @namespace    http://tampermonkey.net/
// @description     Create Card directly from Translation
// @version         3.0
// @author          Junwei Chen
// @author       Joshua Seckler
// @match        https://www.netflix.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tampermonkey.net
// @grant         GM.xmlHttpRequest
// @run-at       document-idle
// @license MIT
// ==/UserScript==

;(function () {
  'use strict'
  const localKey = 'anki_list'
  function sendToAnki() {
    const createNote = (front, back) => ({
      deckName: 'test',
      modelName: 'keypoint',
      fields: {
        front: front,
        back: back,
      },
      tags: ['webbrowser'],
    })
    const data = {
      action: 'addNotes',
      version: 6,
      params: { notes: [] },
    }
    let list = localStorage.getItem(localKey)
    if (list) {
      const cards = JSON.parse(list)
      if (Array.isArray(cards)) {
        const notes = cards.map((item) =>
          createNote(item[0], item[1])
        )
        data.params.notes = notes
      }
    }
    GM.xmlHttpRequest({
      method: 'POST',
      url: 'http://localhost:8765',
      data: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
      onload: function (response) {
        console.log('Anki Response:', response.responseText)
      },
      onerror: function (response) {
        console.error('Anki Is Not runing')
      },
    })
  }

  //wait for things to be setup
  window.addEventListener(
    'load',
    function () {
      document.addEventListener(
        'keyup',
        function doc_keyUp(e) {
          if (e.key === 'A') {
            const lln_subs = document.getElementById('lln-subs')
            const lln_translation = document.getElementById('lln-translations')
            const hoverTooltip = document.querySelector('span.tt.hoverable')
            const hoverSpan = document.querySelector('#lln-subs > span:hover')
            if (hoverTooltip) {
              hoverTooltip.parentNode.removeChild(hoverTooltip)
            }
            if (hoverSpan) {
              const content = hoverSpan.textContent.replace(/\./g, '')
              const wrapper = `<a ${encodeURI(
                `href="dict://${content}"`
              )}><u>${content}</u></a>`
              hoverSpan.textContent = wrapper
            }

            const item = [lln_subs.innerText, lln_translation.innerText]
            console.log(item)
            if (item.includes('') || item.includes(undefined)) {
              return
            }
            let localList = localStorage.getItem(localKey)
            if (localList && Array.isArray(JSON.parse(localList))) {
              let list = JSON.parse(localList)
              list.push(item)
              localStorage.setItem(localKey, JSON.stringify(list))
            } else {
              localStorage.setItem(localKey, JSON.stringify([item]))
            }
          }
          if (e.key === 'N') {
            sendToAnki()
            localStorage.setItem(localKey, '')
          }
        },
        false
      )
    },
    false
  )
})()

