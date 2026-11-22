import { Code2, Lightbulb, Music, Palette } from 'lucide-react'
import type { Task, TaskType } from '@/types'
import { cn } from '@/lib/utils'

const TYPE_META: Record<TaskType, { label: string; icon: typeof Palette; cls: string }> = {
  art: { label: '美术', icon: Palette, cls: 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/30' },
  code: { label: '程序', icon: Code2, cls: 'text-sky-400 bg-sky-500/10 border-sky-500/30' },
  audio: { label: '音频', icon: Music, cls: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  design: { label: '策划', icon: Lightbulb, cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
}

const PRIORITY_CLS = {
  高: 'text-red-400',
  中: 'text-amber-400',
  低: 'text-zinc-500',
}

export default function TaskCard({
  task,
  selected,
  onSelect,
}: {
  task: Task
  selected: boolean
  onSelect: (id: string) => void
}) {
  const meta = TYPE_META[task.type]
  const Icon = meta.icon
  return (
    <button
      onClick={() => onSelect(task.id)}
      className={cn(
        'w-full rounded-lg border border-zinc-800 bg-zinc-900/80 p-3 text-left transition-all hover:border-zinc-600',
        selected && 'border-violet-500 ring-1 ring-violet-500/50',
        task.status === 'review' && 'border-violet-500/40',
      )}
    >
      <div className="flex items-center gap-2">
        <span className={cn('flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px]', meta.cls)}>
          <Icon className="h-3 w-3" />
          {meta.label}
        </span>
        <span className={cn('ml-auto text-[10px] font-medium', PRIORITY_CLS[task.priority])}>
          {task.priority}优先级
        </span>
      </div>
      <p className="mt-2 text-sm font-medium leading-snug text-zinc-100">{task.title}</p>
      <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500">
        <span>{task.agent}</span>
        <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono">v{task.version}</span>
      </div>
      {task.status === 'working' && (
        <div className="mt-2">
          <div className="h-1 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-sky-500 transition-all duration-500"
              style={{ width: `${task.progress}%` }}
            />
          </div>
          <p className="mt-1 text-[10px] text-sky-400">{task.progress}%</p>
        </div>
      )}
      {task.feedback.length > 0 && task.status !== 'approved' && (
        <p className="mt-2 truncate text-[10px] text-zinc-500">
          上次打回：{task.feedback[task.feedback.length - 1].replace(/^v\d+: /, '')}
        </p>
      )}
    </button>
  )
}
