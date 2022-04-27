import * as fs from "fs";

import { marked } from "marked";
import csvtojson from "csvtojson";


/*
 * Build Pages
 */


const sourcePagesFolderPath = "src/pages/";
const wwwPagesFolderPath = "docs/pages/";

fs.readdir(sourcePagesFolderPath, (readDirectoryError, pageFiles) => {

  for (const pageFile of pageFiles) {

    if (!pageFile.endsWith(".md")) {
      continue;
    }

    const htmlFilePath = wwwPagesFolderPath + pageFile.slice(0, Math.max(0, pageFile.length - 2)) + "htm";

    console.log("Building " + htmlFilePath + " ...");

    fs.readFile(sourcePagesFolderPath + pageFile, "utf8", (readFileError, markdownData) => {

      const htmlData = marked(markdownData);

      try {
        fs.writeFileSync(htmlFilePath, htmlData);
      } catch (error) {
        console.error(error);
      }
    });
  }
});


/*
 * Build Data
 */


const heritageSitesCsvPath = "src/data/heritageSites.csv";
const heritageSitesJsonPath = "docs/data/heritageSites.json";

console.log("Building " + heritageSitesJsonPath + " ...");

const heritageSitesJson = await csvtojson().fromFile(heritageSitesCsvPath);

try {
  fs.writeFileSync(heritageSitesJsonPath, JSON.stringify(heritageSitesJson));
} catch (error) {
  console.error(error);
}

console.log("Done.");
