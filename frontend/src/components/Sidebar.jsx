
import { Link, useNavigate } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/", { replace: true });
    };

    return (
        <aside className="sidebar">
            <h2>Smart Freelancer</h2>

            <nav>
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/clients">Clients</Link>
                <Link to="/projects">Projects</Link>
                <Link to="/tasks">Tasks</Link>
                <Link to="/invoices">Invoices</Link>
                <Link to="/payments">Payments</Link>
                <Link to="/history">Project History</Link>
                <Link to="/attachments">Attachments</Link>
            </nav>

            <button
                type="button"
                className="sidebar-logout"
                onClick={handleLogout}
            >
                Logout
            </button>
        </aside>
    );
}

export default Sidebar;
