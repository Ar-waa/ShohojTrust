import React from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

const AdminDashboard = () => {
    return (
        <div className="dashboard">
            <Sidebar />
            <div className="main">
                <Topbar />
                <div className="content">
                    <div className="page-header">
                        <div>
                            <h2>Welcome to Admin Dashboard</h2>
                            <p className="subtext">Manage users, disputes, and system settings.</p>
                        </div>
                    </div>
                    
                    <div className="summary-card" style={{ marginTop: '20px' }}>
                        <h3>Overview</h3>
                        <p>Welcome! Use the sidebar to navigate through the platform administration tools.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
