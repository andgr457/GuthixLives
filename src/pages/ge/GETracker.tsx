import { useCallback, useState } from "react";
import { useRef } from "react";
import {DateTime} from 'luxon'
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { getDiffBetweenNowAndDate, getLocalDateAndTime } from '../../services/common/Dates.service';
import { fetchGEItem } from '../../services/ge/GE.service';
import type { GEItemData } from '../../types/Item';

export default function GETracker() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useLocalStorage<GEItemData[]>(
    "ge-tracker-items",
    []
  );
  const [history, setHistory] = useLocalStorage<GEItemData[]>(
    "ge-tracker-history",
    []
  );

  const [showHistory, setShowHistory] = useState<Map<string, boolean>>(new Map())

  const [input, setInput] = useState("");

  const refreshOne = useCallback(async (itemName: string) => {
    try {

      const data = await fetchGEItem(itemName);
      const newItems: GEItemData[] = []
      const newHistory: GEItemData[] = [...history]

      for(const item of items){
        if(item.name === itemName){
          if(item.price !== data.price){
            const newItem = {
              name: itemName,
              price: data.price,
              timestamp: DateTime.utc().toISO()
            }
            newItems.push(newItem)
            newHistory.push(newItem)
          } else {
            //price did not change
            newItems.push(item)
          }
        } else {
          newItems.push(item)
        }
      }
      
      setItems(newItems);
      setHistory(newHistory)

    } catch (err) {
      console.error(err)
    }
  }, [items, history]);

  const clearAllHistory = function () {
    if(confirm('This will remove all item history and will save it. Export/backup is highly recommended before this! Are you sure?')){
      setHistory([])
    }
  }

  const clearHistory = function(itemName: string){
    if(confirm('This will remove this item history log and will save it. Export/backup is highly recommended before this! Are you sure?')){
      const newHistory: GEItemData[] = []
      for(const h of history){
        if(h.name === itemName) continue
        newHistory.push(h)
      }
      setHistory(newHistory)
    }
  }

  const exportItems = () => {
    const dataStr = JSON.stringify({items, history}, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const date = DateTime.now().toFormat('dd-MM-yyyy')
    const timestamp = DateTime.now().toMillis().toString()
    const a = document.createElement("a");
    a.href = url;
    a.download = `ge-tracker_${date}_${timestamp}.json`;
    a.click();

    URL.revokeObjectURL(url);
  };

  const importItems = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        setItems(parsed.items);
        setHistory(parsed.history)
      } catch {
        alert("Failed to parse JSON.");
      }
    };

    reader.readAsText(file);
  };

  const addItem = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    //format to uppercase 1 index lower the rest
    const rsNaming = trimmed[0].toUpperCase() + trimmed.slice(1).toLowerCase();

    if(items.find(i => i.name === rsNaming)){
      alert('Item already exists in the list with this name.')
      return
    }

    const newItem: GEItemData = {
      name: rsNaming
    }
    const newItems: GEItemData[] = []
    newItems.push(newItem)
    for(const item of items){
      newItems.push(item)
    }
    setItems(newItems)
    setInput("");
  };

  const removeItem = (itemName: string) => {
    if(confirm('This will remove current and history data for this item. Are you sure?')){
      const updated = items.filter(i => i.name !== itemName)
      setItems(updated);
      const updatedHistory = history.filter(h => h.name !== itemName)
      setHistory(updatedHistory)
    }
  };

  const handleShowHistoryClicked = useCallback((itemName: string) => {
    const dupe = new Map(showHistory); // copy current Map

    if (!dupe.has(itemName)) {
      dupe.set(itemName, true);
    } else {
      const current = dupe.get(itemName)!;   // get current value
      dupe.set(itemName, !current);          // toggle it
    }

    setShowHistory(dupe);
  }, [showHistory]);

  const handlePlannerClicked = (itemName: string) => {
    navigate(`/geplanner/${encodeURIComponent(itemName)}`);
  }

  const handleDashboardClicked = () => {
    navigate('/geplanner')
  }

  return (
    <div className="container">
      <div className="panel">
        <h1>GE Tracker</h1>

          New Item Name (exact spacing)<br/>
        <div className="input-row">
          <input
            type="text"
            placeholder="Enter item name. Auto-formats for RS naming."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addItem()}
          />
          <button className="primary" onClick={addItem}>
            Add
          </button>
        </div>

        <div style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem" }}>
          
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

          <button
            className="primary"
            onClick={handleDashboardClicked}
          >
            Planner Dashboard
          </button>

          <div style={{fontSize: 'smaller'}}>
            History only stores when prices change from currently stored values.
          </div>
          <button className="danger" onClick={clearAllHistory}>
            Clear All History
          </button>
        </div>

        <ul className="list">
          {items.map((item, index) => (
            <>
            <li key={index} className="list-item">
              <table style={{width: '100%'}}>
                <tbody>
                  <tr>
                    <td style={{width: '50%'}}>
                      {item.name} 
                    </td>
                    <td style={{letterSpacing: '2px'}}>
                      {item.price ? `${item.price.toLocaleString()} GP` : ''}
                    </td>
                  </tr>
                </tbody>
              </table>
              <hr />

              <div className="button-row">
                {/* Left-side buttons */}
                <div className="button-group">
                  <button
                    className="primary"
                    onClick={() => refreshOne(item.name as string)}
                  >
                    Refresh
                  </button>
                  <button
                    className={showHistory.get(item.name) === true ? 'secondary' : 'primary'}
                    onClick={() => handleShowHistoryClicked(item.name)}
                  >
                    History
                  </button>
                  <button
                    className={'primary'}
                    onClick={() => handlePlannerClicked(item.name)}
                  >
                    Planner
                  </button>
                </div>

                {/* Right-side danger buttons */}
                <div className="button-group">
                  <button
                    className="danger"
                    onClick={() => removeItem(item.name)}
                  >
                    Remove Item & History
                  </button>
                  <button
                    className="danger"
                    onClick={() => clearHistory(item.name)}
                  >
                    Clear History
                  </button>
                </div>
              </div>

            </li>
            {showHistory?.get(item.name) === true && (
              <ul className="list">
                {history
                  .filter((h) => h.name === item.name)
                  .map((h, i) => {
                    const shortHintDiffs = getDiffBetweenNowAndDate(
                      h.timestamp as string
                    );

                    return (
                      <li
                        key={`${item.name}_${i}`}
                        className="sub-list-item"
                      >
                        <table style={{ width: "100%" }}>
                          <tbody>
                            <tr>
                              <td>{h.name}</td>

                              <td>
                                {h.price
                                  ? `${h.price.toLocaleString()} GP`
                                  : ""}
                              </td>

                              <td>
                                {h.timestamp &&
                                  getLocalDateAndTime(h.timestamp)}
                              </td>

                              <td title={shortHintDiffs.hintValue}>
                                {h.timestamp &&
                                  shortHintDiffs.shortValue}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </li>
                    );
                  })}
              </ul>
            )}

            </>
          ))}
        </ul>
      </div>
    </div>
  );
}