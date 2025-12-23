import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cron from "node-cron";

import databaseroutes from "./routes/databaseroute.js";
import fetchdataandsave from "./controllers/datafetcher.js";
import { sql } from "./db.js";

dotenv.config();

const app = express();

/* ---------------- MIDDLEWARE ---------------- */
app.use(express.json());
app.use(cors());

/* ---------------- ROUTES ---------------- */
app.use("/database", databaseroutes);

app.get("/", (req, res) => {
  res.send("hello from server");
});

/* ---------------- COMPANIES LIST ---------------- */
const companies = [
  // NIFTY 50
  "ADANIENT.NS", "ADANIPORTS.NS", "APOLLOHOSP.NS", "ASIANPAINT.NS", "AXISBANK.NS",
  "BAJAJ-AUTO.NS", "BAJFINANCE.NS", "BAJAJFINSV.NS", "BPCL.NS", "BHARTIARTL.NS",
  "BRITANNIA.NS", "CIPLA.NS", "COALINDIA.NS", "DIVISLAB.NS", "DRREDDY.NS",
  "EICHERMOT.NS", "GRASIM.NS", "HCLTECH.NS", "HDFCBANK.NS", "HDFCLIFE.NS",
  "HEROMOTOCO.NS", "HINDALCO.NS", "HINDUNILVR.NS", "ICICIBANK.NS", "ITC.NS",
  "INDUSINDBK.NS", "INFY.NS", "JSWSTEEL.NS", "KOTAKBANK.NS", "LTIM.NS",
  "LT.NS", "M&M.NS", "MARUTI.NS", "NESTLEIND.NS", "NTPC.NS",
  "ONGC.NS", "POWERGRID.NS", "RELIANCE.NS", "SBILIFE.NS", "SBIN.NS",
  "SUNPHARMA.NS", "TCS.NS", "TATACONSUM.NS", "TATAMOTORS.NS", "TATASTEEL.NS",
  "TECHM.NS", "TITAN.NS", "ULTRACEMCO.NS", "WIPRO.NS", "SHRIRAMFIN.NS",

  // NIFTY NEXT 50
  "ADANIGREEN.NS", "ADANIPOWER.NS", "AMBUJACEM.NS", "DMART.NS",
  "BAJAJHLDNG.NS", "BANKBARODA.NS", "BERGEPAINT.NS", "CANBK.NS", "CHOLAFIN.NS",
  "COLPAL.NS", "DABUR.NS", "GAIL.NS", "GODREJCP.NS", "HAVELLS.NS",
  "HDFCAMC.NS", "ICICIGI.NS", "ICICIPRULI.NS", "IOC.NS", "INDIGO.NS",
  "JIOFIN.NS", "JSWENERGY.NS", "LICI.NS", "MARICO.NS", "MOTHERSON.NS",
  "MUTHOOTFIN.NS", "NAUKRI.NS", "PIDILITIND.NS", "PNB.NS", "PGHH.NS",
  "SBICARD.NS", "SIEMENS.NS", "TATAPOWER.NS", "TVSMOTOR.NS", "UPL.NS",
  "VBL.NS", "VEDL.NS", "DLF.NS", "BOSCHLTD.NS",
  "TRENT.NS", "IRCTC.NS", "HAL.NS", "BEL.NS", "SAIL.NS",
  "SRF.NS", "HINDZINC.NS", "HINDPETRO.NS", "JUBLFOOD.NS", "BANDHANBNK.NS"
];

/* ---------------- DATA FETCH JOB ---------------- */
const runDataFetch = async () => {
  try {
    console.log("Clearing stockdata table...");
    await sql`TRUNCATE TABLE stockdata RESTART IDENTITY`;
    console.log("Table cleared");
  } catch (err) {
    console.error("Failed to truncate table:", err);
    return;
  }

  console.log(`Fetching data for ${companies.length} companies...`);

  const results = await Promise.allSettled(
    companies.map(symbol => fetchdataandsave(symbol))
  );

  results.forEach((r, i) => {
    if (r.status === "rejected") {
      console.error(`Failed for ${companies[i]}`, r.reason);
    }
  });

  console.log("Data fetch completed");
};

/* ---------------- CRON (Vercel WARNING) ---------------- */
/**
 * ⚠️ NOTE:
 * node-cron WILL NOT run on Vercel serverless
 * Keep this ONLY for local / traditional server
 */
// cron.schedule("0 0 * * *", runDataFetch);

/* ---------------- EXPORT FOR VERCEL ---------------- */
export default app;
