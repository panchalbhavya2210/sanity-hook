const { createClient } = require("@sanity/client");
const fs = require("fs");
const path = require("path");

// Extract properties from environment variables
const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET;
const apiVersion = process.env.SANITY_API_VERSION || "2025-02-19";
const token = process.env.TOKEN;

if (!projectId || !dataset) {
  console.error(
    "Missing SANITY_PROJECT_ID or SANITY_DATASET environment variables.",
  );
  process.exit(1);
}

const client = createClient({
  projectId: projectId,
  dataset: dataset,
  useCdn: false,
  apiVersion: apiVersion,
  token: token,
});

async function main() {
  try {
    console.log(
      `Fetching all data from Sanity Project: ${projectId}, Dataset: ${dataset}`,
    );

    // Fetch all documents.
    // Excluding some internal sanity documents starts with _ if needed, but *[] gets everything.
    const query = '*[!(_id in path("_.**"))]';
    // const query = '*[_type == "page"]';
    const data = await client.fetch(query);
    console.log(data);

    const targetDir = path.join(__dirname, "data");
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const targetPath = path.join(targetDir, "data.json");
    fs.writeFileSync(targetPath, JSON.stringify(data, null, 2), "utf-8");

    console.log(
      `Successfully fetched ${data.length} documents and saved to data/data.json`,
    );
  } catch (err) {
    console.error("Failed to fetch Sanity data:", err);
    process.exit(1);
  }
}

main();
