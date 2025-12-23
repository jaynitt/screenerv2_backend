import yahoo from "yahoo-finance2"
import pool from "../db.js"

const fetchandsavedata = async (symbol) => {
    try {
        ///company related data
        const fundamentals = await yahoo.quoteSummary(symbol, {
            //modules me different categories of data hota hai
            modules: ["financialData", "incomeStatementHistory", "balanceSheetHistory"]
        })
        // Use optional chaining and provide default values to avoid errors on missing data
        const returnOnEquity = fundamentals?.financialData?.returnOnEquity ?? null;
        console.log("fundamentals", symbol, "returnOnEquity", returnOnEquity)
    
        //real_timedata
        const quote = await yahoo.quote(symbol)
        const { regularMarketPrice, currency, marketCap, trailingPE, bookValue, dividendRate } = quote
        console.log("regularMarketPrice", regularMarketPrice, "marketCap", marketCap, "trailingPE", trailingPE, "bookValue", bookValue, "dividendRate", dividendRate)
    
        // Save api data  in tables of PostGRESQL
        // Use ON CONFLICT to prevent duplicate symbol errors and instead update the existing record
         await pool.query(
            `INSERT INTO stockdata (symbol, regularMarketPrice, marketCap, trailingPE, bookValue, dividendRate, returnOnEquity) 
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (symbol) DO UPDATE SET
               regularMarketPrice = EXCLUDED.regularMarketPrice,
               marketCap = EXCLUDED.marketCap,
               trailingPE = EXCLUDED.trailingPE,
               bookValue = EXCLUDED.bookValue,
               dividendRate = EXCLUDED.dividendRate,
               returnOnEquity = EXCLUDED.returnOnEquity`,
            [symbol, regularMarketPrice, marketCap, trailingPE, bookValue, dividendRate, returnOnEquity]
        );
    } catch (error) {
        console.error(`Failed to fetch or save data for ${symbol}:`, error.message);
    }
}


export default fetchandsavedata;