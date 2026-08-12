import os
import unittest
import socket

SERVER_IP = os.environ.get('SERVER_IP', 'recommendation-server')
SERVER_PORT = 5000

class TestTCPClient(unittest.TestCase):

    def send_command(self, command):
        # Helper method to send a command and receive the response
        client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        client_socket.connect((SERVER_IP, SERVER_PORT))

        command_with_newline = command + "\n"
        client_socket.send(command_with_newline.encode('utf-8'))

        received_message = client_socket.recv(4096).decode('utf-8')
        client_socket.close()

        return received_message.strip()

    def test_help_command(self):
        # Test if the client can send the "HELP" command and receive the correct response
        response = self.send_command("HELP")
        self.assertIn("200 OK", response)

    def test_invalid_command(self):
        # Test if the client can send an invalid command and receive the correct response
        response = self.send_command("INVALID_COMMAND")
        self.assertIn("400 Bad Request", response)

    def test_add_view_command(self):
        # Test if the client can send the "ADD_VIEW" command and receive the correct response
        response = self.send_command("ADD_VIEW user1 item1 item2")
        self.assertIn("201 Created", response)

    def test_recommendation_after_view_command(self):
        # Test if the client can send the "RECOMMEND" command and receive the correct response
        self.send_command("ADD_VIEW user1 target_item")
        self.send_command("ADD_VIEW user2 target_item recommended_item")

        response = self.send_command("RECOMMEND user1 target_item")
        self.assertIn("200 OK", response)
        self.assertIn("recommended_item", response)

    def test_add_purchase_command(self):
        # Test if the client can send the "ADD_PURCHASE" command and receive the correct response
        response = self.send_command("ADD_PURCHASE user1 item3 item4")
        self.assertIn("201 Created", response)

    def test_recommendation_after_purchase_command(self):
        # Test if the client can send the "RECOMMEND" command after adding a purchase and receive the correct response
        self.send_command("ADD_PURCHASE user1 target_item")
        self.send_command("ADD_PURCHASE user2 target_item recommended_item")
        response = self.send_command("RECOMMEND user1 target_item")
        self.assertIn("200 OK", response)
        self.assertIn("recommended_item", response)

    def test_remove_view_command(self):
        # Test if the client can send the "REMOVE_VIEW" command and receive the correct response
        self.send_command("ADD_VIEW user1 item1")
        response = self.send_command("REMOVE_VIEW user1 item1")
        self.assertIn("204 No Content", response)

    def test_remove_purchase_command(self):
        # Test if the client can send the "REMOVE_PURCHASE" command and receive the correct response
        self.send_command("ADD_PURCHASE user1 item1")
        response = self.send_command("REMOVE_PURCHASE user1 item1")
        self.assertIn("204 No Content", response)

if __name__ == '__main__':
    unittest.main(verbosity=2)