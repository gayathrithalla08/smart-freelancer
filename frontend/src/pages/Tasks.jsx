import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import "./Tasks.css";
import API_URL from "../api";

function Tasks() {
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState("");
    const [message, setMessage] = useState("");

    const [taskForm, setTaskForm] = useState({
        title: "",
        description: "",
        priority: "Medium",
        status: "To Do"
    });

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

    useEffect(() => {
        fetchProjects();
    }, []);

    useEffect(() => {
        if (!selectedProject) {
            setTasks([]);
            return;
        }

        const fetchTasks = async () => {
            try {
                const token = localStorage.getItem("token");

                const response = await fetch(
                    `${API_URL}/tasks/project/${selectedProject}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    setMessage(
                        data.message || "Failed to fetch tasks"
                    );
                    return;
                }

                setTasks(data.tasks);
                setMessage("");

            } catch (error) {
                console.error(error);
                setMessage("Unable to connect to server");
            }
        };

        fetchTasks();

    }, [selectedProject]);

    const handleTaskChange = (e) => {
        setTaskForm({
            ...taskForm,
            [e.target.name]: e.target.value
        });
    };

    const handleTaskSubmit = async (e) => {
        e.preventDefault();

        if (!selectedProject) {
            setMessage("Please select a project first");
            return;
        }

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `${API_URL}/tasks`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        project_id: Number(selectedProject),
                        title: taskForm.title,
                        description: taskForm.description,
                        priority: taskForm.priority,
                        status: taskForm.status
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(
                    data.message || "Failed to create task"
                );
                return;
            }

            setMessage("Task created successfully");

            setTaskForm({
                title: "",
                description: "",
                priority: "Medium",
                status: "To Do"
            });

            const tasksResponse = await fetch(
                `${API_URL}/tasks/project/${selectedProject}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const tasksData = await tasksResponse.json();

            if (tasksResponse.ok) {
                setTasks(tasksData.tasks);
            }

        } catch (error) {
            console.error(error);
            setMessage("Unable to connect to server");
        }
    };

    return (
        <div className="tasks-page">

            <Sidebar />

            <div className="tasks-main">

                <div className="tasks-header">

                    <h1>Task Management</h1>

                    <p>
                        Track and manage your project tasks
                    </p>

                </div>

                <div className="task-project-select">

                    <label>Select Project</label>

                    <select
                        value={selectedProject}
                        onChange={(e) =>
                            setSelectedProject(e.target.value)
                        }
                    >
                        <option value="">
                            Select a project
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

                </div>

                <div className="add-task-section">

                    <h2>Add Task</h2>

                    <form
                        className="task-form"
                        onSubmit={handleTaskSubmit}
                    >

                        <input
                            type="text"
                            name="title"
                            placeholder="Task Title"
                            value={taskForm.title}
                            onChange={handleTaskChange}
                            required
                        />

                        <textarea
                            name="description"
                            placeholder="Task Description"
                            value={taskForm.description}
                            onChange={handleTaskChange}
                        />

                        <select
                            name="priority"
                            value={taskForm.priority}
                            onChange={handleTaskChange}
                        >
                            <option value="Low">
                                Low Priority
                            </option>

                            <option value="Medium">
                                Medium Priority
                            </option>

                            <option value="High">
                                High Priority
                            </option>
                        </select>

                        <select
                            name="status"
                            value={taskForm.status}
                            onChange={handleTaskChange}
                        >
                            <option value="To Do">
                                To Do
                            </option>

                            <option value="In Progress">
                                In Progress
                            </option>

                            <option value="Completed">
                                Completed
                            </option>
                        </select>

                        <button type="submit">
                            Create Task
                        </button>

                    </form>

                </div>

                {message && (
                    <p>{message}</p>
                )}

                <div className="task-board">

                    <div className="task-column">

                        <h2>To Do</h2>

                        {tasks
                            .filter(
                                (task) =>
                                    task.status === "To Do"
                            )
                            .map((task) => (
                                <div
                                    className="task-card"
                                    key={task.id}
                                >
                                    <h3>{task.title}</h3>

                                    <p>
                                        {task.description ||
                                            "No description"}
                                    </p>

                                    <span>
                                        Priority: {task.priority}
                                    </span>
                                </div>
                            ))}

                    </div>

                    <div className="task-column">

                        <h2>In Progress</h2>

                        {tasks
                            .filter(
                                (task) =>
                                    task.status === "In Progress"
                            )
                            .map((task) => (
                                <div
                                    className="task-card"
                                    key={task.id}
                                >
                                    <h3>{task.title}</h3>

                                    <p>
                                        {task.description ||
                                            "No description"}
                                    </p>

                                    <span>
                                        Priority: {task.priority}
                                    </span>
                                </div>
                            ))}

                    </div>

                    <div className="task-column">

                        <h2>Completed</h2>

                        {tasks
                            .filter(
                                (task) =>
                                    task.status === "Completed"
                            )
                            .map((task) => (
                                <div
                                    className="task-card"
                                    key={task.id}
                                >
                                    <h3>{task.title}</h3>

                                    <p>
                                        {task.description ||
                                            "No description"}
                                    </p>

                                    <span>
                                        Priority: {task.priority}
                                    </span>
                                </div>
                            ))}

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Tasks;