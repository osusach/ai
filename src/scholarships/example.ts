import { getXataClient } from "../xata";

async function example() {
  const xata = getXataClient();
  const result = await xata.db.ai.getPaginated();
  console.log("funciona xata?", !!result);
  // TODO: pipe info -> llamaparse -> embed -> xata

  // TODO: define getScholarshipsMatches -> { internal, govermental }

  // TODO: profit
}

example().catch(console.error);
