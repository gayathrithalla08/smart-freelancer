const express = require("express");
const db = require("../database/db");
const {
    authMiddleware,
    roleMiddleware
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    roleMiddleware(["freelancer"]),
    (req, res) => {
        try {
            const {
                project_id,
                title,
                description,
                priority,
                status,
                due_date
            } = req.body;

            // Backend validation
            if (!project_id || !title) {
                return res.status(400).json({
                    message: "Project and task title are required"
                });
            }

            // Validate task status
            const allowedStatuses = [
                "To Do",
                "In Progress",
                "Completed"
            ];

            const taskStatus = status || "To Do";

            if (!allowedStatuses.includes(taskStatus)) {
                return res.status(400).json({
                    message: "Invalid task status"
                });
            }

            // Check whether the project exists
            const project = db.prepare(`
                SELECT id FROM projects WHERE id = ?
            `).get(project_id);

            if (!project) {
                return res.status(404).json({
                    message: "Project not found"
                });
            }

            // Insert task
            const statement = db.prepare(`
                INSERT INTO tasks (
                    project_id,
                    title,
                    description,
                    priority,
                    status,
                    due_date
                )
                VALUES (?, ?, ?, ?, ?, ?)
            `);

            const result = statement.run(
                project_id,
                title,
                description || null,
                priority || "Medium",
                taskStatus,
                due_date || null
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
                "Task Created",
                `Task "${title}" was created with status "${taskStatus}"`
            );

            res.status(201).json({
                message: "Task created successfully",
                task_id: result.lastInsertRowid
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                message: "Failed to create task"
            });
        }
    }
);

router.put(
    "/:id/status",
    authMiddleware,
    roleMiddleware(["freelancer"]),
    (req, res) => {
    try {
        const taskId = req.params.id;
        const { status } = req.body;

        // Validate status
        const allowedStatuses = [
            "To Do",
            "In Progress",
            "Completed"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid task status"
            });
        }

        // Check whether the task exists
        const task = db.prepare(`
            SELECT id, project_id, status
            FROM tasks
            WHERE id = ?
        `).get(taskId);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        // Update task status
        const statement = db.prepare(`
            UPDATE tasks
            SET status = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);

        statement.run(status, taskId);
        // Add project history
        db.prepare(`
            INSERT INTO project_history (
                project_id,
                action,
                description
            )
            VALUES (?, ?, ?)
        `).run(
            task.project_id,
            "Task Status Updated",
            `Task status changed from "${task.status}" to "${status}"`
        );


        res.json({
            message: "Task status updated successfully",
            task_id: taskId,
            status: status
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to update task status"
        });
    }
});

router.get(
    "/project/:projectId",
    authMiddleware,
    roleMiddleware(["freelancer"]),
    (req, res) => {
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

            const tasks = db.prepare(`
                SELECT
                    id,
                    project_id,
                    title,
                    description,
                    status,
                    priority,
                    due_date,
                    created_at,
                    updated_at
                FROM tasks
                WHERE project_id = ?
                ORDER BY created_at DESC, id DESC
            `).all(projectId);

            res.json({
                project_id: Number(projectId),
                tasks: tasks
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                message: "Failed to fetch tasks"
            });
        }
    }
);

module.exports = router;