import { useNavigate, useParams } from 'react-router-dom';
import { getLocalStorage, useLocalStorage } from '../../hooks/useLocalStorage';
import { useEffect, useState } from 'react';
import { type Toon, type Task, TASK_STATUS } from '../../types/Toon';
import { DateTime } from 'luxon';

export default function ToonTasks() {
  const navigate = useNavigate()
  const { toonName } = useParams<{ toonName: string }>();
  const [toon, setToon] = useState<Toon | undefined>(undefined)
  const [toonTasks, setToonTasks] = useLocalStorage<Task[]>(
    'toon-tasks',
    []
  )
  const [newTaskName, setNewTaskName] = useState<string>('')

  useEffect(() => {
    const toons = getLocalStorage<Toon[]>('toon')
    const toon = toons.find(t => t.name === toonName)
    if(!toon){
      navigate('/toonPlanner')
    } else {
      setToon(toon)
    }
  }, [toonName])

  const addTask = (toonName: string) => {
    const trimmed = newTaskName.trim();
    if (!trimmed) return;
    const exists = toonTasks.filter(i => i.name.toLowerCase().includes(trimmed.toLowerCase()) && i.toonName === toonName)
    console.log(exists)
    const newTask: Task = {
      name: `${trimmed} [${exists.length + 1}]`,
      toonName,
      createdDate: DateTime.utc().toISO(),
      status: 'pending',
      taskRuns: [],
      actionsPerMinute: 0,
      xpPerAction: 0,
      xpTarget: 0
    }
    const newTasks: Task[] = []
    newTasks.push(newTask)
    for(const task of toonTasks){
      newTasks.push(task)
    }
    setToonTasks(newTasks)
    setNewTaskName("");
  };

  const clearToonTasks = (toonName: string) => {
    if(!confirm('Are you sure? This will permanently remove all tasks for this toon. Recommend backup before continuing.')) return
    setToonTasks(toonTasks.filter(tt => tt.toonName !== toonName))
  }
  
  const updateTask = (taskName: string, prop: string, value: string | number | boolean) => {
    
    const newTasks: Task[] = []
    for(const task of toonTasks){
      if(task.name === taskName){
        //@ts-ignore
        task[prop] = value as any
      }
      newTasks.push(task)
    }
    setToonTasks(newTasks)
  }

  // const addTaskRun = (taskName: string) => {
  //   const newTaskRun: TaskRun = {
  //     createdDate: DateTime.utc().toISO(),
  //     status: 'in-progress',
  //     taskId: `${taskName}_${DateTime.utc().toMillis()}`,
  //     xpGained: 0
  //   }

  //   const newTasks: Task[] = []
  //   for(const task of tasks){
  //     if(task.name === taskName){
  //       task.taskRuns.push(newTaskRun)
  //     }
  //     newTasks.push(task)
  //   }
  //   setTasks(newTasks)
  // };  

  return <div className="container-item">
    <div className='panel-item'>
      <span style={{fontSize: 'larger'}}>{toon?.name}</span> <span style={{fontSize: 'smaller'}}>{toonTasks?.length} total task(s)</span>
      <hr/>
      <div className="input-row">
        <input
        id={`${toon?.name}_new-task`}
          type="text"
          placeholder="Enter new task name..."
          value={newTaskName}
          onChange={(e) => setNewTaskName(e.target.value)}
          style={{width: '450px', height: '25px'}}
        />
      </div>
      <div className='button-row'>
        <div className='button-group'>
          <button className="primary-edit" onClick={() => {addTask(toon?.name as string)}}>
            Add
          </button>
          <button className="primary-edit" onClick={() => {navigate('/toonPlanner')}}>
            Toon list
          </button>
        </div>
        <div className='button-group'>
          <button className="danger" onClick={() => {clearToonTasks(toon?.name as string)}}>
            Clear All Toon Tasks
          </button>
        </div>
      </div>
        
    </div>
    {toonTasks && toonTasks?.filter(tt => tt.toonName === toon?.name).map((task) => {
      let estimateMinutesToTarget = task.xpPerAction * task.actionsPerMinute
      estimateMinutesToTarget = task.xpTarget / estimateMinutesToTarget
      if(Number.isNaN(estimateMinutesToTarget)){
        estimateMinutesToTarget = 0
      }
      const dateEst = DateTime.utc().toLocal().plus({minutes: estimateMinutesToTarget})
      return <div className='panel-item'>
        <div>
          <a id={`${toon?.name}_${task.name}`}></a>
          <div className='button-row'>
            <div className='button-group'>
              <div>
                {task.name}
              </div>
              
            </div>
            <div className='button-group'>
              <div>
                <select className="rs-select"
                  value={task.status}
                  onChange={(e) =>
                    updateTask(task.name, 'status', e.currentTarget.value)
                  }
                >
                  <option value="all">
                    All
                  </option>

                  {TASK_STATUS.map((s) => (
                    <option key={s} value={s}>
                      {s.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

            </div>
            <div className='button-group'>
              <div>
                <button className='danger'>Delete Task</button>

              </div>

            </div>
          </div>
          
          
          <hr/>
        </div>
        <div className='button-row'>
          <div className='button-group'>
            <button className='primary-edit'>Start Run</button>
            <button className='primary-edit'>Stop Run</button>

          </div>
          
        </div>
        <hr/>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: '2rem'}}>
          <div> 
            <div title='The amount of XP gained when completing one action for the skill.'>
              XP/Action
            </div>
            <div className="input-row-item">
                <input
                  id={`${task.name}_task-xp-per-action`}
                  type="text"
                  placeholder="XP per Action"
                  value={task.xpPerAction ?? 0}
                  onChange={(e) => updateTask(task.name, 'xpPerAction', +e.target.value)}
                />
              </div>
          </div>
          <div>
            <div title='The number of actions that can be completed per minute to help calculate estimations.'>
              Actions/Minute
            </div>
            <div className="input-row-item">
              <input
                id={`${task.name}_task-actions-per-minute`}
                type="text"
                placeholder="Actions per minute"
                value={task.actionsPerMinute ?? 0}
                onChange={(e) => updateTask(task.name, 'actionsPerMinute', +e.target.value)}
              />
            </div>
          </div>
          <div>
            <div title='The amount of XP left when you have set Level target on a skill.'>
              XP Left
            </div>
              <div className="input-row-item">
              <input
                id={`${task.name}_task-xp-target`}
                type="text"
                placeholder="XP Left to Target"
                value={task.xpTarget ?? 0}
                onChange={(e) => updateTask(task.name, 'xpTarget', +e.target.value)}
              />
            </div>
            
          </div>
          <div>
            Estimation<br/>
            <strong>{estimateMinutesToTarget?.toFixed(1)}</strong> total minute(s)<br/>
            <strong>{estimateMinutesToTarget > 0 ? dateEst.toFormat('dd-MMM-yyyy') : '??'}</strong> at <strong>{estimateMinutesToTarget > 0 ? dateEst.toFormat('t') : '??'}</strong> 

          </div>
        </div>        
      </div>
    })}
    
  </div>
}