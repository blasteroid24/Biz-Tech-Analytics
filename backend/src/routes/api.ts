import { Router } from "express";
import { pool } from '../config/db.js'

const router = Router();

router.get("/", (req, res) => {
    res.send("Hello World")
})

router.get("/health", (req, res) => {
    res.send("Good Health")
})

router.get("/db", async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()')
        
        res.json({
            status: "success",
            message: "Database connection successful",
            timestamp: result.rows[0]
        })
    } 
    catch (error) {
        res.status(500).json({
            status: "error",
            message: "Database connection failed",
            error: error instanceof Error ? error.message : String(error)
        })
    }
})

export default router