import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import "./Payments.css";
import API_URL from "../api";

function Payments() {
    const [invoices, setInvoices] = useState([]);
    const [payments, setPayments] = useState([]);
    const [message, setMessage] = useState("");

    const [formData, setFormData] = useState({
        invoice_id: "",
        amount: "",
        payment_date: "",
        payment_method: ""
    });

    useEffect(() => {
        fetchInvoices();
        fetchPayments();
    }, []);

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

    const fetchPayments = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `${API_URL}/payments`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(
                    data.message || "Failed to fetch payments"
                );
                return;
            }

            setPayments(data.payments);

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

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `${API_URL}/payments`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        invoice_id: Number(formData.invoice_id),
                        amount: Number(formData.amount),
                        payment_date: formData.payment_date,
                        payment_method: formData.payment_method
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(
                    data.message || "Failed to record payment"
                );
                return;
            }

            setMessage("Payment recorded successfully");

            setFormData({
                invoice_id: "",
                amount: "",
                payment_date: "",
                payment_method: ""
            });

            fetchPayments();
            fetchInvoices();

        } catch (error) {
            console.error(error);
            setMessage("Unable to connect to server");
        }
    };

    return (
        <div className="payments-page">

            <Sidebar />

            <main className="payments-main">

                <div className="payments-header">

                    <h1>
                        Payment Tracking
                    </h1>

                    <p>
                        Record and track payments received from clients
                    </p>

                </div>

                <div className="payment-content">

                    <h2>
                        Record Payment
                    </h2>

                    <form
                        className="payment-form"
                        onSubmit={handleSubmit}
                    >

                        <select
                            name="invoice_id"
                            value={formData.invoice_id}
                            onChange={handleChange}
                            required
                        >

                            <option value="">
                                Select Invoice
                            </option>

                            {invoices.map((invoice) => (
                                <option
                                    key={invoice.id}
                                    value={invoice.id}
                                >
                                    {invoice.invoice_number} — ₹{invoice.amount} — {invoice.status}
                                </option>
                            ))}

                        </select>

                        <input
                            type="number"
                            name="amount"
                            placeholder="Payment Amount"
                            value={formData.amount}
                            onChange={handleChange}
                            min="1"
                            required
                        />

                        <input
                            type="date"
                            name="payment_date"
                            value={formData.payment_date}
                            onChange={handleChange}
                            required
                        />

                        <select
                            name="payment_method"
                            value={formData.payment_method}
                            onChange={handleChange}
                            required
                        >

                            <option value="">
                                Select Payment Method
                            </option>

                            <option value="Cash">
                                Cash
                            </option>

                            <option value="Bank Transfer">
                                Bank Transfer
                            </option>

                            <option value="UPI">
                                UPI
                            </option>

                            <option value="Card">
                                Card
                            </option>

                        </select>

                        <button type="submit">
                            Record Payment
                        </button>

                    </form>

                    {message && (
                        <p>
                            {message}
                        </p>
                    )}

                    <h2>
                        Payment History
                    </h2>

                    <table className="payments-table">

                        <thead>

                            <tr>

                                <th>
                                    Invoice
                                </th>

                                <th>
                                    Amount
                                </th>

                                <th>
                                    Payment Date
                                </th>

                                <th>
                                    Payment Method
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {payments.length === 0 ? (

                                <tr>

                                    <td colSpan="4">
                                        No payments found
                                    </td>

                                </tr>

                            ) : (

                                payments.map((payment) => (

                                    <tr key={payment.id}>

                                        <td>
                                            {payment.invoice_number}
                                        </td>

                                        <td>
                                            ₹{payment.amount}
                                        </td>

                                        <td>
                                            {payment.payment_date}
                                        </td>

                                        <td>
                                            {payment.payment_method}
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

export default Payments;