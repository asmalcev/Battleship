import os
import random
import atexit
import sqlite3
import datetime

EMPTY_FIELD = 100 * '0'

class Rooms(object):

  def __new__(cls):
    if not hasattr(cls, 'instance'):
      cls.instance = super(Rooms, cls).__new__(cls)
    return cls.instance

  def __init__(self):
    self.db_name    = os.environ['DB_NAME']
    self.table_name = os.environ['ROOMS_TABLE_NAME']

    self.con = sqlite3.connect(self.db_name)
    self.cur = self.con.cursor()

    atexit.register(self.cleanup)


  def cleanup(self):
    self.con.close()

  def get_all(self):
    self.cur.execute('SELECT * FROM %s' % self.table_name)
    return self.cur.fetchall()

  def get_all_opened(self):
    self.cur.execute('SELECT * FROM %s WHERE isOpen = 1' % self.table_name)
    return self.cur.fetchall()

  def create(self, host_id):
    id = random.randint(1000000, 1000000000)

    success_insert = False

    while not success_insert:
      try:
        self.cur.execute(
          'INSERT INTO %s (roomID, hostID, hostField, guestField, isOpen) values (%s, %s, "%s", "%s", %s)'
            % (self.table_name, id, host_id, EMPTY_FIELD, EMPTY_FIELD, 1)
        )
        self.con.commit()
        success_insert = True
      except sqlite3.IntegrityError:
        id = random.randint(1000000, 1000000000)

    return id