import type React from 'react'
import type { CharacterGEItem, CharacterGEOrderItem } from '../../types/Characters'

interface CharacterGEOrderItemProps {
  orderItem: CharacterGEOrderItem
  setOrderItemShowListDetail: (orderItemId: string, value: boolean) => void
  relatedGEItem: CharacterGEItem
  setOrderItemBoughtPrice: (orderItemId: string, value: string) => void
  setOrderItemBoughtAmount: (orderItemId: string, value: string) => void
  setOrderItemSellPrice: (orderItemId: string, value: string) => void
  setOrderItemSellAmount: (orderItemId: string, value: string) => void
  setOrderItemIsTaxed: (orderItemId: string, value: boolean) => void
  children?: React.ReactNode
}
export default function CharacterGEOrderOrderItem(props: CharacterGEOrderItemProps) {

  return <div style={{gap: '8px'}} onClick={() => {}}>
    <div className='list-item-title second flex-wrap-gap' style={{gap: '12px'}}>
        <div onClick={() => {props.setOrderItemShowListDetail(props.orderItem.id, !props.orderItem.showListDetail)}}>
          <button className='button-link collapse'>
            {props.orderItem.showListDetail === true ? '-' : '+'} {props.relatedGEItem.name}
          </button>
        </div>
    </div>

    {props.orderItem.showListDetail === true && <div className='list-item-body'>
      <div className='list-item-body flex-wrap-gap' style={{gap: '8px'}}>
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

      <div className='list-item-body flex-wrap-gap' style={{gap: '8px'}}>
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

      <div className='list-item-body flex-wrap-gap' style={{gap: '8px'}}>
        <div>
          <div>
            Is Taxed?
          </div>
          <div>
            <input 
              type='checkbox'
              checked={props.orderItem.taxed ?? true}
              onChange={(e) => props.setOrderItemIsTaxed(props.orderItem.id, e.currentTarget.checked)}
            />
          </div>
        </div>
      </div>

      <div className='list-item-body flex-wrap-gap' style={{gap: '8px'}}>
        <div>
          {props.children}
        </div>
      </div>
    </div>}

  </div>
}