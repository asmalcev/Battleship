export const config = {
  userStates: {
    inMenu         : 0,
    inRoom         : 1,
    readyToPlay    : 2,
    turnToGo       : 3,
    waitingForTurn : 4,
    won            : 5,
    lost           : 6,
  },
  gameStates: {
    notStarted : 0,
    started    : 1
  },
  battleshipServer: {
    host: window.location.hostname + ':8000'
  }
};

export const theme = {
  light: {
    'main-color':            '#fff',
    'secondary-color':       '#091540',
    'logs-background-color': '#fff',
    'error-color':           '#e53935',
    'shadow-color':          '#0004',
    'brightness':            1,
    'field-color':           '#3D518C',
  },
  dark: {
    'main-color':            '#091540',
    'secondary-color':       '#fff',
    'logs-background-color': '#fff',
    'error-color':           '#e53935',
    'shadow-color':          '#0004',
    'brightness':            1,
    'field-color':           '#3D518C',
  }
};
