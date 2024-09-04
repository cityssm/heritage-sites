export interface HeritageSite {
  siteId: string
  descriptionOfSite: string
  civicAddress: string
  legalDescription: string
  ownerName: string
  ownerAddress: string
  bylawNumber: string
  datePassed: string
  latitude: string
  longitude: string
  siteType: 'Property' | 'Monument' | 'Plaque'
  designatedOrListed: 'Designated' | 'Listed'
  hasPage: 'TRUE' | 'FALSE'
  keywords: string
  searchString?: string
}
