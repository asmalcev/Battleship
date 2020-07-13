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
let opponentState = undefined

let socketMSG = {type: 'check'}

let game = new Game()

const changeStatus = (statusIconClass, statusQualityText) => {
  const status = document.querySelector('#connection .status')
  const quality = document.querySelector('#connection .quality')

  status.classList.add(statusIconClass)
  quality.innerHTML = statusQualityText
}

const changeOpponentState = status => {
  opponentState = status
  document.querySelector('#opponent-state span')
    .innerHTML = status
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

const gameStart = field => {
  socketMSG = {
    type: 'field',
    data: field
  }
}

const makeStep = data => {
  socketMSG = {
    type: 'step',
    data: {x: data.x, y: data.y} 
  }
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
  socket.send(JSON.stringify(socketMSG))
}

socket.onmessage = event => {
  const response = JSON.parse(event.data)
  if (response.type === 'initial') {
    game.init(
      response.playerField,
      response.opponentField,
      gameStart,
      disableGame,
      makeStep
    )
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
          `Also in room: ${opponentID}`,
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
    changeOpponentState(response.opponentState === "100" ? "offline" : "online")
    if (response.diff !== undefined) {
      response.diff.forEach(diffCell => {
        console.log(diffCell)
        game.changeCellClass(+diffCell[1] % 10, Math.floor(+diffCell[1] / 10), +diffCell[0])
      })
    }
  } else if (response.type == 'step') {
    response.coords.forEach(coord => {
      game.changeEnemyCellClass(+coord.x, +coord.y, +response.classCode)
    })
    game.checkField()
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
  socket.send(JSON.stringify(socketMSG))
  if (socketMSG.type !== 'check') {
    socketMSG = {type: 'check'}
  }
}, 1000)