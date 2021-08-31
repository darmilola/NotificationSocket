'use strict';

const express = require("express");
const http = require('http');
const socketio = require('socket.io');
const users = new Map();




class Server{

    constructor(){
        this.host = '0.0.0.0';
        this.protocol = "https";
        this.port = process.env.PORT || 3000;
        this.app = express();
        this.http = http.Server(this.app);
        this.socket = socketio(this.http);
        }

   appExecute(){
     
        this.http.listen(this.port, this.host, () => {
            console.log(`Listening on http:${this.host}:${this.port}`);
        });

        this.app.get('/', (req, res) => {

         res.send('Chat Server is running on port 3000')
        });    

        this.socket.on('connection', (socket) => {

        console.log('user connected')

            
        socket.on('join', function(userId) {

        users.set(userId, socket.id);

        //socket.broadcast.emit('userjoinedChat',userNickname +" : has joined the chat ")
        console.log('joined chat')
       });

        socket.on('disconnected', function(senderId) {
         
             users.delete(senderId);
         
         });


         socket.on('match', function(receiverId,matchFirstname,matchImageUrl) {
      
             let  message = {"receiverId":receiverId,"matchFirstname":matchFirstname,"matchImageUrl":matchImageUrl}
             socket.to(users.get(receiverId)).emit("onMatch",message)

         }); 


       socket.on('notificationdetection', (receiverId,messageContent,senderName,senderImageUrl) => {

        //create a message object 

        let  message = {"message":messageContent, "receiverId":receiverId,"senderName":senderName,"senderImageUrl":senderImageUrl}

        socket.to(users.get(receiverId)).emit("notification", message)

        });
       

     });
}

}

const app = new Server();
app.appExecute();