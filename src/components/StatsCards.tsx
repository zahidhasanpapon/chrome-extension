import React from 'react'
import { CheckCircle, Clock, Globe, Activity, Target, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProductivityStats } from '@/types'

interface StatsCardsProps {
    stats: ProductivityStats
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
    const statCards = [
        {
            title: 'Completed Today',
            value: stats.todayCompleted,
            subtitle: 'tasks',
            icon: CheckCircle,
            color: 'text-motivate-500',
            bgColor: 'bg-motivate-50',
            borderColor: 'border-motivate-200'
        },
        {
            title: 'Pending',
            value: stats.pendingTodos,
            subtitle: 'tasks',
            icon: Clock,
            color: 'text-focus-500',
            bgColor: 'bg-focus-50',
            borderColor: 'border-focus-200'
        },
        {
            title: 'Blocked Sites',
            value: stats.blockedSitesCount,
            subtitle: 'sites',
            icon: Globe,
            color: 'text-red-500',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200'
        },
        {
            title: 'Productivity',
            value: stats.productivity,
            subtitle: '%',
            icon: Activity,
            color: 'text-purple-500',
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-200'
        }
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((stat, index) => {
                const Icon = stat.icon
                return (
                    <Card
                        key={index}
                        className={`glass-card border-white/20 hover:shadow-lg transition-all duration-200 ${stat.borderColor}`}
                    >
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 mb-1">
                                        {stat.title}
                                    </p>
                                    <div className="flex items-baseline space-x-1">
                                        <p className="text-2xl font-bold text-gray-900">
                                            {stat.value}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {stat.subtitle}
                                        </p>
                                    </div>
                                </div>
                                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                                    <Icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                            </div>

                            {/* Progress indicator for productivity */}
                            {stat.title === 'Productivity' && (
                                <div className="mt-3">
                                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                        <span>Progress</span>
                                        <span>{stat.value}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${Math.min(stat.value, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Completion rate for completed tasks */}
                            {stat.title === 'Completed Today' && stats.totalTodos > 0 && (
                                <div className="mt-2">
                                    <Badge variant="motivate" className="text-xs">
                                        {Math.round((stats.completedTodos / stats.totalTodos) * 100)}% complete
                                    </Badge>
                                </div>
                            )}

                            {/* Streak indicator */}
                            {stat.title === 'Completed Today' && stats.streakDays > 0 && (
                                <div className="mt-2 flex items-center space-x-1">
                                    <Target className="w-3 h-3 text-orange-500" />
                                    <span className="text-xs text-gray-500">
                                        {stats.streakDays} day streak
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}

export default StatsCards