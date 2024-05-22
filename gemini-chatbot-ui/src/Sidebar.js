/* src/Sidebar.js */
import React, {useState} from "react";
import {FaPen, FaTrash, FaPlus, FaBars} from "react-icons/fa";
import "./Sidebar.css";

function Sidebar({
                     sessions,
                     onSelectSession,
                     onNewSession,
                     onDeleteSession,
                     onUpdateSession,
                     onToggleSidebar,
                     sidebarVisible
                 }) {
    const [editingSessionId, setEditingSessionId] = useState(null);
    const [newName, setNewName] = useState("");
    const [error, setError] = useState("");

    const handleEditClick = (sessionId, currentName) => {
        setEditingSessionId(sessionId);
        setNewName(currentName);
        setError("");
    };

    const handleNameChange = (e) => setNewName(e.target.value);

    const handleUpdate = (sessionId) => {
        if (newName.trim() === "") {
            setError("Name cannot be empty");
            return;
        }
        onUpdateSession(sessionId, newName);
        setEditingSessionId(null);
        setError("");
    };

    return (
        <div className={`sidebar ${sidebarVisible ? "sidebar-visible" : "sidebar-hidden"}`}>
            <div className="sidebar-buttons">
                <div className="button-wrapper">
                    <button className="menu-button" onClick={onToggleSidebar}>
                        <FaBars/>
                    </button>
                    <span className="description">Close Menu</span>
                </div>
                <div className="button-wrapper">
                    <button className="new-session" onClick={onNewSession}>
                        <FaPlus/>
                    </button>
                    <span className="description">New Chat</span>
                </div>
            </div>
            {error && <div className="error-message">{error}</div>}
            <ul className="session-list">
                {sessions.map((session) => (
                    <li key={session.id}>
                        {editingSessionId === session.id ? (
                            <>
                                <input type="text" value={newName} onChange={handleNameChange}/>
                                <button onClick={() => handleUpdate(session.id)}>Save</button>
                            </>
                        ) : (
                            <>
                                <span onClick={() => onSelectSession(session.id)}
                                      className="session-name">{session.name}</span>
                                <div className="session-actions">
                                    <div className="button-wrapper">
                                        <button className="edit-session"
                                                onClick={() => handleEditClick(session.id, session.name)}>
                                            <FaPen/>
                                        </button>
                                    </div>
                                    <div className="button-wrapper">
                                        <button className="delete-session" onClick={() => onDeleteSession(session.id)}>
                                            <FaTrash/>
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Sidebar;
