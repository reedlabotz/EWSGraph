from __future__ import print_function

import logger
import md5
import json

SECRET_KEY = "Zw6n2zedQx87FtRrsluuHhot04XQrX4r"

def average_mid(counts):
  #get an average ignoring the biggest and smallest
  if(len(counts) > 2):
    counts.sort()
    return sum(counts[1:-1])/(len(counts)-2)
  elif(len(counts) >0):
    return sum(counts)/len(counts)
  else:
    return 0

class Snapshot:
  def __init__(self,machine,time):
    self.machine = machine
    self.time = time
    
    #init the arrays for data
    self.cpu_user = []
    self.cpu_system = []
    self.mem_used = []
    self.mem_free = []
    self.user_count = []
    self.task_count = []
    
    #init avgs
    self.cpu_user_avg = -1
    self.cpu_system_avg = -1
    self.mem_used_avg = -1
    self.mem_free_avg = -1
    self.user_count_avg = -1
    self.task_count_avg = -1
    
    self.unique_user_count = -1
    self.users = ""

  def add_cpu_reading(self,cpu_user,cpu_system):
    self.cpu_user.append(cpu_user)
    self.cpu_system.append(cpu_system)

  def add_mem_reading(self,mem_used,mem_free):
    self.mem_used.append(mem_used)
    self.mem_free.append(mem_free)

  def add_user_count_reading(self,user_count):
    self.user_count.append(user_count)

  def add_task_count_reading(self,task_count):
    self.task_count.append(task_count)
    
  def set_unique_users_count(self,unique_user_count):
    self.unique_user_count = unique_user_count
    
  def set_users(self,users):
    hashes = []
    for u in users:
      hashes.append(md5.md5(u+SECRET_KEY).hexdigest())
    self.users = json.dumps(hashes)

  def calc_averages(self):
    self.cpu_user_avg = average_mid(self.cpu_user)
    self.cpu_system_avg = average_mid(self.cpu_system)
    self.mem_used_avg = average_mid(self.mem_used)
    self.mem_free_avg = average_mid(self.mem_free)
    self.user_count_avg = average_mid(self.user_count)
    self.task_count_avg = average_mid(self.task_count)

  def insert_db(self,dbcursor):
    sql = "INSERT INTO `snapshots` (machine_id,time,cpu_user,cpu_system,mem_used,mem_free,user_count,task_count,unique_user_count,users) VALUES "
    sql +="('%d','%s','%f','%f','%d','%d','%d','%d','%d','%s')"%(self.machine.get_id(),self.time,self.cpu_user_avg,self.cpu_system_avg,self.mem_used_avg,self.mem_free_avg,self.user_count_avg,self.task_count_avg,self.unique_user_count,self.users)
    dbcursor.execute(sql)
    logger.info("Inserted 1 snapshot")
