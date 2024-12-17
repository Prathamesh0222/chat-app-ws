import { WebSocket, WebSocketServer } from "ws";

interface User {
  socket: WebSocket;
  room: string;
}

let clientWs: User[] = [];

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (socket) => {
  socket.on("message", (message) => {
    const parsedMessage = JSON.parse(message.toString());
    if (parsedMessage.type === "join") {
      clientWs.push({
        socket,
        room: parsedMessage.payload.roomId,
      });
    }

    if (parsedMessage.type === "chat") {
      const currentUserRoom = clientWs.find(
        (user) => user.socket === socket
      )?.room;

      if (currentUserRoom) {
        clientWs
          .filter((user) => user.room === currentUserRoom)
          .forEach((user) => user.socket.send(parsedMessage.payload.message));
      }
    }
  });
});
