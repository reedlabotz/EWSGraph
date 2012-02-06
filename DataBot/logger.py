import smtplib
import string
import datetime
import settings
from email.mime.text import MIMEText

log = []

def info(s):
   log.append(datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S") + '   ' + s)
   
def exception(s,e):
   log.append(datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S") + '   ERROR: ' + s)
   log.append("----------")
   log.append(e.__str__())
   log.append("----------")

def emailLog():
   message = MIMEText(string.join(log,"\n"))
   
   message['Subject'] = settings.LOGGER['EMAIL']['SUBJECT']
   message['From'] = settings.LOGGER['EMAIL']['FROM']
   message['To'] = settings.LOGGER['EMAIL']['TO']

   # The actual mail send
   server = smtplib.SMTP(settings.SMTP['SERVER'])
   server.starttls()
   server.login(settings.SMTP['USERNAME'], settings.SMTP['PASSWORD'])
   server.sendmail(settings.LOGGER['EMAIL']['FROM'], settings.LOGGER['EMAIL']['TO'], message.as_string())
   server.quit()