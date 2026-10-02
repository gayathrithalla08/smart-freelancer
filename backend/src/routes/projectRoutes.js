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
            const projects = db.prepare(`
                SELECT
                    p.id,
                    p.client_id,
                    c.company_name,
                    p.title,
                    p.description,
                    p.budget,
                    p.deadline,
                    p.status,
                    p.created_at,
                    p.updated_at,

                    (
                        SELECT COUNT(*)
                        FROM tasks t
                        WHERE t.project_id = p.id
                    ) AS total_tasks,

                    (
                        SELECT COUNT(*)
                        FROM tasks t
                        WHERE t.project_id = p.id
                        AND t.status = 'Completed'
                    ) AS completed_tasks

                FROM projects p
                JOIN clients c
                    ON p.client_id = c.id
                ORDER BY p.created_at DESC, p.id DESC
            `).all();

            res.json({
                projects: projects
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                message: "Failed to fetch projects"
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
                client_id,
                title,
                description,
                budget,
                deadline
            } = req.body;

            // Backend validation
            if (
                !client_id ||
                !title ||
                budget === undefined ||
                !deadline
            ) {
                return res.status(400).json({
                    message:
                        "Client, title, budget and deadline are required"
                });
            }

            // Check if the client exists
            const client = db.prepare(`
                SELECT id
                FROM clients
                WHERE id = ?
            `).get(client_id);

            if (!client) {
                return res.status(404).json({
                    message: "Client not found"
                });
            }

            // Prevent duplicate project
            // for the same client with the same title
            const existingProject = db.prepare(`
                SELECT id
                FROM projects
                WHERE client_id = ?
                AND title = ?
            `).get(client_id, title);

            if (existingProject) {
                return res.status(409).json({
                    message:
                        "A project with this title already exists for this client"
                });
            }

            // Insert project
            const statement = db.prepare(`
                INSERT INTO projects (
                    client_id,
                    title,
                    description,
                    budget,
                    deadline
                )
                VALUES (?, ?, ?, ?, ?)
            `);

            const result = statement.run(
                client_id,
                title,
                description || null,
                budget,
                deadline
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
                result.lastInsertRowid,
                "Project Created",
                `Project "${title}" was created`
            );

            res.status(201).json({
                message: "Project created successfully",
                project_id: result.lastInsertRowid
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                message: "Failed to create project"
            });
        }
    }
);

module.exports = router;