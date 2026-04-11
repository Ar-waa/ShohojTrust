import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    FileText,
    ShieldCheck,
    BarChart3,
    Settings
    } from "lucide-react";

    const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        {
        name: "Dashboard",
        path: "/dashboard",
        icon: <LayoutDashboard size={18} />
        },
        {
        name: "Templates",
        path: "/templates",
        icon: <FileText size={18} />
        },
        {
        name: "Active Agreements",
        path: "/agreements",
        icon: <FileText size={18} />
},

        {
        name: "Trust Score",
        path: "/trust",
        icon: <ShieldCheck size={18} />
        },
        {
        name: "Analytics",
        path: "/analytics",
        icon: <BarChart3 size={18} />
        },
        {
        name: "Settings",
        path: "/settings",
        icon: <Settings size={18} />
        }
    ];

    return (
        <div className="sidebar">

        <h2 className="logo">ShohojTrust</h2>

        <div className="menu">

            {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;

            return (
                <div
                key={index}
                className={`menu-item ${isActive ? "active" : ""}`}
                onClick={() => navigate(item.path)}
                >
                {item.icon}
                <span>{item.name}</span>
                </div>
            );
            })}

        </div>
        </div>
    );
};

export default Sidebar;
