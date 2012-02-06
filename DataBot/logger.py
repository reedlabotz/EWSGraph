import smtplib
import string
from email.mime.text import MIMEText

log = []

def info(s):
   log.append(s)
   
def exception(s,e):
   log.append(s)
   log.append("----------")
   log.append(e.__str__())
   log.append("----------")

def emailLog():
   fromaddr = 'reedlabotz@gmail.com'
   toaddrs  = 'reedlabotz@gmail.com'
   message = MIMEText(string.join(log,"\n"))
   
   message['Subject'] = 'Databot Log'
   message['From'] = fromaddr
   message['To'] = toaddrs

   # Credentials (if needed)
   username = 'reedlabotz@gmail.com'
   password = ''

   # The actual mail send
   server = smtplib.SMTP('smtp.gmail.com:587')
   server.starttls()
   server.login(username,password)
   server.sendmail(fromaddr, toaddrs, message.as_string())
   server.quit()