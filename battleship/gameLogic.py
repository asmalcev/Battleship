

class GameLogic:
  playerField = None
  opponentField = None

  FIELD_LENGTH = 100
  FIELD_WIDTH = 10
  DID_LAST_SHOOT_DAMAGED_SHIP = False
  DID_LAST_SHOOT_KILL_SHIP = False
  LAST_KILL_SHIP_COORDS = None

  def checkDiff(self, prev, now):
    changes = []
    i = 0
    for p, n in zip(prev, now):
      if p != n:
        changes.append((n, i))
      i += 1
    return changes
  
  def checkDestroyedShip(self, field, coords, direction):
    coords += direction
    if field[coords] == "3":
      if 0 <= coords + direction < self.FIELD_LENGTH:
        nextCell = self.checkDestroyedShip(field, coords, direction)
        if nextCell != -1:
          return [coords] + nextCell
        else:
          return -1
      return [coords]
    if field[coords] == "1":
      return -1
    return []

  def getReplaceList(self, field, coords):
    replaceList = []
    if field[coords] == "3":
      self.DID_LAST_SHOOT_DAMAGED_SHIP = True
      direction = 0
      if coords - 1 >= 0 and field[coords - 1] == "3":
        direction = -1
      elif coords + 1 < self.FIELD_LENGTH and field[coords + 1] == "3":
        direction = 1
      elif coords - self.FIELD_WIDTH >= 0 and field[coords - self.FIELD_WIDTH] == "3":
        direction = -self.FIELD_WIDTH
      elif coords + self.FIELD_WIDTH < self.FIELD_LENGTH and field[coords + self.FIELD_WIDTH] == "3":
        direction = self.FIELD_WIDTH
      if direction != 0:
        listDir1 = self.checkDestroyedShip(field, coords, direction)
        listDir2 = []
        if 0 <= coords - direction < FIELD_LENGTH:
          listDir2 = self.checkDestroyedShip(field, coords, -direction)
        if listDir1 == -1 or listDir2 == -1:
          return []
        replaceList = listDir1 + listDir2
      if replaceList != -1:
        if replaceList == []:
          if all(map(lambda x: field[x] != "1",
            filter(lambda x: 0 <= x < self.FIELD_LENGTH, [coords - 1, coords + 1, coords - self.FIELD_WIDTH, coords + self.FIELD_WIDTH]))):
            replaceList = [coords]
            self.DID_LAST_SHOOT_KILL_SHIP = True
            self.LAST_KILL_SHIP_COORDS = replaceList
        else:
          replaceList += [coords]
          self.DID_LAST_SHOOT_KILL_SHIP = True
          self.LAST_KILL_SHIP_COORDS = replaceList
    return [] if replaceList == -1 else replaceList

  def makeShoot(self, field, coords):
    self.DID_LAST_SHOOT_DAMAGED_SHIP = False
    self.DID_LAST_SHOOT_KILL_SHIP = False
    self.LAST_KILL_SHIP_COORDS = None
    result = list(field)
    result[coords] = "3" if field[coords] == "1" else "2"

    for x in self.getReplaceList(result, coords):
      result[x] = "4"
    
    return "".join(result)

  def getLastKillShipCoordsLikeXY(self):
    return list(map(lambda x: {'x': x % self.FIELD_WIDTH, 'y': x // self.FIELD_WIDTH}, self.LAST_KILL_SHIP_COORDS))

  def translateXYToNumber(self, x, y):
    return int(x) + int(y) * self.FIELD_WIDTH

  def checkIfAllPlayerShipsWereKilled(self):
    return self.playerField.count('4') == 20

  def checkIfAllOpponentShipsWereKilled(self):
    return self.opponentField.count('4') == 20