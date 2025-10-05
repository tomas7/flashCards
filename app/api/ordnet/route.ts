import { auth } from "auth"; // Replace with your actual auth import
import axios from "axios";
import * as cheerio from "cheerio";
import { NextResponse } from "next/server";

export const GET = auth(async (req) => {
  if (!req.auth) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");

    if (!query) {
      return NextResponse.json({ error: "Missing 'query' parameter" }, { status: 400 });
    }

    const url = `https://ordnet.dk/ddo/ordbog?query=${encodeURIComponent(query)}`;
    const { data } = await axios.get(url);
    if (!data) return NextResponse.json({ error: "Failed to fetch data from ordnet.dk" }, { status: 500 });;
    const $ = cheerio.load(data);

    // Extract first paragraph with class "citat"
    const citat = $(".citat").first().text().trim() || "couldn't find citat";

    return NextResponse.json({ citat });
  } catch (error) {
    console.error("Error fetching from ordnet:", error);
    return NextResponse.json({ error: "Failed to fetch data from ordnet.dk" }, { status: 500 });
  }
});
