import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import "./Invoices.css";
import API_URL from "../api";

function Invoices() {
    const [projects, setProjects] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [message, setMessage] = useState("");

    const [formData, setFormData] = useState({
        project_id: "",
        invoice_number: "",
        amount: "",
        issue_date: "",
        due_date: ""
    });

    useEffect(() => {
        fetchProjects();
        fetchInvoices();
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

        const projectsWithTaskCounts = await Promise.all(
            data.projects.map(async (project) => {
                try {
                    const taskResponse = await fetch(
                        `${API_URL}/tasks/project/${project.id}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }
                    );

                    const taskData = await taskResponse.json();

                    const tasks = taskData.tasks || [];

                    const completedTasks = tasks.filter(
                        (task) => task.status === "Completed"
                    ).length;

                    return {
                        ...project,
                        total_tasks: tasks.length,
                        completed_tasks: completedTasks
                    };

                } catch (error) {
                    console.error(
                        `Failed to fetch tasks for project ${project.id}`,
                        error
                    );

                    return {
                        ...project,
                        total_tasks: 0,
                        completed_tasks: 0
                    };
                }
            })
        );

        setProjects(projectsWithTaskCounts);

    } catch (error) {
        console.error(error);
        setMessage("Unable to connect to server");
    }
};

    const fetchInvoices = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `${API_URL}/invoices`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(
                    data.message || "Failed to fetch invoices"
                );
                return;
            }

            setInvoices(data.invoices);

        } catch (error) {
            console.error(error);
            setMessage("Unable to connect to server");
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const selectedProject = projects.find(
            (project) =>
                Number(project.id) === Number(formData.project_id)
        );

        if (!selectedProject) {
            setMessage("Please select a project");
            return;
        }

        if (
            Number(selectedProject.total_tasks) === 0 ||
            Number(selectedProject.completed_tasks) !==
                Number(selectedProject.total_tasks)
        ) {
            setMessage(
                "Invoice can be created only after all project tasks are completed"
            );
            return;
        }

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `${API_URL}/invoices`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        project_id: Number(formData.project_id),
                        invoice_number: formData.invoice_number,
                        amount: Number(formData.amount),
                        issue_date: formData.issue_date,
                        due_date: formData.due_date
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(
                    data.message || "Failed to create invoice"
                );
                return;
            }

            setMessage("Invoice created successfully");

            setFormData({
                project_id: "",
                invoice_number: "",
                amount: "",
                issue_date: "",
                due_date: ""
            });

            fetchInvoices();
            fetchProjects();

        } catch (error) {
            console.error(error);
            setMessage("Unable to connect to server");
        }
    };

    return (
        <div className="invoices-page">

            <Sidebar />

            <main className="invoices-main">

                <div className="invoices-header">

                    <h1>
                        Invoice Management
                    </h1>

                    <p>
                        Create and manage invoices for completed work
                    </p>

                </div>

                <div className="invoice-content">

                    <h2>
                        Create Invoice
                    </h2>

                    <form
                        className="invoice-form"
                        onSubmit={handleSubmit}
                    >

                        <select
                            name="project_id"
                            value={formData.project_id}
                            onChange={handleChange}
                            required
                        >

                            <option value="">
                                Select Project
                            </option>

                            {projects.map((project) => {

                                const totalTasks =
                                    Number(project.total_tasks);

                                const completedTasks =
                                    Number(project.completed_tasks);

                                const allCompleted =
                                    totalTasks > 0 &&
                                    completedTasks === totalTasks;

                                return (
                                    <option
                                        key={project.id}
                                        value={project.id}
                                    >
                                        {project.title} —{" "}
                                        {completedTasks}/{totalTasks}{" "}
                                        Tasks Completed
                                        {allCompleted
                                            ? " ✓ Ready for Invoice"
                                            : " — Tasks Pending"}
                                    </option>
                                );
                            })}

                        </select>

                        <input
                            type="text"
                            name="invoice_number"
                            placeholder="Invoice Number"
                            value={formData.invoice_number}
                            onChange={handleChange}
                            required
                        />

                        <input
                            type="number"
                            name="amount"
                            placeholder="Amount"
                            value={formData.amount}
                            onChange={handleChange}
                            min="1"
                            required
                        />

                        <input
                            type="date"
                            name="issue_date"
                            value={formData.issue_date}
                            onChange={handleChange}
                            required
                        />

                        <input
                            type="date"
                            name="due_date"
                            value={formData.due_date}
                            onChange={handleChange}
                            required
                        />

                        <button type="submit">
                            Create Invoice
                        </button>

                    </form>

                    {message && (
                        <p>
                            {message}
                        </p>
                    )}

                    <h2>
                        Invoices
                    </h2>

                    <table className="invoices-table">

                        <thead>

                            <tr>

                                <th>
                                    Invoice Number
                                </th>

                                <th>
                                    Project
                                </th>

                                <th>
                                    Amount
                                </th>

                                <th>
                                    Issue Date
                                </th>

                                <th>
                                    Due Date
                                </th>

                                <th>
                                    Status
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {invoices.length === 0 ? (

                                <tr>

                                    <td colSpan="6">
                                        No invoices found
                                    </td>

                                </tr>

                            ) : (

                                invoices.map((invoice) => (

                                    <tr key={invoice.id}>

                                        <td>
                                            {invoice.invoice_number}
                                        </td>

                                        <td>
                                            {invoice.project_title}
                                        </td>

                                        <td>
                                            ₹{invoice.amount}
                                        </td>

                                        <td>
                                            {invoice.issue_date}
                                        </td>

                                        <td>
                                            {invoice.due_date}
                                        </td>

                                        <td>
                                            {invoice.status}
                                        </td>

                                    </tr>

                                ))

                            )}

                        </tbody>

                    </table>

                </div>

            </main>

        </div>
    );
}

export default Invoices;
