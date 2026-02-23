import { useEffect, useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage';
import { DateTime } from 'luxon';
import type { Toon, Task, TaskRun } from '../types/Toon';

export default function ToonPlanner(){
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

  const addTask = (toonName: string) => {
    const trimmed = newTaskName.trim();
    if (!trimmed) return;

    const exists = tasks.filter(i => i.name.toLowerCase().includes(trimmed.toLowerCase()))

    const newTask: Task = {
      name: `${trimmed} [${exists.length + 1}]`,
      toonName,
      createdDate: DateTime.utc().toISO(),
      status: 'pending',
      taskRuns: []
    }
    const newTasks: Task[] = []
    newTasks.push(newTask)
    for(const task of tasks){
      newTasks.push(task)
    }
    setTasks(newTasks)
    setNewTaskName("");
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

  return <div className="container">
    <div className="panel">
      <h1>Toon Planner</h1>
      <div>
        Create custom tasks to utilize helpful auto-xp calculation with urns and deployables by adding some stats from RS.
      </div>
      <div>
        New Toon<br/>
        <div className="input-row">
          <input
            type="text"
            placeholder="Enter toon name."
            value={newToonName}
            onChange={(e) => setNewToonName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addToon()}
          />
          <button className="primary" onClick={addToon}>
            Add
          </button>
        </div>
      </div>
      {toons?.map(toon => {

        return <div>
          <div>
            {toon.name}
          </div>
          <div>
            New Task<br/>
            <div className="input-row">
              <input
                type="text"
                placeholder="Enter task name."
                value={newToonName}
                onChange={(e) => setNewTaskName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTask}
              />
              <button className="primary" onClick={() => {addTask(toon.name)}}>
                Add
              </button>
            </div>
          </div>

          <ul className="list">
            {tasks.filter(task => task.toonName === toon.name).map((task, i) => {

              return (
                <li
                  key={`${task.name}_${i}`}
                  className="sub-list-item">
                    <div>
                      {toon.name}
                    </div>
                    <div>
                      Fields to edit.
                    </div>
                </li>
              )
            })}
          </ul>
          
        </div>
      })}
    </div>
  </div>
}