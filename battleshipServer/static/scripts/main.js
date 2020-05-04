import {Game} from './Game.js'

const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value

let game = new Game()

game.init()

document.querySelector('#quit').addEventListener('click', event => {
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
})

const roomID = document.querySelector('[data-roomID').value
let socket = new WebSocket(`wss://${window.location.host}/game/${roomID}`)

socket.onopen = event => {
  console.log('[open] WebSocket connection')
  socket.send('ready')
}

socket.onmessage = event => {
  console.log(`[message] MSG from server: ${event.data}`)
}

socket.onclose = event => {
  if (event.wasClean) {
    console.log(`[close] Connection closed`)
  } else {
    console.log('[close] Connection lost')
  }
}

socket.onerror = error => {
  console.error(`[error] ${error.message}`)
}