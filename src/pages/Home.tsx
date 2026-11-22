import { useEffect, useMemo, useState } from 'react'
import { CircleCheckBig, Coins, Layers, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import type { Task, TaskStatus } from '@/types'
import { AGENTS, INITIAL_TASKS } from '@/data/mock'
import TaskCard from '@/components/TaskCard'
import ReviewPanel from '@/components/ReviewPanel'
import AgentStrip from '@/components/AgentStrip'

const COLUMNS: { status: TaskStatus; label: string; dot: string }[] = [
  { status: 'queued', label: '待生产', dot: 'bg-zinc-500' },
  { status: 'working', label: '生产中', dot: 'bg-sky-400' },
  { status: 'review', label: '待审核', dot: 'bg-violet-400' },
  { status: 'approved', label: '已通过', dot: 'bg-emerald-400' },
  { status: 'rejected', label: '已打回', dot: 'bg-red-400' },
]

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS)
  const [selectedId, setSelectedId] = useState<string | null>(
    INITIAL_TASKS.find((t) => t.status === 'review')?.id ?? null,
  )

  // 模拟 Agent 生产进度：working 任务逐步推进，完成后进入待审核
  useEffect(() => {
    const timer = setInterval(() => {
      setTasks((prev) =>
        prev.map((t) => {
          if (t.status !== 'working') return t
          const next = Math.min(100, t.progress + 3 + Math.floor(Math.random() * 5))
          if (next >= 100) {
            setTimeout(() => toast.success(`「${t.title}」生产完成，等待你审核`), 0)
            return { ...t, progress: 100, status: 'review' as TaskStatus }
          }
          return { ...t, progress: next }
        }),
      )
    }, 900)
    return () => clearInterval(timer)
  }, [])

  const handleApprove = (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'approved' } : t)))
    const task = tasks.find((t) => t.id === id)
    toast.success(`「${task?.title}」已通过，合入项目资产库`)
  }

  const handleReject = (id: string, feedback: string) => {
    const task = tasks.find((t) => t.id === id)
    if (!task) return
    toast.error(`已打回「${task.title}」，反馈将回传给 ${task.agent}`)
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: 'rejected', feedback: [...t.feedback, `v${t.version}: ${feedback}`] }
          : t,
      ),
    )
    // 模拟 Agent 认领打回任务并重做
    setTimeout(() => {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: 'working', progress: 0 } : t)),
      )
    }, 2000)
    setTimeout(() => {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, version: t.version + 1, seed: (t.seed * 7 + 13) % 1000000 }
            : t,
        ),
      )
    }, 2100)
  }

  const stats = useMemo(() => {
    const approved = tasks.filter((t) => t.status === 'approved').length
    const review = tasks.filter((t) => t.status === 'review').length
    const generations = tasks.reduce((sum, t) => sum + t.version, 0)
    return { approved, total: tasks.length, review, generations }
  }, [tasks])

  const selectedTask = tasks.find((t) => t.id === selectedId) ?? null

  return (
    <div className="flex h-screen flex-col bg-zinc-950 text-zinc-100">
      {/* 顶栏 */}
      <header className="flex items-center gap-4 border-b border-zinc-800 px-5 py-3">
        <div>
          <h1 className="text-lg font-bold tracking-wide">
            星渊旅团 <span className="font-normal text-zinc-500">· 2D 像素 RPG（示例项目）</span>
          </h1>
          <p className="text-[11px] text-zinc-500">AI 游戏工作室审核台 — 所有 Agent 产出经你审核后才合入项目</p>
        </div>
        <div className="ml-auto flex items-center gap-5 text-sm">
          <span className="flex items-center gap-1.5 text-zinc-400">
            <Layers className="h-4 w-4 text-zinc-500" />
            进度 {stats.approved}/{stats.total}
          </span>
          <span className="flex items-center gap-1.5 text-zinc-400">
            <CircleCheckBig className="h-4 w-4 text-violet-400" />
            待审核 {stats.review}
          </span>
          <span className="flex items-center gap-1.5 text-zinc-400">
            <Sparkles className="h-4 w-4 text-fuchsia-400" />
            累计生成 {stats.generations} 次
          </span>
          <span className="flex items-center gap-1.5 text-zinc-400">
            <Coins className="h-4 w-4 text-amber-400" />
            算力成本 ¥0.00
          </span>
          <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[11px] text-emerald-400">
            路线 1 · 零成本验证
          </span>
        </div>
      </header>

      {/* 主区域 */}
      <div className="flex min-h-0 flex-1">
        {/* 左：看板 + Agent 状态 */}
        <div className="flex min-w-0 flex-1 flex-col gap-3 overflow-hidden p-4">
          <div className="flex min-h-0 flex-1 gap-3 overflow-x-auto">
            {COLUMNS.map((col) => {
              const colTasks = tasks.filter((t) => t.status === col.status)
              return (
                <div key={col.status} className="flex w-[230px] shrink-0 flex-col">
                  <div className="mb-2 flex items-center gap-2 px-1">
                    <span className={`h-2 w-2 rounded-full ${col.dot}`} />
                    <span className="text-sm font-medium text-zinc-300">{col.label}</span>
                    <span className="text-xs text-zinc-600">{colTasks.length}</span>
                  </div>
                  <div className="flex-1 space-y-2 overflow-y-auto pr-1">
                    {colTasks.map((t) => (
                      <TaskCard key={t.id} task={t} selected={t.id === selectedId} onSelect={setSelectedId} />
                    ))}
                    {colTasks.length === 0 && (
                      <p className="rounded-lg border border-dashed border-zinc-800 py-6 text-center text-[11px] text-zinc-700">
                        暂无任务
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          <AgentStrip agents={AGENTS} tasks={tasks} />
        </div>

        {/* 右：审核面板 */}
        <aside className="w-[420px] shrink-0 border-l border-zinc-800 p-4">
          <ReviewPanel task={selectedTask} onApprove={handleApprove} onReject={handleReject} />
        </aside>
      </div>
    </div>
  )
}
