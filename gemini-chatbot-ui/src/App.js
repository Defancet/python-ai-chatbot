import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import Sidebar from "./Sidebar";

function App() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [sessions, setSessions] = useState([]);
    const [currentSessionId, setCurrentSessionId] = useState(null);

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const response = await axios.get("http://127.0.0.1:5000/api/sessions");
                setSessions(response.data);
                if (response.data.length > 0) {
                    setCurrentSessionId(response.data[0].id);
                }
            } catch (error) {
                console.error("Error fetching sessions", error);
            }
        };

        fetchSessions();
    }, []);

    useEffect(() => {
        const fetchHistory = async (sessionId) => {
            try {
                const response = await axios.post("http://127.0.0.1:5000/api/chat/history", { session_id: sessionId });
                setMessages(response.data.history);
            } catch (error) {
                console.error("Error fetching chat history", error);
            }
        };

        if (currentSessionId) {
            fetchHistory(currentSessionId);
        }
    }, [currentSessionId]);

    const sendMessage = async () => {
        if (!input.trim()) return;
        const userMessage = { role: "user", text: input.trim() };

        setMessages([...messages, userMessage]);

        try {
            const response = await axios.post("http://127.0.0.1:5000/api/chat", {
                message: input.trim(),
                session_id: currentSessionId,
            });
            const botMessage = { role: "bot", text: response.data.response };
            setMessages([...messages, userMessage, botMessage]);
        } catch (error) {
            const errorMessage = {
                role: "bot",
                text: "Error communicating with the chatbot. Please try again.",
            };
            setMessages([...messages, userMessage, errorMessage]);
        }

        setInput("");
    };

    const handleInputChange = (e) => setInput(e.target.value);

    const handleKeyDown = (e) => {
        if (e.key === "Enter") sendMessage();
    };

    const startNewChat = async () => {
        try {
            const response = await axios.post("http://127.0.0.1:5000/api/chat/new");
            const newSession = {
                id: response.data.session_id,
                name: `Chat ${sessions.length + 1}`,
            };
            setSessions([...sessions, newSession]);
            setCurrentSessionId(newSession.id);
            setMessages([]);
        } catch (error) {
            console.error("Error starting a new chat", error);
        }
    };

    const selectSession = (sessionId) => {
        setCurrentSessionId(sessionId);
    };

    const deleteSession = async (sessionId) => {
        try {
            await axios.post("http://127.0.0.1:5000/api/chat/delete", { session_id: sessionId });
            setSessions(sessions.filter(session => session.id !== sessionId));
            if (currentSessionId === sessionId) {
                setCurrentSessionId(sessions.length > 1 ? sessions[0].id : null);
                setMessages([]);
            }
        } catch (error) {
            console.error("Error deleting the chat session", error);
        }
    };

    const updateSession = async (sessionId, newName) => {
        try {
            await axios.post("http://127.0.0.1:5000/api/chat/update", { session_id: sessionId, name: newName });
            setSessions(sessions.map(session => session.id === sessionId ? { ...session, name: newName } : session));
        } catch (error) {
            console.error("Error updating the chat session name", error);
        }
    };

    return (
        <div className="App">
            <div className="main-content">
                <Sidebar
                    sessions={sessions}
                    onSelectSession={selectSession}
                    onNewSession={startNewChat}
                    onDeleteSession={deleteSession}
                    onUpdateSession={updateSession}
                />
                <main className="chat-section">
                    <div className="chat-window">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`message ${msg.role === "user" ? "user" : "bot"}`}
                            >
                                <span>{msg.text}</span>
                            </div>
                        ))}
                    </div>
                    <div className="chat-input">
                        <input
                            type="text"
                            value={input}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message..."
                        />
                        <button onClick={sendMessage}> Send </button>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default App;
