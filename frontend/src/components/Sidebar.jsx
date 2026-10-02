import { Link } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
    return (
        <aside className="sidebar">

            <h2>Smart Freelancer</h2>

            <nav>
                <Link to="/home">
                    Home
                </Link>

                <Link to="/dashboard">
                    Dashboard
                </Link>

                <Link to="/clients">
                    Clients
                </Link>

                <Link to="/projects">
                    Projects
                </Link>

                <Link to="/tasks">
                    Tasks
                </Link>

                <Link to="/invoices">
                    Invoices
                </Link>

                <Link to="/payments">
                    Payments
                </Link>

                <Link to="/history">
                    Project History
                </Link>

                <Link to="/attachments">
                    Attachments
                </Link>

            </nav>

        </aside>
    );
}

export default Sidebar;