// 用 seed 确定性生成像素风 SVG，模拟 AI 生图资产的预览占位
function mulberry32(a: number) {
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const PALETTES = [
  ['#0f172a', '#164e3f', '#22c55e', '#a3e635', '#facc15'],
  ['#1e1b4b', '#4c1d95', '#8b5cf6', '#e879f9', '#f0abfc'],
  ['#082f49', '#0369a1', '#38bdf8', '#a5f3fc', '#fef08a'],
  ['#450a0a', '#991b1b', '#f97316', '#fdba74', '#fde68a'],
  ['#134e4a', '#0f766e', '#2dd4bf', '#99f6e4', '#fef9c3'],
]

function CharacterSprite({ seed }: { seed: number }) {
  const rand = mulberry32(seed)
  const palette = PALETTES[Math.floor(rand() * PALETTES.length)]
  const size = 14
  const half = Math.ceil(size / 2)
  const cells: { x: number; y: number; c: string }[] = []
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < half; x++) {
      const r = rand()
      if (r > 0.52) {
        const c = palette[1 + Math.floor(rand() * (palette.length - 1))]
        cells.push({ x, y, c })
        if (size - 1 - x !== x) cells.push({ x: size - 1 - x, y, c })
      }
    }
  }
  return (
    <svg viewBox={`-2 -2 ${size + 4} ${size + 4}`} className="h-full w-full" shapeRendering="crispEdges">
      <rect x={-2} y={-2} width={size + 4} height={size + 4} fill="#09090b" />
      {cells.map((cell, i) => (
        <rect key={i} x={cell.x} y={cell.y} width={1.02} height={1.02} fill={cell.c} />
      ))}
    </svg>
  )
}

function SceneArt({ seed }: { seed: number }) {
  const rand = mulberry32(seed)
  const palette = PALETTES[Math.floor(rand() * PALETTES.length)]
  const w = 96
  const h = 64
  const stars = Array.from({ length: 40 }, () => ({ x: rand() * w, y: rand() * h * 0.5, o: 0.3 + rand() * 0.7 }))
  const ridge = (base: number, amp: number, color: string, step: number) => {
    let d = `M0 ${h} L0 ${base}`
    for (let x = 0; x <= w; x += step) d += ` L${x} ${base - rand() * amp}`
    d += ` L${w} ${h} Z`
    return <path d={d} fill={color} />
  }
  const glow = Array.from({ length: 8 }, () => ({ x: rand() * w, y: h * 0.72 + rand() * h * 0.2, r: 1 + rand() * 2 }))
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={`sky-${seed}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={palette[0]} />
          <stop offset="1" stopColor={palette[1]} />
        </linearGradient>
      </defs>
      <rect width={w} height={h} fill={`url(#sky-${seed})`} />
      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={0.5} fill="#fff" opacity={s.o} />
      ))}
      {ridge(h * 0.55, h * 0.25, palette[1], 8)}
      {ridge(h * 0.72, h * 0.18, palette[2], 6)}
      {glow.map((g, i) => (
        <circle key={i} cx={g.x} cy={g.y} r={g.r} fill={palette[3]} opacity={0.8} />
      ))}
    </svg>
  )
}

export default function PixelArt({ seed, mode }: { seed: number; mode: 'character' | 'scene' }) {
  return mode === 'scene' ? <SceneArt seed={seed} /> : <CharacterSprite seed={seed} />
}
