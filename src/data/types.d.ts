export interface HeritageSite {
    siteId: string;
    descriptionOfProperty: string;
    civicAddress: string;
    legalDescription: string;
    ownerName: string;
    ownerAddress: string;
    bylawNumber: string;
    datePassed: string;
    latitude: string;
    longitude: string;
    designatedOrListed: "designated" | "listed";
    hasPage: "TRUE" | "FALSE";
    keywords: string;
    searchString?: string;
}
