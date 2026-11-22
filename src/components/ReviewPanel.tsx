import { useState } from 'react'
import { Check, FileSearch, RotateCcw, X } from 'lucide-react'
import type { Task } from '@/types'
import PixelArt from './PixelArt'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

const CODE_SAMPLE = [
  { sign: '+', text: 'func _physics_process(delta):' },
  { sign: '+', text: '    var dir := Input.get_axis("move_left", "move_right")' },
  { sign: '+', text: '    velocity.x = dir * MOVE_SPEED' },
  { sign: '+', text: '    _coyote_timer -= delta' },
  { sign: '+', text: '    if is_on_floor():' },
  { sign: '+', text: '        _coyote_timer = COYOTE_TIME  # 土狼时间' },
  { sign: '-', text: '    if Input.is_action_just_pressed("jump"):' },
  { sign: '+', text: '    if Input.is_action_just_pressed("jump") and _coyote_timer > 0:' },
  { sign: '+', text: '        velocity.y = -JUMP_FORCE' },
  { sign: '+', text: '    move_and_slide()' },
]

function CodePreview() {
  return (
    <div className="h-full overflow-auto rounded-md bg-[#0d1117] p-3 font-mono text-[11px] leading-5">
      <p className="mb-2 text-zinc-500">// player_controller.gd — diff v1 → v2</p>
      {CODE_SAMPLE.map((l, i) => (
        <p key={i} className={l.sign === '+' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-red-500/10 text-red-300 line-through opacity-70'}>
          {l.sign} {l.text}
        </p>
      ))}
    </div>
  )
}

function Waveform({ seed }: { seed: number }) {
  let a = seed
  const rand = () => {
    a = (a * 9301 + 49297) % 233280
    return a / 233280
  }
  const bars = Array.from({ length: 48 }, () => 0.15 + rand() * 0.85)
  return (
    <div className="flex h-full items-center justify-center gap-[3px] rounded-md bg-zinc-950 px-4">
      {bars.map((b, i) => (
        <div key={i} className="w-[4px] rounded-full bg-amber-500/80" style={{ height: `${b * 70}%` }} />
      ))}
    </div>
  )
}

function DocPreview({ task }: { task: Task }) {
  return (
    <div className="h-full space-y-2 overflow-auto rounded-md bg-zinc-950 p-4 text-[12px] leading-relaxed text-zinc-300">
      <p className="text-sm font-semibold text-zinc-100"># {task.title}</p>
      <p className="text-zinc-500">## 1. 核心循环</p>
      <p>探索洞穴 → 战斗获取素材 → 回城强化装备 → 解锁更深区域。单局时长目标 20~40 分钟。</p>
      <p className="text-zinc-500">## 2. 数值框架（初稿）</p>
      <p>攻击力成长曲线：Lv.n → 8 × 1.18ⁿ；敌人血量同区倍率 0.9~1.1 随机浮动。</p>
      <p className="text-zinc-500">## 3. 待你确认</p>
      <p>· 死亡惩罚：掉素材 or 回存档点？</p>
    </div>
  )
}

export default function ReviewPanel({
  task,
  onApprove,
  onReject,
}: {
  task: Task | null
  onApprove: (id: string) => void
  onReject: (id: string, feedback: string) => void
}) {
  const [feedback, setFeedback] = useState('')

  if (!task) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-zinc-600">
        <FileSearch className="h-10 w-10" />
        <p className="text-sm">点击左侧「待审核」任务卡查看产出物</p>
      </div>
    )
  }

  const isScene = task.title.includes('场景') || task.title.includes('UI')
  const canReview = task.status === 'review'

  return (
    <div className="flex h-full flex-col gap-3">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-zinc-100">{task.title}</h2>
          <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[11px] text-zinc-400">v{task.version}</span>
        </div>
        <p className="mt-1 text-xs text-zinc-500">
          产出方：{task.agent} · 本地算力成本 ¥0.00
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden rounded-lg border border-zinc-800">
        {task.type === 'art' && <PixelArt seed={task.seed} mode={isScene ? 'scene' : 'character'} />}
        {task.type === 'code' && <CodePreview />}
        {task.type === 'audio' && <Waveform seed={task.seed} />}
        {task.type === 'design' && <DocPreview task={task} />}
      </div>

      {task.prompt && (
        <div className="rounded-md border border-zinc-800 bg-zinc-900/60 p-2.5">
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Prompt</p>
          <p className="mt-1 font-mono text-[11px] leading-relaxed text-zinc-400">{task.prompt}</p>
        </div>
      )}

      {task.feedback.length > 0 && (
        <div className="max-h-24 space-y-1 overflow-auto">
          {task.feedback.map((f, i) => (
            <p key={i} className="rounded bg-red-500/5 px-2 py-1 text-[11px] text-red-300/80">
              ↩ {f}
            </p>
          ))}
        </div>
      )}

      {canReview ? (
        <>
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="打回意见：写清楚哪里不对，Agent 会按这条反馈重做（例：配色太暗、跳跃手感太飘）"
            className="min-h-[64px] resize-none border-zinc-800 bg-zinc-900/60 text-sm text-zinc-200 placeholder:text-zinc-600"
          />
          <div className="flex gap-2">
            <Button
              className="flex-1 bg-emerald-600 text-white hover:bg-emerald-500"
              onClick={() => onApprove(task.id)}
            >
              <Check className="mr-1 h-4 w-4" /> 通过，合入项目
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-red-500/40 bg-transparent text-red-400 hover:bg-red-500/10 hover:text-red-300"
              disabled={!feedback.trim()}
              onClick={() => {
                onReject(task.id, feedback.trim())
                setFeedback('')
              }}
            >
              <X className="mr-1 h-4 w-4" /> 打回重做
            </Button>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center gap-2 rounded-md border border-zinc-800 bg-zinc-900/60 py-3 text-sm text-zinc-500">
          <RotateCcw className="h-4 w-4" />
          {task.status === 'working' && 'Agent 正在生产中，完成后会进入待审核'}
          {task.status === 'queued' && '任务排队中，等待 Agent 认领'}
          {task.status === 'approved' && '已通过，已合入项目资产库'}
          {task.status === 'rejected' && '已打回，等待 Agent 重新认领'}
        </div>
      )}
    </div>
  )
}
