#!/usr/bin/python
from __future__ import print_function
import MySQLdb as mdb
from threading import Thread

from machine import Machine
import logger
import settings

machines = []
for mData in settings.MACHINES:
   m = Machine(mData['ID'],mData['NAME'],mData['URL'])
   m.set_credentials(mData['USERNAME'],mData['PASSWORD'])
   machines.append(m)

#get the data from the machines
threads = []
for m in machines:
  t = Thread(target=m.get_data)
  t.start()
  threads += [t]

for t in threads:
  t.join()

#save the data to the db
dbconnection = None

try:
  dbconnection = mdb.connect(settings.DATABASE['HOST'],
                             settings.DATABASE['USERNAME'],
                             settings.DATABASE['PASSWORD'],
                             settings.DATABASE['NAME'])
  dbcursor = dbconnection.cursor()
  
  logger.info("Inserting into database")
  for m in machines:
    m.insert_db(dbcursor)

except mdb.Error, e:
  logger.exception("Database error",e)
finally:
  if(dbconnection):
    dbconnection.close()

logger.emailLog()
