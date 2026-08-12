import socket
import sys

if len(sys.argv) < 3:
    print("Missing ip address and/or port number")
    sys.exit(1)

dest_ip = sys.argv[1]
dest_port = int(sys.argv[2])

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
try:
    s.connect((dest_ip, dest_port))
    print(f"Connected to {dest_ip}:{dest_port}")
except Exception as e:
    print(f"Error connecting to {dest_ip}:{dest_port}")
    sys.exit(1)

msg = input("Enter message to send: ")
while msg != "quit":
    if msg:
        msg_to_send = msg + "\n"
        s.send(msg_to_send.encode("utf-8"))
        data = s.recv(4096)
        print(data.decode('utf-8'), end="")
    msg = input("Enter message to send: ")
s.close()