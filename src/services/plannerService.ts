import type { PlannerItem, PlannerItemStatus } from '../types/Plans';

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