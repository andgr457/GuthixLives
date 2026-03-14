import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useCallback, useRef, useState } from 'react';
import type { Character, CharacterGEItem, CharacterGEItemHistory, CharacterGPTransaction } from '../../types/Characters';
import '../../styles/Characters.css'
import { CharacterService } from '../../services/character/CharacterService';
import { CharacterStorageKeys } from './CharactersStorageKeys';
import InfoSection from '../core/InfoSection';
import RSTextBoxAsForm from '../core/RSTextBoxAsForm';
import RSTextBox from '../core/RSTextBox';
import { DateTime } from 'luxon';

export default function CharacterList(){
  const fileInputRef = useRef<HTMLInputElement>(null);
  const characterService = new CharacterService()

  const [characters, setCharacters] = useLocalStorage<Character[]>(
    CharacterStorageKeys.Characters,
    []
  );
  const [transactions, setTransactions] = useLocalStorage<CharacterGPTransaction[]>(
    CharacterStorageKeys.CharactersGPTransactions,
    []
  );
  const [geItems, setGEItems] = useLocalStorage<CharacterGEItem[]>(
    CharacterStorageKeys.CharactersGEItems,
    []
  )
  const [geItemHistory, setGEItemHistory] = useLocalStorage<CharacterGEItemHistory[]>(
    CharacterStorageKeys.CharactersGEItemsHistory,
    []
  );

  const [newCharacterName, setNewCharacterName] = useState<string | undefined>('')
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [showDanger, setShowDanger] = useState(false)

  const exportData = () => {
    const dataStr = JSON.stringify({characters, geItems, geItemHistory}, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const date = DateTime.now().toFormat('dd-MM-yyyy')
    const timestamp = DateTime.now().toMillis().toString()
    const a = document.createElement("a");
    a.href = url;
    a.download = `ge-tracker_${date}_${timestamp}.json`;
    a.click();

    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        setCharacters(parsed.characters)
        setGEItems(parsed.geItemHistory)
        setGEItemHistory(parsed.geItemHistory)
      } catch {
        alert("Failed to parse JSON.");
      }
    };

    reader.readAsText(file);
  };

  const handleAddCharacterClicked = useCallback(() => {
    console.log(newCharacterName)
    setError('')
    if(!newCharacterName || !newCharacterName.trim()) {
      setError('Character name cannot be empty.')
      setNewCharacterName('')
      return
    }
    const characterName = newCharacterName.trim()
    const exists = characters.find(c => c.name.toLowerCase() === characterName.toLowerCase())
    if(exists){
      setError('A saved character already exists with that name.')
      return
    }

    const newCharacter: Character = characterService.generateNewCharacter(characterName)
    const newCharacters: Character[] = []
    newCharacters.push(newCharacter)
    for(const character of characters){
      newCharacters.push(character)
    }
    setNewCharacterName('')
    setCharacters(newCharacters)
  }, [characters, newCharacterName])

  const handleDeleteAllCharacters = useCallback(() => {
    if(!confirm('Are you sure you want to delete all characters? This cannot be undone and you should save an export.')) return
    setGEItems([])
    setGEItemHistory([])
    setTransactions([])
    setCharacters([])
  }, [])

  const handleResetAllCharcters = useCallback(() => {
    if(!confirm('Are you sure you want to reset all characters? This will keep just characters, cannot be undone, and you should save an export.')) return
    setGEItems([])
    setGEItemHistory([])
    setTransactions([])
  }, [characters, geItems, geItemHistory, transactions])

  const handleDeleteDataByCharacterId = useCallback((characterId: string) => {
    console.log(characterId)
    const c = characters?.find(c => c.id = characterId)
    console.log(c)
    alert(JSON.stringify(c))
    if(!c) return
    if(!confirm(`Are you sure you want to delete ${c?.name}? This cannot be undone and you should save an export.`)) return
    const relatedItems = geItems?.filter(i => i.characterId === c?.id)
    const itemIds = relatedItems?.map(i => i.id)
    const relatedHistory = geItemHistory?.filter(ih => itemIds.includes(ih.itemId))
    const historyIds = relatedHistory?.map(h => h.id)
    const relatedTxns = transactions?.filter(t => t.characterId === c?.id)
    const txnIds = relatedTxns?.map(t => t.id)
    
    const newTxns = []
    for(const txn of transactions){
      if(txnIds.includes(txn.id)){
        continue // to not add it to the new array of transactions effectively removing it
      }
      newTxns.push(txn)
    }

    const newHistory = []
    for(const itemHistory of geItemHistory){
      if(historyIds.includes(itemHistory.id)){
        continue
      }
      newHistory.push(itemHistory)
    }

    const newItems = []
    for(const item of geItems){
      if(itemIds.includes(item.id)){
        continue
      }
      newItems.push(item)
    }

    const newCharacters = []
    for(const character of characters){
      if(character.id === c?.id){
        continue
      }
      newCharacters.push(character)
    }

    setGEItems(newItems)
    setGEItemHistory(newHistory)
    setTransactions(newTxns)
    setCharacters(newCharacters)
  }, [characters, geItems, geItemHistory, transactions])
  
  return <div className='characters-app'>
    <div id='top'></div>
    <div className='app-title'>
      Characters
    </div>

    <div className='flex-wrap-gap'>
      <div>
        <button className='primary' onClick={() => {setShowDanger(!showDanger)}}>
          {showDanger ? 'Hide' : 'Show'} Danger Zones
        </button>
      </div>
      <div>
        <button className="primary" onClick={exportData}>
          Export
        </button>
      </div>
      <div>
        <button
          className="primary"
          onClick={() => fileInputRef.current?.click()}
        >
          Import
        </button>

        <input
          type="file"
          accept="application/json"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={importData}
        />
      </div>
    </div>

    <div className='characters-new'>
      <RSTextBox 
        label={{value: 'New Item Name'}}
        showError={true}
        textbox={{
          id: `new_char_text`,
          key: 'new_char_text',
            onChange: (e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>) => {setNewCharacterName(e.currentTarget.value)},
          placehoder: 'New character name...',
          value: newCharacterName ?? ''
        }}
        button={{
          className: 'primary',
          onClick: handleAddCharacterClicked,
          text: 'Add Item',
        }}  
      />
      {typeof newCharacterName} {newCharacterName?.length ?? 0}
      <RSTextBox 
        showError={false}
        errorMessage={error}
        label={{
          value: 'Filter Characters'
        }}
        textbox={{
          id: `search_char_text`,
          key: 'search_char_text',
          onChange: (e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>) => {setSearch(e.currentTarget.value)},
          placehoder: 'Search character name...',
          value: search
        }}
      />
    </div>
    {showDanger && <div className='danger-zone'>
      <button className='danger' onClick={handleResetAllCharcters}>
        <strong>RESET</strong> All Characters
      </button>
      <button className='danger' onClick={handleDeleteAllCharacters}>
        <strong>DELETE</strong> All Characters
      </button>
    </div>}
    <div className='list'>
      {characters?.map((character, index) => {
        let filteredOut = false
        if(search && search.length > 0){
          if(!character?.name?.toLowerCase().includes(search?.toLowerCase())){
            filteredOut = true
          }
        }
        const relatedItems = geItems?.filter(i => i.characterId === character.id)
        const relatedTxns = transactions?.filter(t => t.characterId === character.id)

        let totalLoss = 0
        let totalGain = 0
        let totalGP = 0
        for(const txn of relatedTxns){
          if(txn.amount > 0){
            totalGain += txn.amount
          } else if(txn.amount < 0){
            totalLoss += txn.amount
          }
          totalGP += txn.amount
        }
        return <div key={`${character.id}_${index}`} className={`list-item-slow-hide ${filteredOut ? 'hide' : ''}`}>
          <div className='app-title small left'>
            {character.name} <span style={{fontSize: '10px'}}>{character.id}</span>
          </div>
          <div className='flex-wrap-gap'>
            <InfoSection sectionTitle='GE' 
              linkUrl={`/characters/${character.id}/ge`}
              linkText={`Teleport`}
              items={[
              {
                title: 'Tracking Item(s)',
                value: `${relatedItems?.length ?? 0}`,
                valueHint: 'Number of saved GE tracking items.'
              },
              {
                title: 'Total GP',
                value: `${totalGP?.toLocaleString() ?? 0}`,
                valueHint: 'Aggregate of all character transactions.'
              },
              {
                title: 'Gain GP',
                value: `${totalGain?.toLocaleString() ?? 0}`,
                valueHint: 'Total of positive amount transactions.'
              },
              {
                title: 'Loss GP',
                value: `${totalLoss?.toLocaleString() ?? 0}`,
                valueHint: 'Total of negative amount transactions.'
              },
            ]} />
            <InfoSection sectionTitle={`Quester's Run`} 
              linkText='Minigame'
              linkUrl={`/questersrun/${character.id}`}
              items={[
              {
                title: 'Total Skill LVL',
                value: `${0}`,
                valueHint: 'Aggregate total of all mini-rs skills.'
              }
            ]} />
            
            <div className='danger-zone'>              
              <button className='danger' onClick={() => {handleDeleteDataByCharacterId(character.id)}}>
                <strong>DELETE</strong> {character.name} {character.id}
              </button>
            </div>
          </div>
          
        </div>
      })}
    </div>
  </div>
}