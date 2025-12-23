import express  from "express"
import cors from "cors"
import pool from "./db.js"
import dotenv from 'dotenv'
import yahoo from "yahoo-finance2"
import cron from 'node-cron'
import databaseroutes from "./routes/databaseroute.js"
import fetchdataandsave from "./controllers/datafetcher.js";

const app=express()
const port=process.env.PORT||4000;

dotenv.config()
///middleware 
app.use(express.json())
app.use(cors())



///routes
app.use("/database",databaseroutes)

app.get('/' , (req , res)=>{

   res.send('hello from server)')

})

// fetching data and saving to database
 const companies = [ // NIFTY 100 Companies (NIFTY 50 + NIFTY Next 50)
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
 
   // NIFTY Next 50
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
    

 // A better approach: run fetches in parallel
 const runDataFetch = async () => {
    try {
      console.log("Clearing existing stock data from the database...");
      // This command deletes all rows from the table to ensure a fresh start.
      await pool.query('TRUNCATE TABLE stockdata RESTART IDENTITY;');
      console.log("Database cleared successfully.");
    } catch (err) {
      console.error("Error clearing the database:", err.stack);
      return; // Stop execution if we can't clear the table
    }
    console.log(`Starting data fetch for ${companies.length} companies...`);
    const fetchPromises = companies.map(comp => fetchdataandsave(comp));
    const results = await Promise.allSettled(fetchPromises);
    console.log("Data fetch process completed.");
    results.forEach((result, index) => {
        if (result.status === 'rejected') {
            console.error(`Promise for ${companies[index]} was rejected:`, result.reason);
        }
    });
 };
  cron.schedule('0 0 * * *',()=>{
        runDataFetch();

 })




///server instance
app.listen(port,()=>{
    console.log(`server running on ${port}`)
})