const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value

document.querySelectorAll('.tablinks').forEach(tab => tab.addEventListener('click', event => {
  let tabcontent = document.querySelectorAll('.tabcontent')
  let tablinks = document.querySelectorAll('.tablinks')

  tabcontent.forEach(content => content.style.display = 'none')
  
  tablinks.forEach(link => link.classList.remove('active'))
  
  document.querySelector(`#${event.target.dataset.target}`).style.display = 'block'
  event.currentTarget.classList.add('active')
}))

document.querySelector('[data-openDefault]').click()

const errMSG = document.querySelector('#errMSG')
document.querySelector('#search-field').addEventListener('keyup', event => {
  const searchField = event.target
  if (searchField.value.search(/[^\d]/) != -1) {
    searchField.style['border-color'] = '#e53935'
    errMSG.style['display'] = 'block'
  } else {
    searchField.style['border-color'] = '#091540'
    errMSG.style['display'] = 'none'
  }
})

document.querySelector('#search-form').addEventListener('submit', event => {
  event.preventDefault()
  const value = event.path[0][0].value
  if (value.trim().length != 0 && value.search(/[^\d]/) == -1) {
    let request = new Request(
      'search',
      { headers: {'X-CSRFToken': csrftoken} }
    )

    fetch(request, {
      method: 'PUT',
      mode: 'same-origin',
      body: value
    }).then(response => {
      if (response.status === 404) {
        const modalMSG = document.querySelector('.modal p')
        modalMSG.innerHTML = `Room with ID [${value}] was NOT FOUND`
        toggleModalWindow()
      } else if (response.redirected) {
        document.location.replace(response.url)
      }
    })
  }
})

document.querySelector('#create-form').addEventListener('submit', async event => {
  event.preventDefault()
  let request = new Request(
    'create',
    { headers: {'X-CSRFToken': csrftoken} }
  )

  fetch(request, {
    method: 'POST',
    mode: 'same-origin'
  }).then(response => {
    document.location.replace(response.url)
  })
})

let modalWindowOpen = false
const toggleModalWindow = () => {
  const modalWrapper = document.querySelector('.modal-wrapper')
  if (modalWindowOpen) {
    modalWrapper.style['display'] = 'none'
  } else {
    modalWrapper.style['display'] = 'flex'
  }
  modalWindowOpen = !modalWindowOpen
}

document.querySelector('.modal input[type=button]').addEventListener('click', toggleModalWindow)