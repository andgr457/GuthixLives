import { useParams } from 'react-router-dom';
import { getLocalStorage, useLocalStorage } from '../hooks/useLocalStorage';
import { useRef, useState } from 'react';
import type { Plan, PlannerCategory, PlannerItem, PlannerItemStatus, PlannerSubCategory } from '../types/Plans';
import { DateTime } from 'luxon';
import { getDiffBetweenNowAndDate, getLocalDateAndTime } from '../services/dates';
import type { GEItemData } from '../types/Item';
import { getDefaultPlannerFieldEditMap, isFieldEdit } from '../services/maps';
import { getProfitTotal, PLANNER_ITEM_STATUS_VALUES } from '../services/plannerService';

export default function GEPlannerItem() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const FLAT_TAX = .02

  const { itemName } = useParams<{ itemName: string }>();
  
  const [items] = useState<GEItemData[]>(getLocalStorage('ge-tracker-items'))

  const [plan, setPlan] = useLocalStorage<Plan>(
    `ge-planner-item-plan-${itemName ?? 'unknown'}`,
    {
      itemName: itemName ?? undefined
    }
  );

  const [itemPlans, setItemPlans] = useLocalStorage<PlannerItem[]>(
    `ge-planner-item-plans-${itemName ?? 'unknown'}`,
    []
  );

  const [categories, setCategories] = useLocalStorage<PlannerCategory[]>(
    `ge-planner-categories`,
    []
  );

  const [itemDefaultCategory, setItemDefaultCategory] = useLocalStorage<PlannerCategory[]>(
    `ge-planner-default-category-${itemName ?? 'unknown'}`,
    []
  )

  const [subCategories, setSubCategories] = useLocalStorage<PlannerSubCategory[]>(
    `ge-planner-sub-categories`,
    []
  );

  const [itemDefaultSubCategory, setItemDefaultSubCategory] = useLocalStorage<PlannerSubCategory[]>(
    `ge-planner-default-sub-category-${itemName ?? 'unknown'}`,
    []
  )


  const [fieldEditMap, setFieldEditMap] = useState(getDefaultPlannerFieldEditMap(itemPlans))

  const [newCategory, setNewCategory] = useState<string>('')
  const [newSubCategory, setNewSubCategory] = useState<string>('')

  const [filterStatusValue, setFilterStatusValue] = useState<string>('all')
  const [filtered, setFiltered] = useState<PlannerItem[] | undefined>(undefined)

  const exportItems = () => {
    const dataStr = JSON.stringify({plan, itemPlans, categories, itemDefaultCategory, itemDefaultSubCategory}, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const date = DateTime.now().toFormat('dd-MM-yyyy')
    const timestamp = DateTime.now().toMillis().toString()
    const a = document.createElement("a");
    a.href = url;
    a.download = `ge-planner_${encodeURIComponent(itemName as string)}_${date}_${timestamp}.json`;
    a.click();

    URL.revokeObjectURL(url);
  };

  const importItems = (event: React.ChangeEvent<HTMLInputElement>) => {
    if(!confirm('This will load an overwrite your current browser data. Are you sure?')) return
    
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        setPlan(parsed.plan);
        setItemPlans(parsed.itemPlans)
        setCategories(parsed.categories)
        setItemDefaultCategory(parsed.itemDefaultCategory)
        setItemDefaultSubCategory(parsed.itemDefaultSubCategory)
      } catch {
        alert("Failed to parse JSON.");
      }
    };

    reader.readAsText(file);
  };

  const addItem = () => {
    if(!itemName) return

    const defaultCategory = itemDefaultCategory?.length > 0 ? itemDefaultCategory[0].name : undefined
    const defaultSubCategory = itemDefaultSubCategory?.length > 0 ? itemDefaultSubCategory[0].name : undefined
    const newItems = []
    const newItem: PlannerItem = { 
      itemName: itemName,
      planId: `${itemName}__${DateTime.utc().toMillis()}`,
      status: 'draft',
      createdOn: DateTime.utc().toISO(),
      category: defaultCategory,
      subCategory: defaultSubCategory
    }
    newItems.push(newItem)
    newItems.push(...itemPlans)
    setItemPlans(newItems)
  }

  const removeItem = (planId: string) => {
    const item = itemPlans.find(ip => ip.planId === planId)
    if(!item) return
    const date = getLocalDateAndTime(item.createdOn as string)
    const diff = getDiffBetweenNowAndDate(item.createdOn as string)

    if(confirm(`Are you sure you want to remove this item plan? ID: ${planId} that was created on ${date} (${diff.shortValue})`)){
      const newItems = itemPlans.filter(ip => ip.planId !== planId)
      setItemPlans(newItems)
    }
  }

  const removeAllItems = () => {
    if(itemPlans?.length === 0) return

    if(confirm(`Are you sure you want to clear all ${itemPlans} item plan(s)? Exporting the data first is highly recommended.`)){
      setItemPlans([])
    }
  }

  const setItemPlanTitle = (planId: string, title: string) => {
    if(typeof title !== 'string') return

    const newPlans = itemPlans.map(ip => {
      if(ip.planId === planId){
        ip.title = title
        ip.updatedOn = DateTime.utc().toISO()
      }
      return ip
    })

    setItemPlans(newPlans)
  }

  const setItemPlanProfit = (planId: string) => {
    if(!planId) return
    const itemPlan = itemPlans.find(ip => ip.planId === planId)
    if(!itemPlan) return
    let profit = 0
    if(itemPlan.boughtPrice){
      if(itemPlan.amount){
        if(itemPlan.soldPrice){
          const taxAmount = Math.floor(itemPlan.soldPrice * FLAT_TAX)
          profit = (itemPlan.soldPrice - taxAmount) * itemPlan.amount
        }
      }
    }
    if(profit > 0){
      const newItems = itemPlans.map(ip => {
        if(ip.planId === planId){
          ip.profit = profit
        }
        return ip
      })
      setItemPlans(newItems)
    }
  }

  const setItemPlanProfitAndComplete = (planId: string) => {
    if(!planId) return
    const itemPlan = itemPlans.find(ip => ip.planId === planId)
    if(!itemPlan) return
    let profit = 0
    if(itemPlan.boughtPrice){
      if(itemPlan.amount){
        if(itemPlan.soldPrice){
          const taxAmount = Math.floor(itemPlan.soldPrice * FLAT_TAX)
          profit = (itemPlan.soldPrice - taxAmount) * itemPlan.amount
        }
      }
    }
    if(profit > 0){
      const newItems = itemPlans.map(ip => {
        if(ip.planId === planId){
          ip.profit = profit
          ip.status = 'complete'
          ip.completedOn = DateTime.utc().toISO()
        }
        return ip
      })
      setItemPlans(newItems)
    }
  }

  const setItemPlanBuyPrice = (planId: string, price: number) => {
    if(typeof price !== 'number') return

    const newPlans = itemPlans.map(ip => {
      if(ip.planId === planId){
        ip.boughtPrice = price
        ip.updatedOn = DateTime.utc().toISO()
      }
      return ip
    })

    setItemPlans(newPlans)
  }

  const setItemPlanSoldPrice = (planId: string, price: number) => {
    if(typeof price !== 'number') return

    const newPlans = itemPlans.map(ip => {
      if(ip.planId === planId){
        ip.soldPrice = price
        ip.updatedOn = DateTime.utc().toISO()
      }
      return ip
    })

    setItemPlans(newPlans)
  }

  const setItemPlanAmount = (planId: string, amount: number) => {
    if(typeof amount !== 'number') return

    const newPlans = itemPlans.map(ip => {
      if(ip.planId === planId){
        ip.amount = amount
        ip.updatedOn = DateTime.utc().toISO()
      }
      return ip
    })

    setItemPlans(newPlans)
  }

  const setItemPlanStatus = (planId: string, status: PlannerItemStatus) => {
    if(!status) return

    const newPlans = itemPlans.map(ip => {
      if(ip.planId === planId){
        ip.status = status
        if(status === 'complete'){
          ip.completedOn = DateTime.utc().toISO()
        }
        ip.updatedOn = DateTime.utc().toISO()
      }
      return ip
    })

    setItemPlans(newPlans)
  }

  const setItemPlanCategory = (planId: string, category: string) => {
    if(!category) return

    const newPlans = itemPlans.map(ip => {
      if(ip.planId === planId){
        ip.category = category
        ip.updatedOn = DateTime.utc().toISO()
      }
      return ip
    })

    setItemPlans(newPlans)
  }

  const setItemPlanSubCategory = (planId: string, subCategory: string) => {
    if(!subCategory) return

    const newPlans = itemPlans.map(ip => {
      if(ip.planId === planId){
        ip.subCategory = subCategory
        ip.updatedOn = DateTime.utc().toISO()
      }
      return ip
    })

    setItemPlans(newPlans)
  }

  const handleSetEditField = (field: string, setTo: boolean, planId: string, fieldValue?: string | number) => {
    if(fieldValue){
      if(typeof fieldValue === 'string'){
        if(fieldValue.length === 0){
          return
        }
      } else {
        if(typeof fieldValue !== 'number'){
          //return out on number field if they produce NaN or is other text
          return
        }
      }
    }

    const mapId = `${planId}__${field}`

    const dupeMap = new Map(fieldEditMap)
    dupeMap.set(mapId, setTo);
    setFieldEditMap(dupeMap)
  }

  const handleSaveCategoryClicked = () => {
    if(!newCategory || newCategory.trim().length === 0) return

    const newCategories = [...categories]
    newCategories.push({name: newCategory})
    const sorted = newCategories.sort()
    setCategories(sorted)
  }  

  const handleSaveSubCategoryClicked = () => {
    if(!newSubCategory || newSubCategory.trim().length === 0) return

    const newSubCategories = [...subCategories]
    newSubCategories.push({name: newSubCategory})
    const sorted = newSubCategories.sort()
    setSubCategories(sorted)
  }

  const setFilterStatus = (status: PlannerItemStatus | 'all') => {
    if(!status) return
    if(status === 'all'){
      setFiltered(undefined)
      setFilterStatusValue('all')
      return
    }

    const filterItems = itemPlans.filter(ip => ip.status === status)
    setFiltered(filterItems)
    setFilterStatusValue(status)
  }

  const itemsToShow = filtered ? filtered : itemPlans

  const handleDashboardClicked = () => {
    window.open(`/geplanner`, "_blank", "noopener,noreferrer");
  }

  const handleTrackerClicked = () => {
    window.open(`/getracker`, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="container">
      <div className="panel">
        <div className='sticky-header'>
          <table style={{width: '100%'}}>
            <tbody>
              <tr>
                <td>
                  <h1>GE Item Planner</h1>
                  <h1>{itemName}</h1>
                  <div style={{textAlign: 'center'}}>
                    <button className='primary-edit' onClick={handleDashboardClicked}>
                      Planner Dashboard
                    </button>
                    <button className='primary-edit' onClick={handleTrackerClicked}>
                      GE Tracker
                    </button>
                  </div>
                </td>
                <td>
                  Flat 2% Sell Tax
                  <br/>
                  Current GE:<br/><span style={{fontWeight: 'bolder'}}>{items?.find(i => i.name === itemName)?.price?.toLocaleString() ?? 'Unknown'} GP</span>
                  <div>
                    Status Filter<br/>
                                      
                    <select className="rs-select"
                      value={filterStatusValue}
                      onChange={(e) =>
                        setFilterStatus(e.currentTarget.value as PlannerItemStatus)
                      }
                    >
                      <option value="all">
                        All
                      </option>

                      {PLANNER_ITEM_STATUS_VALUES.map((s) => (
                        <option key={s} value={s}>
                          {s.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <hr/>
        <div style={{textAlign: 'center'}}>
          All Completed Profit {getProfitTotal(itemPlans).toLocaleString()}
        </div>
        <hr/>
        <div className='button-row'>
          <div className='button-group'>
            <button className="primary" onClick={addItem}>
              Add
            </button>
          </div>
          <div className='button-group'>
            
            <button className="primary" onClick={exportItems}>
              Export
            </button>

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
              onChange={importItems}
            />
            

          </div>
          <div className='button-group'>
            <button
              className="danger"
              onClick={removeAllItems}
            >
              Remove All {itemName} Plans
            </button>

          </div>
        </div>

        <hr/>
          Category Management
          <div style={{fontSize: 'smaller'}}>
            These show for all items.
          </div>
          
          <table style={{width: '100%'}}>
            <tbody>
              <tr>
                <td>
                  <div className="input-row"><input
                    type="text"
                    placeholder="Enter new category."
                    value={newCategory ?? ''}
                    onChange={(e) => setNewCategory(e.currentTarget.value)}
                  /></div>
                  <button onClick={handleSaveCategoryClicked} className='primary-edit'>
                    Save Category
                  </button>
                  <hr/>
                  <div>
                    Default Category for {itemName} <select
                      className="rs-select"
                      value={itemDefaultCategory?.length > 0 ? itemDefaultCategory[0].name : ""}
                      onChange={(e) =>
                        setItemDefaultCategory([{name: e.currentTarget.value}])
                      }
                    >
                      <option value="" disabled>
                        DEFAULT CATEGORY
                      </option>

                      {categories?.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                </td>
                <td>
                  <div className="input-row"><input
                    type="text"
                    placeholder="Enter new sub-category."
                    value={newSubCategory ?? ''}
                    onChange={(e) => setNewSubCategory(e.currentTarget.value)}
                  /></div>
                  <button onClick={handleSaveSubCategoryClicked} className='primary-edit'>
                    Save Sub-Category
                  </button>
                  <hr/>
                  <div>
                    Default Sub-Category for {itemName} <select
                      className="rs-select"
                      value={itemDefaultSubCategory?.length > 0 ? itemDefaultSubCategory[0].name : ""}
                      onChange={(e) =>
                        setItemDefaultSubCategory([{name: e.currentTarget.value}])
                      }
                    >
                      <option value="" disabled>
                        DEFAULT SUB-CATEGORY
                      </option>

                      {subCategories?.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        
        <hr/>

        <div>
          <ul className='list'>
            {itemsToShow?.map(ip => {
              const createdDiff = getDiffBetweenNowAndDate(ip.createdOn as string)
              let updatedDiff
              let completedDiff
              if(ip.updatedOn){
                updatedDiff = getDiffBetweenNowAndDate(ip.updatedOn)
              }
              if(ip.completedOn){
                completedDiff = getDiffBetweenNowAndDate(ip.completedOn)
              }
              const isTitleEdit = isFieldEdit('title', ip, fieldEditMap)
              let showCalculation = false
              let calcTotal = 0
              let calcMade = 0
              let calcTotalTaxed = 0
              if(ip.amount && ip.boughtPrice && ip.soldPrice){
                showCalculation = true
                
                calcTotal = ip.amount * ip.soldPrice
                const taxed = calcTotal * FLAT_TAX
                calcTotalTaxed = calcTotal - taxed
                calcMade = calcTotalTaxed - ip.boughtPrice
              }

              return <li key={ip.planId} className='list-item'>
                <div>
                  <div>
                    {/* HEADER */}
                    <table style={{width: '100%'}}>
                      <tbody>
                        <tr>
                          {isTitleEdit === false && <>
                              <td>
                                <h1>{ip.title}</h1>
                              </td>
                              <td>
                                <button className="primary-edit" onClick={() => {handleSetEditField('title', true, ip.planId)}}>
                                  Edit Title
                                </button>
                              </td>
                            </>}
                          <td>
                            {ip.planId}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                   
                    {/* TITLE EDIT */}
                    {isTitleEdit === true ? <div className="input-row"><input
                        type="text"
                        placeholder="Enter optional title."
                        value={ip.title ?? ''}
                        onChange={(e) => setItemPlanTitle(ip.planId, e.currentTarget.value)}
                        onBlur={(e) => handleSetEditField('title', false, ip.planId, e.target.value)}
                      /> </div>: null
                    }

                    {ip.profit && <div style={{textAlign: 'center'}}>
                      <h1>Profit {ip.profit < 0 ? '-' : ip.profit === 0 ? '' : '+'}{ip.profit.toLocaleString()} GP</h1>
                    </div>}
                      
                    <table style={{width: '100%', textAlign: 'center'}}>
                      <thead>
                        <tr>
                          <th>
                            Status
                          </th>
                          <th>
                            Category
                          </th>
                          <th>
                            Sub-Category
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>
                            <select
                              className="rs-select"
                              value={ip.status ?? ""}
                              onChange={(e) =>
                                setItemPlanStatus(ip.planId, e.target.value as PlannerItemStatus)
                              }
                            >
                              <option value="" disabled>
                                SELECT STATUS
                              </option>

                              {PLANNER_ITEM_STATUS_VALUES.map((s) => (
                                <option key={s} value={s}>
                                  {s.toUpperCase()}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <select
                              className="rs-select"
                              value={ip.category ?? ""}
                              onChange={(e) =>
                                setItemPlanCategory(ip.planId, e.target.value)
                              }
                            >
                              <option value="" disabled>
                                SELECT CATEGORY
                              </option>

                              {categories?.map((c) => (
                                <option key={c.name} value={c.name}>
                                  {c.name.toUpperCase()}
                                </option>
                              ))}
                            </select>
                            
                          </td>
                          <td>
                            <select
                              className="rs-select"
                              value={ip.subCategory ?? ""}
                              onChange={(e) =>
                                setItemPlanSubCategory(ip.planId, e.target.value)
                              }
                            >
                              <option value="" disabled>
                                SELECT SUB-CATEGORY
                              </option>

                              {subCategories?.map((c) => (
                                <option key={c.name} value={c.name}>
                                  {c.name.toUpperCase()}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* DATE INFO */}
                    <table style={{width: '100%', textAlign: 'center'}}>
                      <tbody>
                        <tr title={createdDiff.hintValue}>
                          <td>Created</td>
                          <td>{getLocalDateAndTime(ip.createdOn as string)}</td>
                          <td>{createdDiff.shortValue}</td>
                        </tr>
                        {ip.updatedOn && <tr title={updatedDiff?.hintValue}>
                          <td>Updated</td>
                          <td>{getLocalDateAndTime(ip.updatedOn as string)}</td>
                          <td>{updatedDiff?.shortValue}</td>
                        </tr>}
                        {ip.completedOn && <tr title={completedDiff?.hintValue}>
                          <td>Completed</td>
                          <td>{getLocalDateAndTime(ip.completedOn as string)}</td>
                          <td>{completedDiff?.shortValue}</td>
                        </tr>}
                      </tbody>
                    </table>
                    
                    {/* ITEMS INFO */}
                    <table style={{width: '100%'}}>
                      <thead>
                        <tr>
                          <th>
                            Buy Price
                          </th>
                          <th>
                            Sell Price
                          </th>
                          <th>
                            Quantity
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>
                            <div className="input-row">
                              <input
                                type="text"
                                placeholder="Enter price bought on the GE."
                                value={ip.boughtPrice ?? ''}
                                onChange={(e) => setItemPlanBuyPrice(ip.planId, +e.currentTarget.value)}
                              />
                            </div>
                          </td>
                          <td>
                            <div className="input-row">
                              <input
                                type="text"
                                placeholder="Enter price selling on the GE."
                                value={ip.soldPrice ?? ''}
                                onChange={(e) => setItemPlanSoldPrice(ip.planId, +e.currentTarget.value)}
                              />
                            </div>

                          </td>
                          <td>
                            <div className="input-row">
                              <input
                                type="text"
                                placeholder="Enter quantity selling on the GE."
                                value={ip.amount ?? ''}
                                onChange={(e) => setItemPlanAmount(ip.planId, +e.currentTarget.value)}
                              />
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  {showCalculation && <div>
                    <div style={{textAlign: 'center'}}>
                      Estimated {calcMade.toLocaleString()} GP made.<br/>{calcTotalTaxed.toLocaleString()} GP total ({calcTotal.toLocaleString()} before tax).
                      <br/>
                    <button className='primary-edit' onClick={() => {setItemPlanProfit(ip.planId)}}>
                      Confirm Profit
                    </button>
                    <button className='primary-edit' onClick={() => {setItemPlanProfitAndComplete(ip.planId)}}>
                      Confirm Profit & Complete
                    </button>
                    </div>
                  </div>}
                  <hr/>
                  <div>
                    <button className='danger' onClick={() => {removeItem(ip.planId)}}>
                      Remove Plan Item
                    </button>
                  </div>
                </div>
              </li>
            })}
          </ul>
        </div>
      </div>

    </div>
  )
}