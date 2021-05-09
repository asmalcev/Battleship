import os
import sqlite3

from dotenv import load_dotenv

load_dotenv('../.env')

db_name            = os.environ['DB_NAME']
session_table_name = os.environ['SESSION_TABLE_NAME']

con = sqlite3.connect(db_name)
cur = con.cursor()

cur.execute('CREATE TABLE %s (ID int PRIMARY KEY, JWT varchar(255) NOT NULL)' % session_table_name)
con.commit()

con.close()