import { ReactNode } from 'react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'pink'
}

const colorClasses = {
  blue: 'from-blue-500 to-blue-600',
  green: 'from-green-500 to-green-600',
  purple: 'from-purple-500 to-purple-600',
  orange: 'from-orange-500 to-orange-600',
  pink: 'from-pink-500 to-pink-600',
}

const bgColorClasses = {
  blue: 'bg-blue-50',
  green: 'bg-green-50',
  purple: 'bg-purple-50',
  orange: 'bg-orange-50',
  pink: 'bg-pink-50',
}

export default function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend,
  color = 'blue' 
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow card-hover">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
          {subtitle && (
            <p className="text-gray-400 text-xs mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
              <span className="text-gray-400">较昨日</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${bgColorClasses[color]}`}>
          <div className={`bg-gradient-to-br ${colorClasses[color]} p-2 rounded-lg text-white`}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  )
}
