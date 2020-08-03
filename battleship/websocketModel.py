# from django.contrib.sessions.models import Session
# from battleshipServer.models import Room

class RoomData:
  def __init__(self, roomId, playerID):
    self.roomId = roomId
    self.player1 = playerID
    self.player2 = None

class WebSocketModel(object):
  listenerList = set()

  def __new__(cls):
    if not hasattr(cls, 'instance'):
      cls.instance = super(WebSocketModel, cls).__new__(cls)
    return cls.instance

  def appendListener(self, lster, roomId):
    for lst in self.listenerList:
      if lst.roomId == roomId:
        if lst.player1 == None:
          lst.player1 = lster
        else:
          lst.player2 = lster
        return
    self.listenerList.add(RoomData(roomId, lster))

  def removeListener(self, lster, roomId):
    for lst in self.listenerList:
      if lst.roomId == roomId:
        if lst.player1 == lster:
          lst.player1 = None
        else:
          lst.player2 = None
        return

  async def notifyListeners(self, lster, roomId):
    for lst in self.listenerList:
      if lst.roomId == roomId:
        if lst.player1 == lster and lst.player2 != None:
          await lst.player2.notify()
        else:
          await lst.player1.notify()