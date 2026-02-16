export interface TrackedItem {
  name?: string
}

export interface GEItemData {
  name: string;
  price?: number
  timestamp?: string;
}

export interface GEItemsMap {
  [itemName: string]: GEItemData;
}
