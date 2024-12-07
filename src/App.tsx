import React, { useState } from "react";
import { SceneProvider } from "./context/SceneContext";
import Scene from "./components/Scene";

function App() {
  const [showChat, setShowChat] = useState(false);
  const [history, setHistory] = useState<string[]>([]); 

  const handleNewMessage = (message: string) => {
    setHistory((prev) => [...prev, message]);
  };

  const simulateAIResponse = (message: string) => {
    return `AI: This is a response to "${message}"`;
  };

  return (
    <SceneProvider>
      <div style={{ height: "100vh", position: "relative", overflow: "hidden" }}>
        <Scene />

        {!showChat ? (
          // Floating Text Bar
          <div
            // style={{
            //   position: "fixed",
            //   bottom: "10%",
            //   left: "50%",
            //   transform: "translateX(-50%)",
            //   backgroundColor: "#222",
            //   color: "#fff",
            //   padding: "10px 20px",
            //   borderRadius: "20px",
            //   boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
            //   cursor: "pointer",
            //   zIndex: 10,
            //   maxWidth: "300px",
            //   textAlign: "center",
            // }}
            onClick={() => setShowChat(true)}
          >
            {history.length > 0
              ? history[history.length - 1] // Show the latest message
              : "Tap to start chatting..."}
          </div>
        ) : (
          // Chat History
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "80%",
              maxWidth: "600px",
              height: "70%",
              backgroundColor: "#000",
              color: "#fff",
              zIndex: 10,
              display: "flex",
              flexDirection: "column",
              borderRadius: "10px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
              overflow: "hidden",
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowChat(false)}
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                zIndex: 11,
                backgroundColor: "#444",
                color: "#fff",
                border: "none",
                padding: "10px",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Close
            </button>

            {/* Chat History */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "20px",
                paddingBottom: "80px", // Add space for input field
              }}
            >
              <h1 style={{ marginBottom: "20px" }}>Chat History</h1>
              {history.map((msg, index) => (
                <div
                  key={index}
                  style={{
                    marginBottom: "10px",
                    padding: "10px",
                    borderRadius: "5px",
                    backgroundColor: index % 2 === 0 ? "#222" : "#333",
                  }}
                >
                  {msg}
                </div>
              ))}
            </div>

            {/* Input Field */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                width: "100%",
                padding: "10px 20px",
                backgroundColor: "#222",
                display: "flex",
                alignItems: "center",
                boxShadow: "0 -2px 10px rgba(0,0,0,0.5)",
              }}
            >
              <input
                type="text"
                placeholder="Type your message..."
                style={{
                  flex: 1,
                  padding: "10px",
                  marginRight: "10px",
                  borderRadius: "5px",
                  border: "1px solid #444",
                  backgroundColor: "#333",
                  color: "#fff",
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const userMessage = (e.target as HTMLInputElement).value;
                    if (userMessage.trim()) {
                      handleNewMessage(`User: ${userMessage}`);
                      handleNewMessage(simulateAIResponse(userMessage)); // Simulate AI response
                      (e.target as HTMLInputElement).value = ""; // Clear input
                    }
                  }
                }}
              />
              <button
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#444",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
                onClick={() => {
                  const input = document.querySelector("input[type=text]");
                  if (input) {
                    const userMessage = (input as HTMLInputElement).value;
                    if (userMessage.trim()) {
                      handleNewMessage(`User: ${userMessage}`);
                      handleNewMessage(simulateAIResponse(userMessage)); // Simulate AI response
                      (input as HTMLInputElement).value = ""; // Clear input
                    }
                  }
                }}
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </SceneProvider>
  );
}

export default App;
