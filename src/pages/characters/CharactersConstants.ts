import type { GEItemGameVersion } from '../../types/Characters'

export const CharacterStorageKeys = {
  Characters: 'characters',
  CharactersGPTransactions: 'characters-gp-transactions',
  CharactersGEItems: 'characters-ge-items',
  CharactersGEItemsHistory: 'characters-ge-items-history',
  CharactersGEOrders: 'characters-ge-orders',
  CharactersGEOrderItems: 'characters-ge-order-items',
}

export const getGameNameByVersion = (version: GEItemGameVersion): string => {
  if(version === 'osrs'){
    return 'Old School RuneScape'
  } else if(version === 'rs'){
    return 'RuneScape 3'
  } else {
    return ''
  }
}