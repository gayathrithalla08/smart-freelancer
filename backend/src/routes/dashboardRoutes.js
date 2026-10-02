const express = require("express");
const db = require("../database/db");
const {authMiddleware,roleMiddleware} = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/summary",authMiddleware,roleMiddleware(["freelancer"]),(req, res) => {
    try {
        // 1. Calculate total earnings
        const earningsResult = db.prepare(`
            SELECT COALESCE(SUM(amount), 0) AS total_earnings
            FROM payments
        `).get();

        // 2. Count active projects
        const projectsResult = db.prepare(`
            SELECT COUNT(*) AS active_projects
            FROM projects
            WHERE status = 'Active'
        `).get();

        // 3. Count tasks by status
        const taskResult = db.prepare(`
            SELECT
                COUNT(*) AS total_tasks,
                SUM(CASE WHEN status = 'To Do' THEN 1 ELSE 0 END) AS todo_tasks,
                SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) AS in_progress_tasks,
                SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) AS completed_tasks
            FROM tasks
        `).get();

        res.json({
            total_earnings: Number(earningsResult.total_earnings),
            active_projects: Number(projectsResult.active_projects),
            task_progress: {
                total: Number(taskResult.total_tasks),
                todo: Number(taskResult.todo_tasks || 0),
                in_progress: Number(taskResult.in_progress_tasks || 0),
                completed: Number(taskResult.completed_tasks || 0)
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch dashboard summary"
        });
    }
});

module.exports = router;