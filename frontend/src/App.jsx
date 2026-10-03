import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import Invoices from "./pages/Invoices";
import Payments from "./pages/Payments";
import ProjectHistory from "./pages/ProjectHistory";
import ProjectAttachments from "./pages/ProjectAttachments";

function App() {
    return (
        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={<Login />}
                />

                <Route
                    path="/dashboard"
                    element={<Dashboard />}
                />

                <Route
                    path="/clients"
                    element={<Clients />}
                />

                <Route
                    path="/projects"
                    element={<Projects />}
                />

                <Route
                    path="/tasks"
                    element={<Tasks />}
                />

                <Route
                    path="/invoices"
                    element={<Invoices />}
                />

                <Route
                    path="/payments"
                    element={<Payments />}
                />

                <Route
                    path="/history"
                    element={<ProjectHistory />}
                />
                <Route 
                    path="/attachments" 
                    element={<ProjectAttachments />} 
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;