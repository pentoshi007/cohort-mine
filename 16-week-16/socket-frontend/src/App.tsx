import { useState, useEffect, useRef } from 'react'
import './App.css'

function App() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function sendMessage() {
    if (socket && socket.readyState === WebSocket.OPEN && inputRef.current) {
      socket.send(inputRef.current.value);
      inputRef.current.value = ''; // Clear input after sending
    }
  }

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080');
    setSocket(ws);

    ws.onerror = () => {
      console.log('WebSocket error');
    };

    ws.onopen = () => {
      console.log('WebSocket open');
    };

    ws.onmessage = (event) => {
      alert(event.data);
    };

    // Cleanup on unmount
    return () => {
      ws.close();
    };
  }, []);

  return (
    <>
      <input
        ref={inputRef}
        type='text'
        placeholder='Message...'
      />
      <button onClick={sendMessage}>Send</button>
    </>
  );
}

export default App
