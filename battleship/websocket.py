from django.contrib.sessions.models import Session
from battleshipServer.models import Room

from battleship.gameLogic import GameLogic

import json

async def websocket_application(scope, receive, send):

  roomID = scope['path'].split('/')[2]
  playerID = None
  playerIsHost = None

  gm = GameLogic()

  # STATUS CODES
  # 100 - offline
  # 200 - online
  # 300 - filled his field
  # 400 - should make step
  # 500 - won
  # 0   - lost

  while True:
    event = await receive()

    if event['type'] == 'websocket.connect':
      await send({
        'type': 'websocket.accept'
      })

    if event['type'] == 'websocket.disconnect':
      try:
        room = Room.objects.get(pk = roomID)
        # if playerIsHost:
        #   if room.hostStatus == 300 or room.hostStatus == 400:
        #     room.delete()
        #   else:
        #     room.hostStatus = 100
        #     room.save()
        # else:
        #   if room.guestStatus == 300 or room.guestStatus == 400:
        #     room.delete()
        #   else:
        #     room.guestStatus = 100
        #     room.save()
      except:
        pass
      
      break

    if event['type'] == 'websocket.receive':
      try:
        room = Room.objects.get(pk = roomID)
      except:
        response = {'type': 'warning', 'code': 1}

        await send({
          'type': 'websocket.send',
          'text': json.dumps(response)
        })

      msg = json.loads(event['text'])

      ####################
      
      # initial response #
      
      ####################
      if msg['type'] == 'initial':
        playerID = msg['playerID']
        playerIsHost = str(room.hostID) == playerID
        if playerIsHost:
          gm.playerField = room.hostField[:]
          gm.opponentField = room.guestField.replace('1', '0')
        else:
          gm.opponentField = room.hostField.replace('1', '0')
          gm.playerField = room.guestField[:]

        response = {
          'type': 'initial',
          'playerField': gm.playerField,
          'opponentField': gm.opponentField
        }

        await send({
          'type': 'websocket.send',
          'text': json.dumps(response)
        })

      ##################
      
      # check response #
      
      ##################

      elif msg['type'] == 'check':
        response = {'type': 'check'}

        if playerIsHost:
          response['opponent']      = str(room.guestID)
          response['playerState']   = str(room.hostStatus)
          response['opponentState'] = str(room.guestStatus)
          if room.guestStatus == 500:
            response['type']   = 'theend'
            response['result'] = 'lost'
            room.hostStatus = 0

          else:
            diff = gm.checkDiff(gm.playerField, room.hostField)
            if (len(diff) != 0):
              response['diff'] = diff
              gm.playerField = room.hostField
        else:
          response['opponent']      = str(room.hostID)
          response['playerState']   = str(room.guestStatus)
          response['opponentState'] = str(room.hostStatus)
          if room.hostStatus == 500:
            response['type']   = 'theend'
            response['result'] = 'lost'
            room.guestStatus = 0

          else:
            diff = gm.checkDiff(gm.playerField, room.guestField)
            if (len(diff) != 0):
              response['diff'] = diff
              gm.playerField = room.guestField

        await send({
          'type': 'websocket.send',
          'text': json.dumps(response)
        })

      ##################
      
      # field response #
      
      ##################

      elif msg['type'] == 'field':
        gm.playerField = msg['data']
        if playerIsHost:
          room.hostField = msg['data']
          if room.guestStatus == 300:
            room.hostStatus = 400
          else:
            room.hostStatus = 300
        else:
          room.guestField = msg['data']
          room.guestStatus = 300
          if room.hostStatus == 300:
            room.hostStatus = 400
        room.save()


        response = {
          'type': 'check',
          'opponent': str(room.guestID) if playerIsHost else str(room.hostID),
          'opponentState': str(room.guestStatus) if playerIsHost else str(room.hostStatus)
        }

        await send({
          'type': 'websocket.send',
          'text': json.dumps(response)
        })

      #################
      
      # step response #
      
      #################
      
      elif msg['type'] == 'step':
        response = { 'type': 'step' }
        coords = gm.translateXYToNumber(msg['data']['x'], msg['data']['y'])
        response['coords'] = [msg['data']]

        if playerIsHost:
          if room.hostStatus == 400:
            room.guestField = gm.makeShoot(room.guestField, coords)
            gm.opponentField = room.guestField.replace('1', '0')

            if gm.checkIfAllOpponentShipsWereKilled():
              room.hostStatus    = 500
              room.guestStatus   = 0
              response['type']   = 'theend'
              response['result'] = 'won'
              del response['coords']
              room.save()

              await send({
                'type': 'websocket.send',
                'text': json.dumps(response)
              })
              continue # don't need to send response about last step
            else:
              if gm.DID_LAST_SHOOT_KILL_SHIP:
                response['coords'] = gm.getLastKillShipCoordsLikeXY()
              if not gm.DID_LAST_SHOOT_DAMAGED_SHIP:
                room.guestStatus = 400
                room.hostStatus  = 300
              room.save()
              response['classCode'] = gm.opponentField[coords]

            await send({
              'type': 'websocket.send',
              'text': json.dumps(response)
            })

        else:
          if room.guestStatus == 400:
            room.hostField = gm.makeShoot(room.hostField, coords)
            gm.opponentField = room.hostField.replace('1', '0')

            if gm.checkIfAllOpponentShipsWereKilled():
              room.guestStatus   = 500
              room.hostStatus    = 0
              response['type']   = 'theend'
              response['result'] = 'won'
              del response['coords']
              room.save()

              await send({
                'type': 'websocket.send',
                'text': json.dumps(response)
              })
              continue # don't need to send response about last step
            else:
              if gm.DID_LAST_SHOOT_KILL_SHIP:
                response['coords'] = gm.getLastKillShipCoordsLikeXY()
              if not gm.DID_LAST_SHOOT_DAMAGED_SHIP:
                room.hostStatus  = 400
                room.guestStatus = 300
              room.save()
              response['classCode'] = gm.opponentField[coords]

            await send({
              'type': 'websocket.send',
              'text': json.dumps(response)
            })