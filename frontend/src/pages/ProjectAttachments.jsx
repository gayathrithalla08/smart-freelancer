import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import "./ProjectAttachments.css";
import API_URL from "../api";

function ProjectAttachments() {
    const [projects, setProjects] = useState([]);
    const [attachments, setAttachments] = useState([]);
    const [selectedProject, setSelectedProject] = useState("");
    const [message, setMessage] = useState("");

    const [formData, setFormData] = useState({
        file_name: "",
        file_url: ""
    });

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

    const fetchAttachments = async (projectId) => {
        if (!projectId) {
            setAttachments([]);
            return;
        }

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `${API_URL}/attachments/project/${projectId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(
                    data.message || "Failed to fetch attachments"
                );
                return;
            }

            setAttachments(data.attachments);

        } catch (error) {
            console.error(error);
            setMessage("Unable to connect to server");
        }
    };

    const handleProjectChange = (e) => {
        const projectId = e.target.value;

        setSelectedProject(projectId);
        setMessage("");

        setFormData({
            file_name: "",
            file_url: ""
        });

        fetchAttachments(projectId);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedProject) {
            setMessage("Please select a project");
            return;
        }

        if (!formData.file_name && !formData.file_url) {
            setMessage("Please enter a file name or file URL");
            return;
        }

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `${API_URL}/attachments`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        project_id: Number(selectedProject),
                        file_name: formData.file_name || null,
                        file_url: formData.file_url || null
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(
                    data.message || "Failed to add attachment"
                );
                return;
            }

            setMessage("Attachment added successfully");

            setFormData({
                file_name: "",
                file_url: ""
            });

            fetchAttachments(selectedProject);

        } catch (error) {
            console.error(error);
            setMessage("Unable to connect to server");
        }
    };

    return (
        <div className="attachments-page">
            <Sidebar />

            <main className="attachments-main">

                <div className="attachments-header">
                    <h1>Project Attachments</h1>
                    <p>
                        Add and manage project files and deliverable URLs
                    </p>
                </div>

                <div className="attachments-content">

                    <h2>Select Project</h2>

                    <select
                        className="attachment-project-select"
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

                    {selectedProject && (
                        <>
                            <h2 className="attachment-form-title">
                                Add Attachment
                            </h2>

                            <form
                                className="attachment-form"
                                onSubmit={handleSubmit}
                            >
                                <input
                                    type="text"
                                    name="file_name"
                                    placeholder="File Name"
                                    value={formData.file_name}
                                    onChange={handleChange}
                                />

                                <input
                                    type="url"
                                    name="file_url"
                                    placeholder="File URL"
                                    value={formData.file_url}
                                onChange={handleChange}
                                />

                                <button type="submit">
                                    Add Attachment
                                </button>
                            </form>
                        </>
                    )}

                    {message && (
                        <p className="attachment-message">
                            {message}
                        </p>
                    )}

                    {selectedProject && (
                        <>
                            <h2 className="attachment-list-title">
                                Attachments
                            </h2>

                            {attachments.length === 0 ? (
                                <p>No attachments found for this project.</p>
                            ) : (
                                <table className="attachments-table">
                                    <thead>
                                        <tr>
                                            <th>File Name</th>
                                            <th>File URL</th>
                                            <th>Uploaded At</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {attachments.map((attachment) => (
                                            <tr key={attachment.id}>
                                                <td>
                                                    {attachment.file_name || "-"}
                                                </td>

                                                <td>
                                                    {attachment.file_url ? (
                                                        <a
                                                            href={attachment.file_url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                        >
                                                            Open Attachment
                                                        </a>
                                                    ) : (
                                                        "-"
                                                    )}
                                                </td>

                                                <td>
                                                    {attachment.uploaded_at}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </>
                    )}

                </div>
            </main>
        </div>
    );
}

export default ProjectAttachments;