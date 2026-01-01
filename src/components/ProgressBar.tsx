interface ProgressBarProps {
  current: number
  total: number
  showLabel?: boolean
  color?: 'blue' | 'green' | 'purple' | 'orange'
  size?: 'sm' | 'md' | 'lg'
}

const colorClasses = {
  blue: 'from-blue-400 to-blue-600',
  green: 'from-green-400 to-green-600',
  purple: 'from-purple-400 to-purple-600',
  orange: 'from-orange-400 to-orange-600',
}

const sizeClasses = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
}

export default function ProgressBar({ 
  current, 
  total, 
  showLabel = true,
  color = 'blue',
  size = 'md'
}: ProgressBarProps) {
  const percentage = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>{current} / {total}</span>
          <span>{percentage}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div 
          className={`h-full bg-gradient-to-r ${colorClasses[color]} rounded-full progress-bar`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
