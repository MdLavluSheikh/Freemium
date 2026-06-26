import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  title: string
  action?: { label: string; href?: string; onClick?: () => void }
  className?: string
}

export default function SectionHeader({ title, action, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)}>
      <motion.h2
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="text-xl sm:text-2xl font-bold text-white tracking-tight"
      >
        {title}
      </motion.h2>
      {action && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={action.onClick}
          className="text-sm text-zinc-400 hover:text-white transition-colors font-medium"
        >
          {action.label} →
        </motion.button>
      )}
    </div>
  )
}
