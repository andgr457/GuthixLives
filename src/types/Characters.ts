export interface Character {
  id: string
  name: string
  showListDetail: boolean
  showItems: boolean
  showItemHistory: boolean
  showItemItemId: string | undefined
  showItemHistoryItemId: string | undefined
}

export type CharacterGEItemGameVersion = 'osrs' | 'rs'
export interface CharacterGEItem {
  id?: string
  characterId: string
  name?: string;
  price?: number
  volume?: number
  geTimestamp?: string;
  gameVersion?: CharacterGEItemGameVersion
  showItemDetail: boolean
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

export type CharacterGEOrderStatus = 'Pending' | 'Complete'
export const GE_ORDER_STATUSES: {[prop: string]: CharacterGEOrderStatus} = {
  Pending: 'Pending',
  Success: 'Complete'
}

export interface CharacterGEOrder {
  id: string
  characterId: string
  title: string
  notes?: string
  status: CharacterGEOrderStatus
  createdDate: string
  completedDate?: string
  showListDetail: boolean
  showListOrderItems: boolean
  editNotes: boolean
  showNotes: boolean
}

export interface CharacterGEOrderItem {
  id: string
  orderId: string | undefined
  itemId: string
  boughtPrice: number
  boughtAmount: number
  sellPrice: number
  sellAmount: number
  taxed: boolean
  showListDetail: boolean
  status: CharacterGEOrderStatus
}

export interface QuickOrderItem {
  orderId: string
  itemId: string
}