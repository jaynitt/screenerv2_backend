// routes/databaseroute.js
import express from "express";
import { sql } from "../db.js"; // Neon tagged-template import
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
    const conditions = req.body; // array of { field, operator, value }

    if (!conditions || !Array.isArray(conditions) || conditions.length === 0) {
      return res.status(400).json({ error: "No conditions provided" });
    }

    // Build the dynamic WHERE clause safely
    const whereClauses = conditions.map(c =>
      sql`${sql.identifier([c.field])} ${sql.raw(c.operator)} ${c.value}`
    );

    const data = await sql`
      SELECT * FROM stockdata
      WHERE ${sql.join(whereClauses, sql` AND `)}
    `;

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Can't fetch data" });
  }
});

/* ---------------- GET SINGLE STOCK ---------------- */
router.post("/getstock", async (req, res) => {
  try {
    const { symbol } = req.body;

    if (!symbol) {
      return res.status(400).json({ error: "Symbol required" });
    }

    const data = await sql`
      SELECT * FROM stockdata
      WHERE symbol = ${symbol}
    `;

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Can't fetch stock" });
  }
});

/* ---------------- GET ALL STOCKS ---------------- */
router.get("/getallstock", async (req, res) => {
  try {
    const data = await sql`SELECT * FROM stockdata`;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Can't fetch all stocks" });
  }
});

export default router;
