export interface Character {
  id: string
  name: string
  showItems: boolean
  showItemHistory: boolean
  showItemItemId: string | undefined
  showItemHistoryItemId: string | undefined
}

export type GEItemGameVersion = 'osrs' | 'rs'
export interface CharacterGEItem {
  id?: string
  characterId: string
  name?: string;
  price?: number
  volume?: number
  geTimestamp?: string;
  gameVersion?: GEItemGameVersion
}

export interface CharacterGEItemHistory extends CharacterGEItem {
  itemId: string
}

export interface CharacterGPTransaction {
  id: string
  characterId: string
  itemId?: string
  note?: string
  amount: number
}

export interface CharacterGEOrder {
  id: string
  characterId: number
  title: string
  notes?: string
}

export interface CharacterGEOrderItem {
  id: string
  orderId: string
  itemId: string
  boughtPrice: number
  sellPrice: number
  taxed: boolean
}