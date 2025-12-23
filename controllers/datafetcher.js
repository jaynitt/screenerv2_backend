import yahoo from "yahoo-finance2";
import { sql } from "../db.js"; // ✅ use Neon sql

const fetchandsavedata = async (symbol) => {
  try {
    /* -------- FUNDAMENTALS -------- */
    const fundamentals = await yahoo.quoteSummary(symbol, {
      modules: ["financialData", "incomeStatementHistory", "balanceSheetHistory"],
    });

    const returnOnEquity =
      fundamentals?.financialData?.returnOnEquity ?? null;

    /* -------- REAL TIME DATA -------- */
    const quote = await yahoo.quote(symbol);

    const {
      regularMarketPrice,
      marketCap,
      trailingPE,
      bookValue,
      dividendRate,
    } = quote;

    /* -------- SAVE TO DB (NEON SAFE) -------- */
    await sql`
      INSERT INTO stockdata (
        symbol,
        regularMarketPrice,
        marketCap,
        trailingPE,
        bookValue,
        dividendRate,
        returnOnEquity
      )
      VALUES (
        ${symbol},
        ${regularMarketPrice},
        ${marketCap},
        ${trailingPE},
        ${bookValue},
        ${dividendRate},
        ${returnOnEquity}
      )
      ON CONFLICT (symbol)
      DO UPDATE SET
        regularMarketPrice = EXCLUDED.regularMarketPrice,
        marketCap = EXCLUDED.marketCap,
        trailingPE = EXCLUDED.trailingPE,
        bookValue = EXCLUDED.bookValue,
        dividendRate = EXCLUDED.dividendRate,
        returnOnEquity = EXCLUDED.returnOnEquity;
    `;
  } catch (error) {
    console.error(`Failed to fetch or save data for ${symbol}:`, error.message);
    throw error;
  }
};

export default fetchandsavedata;

