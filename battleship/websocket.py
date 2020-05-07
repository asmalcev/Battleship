from django.contrib.sessions.models import Session
from battleshipServer.models import Room

import json
import difflib

def checkDiff(prev, now):
  changes = []
  for i,s in enumerate(difflib.ndiff(prev, now)):
    if s[0]=='+':
      changes.append((s[-1], i-1))
  return changes

async def websocket_application(scope, receive, send):

  playerID = None
  playerIsHost = None
  playerField = None
  opponentField = None

  while True:
    event = await receive()

    if event['type'] == 'websocket.connect':
      await send({
        'type': 'websocket.accept'
      })

    if event['type'] == 'websocket.disconnect':
      break

    if event['type'] == 'websocket.receive':
      roomID = scope['path'].split('/')[2]

      try:
        room = Room.objects.get(pk = roomID)
      except:
        response = {'type': 'warning', 'code': 1}

        await send({
          'type': 'websocket.send',
          'text': json.dumps(response)
        })

      msg = json.loads(event['text'])

      """
      
      initial message
      
      """
      if msg['type'] == 'initial':
        playerID = msg['playerID']
        playerIsHost = str(room.hostID) == playerID
        if playerIsHost:
          playerField = room.hostField
          opponentField = room.guestField.replace('1', '0')
        else:
          opponentField = room.hostField.replace('1', '0')
          playerField = room.guestField

        response = {
          'type': 'initial',
          'playerField': playerField,
          'opponentField': opponentField
        }
        
        

        await send({
          'type': 'websocket.send',
          'text': json.dumps(response)
        })

      elif msg['type'] == 'check':
        response = {
          'type': 'check',
          'opponent': str(room.guestID) if playerIsHost else str(room.hostID)
        }

        await send({
          'type': 'websocket.send',
          'text': json.dumps(response)
        })