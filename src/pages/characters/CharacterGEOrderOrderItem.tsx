import type React from 'react'
import type { CharacterGEItem, CharacterGEItemGameVersion, CharacterGEOrderItem } from '../../types/Characters'
import { getShortGameNameByVersion } from './CharactersConstants'

interface CharacterGEOrderItemProps {
  setOrderItemShowListDetail: (orderItemId: string, value: boolean) => void
  setOrderItemBoughtPrice: (orderItemId: string, value: string) => void
  setOrderItemBoughtAmount: (orderItemId: string, value: string) => void
  setOrderItemSellPrice: (orderItemId: string, value: string) => void
  setOrderItemSellAmount: (orderItemId: string, value: string) => void
  setOrderItemIsTaxed: (orderItemId: string, value: boolean) => void
  handleDeleteOrderItemById: (orderItemId: string, orderId: string) => void
  showDanger: boolean
  orderItem: CharacterGEOrderItem
  orderId?: string
  relatedGEItem: CharacterGEItem
  children?: React.ReactNode
  index?: string
}
export default function CharacterGEOrderOrderItem(props: CharacterGEOrderItemProps) {

  return <div style={{gap: '8px'}} onClick={() => {}}>
    <div className='list-item-title second' style={{gap: '12px'}}>
        <div>
          {props.showDanger === true && <div style={{ float: 'right', fontSize: '0.7em'}}>
            <button 
              className='button-link action danger'
              onClick={() => {props.handleDeleteOrderItemById(props.orderItem.id as string, props.orderId as string)}} 
              >
              Delete Order Item
            </button>
          </div>}
        </div>
        <div onClick={() => {props.setOrderItemShowListDetail(props.orderItem.id, !props.orderItem.showListDetail)}}>
          <button className='button-link collapse'>
            {props.orderItem.showListDetail === true ? '-' : '+'}{props.index ? ` #${props.index}` : ''} {props.relatedGEItem.name}
          </button>
          <button className='button-link destructive'>
            {getShortGameNameByVersion(props.relatedGEItem.gameVersion as CharacterGEItemGameVersion)}
          </button>
        </div>
    </div>

    {props.orderItem.showListDetail === true && <div className='list-item-body'>
      <div className='list-item-body second flex-wrap-gap' style={{gap: '8px'}}>
        <div>
          <div>
            Bought Amount
          </div>
          <div>
            <input 
              type='text'
              value={props.orderItem.boughtAmount ?? ''}
              placeholder='Enter bought amount...'
              onChange={(e) => props.setOrderItemBoughtAmount(props.orderItem.id, e.currentTarget.value)}
            />
          </div>
        </div>

        <div>
          <div>
            Bought Price per Item
          </div>
          <div>
            <input 
              type='text'
              value={props.orderItem.boughtPrice ?? ''}
              placeholder='Enter bought price per item...'
              onChange={(e) => props.setOrderItemBoughtPrice(props.orderItem.id, e.currentTarget.value)}
            />
          </div>
        </div>

      </div>

      <div className='list-item-body second flex-wrap-gap' style={{gap: '8px'}}>
        <div>
          <div>
            Sell Amount
          </div>
          <div>
            <input 
              type='text'
              value={props.orderItem.sellAmount ?? ''}
              placeholder='Enter sell amount...'
              onChange={(e) => props.setOrderItemSellAmount(props.orderItem.id, e.currentTarget.value)}
            />
          </div>
        </div>

        <div>
          <div>
            Sell Price per Item
          </div>
          <div>
            <input 
              type='text'
              value={props.orderItem.sellPrice ?? ''}
              placeholder='Enter sell price per item...'
              onChange={(e) => props.setOrderItemSellPrice(props.orderItem.id, e.currentTarget.value)}
            />
          </div>
        </div>
      </div>

      <div className='list-item-body second flex-wrap-gap' style={{gap: '8px'}}>
        <button 
          className={`button-link action ${props.orderItem.taxed && 'selected'}`}
          onClick={() => {props.setOrderItemIsTaxed(props.orderItem.id, !props.orderItem.taxed)}}
        >
          Taxed
        </button>
      </div>

      <div>

      </div>

      <div className='list-item-body flex-wrap-gap' style={{gap: '8px'}}>
        <div>
          {props.children}
        </div>
      </div>
    </div>}

  </div>
}