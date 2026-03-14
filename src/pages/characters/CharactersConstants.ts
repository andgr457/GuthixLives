import type { GEItemGameVersion } from '../../types/Characters'

export const CharacterStorageKeys = {
  Characters: 'characters',
  CharactersGPTransactions: 'characters-gp-transactions',
  CharactersGEItems: 'characters-ge-items',
  CharactersGEItemsHistory: 'characters-ge-items-history'
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