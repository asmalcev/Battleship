const disableGame = () => {
  document.querySelector('.fields-container').style['filter'] = 'grayscale(1)'
  document.querySelector('#wall').style['display'] = 'block'
}

const enableGame = () => {
  document.querySelector('.fields-container').style['filter'] = 'grayscale(0)'
  document.querySelector('#wall').style['display'] = 'none'
}

import {Game} from './Game.js'

const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value

const roomID = document.querySelector('[data-roomID]').value
const playerID = document.querySelector('[data-playerID]').value
let opponentID = undefined

const msg = {
  type: 'check',
}

let game = new Game()

const changeStatus = (statusIconClass, statusQualityText) => {
  const status = document.querySelector('#connection .status')
  const quality = document.querySelector('#connection .quality')

  status.classList.add(statusIconClass)
  quality.innerHTML = statusQualityText
}

const sendDeleteRequest = () => {
  let request = new Request(
    'quit',
    { headers: {'X-CSRFToken': csrftoken} }
  )

  fetch(request, {
    method: 'DELETE',
    mode: 'same-origin'
  }).then(response => {
    document.location.replace(response.url)
  })
}

const openModal = (h3Text, pText, btnText, btnClickedFunc) => {
  document.querySelector('.modal-wrapper').style['display'] = 'flex'

  document.querySelector('.modal').innerHTML = 
   `<h3>${h3Text}</h3>
    <p>${pText}</p>
    <input type="button" class="styled-btn" value="${btnText}">`
  document.querySelector('.modal input[type=button]').addEventListener('click', btnClickedFunc)
}

const closeModal = () => {
  document.querySelector('.modal-wrapper').style['display'] = 'none'
}

document.querySelector('#quit').addEventListener('click', sendDeleteRequest)

let socket = new WebSocket(`ws://${window.location.host}/game/${roomID}`)

socket.onopen = event => {
  changeStatus('ok', 'Connection established')

  const initialMSG = {
    type: 'initial',
    playerID: playerID
  }

  socket.send(JSON.stringify(initialMSG))
  socket.send(JSON.stringify(msg))
}

socket.onmessage = event => {
  // console.log(event)

  const response = JSON.parse(event.data)
  if (response.type === 'initial') {
    // response.playerField = "0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
    // response.opponentField = "0000000020000000000003000000020300000000000000000200000000000000200400000000040002000004000000000000"
    game.init(response.playerField, response.opponentField, disableGame)
    // game.init(response.playerField, response.opponentField, () => {})
  } else if (response.type === 'warning') {
    switch(response.code) {
      case 1: // room has been deleted
        changeStatus('bad', 'Connection lost')
        openModal('404',
          'Seems like host leaved the room and it has been deleted',
          'Return to lobby',
          sendDeleteRequest)
        break;
    }
  } else if (response.type == 'check') {
    if (response.opponent !== "None" && opponentID === undefined) {
      opponentID = response.opponent
      openModal('You are not alone!',
          `People in room:
            <ul>
              <li>${playerID}</li>
              <li>${opponentID}</li>
            </ul>`,
          'Ok :)',
          closeModal)
      enableGame()
    } else if (response.opponent === "None" && opponentID !== undefined) {
      opponentID = undefined
      openModal('Opponent leaved',
          '',
          'Ok :(',
          closeModal)
      disableGame()
    }
  }
}

socket.onclose = event => {
  changeStatus('bad', 'Connection lost')
  clearInterval(checker)
}

socket.onerror = error => {
  console.error(`[WebSocket error] ${error.message}`)
}

let checker = setInterval(() => {
  socket.send(JSON.stringify(msg))
}, 1000)