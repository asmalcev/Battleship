export class GameLog {
  constructor(selector) {
    this.container = document.querySelector(selector)
    this.length = 0
  }

  add = (text) => {
    if (this.length > 2) {
      this.container.childNodes[0].remove()
    }
    let log = document.createElement('div')
    let btn = document.createElement('button')
    btn.addEventListener('click', e => {
      e.target.parentNode.remove()
    })
    log.classList.add('log')
    log.innerHTML = `<p>${text}</p>`
    log.appendChild(btn)

    this.container.appendChild(log)
    this.length++
  }
} 