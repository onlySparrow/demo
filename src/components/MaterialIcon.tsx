interface MaterialIconProps {
  /** Material Symbols 图标名,与需求原型一致(如 pending_actions / inbox / task_alt) */
  name: string
  /** 填充变体(默认线性描边) */
  filled?: boolean
  className?: string
}

/**
 * Material Symbols 字体图标。
 * 图标名可直接抄原型里的 <span class="material-symbols-outlined">xxx</span>。
 */
export function MaterialIcon({ name, filled, className }: MaterialIconProps) {
  const classes = ['material-symbols-outlined', className].filter(Boolean).join(' ')

  return (
    <span
      className={classes}
      aria-hidden="true"
      style={filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
    >
      {name}
    </span>
  )
}
