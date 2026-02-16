export interface PlanData {
  plan: Plan
  note?: string
  items: PlannerItem[]
}

export interface Plan {
  itemName: string | undefined
  geLimit?: number
  geGPLimit?: number
}

export type PlannerItemStatus = 'draft' | 'ready' | 'in-progress' | 'complete'

export interface PlannerItem {
  planId: string
  itemName: string
  title?: string
  category?: string
  subCategory?: string
  amount?: number
  boughtPrice?: number
  soldPrice?: number
  createdOn?: string
  updatedOn?: string
  completedOn?: string
  status: PlannerItemStatus
  profit?: number
}

export interface PlannerCategory {
  name: string
}

export interface PlannerSubCategory {
  name: string
}