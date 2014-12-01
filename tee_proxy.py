#!/usr/bin/env python


#testapp for listening to messages from a chrome plugin

import struct
import sys
import threading
import logging
import Queue

import Tkinter
import tkMessageBox

logging.basicConfig(filename='/home/apellikk/studies/bsc/dev/test.log',level=logging.DEBUG)
logging.debug('derp')

def send_message(message):
  sys.stdout.write(struct.pack('I', len(message)))
  sys.stdout.write(message)
  sys.stdout.flush()

def read_thread(queue):
  message_number = 0
  while 1:
    text_length_bytes = sys.stdin.read(4)

    if len(text_length_bytes) == 0:
      if queue:
        queue.put(None)
      sys.exit(0)

    text_length = struct.unpack('i', text_length_bytes)[0]

    text = sys.stdin.read(text_length).decode('utf-8')

    if queue:
      queue.put(text)
    else:
      send_message('{"echo": %s}' % text)

class NativeMessagingWindow(Tkinter.Frame):
  def __init__(self, queue):
    self.queue = queue

    Tkinter.Frame.__init__(self)
    self.pack()

    self.text = Tkinter.Text(self)
    self.text.grid(row=0, column=0, padx=10, pady=10, columnspan=2)
    self.text.config(state=Tkinter.DISABLED, height=10, width=40)

    self.messageContent = Tkinter.StringVar()
    self.sendEntry = Tkinter.Entry(self, textvariable=self.messageContent)
    self.sendEntry.grid(row=1, column=0, padx=10, pady=10)

    self.sendButton = Tkinter.Button(self, text="Send", command=self.onSend)
    self.sendButton.grid(row=1, column=1, padx=10, pady=10)

    self.after(100, self.processMessages)

  def processMessages(self):
    while not self.queue.empty():
      message = self.queue.get_nowait()

      if message == None:
        self.quit()
        return
      self.log("Received %s" % message)

    self.after(100, self.processMessages)

  def onSend(self):
    text = '{"text": "' + self.messageContent.get() + '"}'
    self.log('Sending %s' % text)
    logging.debug('derp')

    try:
      send_message(text)
    except IOError:
      tkMessageBox.showinfo('Native Messaging test', 'failed to send msg')
      sys.exit(1)

  def log(self, message):
    self.text.config(state=Tkinter.NORMAL)
    self.text.insert(Tkinter.END, message + "\n")
    self.text.config(state=Tkinter.DISABLED)

def Main():
  queue = Queue.Queue()

  main_window = NativeMessagingWindow(queue)
  main_window.master.title('Native Messaging test')

  thread = threading.Thread(target=read_thread, args=(queue,))
  thread.daemon = True
  thread.start()

  main_window.mainloop()

  sys.exit(0)


if __name__ == '__main__':
  Main()
