const express = require("express");
const db = require("../database/db");
const {
    authMiddleware,
    roleMiddleware
} = require("../middleware/authMiddleware");

const router = express.Router();

// Add attachment
router.post("/",  authMiddleware,
    roleMiddleware(["freelancer"]),(req, res) => {
    try {
        const {
            project_id,
            file_name,
            file_url
        } = req.body;

        // Validation
        if (!project_id || (!file_name && !file_url)) {
            return res.status(400).json({
                message: "Project ID and file name or file URL are required"
            });
        }

        // Check project exists
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

        // Insert attachment
        const statement = db.prepare(`
            INSERT INTO project_attachments (
                project_id,
                file_name,
                file_url
            )
            VALUES (?, ?, ?)
        `);

        const result = statement.run(
            project_id,
            file_name || null,
            file_url || null
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
            "Attachment Added",
            `Attachment "${file_name || file_url}" was added`
        );

        res.status(201).json({
            message: "Attachment added successfully",
            attachment_id: result.lastInsertRowid
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to add attachment"
        });
    }
});

// Get project attachments
router.get("/project/:projectId", authMiddleware,
    roleMiddleware(["freelancer"]), (req, res) => {
    try {
        const projectId = req.params.projectId;

        const project = db.prepare(`
            SELECT id
            FROM projects
            WHERE id = ?
        `).get(projectId);

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        const attachments = db.prepare(`
            SELECT
                id,
                project_id,
                file_name,
                file_url,
                uploaded_at
            FROM project_attachments
            WHERE project_id = ?
            ORDER BY uploaded_at DESC, id DESC
        `).all(projectId);

        res.json({
            project_id: Number(projectId),
            attachments: attachments
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch attachments"
        });
    }
});

module.exports = router;