from django.contrib.sessions.models import Session
from battleshipServer.models import Room

from battleship.gameLogic import GameLogic

import json

  # PLAYERS STATUS CODES
  # 100 - offline
  # 200 - online
  # 300 - filled his field
  # 400 - should make step
  # 500 - won
  # 0   - lost

class WebsocketApplication:

  def __init__(self, scope, receive, send):
    self.scope = scope
    self.receive = receive
    self.send = send

    self.roomId = self.scope['path'].split('/')[2]
    self.playerID = None
    self.playerIsHost = None

    self.gm = GameLogic()

  async def run(self):
    while True:
      event = await self.receive()

      if event['type'] == 'websocket.connect':
        await self.send({
          'type': 'websocket.accept'
        })

      if event['type'] == 'websocket.disconnect':
        try:
          room = Room.objects.get(pk = self.roomId)
          # if self.playerIsHost:
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
          room = Room.objects.get(pk = self.roomId)
        except:
          response = {'type': 'warning', 'code': 1}

          await self.send({
            'type': 'websocket.send',
            'text': json.dumps(response)
          })

        msg = json.loads(event['text'])

        ####################
        
        # initial response #
        
        ####################
        if msg['type'] == 'initial':
          self.playerID = msg['playerID']
          self.playerIsHost = str(room.hostID) == self.playerID
          if self.playerIsHost:
            self.gm.playerField = room.hostField[:]
            self.gm.opponentField = room.guestField.replace('1', '0')
          else:
            self.gm.opponentField = room.hostField.replace('1', '0')
            self.gm.playerField = room.guestField[:]

          response = {
            'type': 'initial',
            'playerField': self.gm.playerField,
            'opponentField': self.gm.opponentField
          }

          await self.send({
            'type': 'websocket.send',
            'text': json.dumps(response)
          })

        ##################
        
        # check response #
        
        ##################

        elif msg['type'] == 'check':
          response = {'type': 'check'}

          if self.playerIsHost:
            response['opponent']      = str(room.guestID)
            response['playerState']   = str(room.hostStatus)
            response['opponentState'] = str(room.guestStatus)
            if room.guestStatus == 500:
              response['type']   = 'theend'
              response['result'] = 'lost'
              room.hostStatus = 0

            else:
              diff = self.gm.checkDiff(self.gm.playerField, room.hostField)
              if (len(diff) != 0):
                response['diff'] = diff
                self.gm.playerField = room.hostField
          else:
            response['opponent']      = str(room.hostID)
            response['playerState']   = str(room.guestStatus)
            response['opponentState'] = str(room.hostStatus)
            if room.hostStatus == 500:
              response['type']   = 'theend'
              response['result'] = 'lost'
              room.guestStatus = 0

            else:
              diff = self.gm.checkDiff(self.gm.playerField, room.guestField)
              if (len(diff) != 0):
                response['diff'] = diff
                self.gm.playerField = room.guestField

          await self.send({
            'type': 'websocket.send',
            'text': json.dumps(response)
          })

        ##################
        
        # field response #
        
        ##################

        elif msg['type'] == 'field':
          self.gm.playerField = msg['data']
          if self.playerIsHost:
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
            'opponent': str(room.guestID) if self.playerIsHost else str(room.hostID),
            'opponentState': str(room.guestStatus) if self.playerIsHost else str(room.hostStatus)
          }

          await self.send({
            'type': 'websocket.send',
            'text': json.dumps(response)
          })

        #################
        
        # step response #
        
        #################
        
        elif msg['type'] == 'step':
          response = { 'type': 'step' }
          coords = self.gm.translateXYToNumber(msg['data']['x'], msg['data']['y'])
          response['coords'] = [msg['data']]

          if self.playerIsHost:
            if room.hostStatus == 400:
              room.guestField = self.gm.makeShoot(room.guestField, coords)
              self.gm.opponentField = room.guestField.replace('1', '0')

              if self.gm.checkIfAllOpponentShipsWereKilled():
                room.hostStatus    = 500
                room.guestStatus   = 0
                response['type']   = 'theend'
                response['result'] = 'won'
                del response['coords']
                room.save()

                await self.send({
                  'type': 'websocket.send',
                  'text': json.dumps(response)
                })
                continue # don't need to self.send response about last step
              else:
                if self.gm.DID_LAST_SHOOT_KILL_SHIP:
                  response['coords'] = self.gm.getLastKillShipCoordsLikeXY()
                if not self.gm.DID_LAST_SHOOT_DAMAGED_SHIP:
                  room.guestStatus = 400
                  room.hostStatus  = 300
                room.save()
                response['classCode'] = self.gm.opponentField[coords]

              await self.send({
                'type': 'websocket.send',
                'text': json.dumps(response)
              })

          else:
            if room.guestStatus == 400:
              room.hostField = self.gm.makeShoot(room.hostField, coords)
              self.gm.opponentField = room.hostField.replace('1', '0')

              if self.gm.checkIfAllOpponentShipsWereKilled():
                room.guestStatus   = 500
                room.hostStatus    = 0
                response['type']   = 'theend'
                response['result'] = 'won'
                del response['coords']
                room.save()

                await self.send({
                  'type': 'websocket.send',
                  'text': json.dumps(response)
                })
                continue # don't need to self.send response about last step
              else:
                if self.gm.DID_LAST_SHOOT_KILL_SHIP:
                  response['coords'] = self.gm.getLastKillShipCoordsLikeXY()
                if not self.gm.DID_LAST_SHOOT_DAMAGED_SHIP:
                  room.hostStatus  = 400
                  room.guestStatus = 300
                room.save()
                response['classCode'] = self.gm.opponentField[coords]

              await self.send({
                'type': 'websocket.send',
                'text': json.dumps(response)
              })