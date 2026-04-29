import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    FileText,
    ShieldCheck,
    BarChart3,
    Settings,
    History,
    CreditCard,
    AlertCircle,
    Archive
} from "lucide-react";

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // ✅ GET USER ROLE FROM LOCAL STORAGE
    const user = JSON.parse(localStorage.getItem("user"));
    const role = user?.role;

    // ✅ DYNAMIC DASHBOARD PATH
    let dashboardPath = "/client-dashboard";

    if (role === "provider") {
        dashboardPath = "/provider-dashboard";
    } else if (role === "admin") {
        dashboardPath = "/admin-dashboard";
    }

    const menuItems = [
        {
            name: "Dashboard",
            path: dashboardPath, // ✅ FIXED HERE
            icon: <LayoutDashboard size={18} />
        },
        ...(role === "client"
            ? [{ name: "Payment", path: "/payment", icon: <CreditCard size={18} /> }]
            : []),
        ...(role === "provider"
            ? [{ name: "Templates", path: "/templates", icon: <FileText size={18} /> }]
            : []),
        {
            name: "Active Agreements",
            path: "/agreements",
            icon: <FileText size={18} />
        },
        {
            name: "Agreement Activity Timeline",
            path: "/agreement-activity-timeline",
            icon: <History size={18} />
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
        ...(role !== "admin"
            ? [
                {
                    name: "My Report",
                    path: "/reports/my-report",
                    icon: <FileText size={18} />
                }
            ]
            : []),

        ...(role === "admin"
            ? [{ name: "Dispute Review", path: "/admin/disputes", icon: <AlertCircle size={18} /> }]
            : [{ name: "Dispute", path: "/dispute", icon: <AlertCircle size={18} /> }]
        ),
        ...(role !== "admin"
            ? [{ name: "Agreement History", path: "/agreement-history", icon: <Archive size={18} /> }]
            : [])
    ];

    return (
        <div className="sidebar">

            <h2 className="logo">ShohojTrust</h2>

            <div className="menu">

                {menuItems.map((item, index) => {
                    const isTimelinePath =
                        item.path === "/agreement-activity-timeline" &&
                        location.pathname.startsWith("/agreement-activity-timeline");

                    const isActive =
                        location.pathname === item.path || isTimelinePath;

                    return (
                        <div
                            key={index}
                            className={`menu-item ${isActive ? "active" : ""}`}
                            onClick={() => {
                                if (item.path) {
                                    navigate(item.path);
                                }
                            }}
                            style={{ cursor: item.path ? "pointer" : "default" }}
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
