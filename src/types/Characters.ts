export interface Character {
  id: string
  name: string
  showItems: boolean
  showItemHistory: boolean
  showItemItemId: string | undefined
  showItemHistoryItemId: string | undefined
}

export interface CharacterGEItem {
  id?: string
  characterId: string
  name: string;
  price?: number
  volume?: number
  geTimestamp?: string;
  gameVersion?: 'osrs' | 'rs'
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