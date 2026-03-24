import type { CharacterGEItemGameVersion } from '../../types/Characters'

export const CharacterStorageKeys = {
  Characters: 'characters',
  CharactersGPTransactions: 'characters-gp-transactions',
  CharactersGEItems: 'characters-ge-items',
  CharactersGEItemsHistory: 'characters-ge-items-history',
  CharactersGEOrders: 'characters-ge-orders',
  CharactersGEOrderItems: 'characters-ge-order-items',
}

export const getGameNameByVersion = (version: CharacterGEItemGameVersion): string => {
  if(version === 'osrs'){
    return 'Old School RuneScape'
  } else if(version === 'rs'){
    return 'RuneScape 3'
  } else {
    return ''
  }
}

export const getShortGameNameByVersion = (version: CharacterGEItemGameVersion): string => {
  if(version === 'osrs'){
    return 'osrs'
  } else if(version === 'rs'){
    return 'rs3'
  } else {
    return ''
  }
}