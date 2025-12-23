import express from "express";
import sql from "../db.js";
import fetchandsavedata from "../controllers/datafetcher.js";

const router = express.Router();

/* ---------------- INSERT STOCK ---------------- */
router.post("/insertstock", async (req, res) => {
    try {
        const symbol = req.body.symbol;

        if (!symbol) {
            return res.status(400).json({ error: "Symbol required" });
        }

        await fetchandsavedata(symbol);

        res.json({ message: "Stock inserted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Insert failed" });
    }
});

/* ---------------- CONDITIONAL QUERY ---------------- */
router.post("/conditionalstock", async (req, res) => {
    try {
        const conditions = req.body;

        let whereClauses = [];
        let values = [];

        conditions.forEach((c, i) => {
            whereClauses.push(`${c.field} ${c.operator} $${i + 1}`);
            values.push(c.value);
        });

        const whereString =
            whereClauses.length > 0
                ? `WHERE ${whereClauses.join(" AND ")}`
                : "";

        const query = `SELECT * FROM stockdata ${whereString}`;

        const data = await sql(query, values);

        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Can't fetch data" });
    }
});

/* ---------------- GET SINGLE STOCK ---------------- */
router.post("/getstock", async (req, res) => {
    try {
        const { symbol } = req.body;

        const data = await sql(
            "SELECT * FROM stockdata WHERE symbol = $1",
            [symbol]
        );

        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Can't fetch stock" });
    }
});

/* ---------------- GET ALL STOCKS ---------------- */
router.get("/getallstock", async (req, res) => {
    try {
        const data = await sql("SELECT * FROM stockdata");
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Can't fetch all stocks" });
    }
});

export default router;
