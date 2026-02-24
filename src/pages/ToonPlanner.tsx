import { useEffect, useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage';
import { DateTime } from 'luxon';
import type { Toon, Task, TaskRun } from '../types/Toon';
import { useNavigate } from 'react-router-dom';

interface ToonToggle {
  toonName: string
  showTasks: boolean
  newTaskName: string
  showComplete: boolean
}

export default function ToonPlanner(){
  const navigate = useNavigate()

  const [newToonName, setNewToonName] = useState<string>('')
  const [newTaskName, setNewTaskName] = useState<string>('')

  const [toons, setToons] = useLocalStorage<Toon[]>(
     "toon",
    []
  )

  const [tasks, setTasks] = useLocalStorage<Task[]>(
    'toon-tasks',
    []
  )

  const [toggles, setToggles] = useLocalStorage<ToonToggle[]>(
    'toon-toggles',
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

  

  const addTaskRun = (taskName: string) => {
    const newTaskRun: TaskRun = {
      createdDate: DateTime.utc().toISO(),
      status: 'in-progress',
      taskId: `${taskName}_${DateTime.utc().toMillis()}`,
      xpGained: 0
    }

    const newTasks: Task[] = []
    for(const task of tasks){
      if(task.name === taskName){
        task.taskRuns.push(newTaskRun)
      }
      newTasks.push(task)
    }
    setTasks(newTasks)
  };

  const updateTask = (taskName: string, prop: string, value: string | number | boolean) => {
    
    const newTasks: Task[] = []
    for(const task of tasks){
      if(task.name === taskName){
        //@ts-ignore
        task[prop] = value as any
      }
      newTasks.push(task)
    }
    setTasks(newTasks)
  }

  const updateToggles = (toonName: string, prop: string, value: string | number | boolean) => {
    const newToggles: ToonToggle[] = []
    const exists = toggles.find(t => t.toonName === toonName)
    if(!exists){
      newToggles.push({
        toonName,
        showTasks: value as any,
        newTaskName: '',
        showComplete: false
      })
    }

    for(const toggle of toggles){
      if(toggle.toonName === toonName){
        //@ts-ignore
        toggle[prop]= value as any
      }
      newToggles.push(toggle)
    }
    setToggles(newToggles)
  }

  const moveToonToIndex = (toonName: string, index: number) => {
    const currentIndex = toons.findIndex(t => t.name === toonName)
    if (currentIndex === -1) return

    const updated = [...toons]
    const [moved] = updated.splice(currentIndex, 1)

    const safeIndex = Math.max(0, Math.min(index, updated.length))
    updated.splice(safeIndex, 0, moved)

    setToons(updated)
  }

  const moveToonTaskToIndex = (toonName: string, taskName: string, index: number) => {
    const currentIndex = tasks.findIndex(t => t.name === taskName)
    if (currentIndex === -1) return
    const updated = [...tasks]
    const [moved] = updated.splice(currentIndex, 1)
    
    const safeIndex = Math.max(0, Math.min(index, updated.length))
    updated.splice(safeIndex, 0, moved)
    

    setTasks(updated)
  }

  const clearAll = () => {
    if(!confirm('Are you sure you wish to delete all local data? Recommended to export before this.')) return
    setToons([])
    setTasks([])
  }

  return <div className="container">
    <div className="panel">
      <h1>Toon Planner</h1>
      <div style={{fontSize: 'smaller'}}>
        Create custom tasks to utilize helpful auto-xp calculation with urns and deployables by adding some stats from RS.
      </div>
      <div className='button-row'>
        <div className='button-group'>
          <button className='danger' onClick={clearAll}>Clear All Data</button>
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
      {toons?.map((toon, toonIndex) => {
        const toonTasks = tasks.filter(task => task.toonName === toon.name)
        const toonToggle = toggles?.find(toggle => toggle.toonName === toon.name)
        const showTasks = typeof toonToggle?.showTasks === 'undefined' ? false : toonToggle.showTasks
        const newTaskName = typeof toonToggle?.newTaskName === 'undefined' ? '' : toonToggle.newTaskName
        return <div id={`${toon.name}`} key={`${toon.name}`}>
          <br/>
          <button className='primary-edit' onClick={() => {navigate(`/toonTasks/${toon.name}`)}}>
            {toon.name} {'-->'} {toonTasks.length} Task(s)
          </button>
          
          {/* <div>
            New Task<br/>
            <div className="input-row" style={{maxWidth: '350px'}}>
              <input
              id={`${toon.name}_new-task`}
                type="text"
                placeholder="Enter task name."
                value={newTaskName}
                onChange={(e) => updateToggles(toon.name, 'newTaskName', e.target.value)}
                style={{width: '450px'}}
              />
              <button className="primary" onClick={() => {addTask(toon.name)}}>
                Add
              </button>
              <button className='primary-edit' onClick={() => {updateToggles(toon.name, 'showTasks', !showTasks)}}>{showTasks === true ? 'Hide' : 'Show'} {toonTasks.length} Task(s)</button>
            </div>
          </div> */}
          {/* <ul className="list">
            {showTasks === true && toonTasks.map((task, taskIndex) => {
              let estimateMinutesToTarget = task.xpPerAction * task.actionsPerMinute
              estimateMinutesToTarget = task.xpTarget / estimateMinutesToTarget
              if(Number.isNaN(estimateMinutesToTarget)){
                estimateMinutesToTarget = 0
              }
              const dateEst = DateTime.utc().toLocal().plus({minutes: estimateMinutesToTarget})
              return (
                <li
                  id={`${toon.name}_${task.name}`}  
                  key={`${task.name}_${taskIndex}`}
                  style={{fontSize: '.8em', paddingLeft: '5%', paddingRight: '5%', textAlign: 'center'}}
                >
                  <hr/>
                  <a id={`${toon.name}_${task.name}`}  ></a>

                  {taskIndex !== 0 && <div className="input-row" style={{maxWidth: '450px'}}>
                        <input
                          id={`${task.name}_index`}
                          type="text"
                          placeholder="Change postition."
                          value={taskIndex}
                          onChange={(e) => {moveToonTaskToIndex(toon.name, task.name, +e.target.value)}}
                          style={{width: '50px', height: '20px'}}
                        />
                        <div style={{width: '450px', textAlign: 'center', fontSize: 'larger'}}>TASK: {task.name}</div>
                        <button className='primary-edit' style={{width: '200px', maxHeight: '30px'}} onClick={() => {moveToonTaskToIndex(toon.name, task.name, 0)}}>Move To TOP</button>

                      </div>}
                  <div style={{display: 'flex', flexWrap: 'wrap', gap: '1em'}}>
                    <div style={{width: '33%'}}>                 
                      <div className="input-row" style={{maxWidth: '250px'}}>
                        <div style={{width: '70px'}}>
                          XP/Action
                        </div>
                        <input
                          id={`${task.name}_task-xp-per-action`}
                          type="text"
                          placeholder="XP per Action"
                          value={task.xpPerAction ?? 0}
                          onChange={(e) => updateTask(task.name, 'xpPerAction', +e.target.value)}
                          style={{width: '50px', height: '20px'}}
                        />
                        
                      </div>
                    
                      <div className="input-row" style={{maxWidth: '250px'}}>
                        <div style={{width: '70px'}}>
                          Actions<br/>/Minute
                        </div>
                        <input
                          id={`${task.name}_task-actions-per-minute`}
                          type="text"
                          placeholder="Actions per minute"
                          value={task.actionsPerMinute ?? 0}
                          onChange={(e) => updateTask(task.name, 'actionsPerMinute', +e.target.value)}
                          style={{width: '50px', height: '20px'}}
                        />
                        
                      </div>

                    <div className="input-row" style={{maxWidth: '250px'}}>
                      <div style={{width: '70px'}}>
                        XP Left
                      </div>
                        <input
                          id={`${task.name}_task-xp-target`}
                          type="text"
                          placeholder="XP Left to Target"
                          value={task.xpTarget ?? 0}
                          onChange={(e) => updateTask(task.name, 'xpTarget', +e.target.value)}
                          style={{width: '75px', height: '20px'}}
                        />
                        
                      </div>
                    </div>

                    <div  style={{width: '33%'}}>
                      <div style={{padding: '10px'}}>
                        {estimateMinutesToTarget > 0 && <strong>{dateEst.toFormat('t')}</strong>} Est. End (Time)
                      </div>
                      <div style={{padding: '10px'}}>
                        <strong>{estimateMinutesToTarget > 0 && dateEst.toFormat('dd-MMM-yyyy')}</strong> Est. End (Day)

                      </div>
                      <div style={{padding: '10px'}}>
                        <strong>{task.xpPerAction?.toFixed(1) ?? 0}</strong> XP/Action

                      </div>
                      <div style={{padding: '10px'}}>
                        <strong>{task.actionsPerMinute?.toFixed(1) ?? 0}</strong> Actions/Minute

                      </div>
                      <div style={{padding: '10px'}}>
                        <strong>{task.xpTarget?.toFixed(1) ?? 0}</strong> XP Left of Target Level

                      </div>
                      <div style={{padding: '10px'}}>
                        <strong>{estimateMinutesToTarget?.toFixed(1)}</strong> Estimated Minute(s) to Target
                      </div>
                    </div>

                    <div style={{width: '30%'}}>
                      <div className='button-row'>
                        <div className='button-group'>
                          <button className='primary'>Start Run</button>

                        </div>
                        <div className='button-group'>
                          <button className='danger'>Delete Task</button>
                          <div>
                            {task.taskRuns?.map(taskRun => {
                              return <div>
                                {taskRun.createdDate}
                                </div>
                            })}
                          </div>
                        </div>
                      </div>
                      <div className='button-row'>
                        <div className='button-group'>
                          <button className='primary'>Stop Run</button>
                        </div>
                      </div>
                    </div>

                  </div>
                    <div>
                    </div>
                </li>
              )
            })}
          </ul> */}
          
        </div>
      })}
    </div>
  </div>
}