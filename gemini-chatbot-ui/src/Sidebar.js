// src/Sidebar.js
import React, { useState } from "react";
import "./Sidebar.css";

function Sidebar({ sessions, onSelectSession, onNewSession, onDeleteSession, onUpdateSession }) {
    const [editingSessionId, setEditingSessionId] = useState(null);
    const [newName, setNewName] = useState("");

    const handleEditClick = (sessionId, currentName) => {
        setEditingSessionId(sessionId);
        setNewName(currentName);
    };

    const handleNameChange = (e) => setNewName(e.target.value);

    const handleUpdate = (sessionId) => {
        onUpdateSession(sessionId, newName);
        setEditingSessionId(null);
    };

    return (
        <div className="sidebar">
            <button className="new-session" onClick={onNewSession}>New Chat</button>
            <ul className="session-list">
                {sessions.map((session) => (
                    <li key={session.id}>
                        {editingSessionId === session.id ? (
                            <>
                                <input type="text" value={newName} onChange={handleNameChange} />
                                <button onClick={() => handleUpdate(session.id)}>Save</button>
                            </>
                        ) : (
                            <>
                                <span onClick={() => onSelectSession(session.id)}>{session.name}</span>
                                <button className="edit-session" onClick={() => handleEditClick(session.id, session.name)}>Edit</button>
                                <button className="delete-session" onClick={() => onDeleteSession(session.id)}>Delete</button>
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Sidebar;
