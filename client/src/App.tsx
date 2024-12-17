import { useEffect, useRef, useState } from "react";
import { Input } from "./components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "./components/ui/button";

function App() {
  const [messages, setMessages] = useState<string[]>([]);
  const [roomId, setRoomId] = useState(localStorage.getItem("roomId") || ""); // Load from localStorage
  const [userJoined, setUserJoined] = useState<boolean>(
    localStorage.getItem("userJoined") === "true"
  );
  const [currentMessage, setCurrentMessage] = useState("");
  const wsRef = useRef<WebSocket>();

  useEffect(() => {
    if (!userJoined || !roomId) return;

    const socket = new WebSocket("ws://localhost:8080");

    socket.onopen = () => {
      const response = JSON.stringify({
        type: "join",
        payload: { roomId },
      });
      socket.send(response);
    };

    socket.onmessage = (event) => {
      setMessages((prevMessages) => [...prevMessages, event.data]);
    };

    wsRef.current = socket;

    socket.onclose = () => {
      setUserJoined(false);
      localStorage.removeItem("userJoined");
      localStorage.removeItem("roomId");
    };

    return () => {
      socket.close();
    };
  }, [userJoined, roomId]);

  const handleJoinRoom = () => {
    setUserJoined(true);
    setMessages([]);
    localStorage.setItem("userJoined", "true");
    localStorage.setItem("roomId", roomId);
  };

  const handleChat = () => {
    if (currentMessage.trim() !== "") {
      const response = JSON.stringify({
        type: "chat",
        payload: { message: currentMessage },
      });
      wsRef.current?.send(response);
      setCurrentMessage("");
    }
  };

  const handleLeaveRoom = () => {
    wsRef.current?.close();
    setUserJoined(false);
    setRoomId("");
    setMessages([]);
    localStorage.removeItem("userJoined");
    localStorage.removeItem("roomId");
  };

  return (
    <div>
      {!userJoined ? (
        <div className="flex flex-col justify-center h-screen">
          <div className="flex justify-center">
            <Card className="w-[350px] flex flex-col">
              <CardHeader>
                <div className="text-center">
                  <CardTitle className="text-3xl">Join Room</CardTitle>
                  <CardDescription className="text-sm">
                    Enter the Room Id to join chat
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <Input
                  placeholder="Enter the roomId"
                  onChange={(e) => setRoomId(e.target.value)}
                  value={roomId}
                />
                <Button onClick={handleJoinRoom}>Join</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="flex flex-col justify-center h-screen">
          <div className="flex justify-center">
            <Card className="w-[350px] h-[500px] flex flex-col">
              <CardHeader>
                <div className="text-center">
                  <CardTitle className="text-3xl">Chat Room</CardTitle>
                  <CardDescription className="text-sm">
                    Send a message or leave the room
                  </CardDescription>
                </div>
              </CardHeader>
              <div className="flex-grow overflow-auto p-4">
                {messages.map((message, index) => (
                  <div key={index}>{message}</div>
                ))}
              </div>
              <CardContent className="flex flex-col gap-4">
                <Input
                  placeholder="Enter your message"
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  value={currentMessage}
                />
                <div className="flex justify-between gap-4">
                  <Button onClick={handleChat} className="flex-1">
                    Send
                  </Button>
                  <Button
                    onClick={handleLeaveRoom}
                    variant="destructive"
                    className="flex-1"
                  >
                    Leave Room
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
