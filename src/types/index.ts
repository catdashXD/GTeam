export type TaskType = 'art' | 'code' | 'audio' | 'design'

export type TaskStatus = 'queued' | 'working' | 'review' | 'approved' | 'rejected'

export interface Task {
  id: string
  title: string
  type: TaskType
  status: TaskStatus
  agent: string
  priority: '高' | '中' | '低'
  version: number
  seed: number
  prompt?: string
  feedback: string[]
  progress: number
}

export interface AgentInfo {
  id: string
  name: string
  role: string
  tool: string
  doneCount: number
}
