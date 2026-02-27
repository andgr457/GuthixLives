import type { GEItemData, GEItemsMap } from '../../types/Item';
import type { PlannerItemStatus, PlannerItem } from '../../types/Plans';

// Fetch GE prices by item ID(s)
export async function fetchGEItem(name: string): Promise<GEItemData> {
  const res = await fetch(`https://api.weirdgloop.org/exchange/history/rs/latest?name=${name}`);
  const body = await res.text()
  let parsed: GEItemsMap
  let price = undefined
  try {
    parsed = JSON.parse(body)
    price = parsed[name].price
  }catch(error){
    console.error(error)
  }

  return {
    name,
    price: price
  };
}


export const PLANNER_ITEM_STATUS_VALUES: PlannerItemStatus[] = ['draft', 'ready', 'in-progress', 'complete']

export function getProfitTotal(itemPlans: PlannerItem[]){
  let total = 0
  for(const item of itemPlans){
    if(item.status === 'complete'){
      if(item.profit){
        total += item.profit
      }
    }
  }
  return total
}