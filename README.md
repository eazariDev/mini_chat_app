# Mini chat application


A mini chat application built using Node.js, Express, and Socket.io that allows users to send and receive messages between different users and stores message data in a file.

## Register and Login
Before users can use the chat to send and receive, they have to register with a username and a password. After that they can use their username and password to login and use this app.

![image](https://github.com/user-attachments/assets/89bb2def-39c8-4057-963c-4253a69e7414)


## Entering the chat
After successfully login, user now can send and see others messages. also he can see which users are online.
Note that the chat section only shows the last 10 new messages and it deletes older messages.

![image](https://github.com/user-attachments/assets/f5207ac5-e7b7-469a-9c21-343cd64f3891)

## list of all/online users
There are two api's which developed to get list of users and online users which can be find at:

* http:localhost:9000/api/users
![image](https://github.com/user-attachments/assets/b78e85b7-f304-4619-8f45-13bbc02a205d)


* http:localhost:9000/api/online-users
![image](https://github.com/user-attachments/assets/9297c634-a942-4af4-a62e-33e1730eecd5)

