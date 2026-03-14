import { useCallback, useState } from 'react'
import { getLocalStorage, useLocalStorage } from '../../hooks/useLocalStorage'
import { useNavigate, useParams } from 'react-router-dom'
import type { Character, CharacterGEItem, CharacterGEItemHistory, CharacterGPTransaction } from '../../types/Characters'
import { CharacterItemService } from '../../services/character/CharacterItemService'
import { CharacterStorageKeys } from './CharactersStorageKeys'
import RSTextBox from '../core/RSTextBox'

export default function CharacterGEItems() {
  const navigate = useNavigate()
  const {characterId} = useParams<{ characterId: string }>();
  const [characters, setCharacters] = useLocalStorage<Character[]>(
    CharacterStorageKeys.Characters,
    []
  )
  const [transactions, setTransactions] = useLocalStorage<CharacterGPTransaction[]>(
    CharacterStorageKeys.CharactersGPTransactions,
    []
  );
  const characterItems = getLocalStorage<CharacterGEItem[]>('characters-ge-items')
  const characterItemHistories = getLocalStorage<CharacterGEItemHistory[]>('characters-ge-items-history')
  const [character] = useState<Character | undefined>(characters?.find(c => c.id === characterId))
  const [gpTransactions, setGPTransactions] = useState<CharacterGPTransaction[] | undefined>(transactions?.filter(t => t.characterId === characterId))
  const [geItems, setGEItems] = useState<CharacterGEItem[] | undefined>(characterItems?.filter(i => i.characterId === characterId))
  const [geItemHistories, setGEItemHistories] = useState<CharacterGEItemHistory[] | undefined>(characterItemHistories?.filter(h => h.characterId === characterId))
  const [newItemName, setNewItemName] = useState('')
  const [error, setError] = useState('')
  const itemService = new CharacterItemService()

  const handleNewItemClicked = useCallback(async () => {
    setError('')
    if(!newItemName || !newItemName?.trim() || !character) return
    const itemName = newItemName.trim()
    const exists = geItems?.find(i => i.name === itemName && i.characterId === character?.id)
    if(exists){
      setError(`${itemName} already exists for ${character?.name ?? 'this character'}.`)
      return
    }
    const newItem: CharacterGEItem = itemService.generateNewItem(itemName, character?.id as string)
    const newItems = []
    newItems.push(newItem)
    for(const item of geItems ?? []){
      newItems.push(item)
    }
    setGEItems(newItems)
  }, [newItemName, geItems, character])

  const handleAddItemClicked = useCallback(() => {
    if(!newItemName || !newItemName?.trim()) return

  }, [newItemName])

  return <div className='characters-app'>
    <div id='top'></div>
    <div className='app-title'>
      Grand Exchange Item Tracker
    </div>
    <div className='app-title smaller'>
      {character?.name}
    </div>

    <div>
      <button className='button-link' onClick={() => {navigate('/characters')}}>Back to Characters</button>
    </div>
    <div className='character-name'>
      {character?.name}
    </div>
    <RSTextBox
      label={{value: 'New Item Name'}}
      showError={true}
      textbox={{
        id: `new_item_text`,
        key: 'new_item_text',
        onChange: (e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>) => {setNewItemName(e.currentTarget.value)},
        placehoder: 'New item name...',
        value: newItemName ?? ''
      }}
      button={{
        className: 'primary',
        onClick: handleAddItemClicked,
        text: 'Add Item',
      }}      
    />
    <div className=''>

    </div>
    <div>
      {geItems?.map((item, index) => {

        return <div className='character-ge-item' key={`${item.id}__${index}`}>
          {item.name} {item.price}
        </div>
      })}
    </div>
  </div>
}