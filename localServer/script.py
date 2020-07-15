import subprocess, time, pyautogui, threading, os, sys
from flask import Flask, render_template
from flask_socketio import SocketIO

t = 1 / 60

app = Flask(__name__)
app.config['SECRET_KEY'] = "mysecret"
socketio = SocketIO(app, cors_allowed_origins="*")

@socketio.on('command')
def handle_message(message):
    print(message)
    os.system(message)

@socketio.on('connect')
def test_connect():
    print('CONNECTED')

@socketio.on('disconnect')
def test_disconnect():
    print('COME BACK')

def f1():
    socketio.run(app, host = '0.0.0.0', port = 5000)
def f2():
    while True:
        p = pyautogui.position()
        command = ('wallpaper64.exe -control applyProperties -properties RAW~({"mouse":{"x":'+str(p[0])+', "y":'+str(p[1])+'}})~END')
        os.popen(command)
        time.sleep(t)

t2 = threading.Thread(target=f2)
t1 = threading.Thread(target=f1)
t1.start()
t2.start()
t1.join()
t2.join()
