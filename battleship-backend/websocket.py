from rooms             import Rooms
from gameLogic         import GameLogic
from WebSocketObserver import WebSocketObserver

import json

# PLAYERS STATUS CODES
# 0 - in menu
# 1 - in room
# 2 - filled his field
# 3 - should make step
# 4 - waiting for step
# 5 - won
# 6 - lost

# old:
  # PLAYERS STATUS CODES
  # 100 - offline
  # 200 - online
  # 300 - filled his field
  # 400 - should make step
  # 500 - won
  # 0   - lost

# room [roomID, hostID, guestID, hostField, guestField, hostStatus, guestStatus, isOpen]
#       0       1       2        3          4           5           6            7
class WebsocketApplication:

  def __init__(self, scope, receive, send):
    self.scope   = scope
    self.receive = receive
    self.send    = send

    self.roomId       = self.scope['path'].split('/')[2]
    self.playerID     = None
    self.playerIsHost = None

    self.gm = GameLogic()

    self.wsModel = WebSocketObserver()
    self.wsModel.appendListener(self, self.roomId)

    self.rooms = Rooms()

  async def notify(self):
    response = {'type': 'modelChange'}

    try:
      # room = Room.objects.get(pk = self.roomId)
      room = self.rooms.get_by_id(self.roomId)[0]
    except:
      response = {'type': 'warning', 'code': 1}

      await self.send({
        'type': 'websocket.send',
        'text': json.dumps(response)
      })
      return

    if self.playerIsHost:
      # response['opponent']      = str(room.guestID)
      # response['playerState']   = str(room.hostStatus)
      # response['opponentState'] = str(room.guestStatus)
      response['opponent']      = str(room[2]) # guestID
      response['playerState']   = str(room[5]) # hostStatus
      response['opponentState'] = str(room[6]) # guestStatus
      # if room.guestStatus == 500:
      if room[4] == 5: # guestStatus
      # guest won
        response['type']   = 'theend'
        response['result'] = 'lost'
        # room.hostStatus = 0
        self.rooms.change_host_status(self.roomId, 6) # host lost
      else: 
      # host won
        # diff = self.gm.checkDiff(self.gm.playerField, room.hostField)
        diff = self.gm.checkDiff(self.gm.playerField, list(room[3])) # hostField
        if (len(diff) != 0):
          response['diff'] = diff
          # self.gm.playerField = room.hostField
          self.gm.playerField = room[3] # hostField
    else:
      # response['opponent']      = str(room.hostID)
      # response['playerState']   = str(room.guestStatus)
      # response['opponentState'] = str(room.hostStatus)
      response['opponent']      = str(room[1]) # hostID
      response['playerState']   = str(room[6]) # guestStatus
      response['opponentState'] = str(room[5]) # hostStatus
      # if room.hostStatus == 500:
      if room[5] == 5:
      # host won
        response['type']   = 'theend'
        response['result'] = 'lost'
        # room.guestStatus = 0
        self.rooms.change_guest_status(self.roomId, 6) # guest lost
      else:
      # guest won
        # diff = self.gm.checkDiff(self.gm.playerField, room.guestField)
        diff = self.gm.checkDiff(self.gm.playerField, list(room[4])) # guestField
        if (len(diff) != 0):
          response['diff'] = diff
          # self.gm.playerField = room.guestField
          self.gm.playerField = room[4] # guestField

    await self.send({
      'type': 'websocket.send',
      'text': json.dumps(response)
    })

  async def run(self):
    while True:
      event = await self.receive()

      if event['type'] == 'websocket.connect':
        await self.send({
          'type': 'websocket.accept'
        })

      if event['type'] == 'websocket.disconnect':
        self.wsModel.removeListener(self, self.roomId)
        # try:
          # room = Room.objects.get(pk = self.roomId)
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
        # except:
          # pass
        
        break

      if event['type'] == 'websocket.receive':
        try:
          # room = Room.objects.get(pk = self.roomId)
          room = self.rooms.get_by_id(self.roomId)[0]
        except:
          response = {'type': 'warning', 'code': 1}

          await self.send({
            'type': 'websocket.send',
            'text': json.dumps(response)
          })

        # try:
        msg = json.loads(event['text'])
        # except:
          # response = {'type': 'warning', 'code': 1, 'err': 'Request should contain json'}

          # await self.send({
          #   'type': 'websocket.send',
          #   'text': json.dumps(response)
          # })

        ####################
        
        # initial response #
        
        ####################
        if msg['type'] == 'initial':
          response = {'type': 'initial'}
          self.playerID = msg['playerID']
          # self.playerIsHost = str(room.hostID) == self.playerID
          self.playerIsHost = room[1] == self.playerID # hostID
          if self.playerIsHost:
            # self.gm.playerField = room.hostField[:]
            # self.gm.opponentField = room.guestField.replace('1', '0')
            # response['opponent']      = str(room.guestID)
            # response['playerState']   = str(room.hostStatus)
            # response['opponentState'] = str(room.guestStatus)
            self.gm.playerField   = room[3][:] # hostField
            self.gm.opponentField = room[4].replace('1', '0') # guestField
            response['opponent']      = str(room[2]) # guestID
            response['playerState']   = str(room[5]) # hostStatus
            response['opponentState'] = str(room[6]) # guestStatus
          else:
            # self.gm.opponentField = room.hostField.replace('1', '0')
            # self.gm.playerField = room.guestField[:]
            # response['opponent']      = str(room.hostID)
            # response['playerState']   = str(room.guestStatus)
            # response['opponentState'] = str(room.hostStatus)
            self.gm.opponentField = room[3].replace('1', '0') # hostField
            self.gm.playerField   = room[4][:] # guestField
            response['opponent']      = str(room[1]) # hostID
            response['playerState']   = str(room[6]) # guestStatus
            response['opponentState'] = str(room[5]) # hostStatus

          response['playerField']   = self.gm.playerField
          response['opponentField'] = self.gm.opponentField

          await self.wsModel.notifyListeners(self, self.roomId)
          await self.send({
            'type': 'websocket.send',
            'text': json.dumps(response)
          })
          await self.notify()

        ##################
        
        # field response #
        
        ##################

        elif msg['type'] == 'field':
          self.gm.playerField = msg['data']
          if self.playerIsHost:
            # room.hostField = msg['data']
            # if room.guestStatus == 300:
            #   room.hostStatus = 400
            # else:
            #   room.hostStatus = 300
            self.rooms.change_host_field(self.roomId, msg['data'])
            # if guest has already filled field => host can turn else host should wait
            if room[6] == 4: # guestStatus == waiting for turn
              self.rooms.change_host_status(self.roomId, 3) # should turn
            else:
              self.rooms.change_host_status(self.roomId, 4) # waiting for turn
          else:
            # room.guestField = msg['data']
            # room.guestStatus = 300
            # if room.hostStatus == 300:
            #   room.hostStatus = 400
            self.rooms.change_guest_field(self.roomId, msg['data'])
            self.rooms.change_guest_status(self.roomId, 4) # waiting for turn
            if room[5] == 4: # hostStatus == waiting for turn
              self.rooms.change_host_status(self.roomId, 3) # should turn
          # room.save()

          response = {
            'type': 'modelChange',
            # 'opponent': str(room.guestID) if self.playerIsHost else str(room.hostID),
            # 'opponentState': str(room.guestStatus) if self.playerIsHost else str(room.hostStatus)
            'opponent'      : str(room[2]) if self.playerIsHost else str(room[1]), # guestID or hostID
            'opponentState' : str(room[6]) if self.playerIsHost else str(room[5])  # guestStatus or hostStatus
          }

          await self.wsModel.notifyListeners(self, self.roomId)
          await self.send({
            'type': 'websocket.send',
            'text': json.dumps(response)
          })

        #################
        
        # step response #
        
        #################
        
        elif msg['type'] == 'step':
          response = { 'type': 'step' }
          coords   = self.gm.translateXYToNumber(msg['data']['x'], msg['data']['y'])

          response['coords'] = [msg['data']]

          if self.playerIsHost:
            # if room.hostStatus == 400:
            if room[5] == 3: # hostStatus == should turn
              # room.guestField = self.gm.makeShoot(room.guestField, coords)
              # self.gm.opponentField = room.guestField.replace('1', '0')
              self.rooms.change_guest_field(self.roomId, self.gm.makeShoot(room[4], coords))
              room = self.rooms.get_by_id(self.roomId)[0]
              self.gm.opponentField = room[4].replace('1', '0') # guestField

              if self.gm.checkIfAllOpponentShipsWereKilled():
                # room.hostStatus    = 500
                # room.guestStatus   = 0
                self.rooms.change_host_status(self.roomId, 5)  # won
                self.rooms.change_guest_status(self.roomId, 6) # lost
                response['type']   = 'theend'
                response['result'] = 'won'
                del response['coords']
                # room.save()

                await self.wsModel.notifyListeners(self, self.roomId)
                await self.send({
                  'type': 'websocket.send',
                  'text': json.dumps(response)
                })
                continue # don't need to send response about last step
              else:
                if self.gm.DID_LAST_SHOOT_KILL_SHIP:
                  response['coords'] = self.gm.getLastKillShipCoordsLikeXY()
                if not self.gm.DID_LAST_SHOOT_DAMAGED_SHIP:
                  # room.guestStatus = 400
                  # room.hostStatus  = 300
                  self.rooms.change_guest_status(self.roomId, 3) # should turn
                  self.rooms.change_host_status(self.roomId, 4)  # waiting for turn
                # room.save()
                response['classCode'] = self.gm.opponentField[coords]

              await self.wsModel.notifyListeners(self, self.roomId)
              await self.send({
                'type': 'websocket.send',
                'text': json.dumps(response)
              })

          else:
            # if room.guestStatus == 400:
            if room[6] == 3: # guest == should turn
              # room.hostField = self.gm.makeShoot(room.hostField, coords)
              # self.gm.opponentField = room.hostField.replace('1', '0')
              self.rooms.change_host_field(self.roomId, self.gm.makeShoot(room[3], coords)) # hostField
              room = self.rooms.get_by_id(self.roomId)[0]
              self.gm.opponentField = room[3].replace('1', '0') # hostField

              if self.gm.checkIfAllOpponentShipsWereKilled():
                # room.guestStatus   = 500
                # room.hostStatus    = 0
                self.rooms.change_guest_status(self.roomId, 5) # win
                self.rooms.change_host_status(self.roomId, 6)  # lost
                response['type']   = 'theend'
                response['result'] = 'won'
                del response['coords']
                # room.save()

                await self.wsModel.notifyListeners(self, self.roomId)
                await self.send({
                  'type': 'websocket.send',
                  'text': json.dumps(response)
                })
                continue # don't need to send response about last step
              else:
                if self.gm.DID_LAST_SHOOT_KILL_SHIP:
                  response['coords'] = self.gm.getLastKillShipCoordsLikeXY()
                if not self.gm.DID_LAST_SHOOT_DAMAGED_SHIP:
                  # room.hostStatus  = 400
                  # room.guestStatus = 300
                  self.rooms.change_host_status(self.roomId, 3)  # should turn
                  self.rooms.change_guest_status(self.roomId, 4) # waiting for turn
                # room.save()
                response['classCode'] = self.gm.opponentField[coords]

              await self.wsModel.notifyListeners(self, self.roomId)
              await self.send({
                'type': 'websocket.send',
                'text': json.dumps(response)
              })
        elif msg['type'] == 'notifyOpponent':
          await self.wsModel.notifyListeners(self, self.roomId)