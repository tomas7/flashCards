// app/api/ordnet/route.ts

import { auth } from "auth"; // Replace with your actual auth function
import axios from "axios";
import * as cheerio from "cheerio";
import { NextResponse } from "next/server";

export const GET = auth(async (req) => {
  if (!req.auth) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
  }

  try {
    const url = `https://ordnet.dk/ddo/ordbog?query=${encodeURIComponent(query)}`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // Get all .citat elements
    const citats: string[] = [];
    $(".citat").each((i, el) => {

      const text = $(el).text().trim();
      if (text) citats.push(text);
    });

    return NextResponse.json({ citats });
  } catch (error) {
    console.error("Scraping failed:", error);
    return NextResponse.json({ error: "Scraping failed" }, { status: 500 });
  }
});
