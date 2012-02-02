#!/usr/bin/python
from __future__ import print_function
import MySQLdb as mdb
from threading import Thread

from machine import Machine

#setup machines
machines = []
linux1 = Machine(1,'linux1','linux1.ews.illinois.edu')
linux1.set_credentials('labotz1','')
machines.append(linux1)

linux2 = Machine(2,'linux2','linux2.ews.illinois.edu')
linux2.set_credentials('labotz1','')
machines.append(linux2)

linux3 = Machine(3,'linux3','linux3.ews.illinois.edu')
linux3.set_credentials('labotz3','')
#machines.append(linux3)

linux4 = Machine(4,'linux4','linux4.ews.illinois.edu')
linux4.set_credentials('labotz1','')
#machines.append(linux4)

#setup database
dbhost = 'dcs-projects.cs.illinois.edu'
dbname = 'labotz1_EWSGraph'
dbuser = 'labotz1_databot'
dbpass = 'Me^G8eXD?=!v'


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
  dbconnection = mdb.connect(dbhost,dbuser,dbpass,dbname)
  dbcursor = dbconnection.cursor()
  
  print("Inserting into database")
  for m in machines:
    m.insert_db(dbcursor)

except mdb.Error, e:
  print("Database error")
  print(e)
finally:
  if(dbconnection):
    dbconnection.close()

