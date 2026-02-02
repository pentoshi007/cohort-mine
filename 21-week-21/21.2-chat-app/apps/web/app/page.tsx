"use client";

import { useState } from "react";
import { TextInput } from "@repo/ui/TextInput";
import { useRouter } from "next/navigation";

export default function Home() {
  const [roomId, setRoomId] = useState("");
  const router = useRouter();

  return (
    <div className="h-screen flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm flex flex-col gap-4">
        <h1 className="text-3xl font-bold text-center">Join Chat Room</h1>
        <TextInput 
          className="w-full" 
          placeholder="Enter Room ID" 
          value={roomId} 
          onChange={(val) => setRoomId(val)} 
        />
        <button 
          onClick={() => {
            if (roomId.trim()) {
              router.push(`/chat/${roomId}`);
            }
          }}
          className="w-full bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors font-semibold"
        >
          Join Room
        </button>
      </div>
    </div>
  );
}
