import React from "react";
import { useNavigate } from "react-router-dom";

const Topbar = () => {

    const navigate = useNavigate();

    const logout = () => {
        localStorage.removeItem("user");
        navigate("/");
    };

    return (
        <div className="topbar">
        <input type="text" placeholder="Search..." />
        <div className="topbar-right">
            <span>🔔</span>
            <span className="profile">User</span>
            <span onClick={logout} style={{cursor: "pointer"}}>
        Logout
        </span>
        </div>
        </div>
    );
};

export default Topbar;
