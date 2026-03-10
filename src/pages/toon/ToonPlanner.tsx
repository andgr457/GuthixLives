import { useRef, useState } from 'react'
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { DateTime } from 'luxon';
import type { Toon, Task } from '../../types/Toon';
import { useNavigate } from 'react-router-dom';

export default function ToonPlanner(){
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newToonName, setNewToonName] = useState<string>('')

  const [toons, setToons] = useLocalStorage<Toon[]>(
     "toon",
    []
  )

  const [tasks, setTasks] = useLocalStorage<Task[]>(
    'toon-tasks',
    []
  )

  const exportItems = () => {
      const dataStr = JSON.stringify({toons, tasks}, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const date = DateTime.now().toFormat('dd-MM-yyyy')
      const timestamp = DateTime.now().toMillis().toString()
      const a = document.createElement("a");
      a.href = url;
      a.download = `toons-tasks_${date}_${timestamp}.json`;
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
          setToons(parsed.toons);
          setTasks(parsed.tasks)
        } catch {
          alert("Failed to parse JSON.");
        }
      };
  
      reader.readAsText(file);
    };
  
  const addToon = () => {
    const trimmed = newToonName.trim();
    if (!trimmed) return;

    if(toons.find(i => i.name.toLowerCase() === trimmed.toLowerCase())){
      alert('Item already exists in the list with this name.')
      return
    }

    const newToon: Toon = {
      name: trimmed,
    }
    const newToons: Toon[] = []
    newToons.push(newToon)
    for(const toon of toons){
      newToons.push(toon)
    }
    setToons(newToons)
    setNewToonName("");
  };

  const clearAll = () => {
    if(!confirm('Are you sure you wish to delete all local data? Recommended to export before this.')) return
    setToons([])
    setTasks([])
  }

  return <div>
    <div>
      <h1>Toon Planner</h1>
      <div style={{fontSize: 'smaller'}}>
        Create custom tasks to utilize helpful auto-xp calculation with urns and deployables by adding some stats from RS.
      </div>
      <div className='button-row'>
        <div className='button-group'>
          <button className='danger' onClick={clearAll}>Clear All Data</button>
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
      </div>
      <div>
        New Toon<br/>
        <div className="input-row">
          <input
            type="text"
            placeholder="Enter toon name."
            value={newToonName}
            onChange={(e) => setNewToonName(e.target.value)}
          />
          <button className="primary" onClick={addToon}>
            Add
          </button>
        </div>
      </div>
      <div id='top-toons'></div>
      {toons?.map((toon) => {
        const toonTasks = tasks.filter(task => task.toonName === toon.name)
        return <div id={`${toon.name}`} key={`${toon.name}`}>
          <br/>
          <button className='primary-edit' onClick={() => {navigate(`/toonTasks/${toon.name}`)}}>
            {toon.name} {'-->'} {toonTasks.length} Task(s)
          </button>
        </div>
      })}
    </div>
  </div>
}