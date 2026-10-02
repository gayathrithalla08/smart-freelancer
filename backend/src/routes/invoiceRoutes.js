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
            const invoices = db.prepare(`
                SELECT
                    i.id,
                    i.project_id,
                    p.title AS project_title,
                    i.invoice_number,
                    i.amount,
                    i.issue_date,
                    i.due_date,
                    i.status,
                    i.created_at
                FROM invoices i
                JOIN projects p
                    ON i.project_id = p.id
                ORDER BY i.created_at DESC, i.id DESC
            `).all();

            res.json({
                invoices: invoices
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                message: "Failed to fetch invoices"
            });
        }
    }
);

router.post(
    "/",
    authMiddleware,
    roleMiddleware(["freelancer"]),
    (req, res) => {
        try {
            const {
                project_id,
                invoice_number,
                amount,
                issue_date,
                due_date
            } = req.body;

            // Backend validation
            if (
                !project_id ||
                !invoice_number ||
                amount === undefined ||
                !issue_date ||
                !due_date
            ) {
                return res.status(400).json({
                    message:
                        "Project, invoice number, amount, issue date and due date are required"
                });
            }

            // Validate amount
            if (Number(amount) <= 0) {
                return res.status(400).json({
                    message:
                        "Invoice amount must be greater than zero"
                });
            }

            // Check whether project exists
            const project = db.prepare(`
                SELECT id
                FROM projects
                WHERE id = ?
            `).get(project_id);

            if (!project) {
                return res.status(404).json({
                    message: "Project not found"
                });
            }

            // Check whether all project tasks are completed
            const taskSummary = db.prepare(`
                SELECT
                    COUNT(*) AS total_tasks,
                    SUM(
                        CASE
                            WHEN status = 'Completed' THEN 1
                            ELSE 0
                        END
                    ) AS completed_tasks
                FROM tasks
                WHERE project_id = ?
            `).get(project_id);

            if (
                Number(taskSummary.total_tasks) === 0 ||
                Number(taskSummary.completed_tasks) !==
                    Number(taskSummary.total_tasks)
            ) {
                return res.status(400).json({
                    message:
                        "Invoice can be generated only after all project tasks are completed"
                });
            }

            // Check duplicate invoice number
            const existingInvoice = db.prepare(`
                SELECT id
                FROM invoices
                WHERE invoice_number = ?
            `).get(invoice_number);

            if (existingInvoice) {
                return res.status(409).json({
                    message: "Invoice number already exists"
                });
            }

            // Create invoice
            const statement = db.prepare(`
                INSERT INTO invoices (
                    project_id,
                    invoice_number,
                    amount,
                    issue_date,
                    due_date
                )
                VALUES (?, ?, ?, ?, ?)
            `);

            const result = statement.run(
                project_id,
                invoice_number,
                amount,
                issue_date,
                due_date
            );

            // Add project history
            db.prepare(`
                INSERT INTO project_history (
                    project_id,
                    action,
                    description
                )
                VALUES (?, ?, ?)
            `).run(
                project_id,
                "Invoice Created",
                `Invoice "${invoice_number}" was created for ₹${amount}`
            );

            res.status(201).json({
                message: "Invoice created successfully",
                invoice_id: result.lastInsertRowid
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                message: "Failed to create invoice"
            });
        }
    }
);

module.exports = router;