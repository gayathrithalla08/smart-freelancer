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
            const clients = db.prepare(`
                SELECT
                    id,
                    company_name,
                    phone,
                    address,
                    notes,
                    created_at
                FROM clients
                ORDER BY created_at DESC, id DESC
            `).all();

            res.json({
                clients: clients
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                message: "Failed to fetch clients"
            });
        }
    }
);

router.post("/", authMiddleware,
    roleMiddleware(["freelancer"]), (req, res) => {
    try {
        const { user_id, company_name, phone, address, notes } = req.body;

        if (!company_name) {
            return res.status(400).json({
                message: "Company name is required"
            });
        }

        const statement = db.prepare(`
            INSERT INTO clients (
                user_id,
                company_name,
                phone,
                address,
                notes
            )
            VALUES (?, ?, ?, ?, ?)
        `);

        const result = statement.run(
            user_id || null,
            company_name,
            phone || null,
            address || null,
            notes || null
        );

        res.status(201).json({
            message: "Client created successfully",
            client_id: result.lastInsertRowid
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to create client"
        });
    }
});

module.exports = router;