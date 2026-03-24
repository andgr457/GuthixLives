import { useState } from 'react';
import { useConfirm } from '../../context/ConfirmProvider';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import useScrollReveal from '../../hooks/useScrollReveal';
import type { Character, CharacterGPTransaction, CharacterGEItem, CharacterGEItemHistory, CharacterGEOrder, CharacterGEOrderItem } from '../../types/Characters';
import CharacterLinks from '../characters/CharacterLinks';
import { CharacterStorageKeys } from '../characters/CharactersConstants';
import InfoSection from '../core/InfoSection';

export default function Dashboard() {
  useScrollReveal()
  const showConfirm = useConfirm()
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

  const [geOrders, setGEOrders] = useLocalStorage<CharacterGEOrder[]>(
    CharacterStorageKeys.CharactersGEOrders,
    []
  )
  const [geOrderItems, setGEOrderItems] = useLocalStorage<CharacterGEOrderItem[]>(
    CharacterStorageKeys.CharactersGEOrderItems,
    []
  );
  const [showFilters, setShowFilters] = useState(false)
  const [filterByCharacterId, setFilterByCharacterId] = useState('')
  const [filterByGameVersion, setFilterByGameVersion] = useState('')
  
  const clearFilters = () => {
    setFilterByCharacterId('')
    setFilterByGameVersion('')
  }

  let totalBought = 0
  let totalBoughtAmount = 0
  let totalSell = 0
  let totalSellAmount = 0
  let totalGains = 0
  let totalTax = 0

  geOrderItems.forEach((oi) => {
    if(filterByCharacterId){
      const relatedOrder = geOrders.find(o => o.id === oi.orderId)
      if(relatedOrder?.characterId !== filterByCharacterId){
        return
      }
    }
    if(filterByGameVersion){
      const relatedItem = geItems.find(i => i.id === oi.itemId)
      if(relatedItem?.gameVersion !== filterByGameVersion){
        return
      }
    }

    let sellPrice = oi.sellPrice * oi.sellAmount
    if(oi.taxed === true){
      const taxAmount = sellPrice * .02
      sellPrice = sellPrice - taxAmount
      totalTax += taxAmount
    }
    totalBought += oi.boughtPrice * oi.boughtAmount
    totalBoughtAmount += oi.boughtAmount
    totalSell += sellPrice
    totalSellAmount += oi.sellAmount
    totalGains += sellPrice - (oi.boughtPrice * oi.boughtAmount)
  })

  return <div className='dashboard-app reveal'>
    <div className='list-item-header'>
      <div className='app-title'>
        Dashboard
      </div>
      <CharacterLinks 
        page='dashboard' 
        characterId={undefined}
      />
    </div>

    <div>
      <div className='list-item-title'>
        <button
          className='button-link collapse'
          onClick={() => {setShowFilters(!showFilters)}}
        >
          {showFilters === true ? '-' : '+'} Filters
        </button>
      </div>
      {showFilters === true && <div className='list-item-body'>
        <InfoSection 
          sectionTitle='Filtering By'
          items={[
            {
              title: 'Character',
              value: filterByCharacterId ? characters.find(c => c.id === filterByCharacterId)?.name as string : 'No'
            },
            {
              title: 'Game Version',
              value: filterByGameVersion ? filterByGameVersion.toUpperCase() : 'NO'
            }
          ]}
        />
        <div className='flex-wrap-gap'>
          <div>
            <select
              className='rs-select'
              value={filterByCharacterId}
              onChange={(e) => {setFilterByCharacterId(e.currentTarget.value)}}
            >
              <option value=''>Filter Character</option>
              {characters?.map(c => {
                return <option value={c.id}>
                  {c.name}
                </option>
              })}
            </select>
          </div>
          <div>
            <select
              className='rs-select'
              value={filterByGameVersion}
              onChange={(e) => {setFilterByGameVersion(e.currentTarget.value)}}
            >
              <option value=''>Filter Game</option>
              <option value='osrs'>OSRS</option>
              <option value='rs'>RS 3</option>
            </select>
          </div>
        </div>
      </div>}
    </div>

    <InfoSection 
      sectionTitle='Totals'
      items={[
        {
          title: 'Characters',
          value: `${characters?.length?.toLocaleString()}`
        },
        {
          title: 'Items',
          value: `${geItems?.length?.toLocaleString()}`
        },
        {
          title: 'Orders',
          value: `${geOrders?.length.toLocaleString()}`
        },
        {
          title: 'Order Items',
          value: `${geOrderItems.length.toLocaleString()}`
        },
        {
          title: 'Bought Amount',
          value: `${totalBoughtAmount.toLocaleString()}`
        },
        {
          title: 'Bought Price',
          value: `${totalBought.toLocaleString()} GP`
        },
        {
          title: 'Sell Amount',
          value: `${totalSellAmount.toLocaleString()}`
        },
        {
          title: 'Sell Price',
          value: `${totalSell.toLocaleString()} GP`
        },
        {
          title: 'Tax',
          value: `${totalTax.toLocaleString()} GP`
        },
        {
          title: 'Gains',
          value: `${totalGains.toLocaleString()} GP`
        }

      ]}
    />
  </div>
}