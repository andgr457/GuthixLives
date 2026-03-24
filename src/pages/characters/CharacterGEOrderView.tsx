import type { CharacterGEItem, CharacterGEItemGameVersion, CharacterGEOrder, CharacterGEOrderItem, CharacterGEOrderStatus, QuickOrderItem } from '../../types/Characters'
import InfoSection from '../core/InfoSection'
import CharacterGEOrderOrderItem from './CharacterGEOrderOrderItem'
import { getShortGameNameByVersion } from './CharactersConstants'

interface CharacterGEOrderProps {
  filteredOut: boolean
  order: CharacterGEOrder
  index?: string
  createdDate: string
  completedDate: string
  totalBought: number
  totalSell: number
  totalTax: number
  totalGains: number
  showDanger: boolean
  relatedOrderItems: CharacterGEOrderItem[]
  relatedGEItems: CharacterGEItem[]
  handleSetOrderStatus: (orderId: string, status: CharacterGEOrderStatus) => void
  handleToggleShowOrderListDetail: (orderId: string, value: boolean) => void
  handleToggleShowOrderNotes: (orderId: string, value: boolean) => void
  handleToggleOrderEditNotes: (orderId: string, value: boolean) => void
  handleSetOrderNotes: (orderId: string, value: string) => void
  handleDeleteOrderById: (orderId: string) => void
  handleToggleShowOrderListOrderItems: (orderId: string, value: boolean) => void
  setSelectedQuickOrderItem: (quickOrderId: QuickOrderItem) => void
  handleAddOrderQuickOrderItem: () => void
  handleSetOrderItemBoughtAmount: (orderId: string, value: string) => void
  handleSetOrderItemBoughtPrice: (orderId: string, value: string) => void
  handleSetOrderItemIsTaxed: (orderId: string, value: boolean) => void
  handleSetOrderItemSellAmount: (orderId: string, value: string) => void
  handleSetOrderItemSellPrice: (orderId: string, value: string) => void
  handleToggleShowOrderItemListDetail: (orderId: string, value: boolean) => void
  handleDeleteOrderItemById: (orderItemId: string, orderId: string) => void
}

export default function CharacterGEOrderView(props: CharacterGEOrderProps) {
  const {
    handleSetOrderStatus,
    handleToggleShowOrderListDetail,
    handleToggleShowOrderNotes,
    handleToggleOrderEditNotes,
    handleSetOrderNotes,
    handleDeleteOrderById,
    handleToggleShowOrderListOrderItems,
    setSelectedQuickOrderItem,
    handleAddOrderQuickOrderItem,
    handleSetOrderItemBoughtAmount,
    handleSetOrderItemBoughtPrice,
    handleSetOrderItemIsTaxed,
    handleSetOrderItemSellAmount,
    handleSetOrderItemSellPrice,
    handleToggleShowOrderItemListDetail,
    handleDeleteOrderItemById,
    filteredOut,
    order,
    index,
    createdDate,
    completedDate,
    totalBought,
    totalGains,
    totalSell,
    totalTax,
    showDanger,
    relatedOrderItems,
    relatedGEItems,
  } = props

  if(filteredOut === true){
    return <div></div>
  }

  return <div className={`${filteredOut ? 'reveal' : ''} list-item-slow-hide ${filteredOut ? 'hide' : ''}`} key={`${order.id}__${index}`}>
    <div className='list-item-title ' style={{gap: '1.5em'}}>
      <div>
        {showDanger && <div style={{ float: 'right'}}>
              <button 
                className='button-link action danger'
                onClick={() => {handleDeleteOrderById(order.id as string)}} 
                >
                Delete Order
              </button>
            </div>}
      </div>
      <div className='flex-wrap-gap'>
        <button 
          onClick={() => {handleToggleShowOrderListDetail(order.id, !order.showListDetail)}} 
          className='button-link collapse'
        >
          {order.showListDetail === true ? '-' : '+'} {order.title}
          &nbsp;&nbsp;&nbsp;&nbsp;<span style={{fontSize: '0.8em'}}>{order.status}</span>
        </button>
      </div>
      
    </div>
    
    {order.showListDetail === true && <div className='list-item-body'>
      <div className='basic-div' style={{fontSize: '0.8em'}}>
        <select
          className="rs-select"
          style={{width: '33vh'}}
          value={order.status}
          onChange={(e) => {
            handleSetOrderStatus(order.id, e.currentTarget.value as CharacterGEOrderStatus)
          }}
        >
          <option value='Pending'>Pending</option>
          <option value='Complete'>Complete</option>
        </select>
      </div>
      <div className='flex-wrap-gap'>
        <InfoSection 
          sectionTitle='Details'
          items={[
            {
              title: 'Created',
              value: createdDate
            },
            {
              title: 'Completed',
              value: completedDate ?? 'N/A'
            }
          ]}
        />
        <InfoSection 
          sectionTitle='Totals'
          items={[
            {
              title: 'Bought',
              value: `${totalBought.toLocaleString()} GP`
            },
            {
              title: 'Sell',
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
      <div style={{padding: '1em'}}>
        <div className='list-item-title second' style={{fontSize: '1em'}}>

          <button 
            onClick={() => {handleToggleShowOrderNotes(order.id, !(order.showNotes ?? false))}}
            className='button-link collapse'>
            {order.showNotes === true ? '-' : '+'} Notes  
          </button> 
          {!order.editNotes ? <button onClick={() => {handleToggleOrderEditNotes(order.id as string, !(order.editNotes ?? false))}} className='button-link collapse'>
            Edit
          </button> : null}
        </div>
        {order.editNotes === true && <textarea 
          onChange={(e) => {handleSetOrderNotes(order.id as string, e.currentTarget.value)}}
          onBlur={() => {
            handleToggleOrderEditNotes(order.id as string, false)
          }} 
          style={{width: '100%'}} 
          rows={2} 
          cols={50}
          placeholder='Enter notes...'
        >
          {order.notes ?? ''}
        </textarea>}
        {!order.editNotes && order.notes && order.showNotes === true && <div 
          className='basic-div'
          style={{fontSize: '1em'}}
        >
          {order.notes ?? ''}  
        </div>}
      </div>
      <div style={{padding: '1em'}}>
        <div  
          className='list-item-title second' 
        >
          <button onClick={() => {handleToggleShowOrderListOrderItems(order.id as string, !order.showListOrderItems)}}
            className='button-link collapse'>
            {order.showListOrderItems ? '-' : '+'} {relatedOrderItems.length} Order Items
          </button>
          <select
            className="rs-select"
            style={{width: '33%', fontSize: '0.8em'}}
            onChange={(e) => {
              setSelectedQuickOrderItem({
                itemId: e.currentTarget.value,
                orderId: order.id
              })
            }}
          >
            <option>Quick Add</option>
            {relatedGEItems.map((geItem) => {
              return <option value={geItem.id}>
                {geItem.name} - {getShortGameNameByVersion(geItem.gameVersion as CharacterGEItemGameVersion)}
              </option>
            })}
          </select>
          <button onClick={() => {handleAddOrderQuickOrderItem()}} className='button-link action'>
              Add
          </button>
        </div>
        {order.showListOrderItems && <div className='list-item-body'>
          {relatedOrderItems.map((orderItem, oiIndex) => {
            const relatedItem = relatedGEItems.find(i => i.id === orderItem.itemId) as CharacterGEItem
            return <div style={{fontSize: '1.2em', marginLeft: '.2em', marginRight: '.2em'}}>
              <CharacterGEOrderOrderItem 
                orderItem={orderItem}
                orderId={order.id}
                index={`${oiIndex+1}`}
                showDanger={showDanger}
                handleDeleteOrderItemById={handleDeleteOrderItemById}
                relatedGEItem={relatedItem as CharacterGEItem}
                setOrderItemBoughtAmount={handleSetOrderItemBoughtAmount}
                setOrderItemBoughtPrice={handleSetOrderItemBoughtPrice}
                setOrderItemIsTaxed={handleSetOrderItemIsTaxed}
                setOrderItemSellAmount={handleSetOrderItemSellAmount}
                setOrderItemSellPrice={handleSetOrderItemSellPrice}
                setOrderItemShowListDetail={handleToggleShowOrderItemListDetail}
              >
              </CharacterGEOrderOrderItem>
            </div>
          })}
        </div>}
      </div>
    </div>}
  </div>
}