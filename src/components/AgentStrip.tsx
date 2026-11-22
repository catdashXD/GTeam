import { Bot, Code2, Lightbulb, Music, Palette } from 'lucide-react'
import type { AgentInfo, Task } from '@/types'
import { cn } from '@/lib/utils'

const ICONS: Record<string, typeof Bot> = {
  planner: Lightbulb,
  artist: Palette,
  coder: Code2,
  audio: Music,
}

export default function AgentStrip({ agents, tasks }: { agents: AgentInfo[]; tasks: Task[] }) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {agents.map((agent) => {
        const working = tasks.find((t) => t.agent === agent.name && t.status === 'working')
        const Icon = ICONS[agent.id] ?? Bot
        return (
          <div key={agent.id} className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-800 text-zinc-300">
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-zinc-200">{agent.name}</p>
                <p className="truncate text-[10px] text-zinc-500">{agent.tool}</p>
              </div>
              <span
                className={cn(
                  'ml-auto flex items-center gap-1.5 text-[10px]',
                  working ? 'text-sky-400' : 'text-zinc-500',
                )}
              >
                <span
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    working ? 'animate-pulse bg-sky-400' : 'bg-zinc-600',
                  )}
                />
                {working ? '工作中' : '待命'}
              </span>
            </div>
            <p className="mt-2 truncate text-[11px] text-zinc-500">
              {working ? `正在做：${working.title}` : `已完成 ${agent.doneCount} 项任务`}
            </p>
          </div>
        )
      })}
    </div>
  )
}
