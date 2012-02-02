from __future__ import print_function

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

  def calc_averages(self):
    self.cpu_user_avg = average_mid(self.cpu_user)
    self.cpu_system_avg = average_mid(self.cpu_system)
    self.mem_used_avg = average_mid(self.mem_used)
    self.mem_free_avg = average_mid(self.mem_free)
    self.user_count_avg = average_mid(self.user_count)
    self.task_count_avg = average_mid(self.task_count)

