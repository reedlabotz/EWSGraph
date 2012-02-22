from __future__ import print_function
import paramiko
import sys
import traceback
import re
from datetime import datetime

from snapshot import Snapshot
import logger

class Machine:
  def __init__(self,id,name,url):
    self.id = id
    self.name = name
    self.url = url

    self.username = ''
    self.password = ''

    self.snapshot = None

  def set_credentials(self,username,password):
    self.username = username
    self.password = password
  
  def get_data(self):
    self.snapshot = Snapshot(self,datetime.now())

    try:
      #get an SSH clinet to communicate with the host
      client = paramiko.SSHClient()
      client.load_system_host_keys()
      client.set_missing_host_key_policy(paramiko.WarningPolicy)
      client.connect(self.url,username=self.username,password=self.password)

      logger.info("Grabbing data from %s, should take 15 seconds" % self.name)
      stdin, stdout, stderr = client.exec_command('top -b -d3 -n5')

      data = stdout.readlines()

      self.process_output(data)
      
      stdin, stdout, stderr = client.exec_command('users')
      
      data = stdout.readlines()
      
      self.process_output_users(data)

      client.close()
      logger.info("Got data from %s" % self.name)
    except Exception, e:
      logger.exception("Error in SSH on host %s" % self.name,e)
      try:
        client.close()
      except:
        pass
      return

    #do the final processing for the snapshot
    self.snapshot.calc_averages()

  def process_output(self,data):
    #grab useful data from lines
    lineCounter = -1
    for line in data:
      if(line[:5] == "top -"):
        lineCounter = 0
      if(lineCounter == 0):
        user_count = self.process_output_line0(line)
        self.snapshot.add_user_count_reading(user_count)
      if(lineCounter == 1):
        task_count = self.process_output_line1(line)
        self.snapshot.add_task_count_reading(task_count)
      if(lineCounter == 2):
        cpu_user, cpu_system = self.process_output_line2(line)
        self.snapshot.add_cpu_reading(cpu_user,cpu_system)
      if(lineCounter == 3):
        mem_used, mem_free = self.process_output_line3(line)
        self.snapshot.add_mem_reading(mem_used,mem_free)
      lineCounter+=1

  def process_output_line0(self,line):
    m = re.search(r' (\d+) users?',line)
    return int(m.group(1))

  def process_output_line1(self,line):
    m = re.search(r' (\d+) total',line)
    return int(m.group(1))

  def process_output_line2(self,line):
    m = re.search(r' (\d+.\d+)%us,[ ]*(\d+.\d+)%sy',line)
    return (float(m.group(1)),float(m.group(2)))
  
  def process_output_line3(self,line):
    m = re.search(r'(\d+)k used,[ ]*(\d+)k free',line)
    return (int(m.group(1)),int(m.group(2)))
    
  def process_output_users(self,data):
    if(len(data) > 0):
      self.snapshot.set_unique_users_count(len(set(data[0].split(' '))))
    else:
      self.snapshot.set_unique_users_count(0)
  def insert_db(self,dbcursor):
    if(self.snapshot):
      logger.info("Inserting snapshot for %s"%self.name)
      self.snapshot.insert_db(dbcursor)

  def get_id(self):
    return self.id
