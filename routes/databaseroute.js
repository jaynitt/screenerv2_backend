import pg from "pg"
import express from "express"
import pool from "../db.js"
import yahooFinance from "yahoo-finance2"
import fetchandsavedata from "../controllers/datafetcher.js"



const router = express.Router()

router.post("/insertstock", async (req, res) => {
    const symbol = req.body
    const result = fetchandsavedata(symbol)


})

///field ,sign,value
router.post("/conditionalstock", async (req, res) => {
    const conditions = req.body;
    console.log('vodjdj')
    console.log(conditions);

    let whereClauses = [];
    let values = [];

    conditions.forEach((e, i) => {
        whereClauses.push(`${e.field.trim()} ${e.operator.trim()} $${i + 1}`);
        values.push(e.value.trim());
    });

    const whereString = whereClauses.length ? "WHERE " + whereClauses.join(" AND ") : "";
    const query = `SELECT * FROM stockdata ${whereString}`;

    try {
        const data = await pool.query(query, values);
        console.log(data);
        res.json(data);
    } catch (error) {
        console.log(error);
        res.json({ error: "can't fetch data" });
    }
});


router.post("/getstock", async (req, res) => {
    const { symbol } = req.body

    try {
        const data = await pool.query("SELECT * FROM stockdata WHERE symbol=$1", [symbol])
        res.json(data.rows)
    } catch (error) {
        console.log(error)
        res.json({
            "error": `can't fetch data `
        })
    }



})
router.get("/getallstock", async (req, res) => {
    try {
        const data = await pool.query("SELECT * FROM stockdata")
        res.json(data.rows)
    } catch (error) {
        console.log(`can't fetch all stocks`)
    }


})


// router.get("/fetchdata",async(req,res)=>{
//     const fundamentals = await yahooFinance.quoteSummary("AAPL", {
//   modules: ["financialData", "incomeStatementHistory", "balanceSheetHistory"]
// });

// })


export default router