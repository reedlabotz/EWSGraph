from __future__ import print_function
import subprocess
import paramiko
import sys
import traceback

#monitor settings
hosts = ['linux1.ews.illinois.edu',
		 'linux2.ews.illinois.edu',
		 'linux3.ews.illinois.edu',
		 'linux4.ews.illinois.edu']
hostuser = 'labotz1'
hostpass = ''

#database settings
dbhost = ''
dbname = ''
dbuser = ''
dbpass = ''

def get_data_from_host(host,hostuser,hostpass):
	try:
		client = paramiko.SSHClient()
		client.load_system_host_keys()
		client.set_missing_host_key_policy(paramiko.WarningPolicy)
		client.connect(host,username=hostuser,password=hostpass)

		print("Grabbing data from %s, should take 15 seconds" % host)
		stdin, stdout, stderr = client.exec_command('top -b -d3 -n5')

		data = stdout.readlines()

		for line in data:
			if(line[:5] == "top -"):
				print(line)

		client.close()
		print("Got data from %s" % host)
	except Exception, e:
		print("Error in SSH on host %s" % host)
		traceback.print_exc()
		try:
			client.close()
		except:
			pass

#main program
for host in hosts:
	get_data_from_host(host,hostuser,hostpass)