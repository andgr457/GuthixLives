import { useEffect, useMemo, useState } from 'react';
import { getLocalStorage } from '../hooks/useLocalStorage';
import type { GEItemData } from '../types/Item';
import type { PlannerItem, PlannerCategory, PlannerSubCategory } from '../types/Plans';
import { getDiffBetweenNowAndDate } from '../services/dates';

export default function GEPlanner() {
  const [selectedItemName, setSelectedItemName] = useState('any')
  const [selectedCategory, setSelectedCategory] = useState('any')
  const [selectedSubCategory, setSelectedSubCategory] = useState('any')

  const results = useMemo<PlannerItem[]>(() => {
    const items = getLocalStorage<GEItemData[]>('ge-tracker-items')
    console.log(items)

    if (!items || items.length === 0) return [];

    let filtering: PlannerItem[] = [];

    if (selectedItemName !== "any") {
      filtering =
        getLocalStorage<PlannerItem[]>(
          `ge-planner-item-plans-${selectedItemName}`
        ) ?? [];
    } else {
      for (const item of items) {
        const stored =
          getLocalStorage<PlannerItem[]>(
            `ge-planner-item-plans-${item.name}`
          ) ?? [];

        filtering.push(...stored);
      }
    }

    //only show complete
    filtering = filtering.filter(f => f.status === 'complete')

    if (selectedCategory !== "any") {
      filtering = filtering.filter(
        (f) => f.category === selectedCategory
      );
    }

    if (selectedSubCategory !== "any") {
      filtering = filtering.filter(
        (f) => f.subCategory === selectedSubCategory
      );
    }

    filtering.sort(
      (a, b) =>
        new Date(b.completedOn ?? 0).getTime() -
        new Date(a.completedOn ?? 0).getTime()
    );
    
    return filtering;

  }, [selectedItemName, selectedCategory, selectedSubCategory]);

  const handleItemNameClicked = (itemName: string) => {
    window.open(`/geplanner/${itemName}`, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="container">
      <div className="panel">
        <div>
          <h1>GE Planner Dashboard</h1>
        </div>
        <div>
          {/* filters */}
          <table style={{width: '100%'}}>
            <tbody>
              <tr>
                <td>
                  Item
                  <select
                    className="rs-select"
                    value={selectedItemName}
                    onChange={(e) =>
                      setSelectedItemName(e.currentTarget.value)
                    }
                  >
                    <option value="any">
                      Any
                    </option>

                    {getLocalStorage<GEItemData[]>('ge-tracker-items')?.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  Category
                  <select
                    className="rs-select"
                    value={selectedCategory}
                    onChange={(e) =>
                      setSelectedCategory(e.currentTarget.value)
                    }
                  >
                    <option value="any">
                      Any
                    </option>

                    {getLocalStorage<PlannerCategory[]>('ge-planner-categories')?.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  Sub-Category
                  <select
                    className="rs-select"
                    value={selectedSubCategory}
                    onChange={(e) =>
                      setSelectedSubCategory(e.currentTarget.value)
                    }
                  >
                    <option value="any">
                      Any
                    </option>

                    {getLocalStorage<PlannerSubCategory[]>('ge-planner-sub-categories')?.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <hr/>
        <div style={{textAlign: 'center', fontSize: 'larger'}}>
          {results.reduce((total, item) => {
            return total + (item.profit ?? 0);
          }, 0).toLocaleString()} GP Profit
        </div>
        <hr/>
        <div>
          <table style={{width: '100%', textAlign: 'center'}}>
            <thead>
              <tr>
                <th>
                  Item
                </th>
                <th>
                  Bought At
                </th>
                <th>
                  Sold At
                </th>
                <th>
                  Quantity
                </th>
                <th>
                  Profit
                </th>
                <th>
                  Completed
                </th>
              </tr>
            </thead>
            <tbody>
              {results?.map(i => {
                console.log(i.completedOn)
                return (
                  <tr>
                    <td>
                      <button className='primary-edit' onClick={() => {handleItemNameClicked(i.itemName)}}>
                        {i.itemName}
                      </button>
                    </td>
                    <td>
                      {i.boughtPrice?.toLocaleString()} GP
                    </td>
                    <td>
                      {i.soldPrice?.toLocaleString()} GP
                    </td>
                    <td>
                      {i.amount?.toLocaleString()}
                    </td>
                    <td>
                      {i.profit?.toLocaleString()} GP
                    </td>
                    <td>
                      {i.completedOn && getDiffBetweenNowAndDate(i.completedOn).shortValue}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}