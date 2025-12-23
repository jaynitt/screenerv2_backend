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
    const conditions = req.body;

    if (!Array.isArray(conditions) || conditions.length === 0) {
      return res.status(400).json({ error: "No conditions provided" });
    }

    const allowedFields = [
      "symbol",
      "regularmarketprice",
      "marketcap",
      "trailingpe",
      "bookvalue",
      "dividendrate",
      "returnonequity"
    ];

    const allowedOperators = ["=", ">", "<"];

    const whereClauses = [];
    const values = [];

    conditions.forEach((c, idx) => {
      if (
        !allowedFields.includes(c.field) ||
        !allowedOperators.includes(c.operator)
      ) {
        throw new Error("Invalid condition");
      }

      // Build safe SQL fragment
      whereClauses.push(
        `${c.field} ${c.operator} $${idx + 1}`
      );

      values.push(Number(c.value));
    });

    const query = `
      SELECT * FROM stockdata
      WHERE ${whereClauses.join(" AND ")}
    `;

    const data = await sql(query, values);
    res.json(data);
  } catch (err) {
    console.error("Conditional query error:", err);
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
