const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../database/db");
const jwt = require("jsonwebtoken");

const router = express.Router();
// Register user
router.post("/register", async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            role
        } = req.body;

        // Validation
        if (!name || !email || !password || !role) {
            return res.status(400).json({
                message: "Name, email, password and role are required"
            });
        }

        // Validate role
        const allowedRoles = [
            "freelancer",
            "client",
            "admin"
        ];

        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                message: "Invalid role"
            });
        }

        // Check whether email already exists
        const existingUser = db.prepare(`
            SELECT id
            FROM users
            WHERE email = ?
        `).get(email);

        if (existingUser) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save user
        const statement = db.prepare(`
            INSERT INTO users (
                name,
                email,
                password,
                role
            )
            VALUES (?, ?, ?, ?)
        `);

        const result = statement.run(
            name,
            email,
            hashedPassword,
            role
        );

        res.status(201).json({
            message: "User registered successfully",
            user_id: result.lastInsertRowid,
            role: role
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to register user"
        });
    }
});
// Login user
router.post("/login", async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        // Find user
        const user = db.prepare(`
            SELECT
                id,
                name,
                email,
                password,
                role
            FROM users
            WHERE email = ?
        `).get(email);

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Compare password
        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Create JWT token
        const token = jwt.sign(
            {
                user_id: user.id,
                role: user.role
            },
            "freelancer_secret_key",
            {
                expiresIn: "1d"
            }
        );

        res.json({
            message: "Login successful",
            token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Login failed"
        });
    }
});

module.exports = router;