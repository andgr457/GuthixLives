export interface TrackedItem {
  name?: string
}

export interface GEItemData {
  id?: number
  name: string;
  price?: number
  timestamp?: string;
}

export interface GEItemsMap {
  [itemName: string]: GEItemData;
}
