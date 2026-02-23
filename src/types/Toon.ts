export interface Toon {
  name: string
}

export type TaskStatus = 'pending' | 'in-progress' | 'complete'
export interface Task {
  toonName: string
  name: string
  createdDate: string
  status: TaskStatus

  /** Skilling */
  /** @example 22 xp per action  */
  xpPerAction: number
  /** @example 20 traverse actions per minute = 440 xp (22 xp * 20 action)  */
  actionsPerMinute: number
  /** @example 18,185 */
  xpTarget: number
  taskRuns: TaskRun[]
}

export interface TaskRun {
  taskId: string
  xpGained: number
  status: TaskStatus
  createdDate: string
  stoppedDate?: string
  actualXPGained?: number
}