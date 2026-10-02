import { useEffect, useState } from "react";
import "./Clients.css";
import API_URL from "../api";
import Sidebar from "../components/Sidebar";

function Clients() {
    const [clients, setClients] = useState([]);

    const [formData, setFormData] = useState({
        company_name: "",
        phone: "",
        address: "",
        notes: ""
    });

    const [message, setMessage] = useState("");

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

            if (!response.ok) {
                setMessage(data.message || "Failed to fetch clients");
                return;
            }

            setClients(data.clients);

        } catch (error) {
            console.error(error);
            setMessage("Unable to connect to server");
        }
    };

    useEffect(() => {
        fetchClients();
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
                `${API_URL}/clients`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(formData)
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || "Failed to create client");
                return;
            }

            setMessage("Client created successfully");

            setFormData({
                company_name: "",
                phone: "",
                address: "",
                notes: ""
            });

            fetchClients();

        } catch (error) {
            console.error(error);
            setMessage("Unable to connect to server");
        }
    };

    return (
    <div className="clients-page">

        <Sidebar />

        <div className="clients-main">

            <div className="clients-header">
                <h1>Client Management</h1>
                <p>Manage your clients and their information</p>
            </div>

            <div className="clients-content">

                <h2>Add Client</h2>

                <form
                    className="client-form"
                    onSubmit={handleSubmit}
                >
                    <input
                        type="text"
                        name="company_name"
                        placeholder="Company Name"
                        value={formData.company_name}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="text"
                        name="phone"
                        placeholder="Phone"
                        value={formData.phone}
                        onChange={handleChange}
                    />

                    <input
                        type="text"
                        name="address"
                        placeholder="Address"
                        value={formData.address}
                        onChange={handleChange}
                    />

                    <textarea
                        name="notes"
                        placeholder="Notes"
                        value={formData.notes}
                        onChange={handleChange}
                    />

                    <button type="submit">
                        Add Client
                    </button>
                </form>

                {message && (
                    <p>{message}</p>
                )}

                <h2>Clients</h2>

                <table className="clients-table">
                    <thead>
                        <tr>
                            <th>Company</th>
                            <th>Phone</th>
                            <th>Address</th>
                            <th>Notes</th>
                        </tr>
                    </thead>

                    <tbody>
                        {clients.map((client) => (
                            <tr key={client.id}>
                                <td>{client.company_name}</td>
                                <td>{client.phone || "-"}</td>
                                <td>{client.address || "-"}</td>
                                <td>{client.notes || "-"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

            </div>

        </div>

    </div>
);
}

export default Clients;