import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import "./ProjectHistory.css";
import API_URL from "../api";

function ProjectHistory() {
    const [projects, setProjects] = useState([]);
    const [history, setHistory] = useState([]);
    const [selectedProject, setSelectedProject] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `${API_URL}/projects`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(
                    data.message || "Failed to fetch projects"
                );
                return;
            }

            setProjects(data.projects);

        } catch (error) {
            console.error(error);
            setMessage("Unable to connect to server");
        }
    };

    const fetchHistory = async (projectId) => {
        if (!projectId) {
            setHistory([]);
            return;
        }

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `${API_URL}/history/project/${projectId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(
                    data.message || "Failed to fetch project history"
                );
                return;
            }

            setHistory(data.history);

        } catch (error) {
            console.error(error);
            setMessage("Unable to connect to server");
        }
    };

    const handleProjectChange = (e) => {
        const projectId = e.target.value;

        setSelectedProject(projectId);
        setMessage("");

        fetchHistory(projectId);
    };

    return (
        <div className="history-page">

            <Sidebar />

            <main className="history-main">

                <div className="history-header">

                    <h1>
                        Project History
                    </h1>

                    <p>
                        View the complete history of project activities
                    </p>

                </div>

                <div className="history-content">

                    <h2>
                        Select Project
                    </h2>

                    <select
                        className="history-project-select"
                        value={selectedProject}
                        onChange={handleProjectChange}
                    >

                        <option value="">
                            Select Project
                        </option>

                        {projects.map((project) => (
                            <option
                                key={project.id}
                                value={project.id}
                            >
                                {project.title}
                            </option>
                        ))}

                    </select>

                    {message && (
                        <p className="history-message">
                            {message}
                        </p>
                    )}

                    {selectedProject && (
                        <>
                            <h2 className="history-title">
                                Activity History
                            </h2>

                            {history.length === 0 ? (

                                <p>
                                    No history found for this project.
                                </p>

                            ) : (

                                <div className="history-list">

                                    {history.map((item) => (

                                        <div
                                            className="history-item"
                                            key={item.id}
                                        >

                                            <div className="history-item-header">

                                                <strong>
                                                    {item.action}
                                                </strong>

                                                <span>
                                                    {item.created_at}
                                                </span>

                                            </div>

                                            <p>
                                                {item.description}
                                            </p>

                                        </div>

                                    ))}

                                </div>

                            )}

                        </>
                    )}

                </div>

            </main>

        </div>
    );
}

export default ProjectHistory;