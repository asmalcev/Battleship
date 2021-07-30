import os
import sqlite3

from dotenv import load_dotenv

load_dotenv('.env')

try:
  os.remove(os.environ['DB_NAME'])
except:
  pass

db_name            = os.environ['DB_NAME']
rooms_table_name   = os.environ['ROOMS_TABLE_NAME']
session_table_name = os.environ['SESSION_TABLE_NAME']

con = sqlite3.connect(db_name)
cur = con.cursor()

cur.execute('CREATE TABLE %s (ID int PRIMARY KEY, JWT varchar(255) NOT NULL, roomID DECIMAL(10,0))' % session_table_name)
cur.execute('CREATE TABLE %s (roomID DECIMAL(10,0) PRIMARY KEY, hostID DECIMAL(10,0) NOT NULL, guestID DECIMAL(10,0), hostField varchar(255)  NOT NULL, guestField varchar(255) NOT NULL, hostStatus SMALLINT, guestStatus SMALLINT, isOpen boolean NOT NULL)' % rooms_table_name)
con.commit()

con.close()
