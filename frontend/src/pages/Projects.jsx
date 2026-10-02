import { useEffect, useState } from "react";
import "./Projects.css";
import API_URL from "../api";
import Sidebar from "../components/Sidebar";

function Projects() {
    const [projects, setProjects] = useState([]);
    const [clients, setClients] = useState([]);
    const [message, setMessage] = useState("");

    const [formData, setFormData] = useState({
        client_id: "",
        title: "",
        description: "",
        budget: "",
        deadline: ""
    });

    const fetchClients = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `${API_URL}/clients`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (response.ok) {
                setClients(data.clients);
            }
        } catch (error) {
            console.error(error);
        }
    };

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
                setMessage(data.message || "Failed to fetch projects");
                return;
            }

            setProjects(data.projects);

        } catch (error) {
            console.error(error);
            setMessage("Unable to connect to server");
        }
    };

    useEffect(() => {
        fetchClients();
        fetchProjects();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `${API_URL}/projects`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        client_id: Number(formData.client_id),
                        title: formData.title,
                        description: formData.description,
                        budget: Number(formData.budget),
                        deadline: formData.deadline
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || "Failed to create project");
                return;
            }

            setMessage("Project created successfully");

            setFormData({
                client_id: "",
                title: "",
                description: "",
                budget: "",
                deadline: ""
            });

            fetchProjects();

        } catch (error) {
            console.error(error);
            setMessage("Unable to connect to server");
        }
    };

   return (
    <div className="projects-page">

        <Sidebar />

        <div className="projects-main">

            <div className="projects-header">
                <h1>Project Management</h1>
                <p>Create and manage your projects</p>
            </div>

            <div className="projects-content">


                <form
                    className="project-form"
                    onSubmit={handleSubmit}
                >
                    <select
                        name="client_id"
                        value={formData.client_id}
                        onChange={handleChange}
                        required
                    >
                        <option value="">
                            Select Client
                        </option>

                        {clients.map((client) => (
                            <option
                                key={client.id}
                                value={client.id}
                            >
                                {client.company_name}
                            </option>
                        ))}
                    </select>

                    <input
                        type="text"
                        name="title"
                        placeholder="Project Title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />

                    <textarea
                        name="description"
                        placeholder="Project Description"
                        value={formData.description}
                        onChange={handleChange}
                    />

                    <input
                        type="number"
                        name="budget"
                        placeholder="Budget"
                        value={formData.budget}
                        onChange={handleChange}
                        min="1"
                        required
                    />

                    <input
                        type="date"
                        name="deadline"
                        value={formData.deadline}
                        onChange={handleChange}
                        required
                    />

                    <button type="submit">
                        Create Project
                    </button>
                </form>

                {message && (
                    <p>{message}</p>
                )}

                <h2>Projects</h2>

                <table className="projects-table">
                    <thead>
                        <tr>
                            <th>Client</th>
                            <th>Project</th>
                            <th>Budget</th>
                            <th>Deadline</th>
                            <th>Status</th>
                        </tr>
                    </thead>

                    <tbody>
                        {projects.map((project) => (
                            <tr key={project.id}>
                                <td>{project.company_name}</td>
                                <td>{project.title}</td>
                                <td>₹{project.budget}</td>
                                <td>{project.deadline}</td>
                                <td className="project-status">
                                    {project.status}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

            </div>

        </div>

    </div>
);
}

export default Projects;