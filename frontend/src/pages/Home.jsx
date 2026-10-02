import Sidebar from "../components/Sidebar";
import "./Home.css";

function Home() {
    return (
        <div className="home-page">

            <Sidebar />

            <main className="home-content">

                <h1>Welcome to Smart Freelancer</h1>

                <p>
                    Manage your clients, projects, tasks and payments
                    from one place.
                </p>

                <div className="home-cards">

                    <div className="home-card">
                        <h3>Dashboard</h3>
                        <p>View your project and earnings summary.</p>
                    </div>

                    <div className="home-card">
                        <h3>Clients</h3>
                        <p>Manage your client information.</p>
                    </div>

                    <div className="home-card">
                        <h3>Projects</h3>
                        <p>Create and manage projects.</p>
                    </div>

                    <div className="home-card">
                        <h3>Tasks</h3>
                        <p>Track task progress and status.</p>
                    </div>

                    <div className="home-card">
                        <h3>Invoices</h3>
                        <p>Manage invoices for completed work.</p>
                    </div>

                    <div className="home-card">
                        <h3>Payments</h3>
                        <p>Track pending and completed payments.</p>
                    </div>

                </div>

            </main>

        </div>
    );
}

export default Home;