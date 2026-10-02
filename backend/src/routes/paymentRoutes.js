const express = require("express");
const db = require("../database/db");
const {
    authMiddleware,
    roleMiddleware
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
    "/",
    authMiddleware,
    roleMiddleware(["freelancer"]),
    (req, res) => {
        try {
            const payments = db.prepare(`
                SELECT
                    pay.id,
                    pay.invoice_id,
                    i.invoice_number,
                    i.project_id,
                    p.title AS project_title,
                    pay.amount,
                    pay.payment_date,
                    pay.payment_method,
                    pay.notes,
                    pay.created_at
                FROM payments pay
                JOIN invoices i
                    ON pay.invoice_id = i.id
                JOIN projects p
                    ON i.project_id = p.id
                ORDER BY pay.payment_date DESC, pay.id DESC
            `).all();

            res.json({
                payments: payments
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                message: "Failed to fetch payments"
            });
        }
    }
);

router.post("/",  authMiddleware,
    roleMiddleware(["freelancer"]),(req, res) => {
    try {
        const {
            invoice_id,
            amount,
            payment_date,
            payment_method,
            notes
        } = req.body;

        // Validate required fields
        if (!invoice_id || amount === undefined || !payment_date) {
            return res.status(400).json({
                message: "Invoice, amount and payment date are required"
            });
        }

        // Validate amount
        if (Number(amount) <= 0) {
            return res.status(400).json({
                message: "Payment amount must be greater than zero"
            });
        }

        // Check invoice exists
        const invoice = db.prepare(`
            SELECT id, amount
            FROM invoices
            WHERE id = ?
        `).get(invoice_id);

        if (!invoice) {
            return res.status(404).json({
                message: "Invoice not found"
            });
        }

        // Calculate already paid amount
        const paidResult = db.prepare(`
            SELECT COALESCE(SUM(amount), 0) AS total_paid
            FROM payments
            WHERE invoice_id = ?
        `).get(invoice_id);

        const totalPaid = Number(paidResult.total_paid);

        // Prevent overpayment
        if (totalPaid + Number(amount) > Number(invoice.amount)) {
            return res.status(400).json({
                message: "Payment amount exceeds remaining invoice amount"
            });
        }

        // Insert payment
        const statement = db.prepare(`
            INSERT INTO payments (
                invoice_id,
                amount,
                payment_date,
                payment_method,
                notes
            )
            VALUES (?, ?, ?, ?, ?)
        `);

        const result = statement.run(
            invoice_id,
            amount,
            payment_date,
            payment_method || null,
            notes || null
        );

        // Get project for this invoice
const invoiceProject = db.prepare(`
    SELECT project_id
    FROM invoices
    WHERE id = ?
`).get(invoice_id);

// Add project history
db.prepare(`
    INSERT INTO project_history (
        project_id,
        action,
        description
    )
    VALUES (?, ?, ?)
`).run(
    invoiceProject.project_id,
    "Payment Received",
    `Payment of ₹${amount} received for invoice "${invoice_id}"`
);

        // Calculate new total
        const newTotalPaid = totalPaid + Number(amount);

        let status = "Pending";

        if (newTotalPaid >= Number(invoice.amount)) {
            status = "Paid";
        } else if (newTotalPaid > 0) {
            status = "Partially Paid";
        }

        // Update invoice status
        db.prepare(`
            UPDATE invoices
            SET status = ?
            WHERE id = ?
        `).run(status, invoice_id);

        res.status(201).json({
            message: "Payment recorded successfully",
            payment_id: result.lastInsertRowid,
            invoice_status: status
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to record payment"
        });
    }
});

module.exports = router;