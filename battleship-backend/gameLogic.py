class GameLogic:
  playerField   = None
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

  def checkCellsConsistent(self, coord1, coord2):
    if abs(coord1 - coord2) == 1:
      return coord1 // self.FIELD_WIDTH == coord2 // self.FIELD_WIDTH
    return True

  def checkDestroyedShip(self, field, coords, direction):
    coords += direction
    if field[coords] == "3":
      if 0 <= coords + direction < self.FIELD_LENGTH \
        and self.checkCellsConsistent(coords, coords + direction):
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

    if field[coords] == '3':
      self.DID_LAST_SHOOT_DAMAGED_SHIP = True
      direction = 0
      notLeftBoundaryIndex = coords % self.FIELD_WIDTH != 0
      notRightBoundaryIndex = coords % self.FIELD_WIDTH != 9

      checkList = [coords - self.FIELD_WIDTH, coords + self.FIELD_WIDTH]

      if notLeftBoundaryIndex: checkList.append(coords - 1)
      if notRightBoundaryIndex: checkList.append(coords + 1)

      checkList = list(filter(lambda coord: 0 <= coord < self.FIELD_LENGTH, checkList))

      for ch in checkList:
        if field[ch] == '3':
          direction = ch - coords

      if direction != 0:
        dirList1 = []
        dirList2 = []

        dirList1 = self.checkDestroyedShip(field, coords, direction)
        dirList2 = []

        if 0 <= coords - direction < self.FIELD_LENGTH \
          and self.checkCellsConsistent(coords, coords - direction):
          dirList2 = self.checkDestroyedShip(field, coords, -direction)

        if dirList1 == -1 or dirList2 == -1:
          return []
        replaceList = dirList1 + dirList2

      if replaceList == []:
        if all(map(lambda x: field[x] != "1", checkList)):
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