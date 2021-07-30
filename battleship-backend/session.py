import os
import jwt
import random
import atexit
import sqlite3
import datetime

class UserSessions(object):

  def __new__(cls):
    if not hasattr(cls, 'instance'):
      cls.instance = super(UserSessions, cls).__new__(cls)
    return cls.instance


  def __init__(self):
    self.db_name    = os.environ['DB_NAME']
    self.table_name = os.environ['SESSION_TABLE_NAME']

    self.con = sqlite3.connect(self.db_name)
    self.cur = self.con.cursor()

    atexit.register(self.cleanup)


  def cleanup(self):
    self.con.close()


  def register_new(self):
    id         = random.randint(1000000, 1000000000)
    jwt_string = jwt.encode({
      "id" : id,
      "exp": datetime.datetime.utcnow() + datetime.timedelta(days=int(os.environ['JWT_EXPIRE_DAYS']))
    }, os.environ['PRIVATE_KEY'], algorithm="HS256")

    success_insert = False

    while not success_insert:
      try:
        self.cur.execute('INSERT INTO %s (ID, JWT) values (%s, "%s")' % (self.table_name, id, jwt_string))
        self.con.commit()
        success_insert = True
      except sqlite3.IntegrityError:
        id = random.randint(1000000, 1000000000)

    return [id, jwt_string, None]


  def get_all(self):
    self.cur.execute('SELECT * FROM %s' % self.table_name)
    return self.cur.fetchall()


  def decode_jwt(self, jwt_string):
    try:
      decoded_json = jwt.decode(jwt_string, os.environ['PRIVATE_KEY'], algorithms=["HS256"])
      return decoded_json
    except:
      return None


  def find_user(self, id):
    self.cur.execute('SELECT * FROM %s WHERE ID = %s' % (self.table_name, id))
    return self.cur.fetchone()


  def find_user_by_jwt(self, jwt_string):
    decoded_json = self.decode_jwt(jwt_string)
    if decoded_json == None:
      return None

    return self.find_user(decoded_json['id'])

  def update_room(self, user_id, room_id):
    self.cur.execute('UPDATE %s SET roomID = %s WHERE ID = %s' % (self.table_name, room_id, user_id))
    self.con.commit()
