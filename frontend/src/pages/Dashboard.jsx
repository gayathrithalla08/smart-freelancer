import { useEffect, useState } from "react";
import "./Dashboard.css";
import API_URL from "../api";
import Sidebar from "../components/Sidebar";

function Dashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const token = localStorage.getItem("token");

                const response = await fetch(
                    `${API_URL}/dashboard/summary`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    setError(data.message || "Failed to load dashboard");
                    return;
                }

                setDashboard(data);

            } catch (error) {
                console.error(error);
                setError("Unable to connect to server");
            }
        };

        fetchDashboard();
    }, []);

    if (error) {
        return (
            <div className="dashboard-page">
                <Sidebar />

                <div className="dashboard-main">
                    <h2>{error}</h2>
                </div>
            </div>
        );
    }

    if (!dashboard) {
        return (
            <div className="dashboard-page">
                <Sidebar />

                <div className="dashboard-main">
                    <h2>Loading dashboard...</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-page">

            <Sidebar />

            <div className="dashboard-main">

                <div className="dashboard-header">
                    <h1>Dashboard</h1>

                    <p>
                        Welcome to Smart Freelancer
                    </p>
                </div>

                <div className="dashboard-cards">

                    <div className="dashboard-card">
                        <h3>Total Earnings</h3>
                        <p>₹{dashboard.total_earnings}</p>
                    </div>

                    <div className="dashboard-card">
                        <h3>Active Projects</h3>
                        <p>{dashboard.active_projects}</p>
                    </div>

                    <div className="dashboard-card">
                        <h3>Tasks Completed</h3>
                        <p>
                            {dashboard.task_progress.completed} /{" "}
                            {dashboard.task_progress.total}
                        </p>
                    </div>

                </div>

            </div>

        </div>
    );
}

export default Dashboard;