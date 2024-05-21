/* src/App.js */
import React, {useState, useEffect, useRef} from "react";
import axios from "axios";
import {FaArrowRight, FaBars, FaPlus} from "react-icons/fa";
import "./App.css";
import Sidebar from "./Sidebar";
import debounce from 'lodash.debounce';

function App() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [sessions, setSessions] = useState([]);
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [sidebarVisible, setSidebarVisible] = useState(window.innerWidth > 768);
    const textareaRef = useRef(null);

    const toggleSidebar = () => setSidebarVisible(!sidebarVisible);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 768) {
                setSidebarVisible(false);
            } else {
                setSidebarVisible(true);
            }
        };

        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

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
                const response = await axios.post("http://127.0.0.1:5000/api/chat/history", {session_id: sessionId});
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
        const userMessage = {role: "user", text: input.trim()};

        setMessages([...messages, userMessage]);

        try {
            const response = await axios.post("http://127.0.0.1:5000/api/chat", {
                message: input.trim(),
                session_id: currentSessionId,
            });
            const botMessage = {role: "bot", text: response.data.response};
            setMessages([...messages, userMessage, botMessage]);
        } catch (error) {
            const errorMessage = {
                role: "bot",
                text: "Error communicating with the chatbot. Please try again.",
            };
            setMessages([...messages, userMessage, errorMessage]);
        }

        setInput("");
        textareaRef.current.style.height = "auto";
    };

    const adjustTextareaHeight = debounce(() => {
        const textarea = textareaRef.current;
        textarea.style.height = "auto"; // Reset the height

        const scrollHeight = textarea.scrollHeight;
        const maxHeight = 200;

        if (scrollHeight > maxHeight) {
            textarea.style.height = `${maxHeight}px`;
            textarea.style.overflowY = "auto";
        } else if (textarea.clientHeight < scrollHeight) {
            textarea.style.height = `${scrollHeight}px`;
            textarea.style.overflowY = "hidden";
        }
    }, 100);

    const handleInputChange = (e) => {
        setInput(e.target.value);
        adjustTextareaHeight();
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const startNewChat = async () => {
        try {
            // Determine the next chat number
            const nextChatNumber = sessions.length + 1;
            const newChatName = `Chat ${nextChatNumber}`;

            const response = await axios.post("http://127.0.0.1:5000/api/chat/new", {name: newChatName});
            const newSession = {
                id: response.data.session_id,
                name: newChatName,
            };
            setSessions([...sessions, newSession]);
            setCurrentSessionId(newSession.id);
            setMessages([]);
            if (!sidebarVisible) {
                toggleSidebar();
            }
        } catch (error) {
            console.error("Error starting a new chat", error);
        }
    };

    const selectSession = (sessionId) => {
        setCurrentSessionId(sessionId);
    };

    const deleteSession = async (sessionId) => {
        try {
            await axios.post("http://127.0.0.1:5000/api/chat/delete", {session_id: sessionId});
            setSessions(sessions.filter((session) => session.id !== sessionId));
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
            await axios.post("http://127.0.0.1:5000/api/chat/update", {session_id: sessionId, name: newName});
            setSessions(sessions.map((session) => (session.id === sessionId ? {...session, name: newName} : session)));
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
                    onToggleSidebar={toggleSidebar}
                    sidebarVisible={sidebarVisible}
                />
                <main className={`chat-section ${sidebarVisible ? "" : "full-width"}`}>
                    <div className="chat-window">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.role === "user" ? "user" : "bot"}`}>
                                <span>{msg.text}</span>
                            </div>
                        ))}
                    </div>
                    <div className="chat-input">
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message..."
                            rows={1}
                        />
                        <button onClick={sendMessage} disabled={!input.trim()}>
                            <FaArrowRight/>
                        </button>
                    </div>
                </main>
            </div>
            {!sidebarVisible && (
                <div className="sidebar-toggle">
                    <div className="button-wrapper">
                        <button className="menu-button" onClick={toggleSidebar}>
                            <FaBars/>
                        </button>
                        <span className="description">Open Menu</span>
                    </div>
                    <div className="button-wrapper">
                        <button className="new-session" onClick={startNewChat}>
                            <FaPlus/>
                        </button>
                        <span className="description">New Chat</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
