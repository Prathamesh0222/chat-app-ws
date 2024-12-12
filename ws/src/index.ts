import { WebSocket, WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

interface User {
  socket: WebSocket;
  room: string;
}

let clientWs: User[] = [];

wss.on("connection", (socket) => {
  socket.on("message", (message) => {
    const parsedMessage = JSON.parse(message as unknown as string);
    if (parsedMessage.type === "join") {
      console.log("user joined room: " + parsedMessage.payload.roomId);
      clientWs.push({
        socket,
        room: parsedMessage.payload.roomId,
      });
    }
    if (parsedMessage.type === "chat") {
      console.log("User wants to chat");
      let currentUserRoom = null;
      console.log("Message Received: " + parsedMessage.payload.message);
      for (let i = 0; i < clientWs.length; i++) {
        if (clientWs[i].socket === socket) {
          currentUserRoom = clientWs[i].room;
        }
      }
      for (let i = 0; i < clientWs.length; i++) {
        if (clientWs[i].room === currentUserRoom) {
          clientWs[i].socket.send(parsedMessage.payload.message);
        }
      }
    }
  });
});
