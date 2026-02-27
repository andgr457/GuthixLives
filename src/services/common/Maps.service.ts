import type { PlannerItem } from '../../types/Plans'

export function getDefaultPlannerFieldEditMap(
  itemPlans: PlannerItem[]
): Map<string, boolean> {
  const editMap = new Map<string, boolean>()
  for(const plan of itemPlans){
    const mapId = `${plan.planId}__`
    if(!plan.title){
      editMap.set(`${mapId}title`, true)
    } else {
      editMap.set(`${mapId}title`, false)
    }

    if(!plan.category){
      editMap.set(`${mapId}category`, true)
    } else {
      editMap.set(`${mapId}category`, false)
    }

    if(!plan.subCategory){
      editMap.set(`${mapId}subCategory`, true)
    } else {
      editMap.set(`${mapId}subCategory`, false)
    }    

    if(!plan.amount){
      editMap.set(`${mapId}amount`, true)
    } else {
      editMap.set(`${mapId}amount`, false)
    }

    if(!plan.boughtPrice){
      editMap.set(`${mapId}boughtPrice`, true)
    } else {
      editMap.set(`${mapId}boughtPrice`, false)
    }

    if(!plan.soldPrice){
      editMap.set(`${mapId}soldPrice`, true)
    } else {
      editMap.set(`${mapId}soldPrice`, false)
    }
  }

  return editMap
}

export function isFieldEdit(
  field: string,
  itemPlan: PlannerItem,
  editMap: Map<string, boolean>
): boolean {
  const mapId = `${itemPlan.planId}__${field}`
  const value = editMap.get(mapId)
  return value ?? true
}

