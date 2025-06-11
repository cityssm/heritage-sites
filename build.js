import fs from 'node:fs/promises';
import csvtojson from 'csvtojson';
import { marked } from 'marked';
const sourcePagesFolderPath = 'docs/markdown/';
const wwwPagesFolderPath = 'docs/pages/';
const pageFiles = await fs.readdir(sourcePagesFolderPath);
for (const pageFile of pageFiles) {
    if (!pageFile.endsWith('.md')) {
        continue;
    }
    const htmlFilePath = wwwPagesFolderPath +
        pageFile.slice(0, Math.max(0, pageFile.length - 2)) +
        'htm';
    console.log('Building ' + htmlFilePath + ' ...');
    const markdownData = await fs.readFile(sourcePagesFolderPath + pageFile, 'utf8');
    const htmlData = await marked(markdownData);
    try {
        await fs.writeFile(htmlFilePath, htmlData);
    }
    catch (error) {
        console.error(error);
    }
}
const heritageSitesCsvPath = 'docs/data/heritageSites.csv';
const heritageSitesJsonPath = 'docs/data/heritageSites.json';
console.log('Building ' + heritageSitesJsonPath + ' ...');
const heritageSitesJson = await csvtojson().fromFile(heritageSitesCsvPath);
try {
    await fs.writeFile(heritageSitesJsonPath, JSON.stringify(heritageSitesJson));
}
catch (error) {
    console.error(error);
}
console.log('Done.');
