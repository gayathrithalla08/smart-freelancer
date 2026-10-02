const express = require("express");
const db = require("../database/db");
const {
    authMiddleware,
    roleMiddleware
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/project/:projectId", authMiddleware,
    roleMiddleware(["freelancer"]), (req, res) => {
    try {
        const projectId = req.params.projectId;

        // Check project exists
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

        // Get project history
        const history = db.prepare(`
            SELECT
                id,
                project_id,
                action,
                description,
                created_at
            FROM project_history
            WHERE project_id = ?
            ORDER BY created_at DESC, id DESC
        `).all(projectId);

        res.json({
            project_id: Number(projectId),
            history: history
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch project history"
        });
    }
});

module.exports = router;