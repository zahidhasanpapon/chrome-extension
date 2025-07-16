import React, { useState, useEffect } from 'react'
import { Target, CheckCircle, Globe, Settings, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Stats {
    totalTodos: number
    completedTodos: number
    blockedSitesCount: number
    todayCompleted: number
}

const PopupApp: React.FC = () => {
    const [stats, setStats] = useState<Stats>({
        totalTodos: 0,
        completedTodos: 0,
        blockedSitesCount: 0,
        todayCompleted: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadStats = async () => {
            try {
                const response = await chrome.runtime.sendMessage({ action: 'getStats' })
                if (response.stats) {
                    setStats(response.stats)
                }
            } catch (error) {
                console.error('Error loading stats:', error)
            } finally {
                setLoading(false)
            }
        }

        loadStats()
    }, [])

    const openProductivityHub = async () => {
        try {
            await chrome.tabs.create({ url: 'chrome://newtab/' })
            window.close()
        } catch (error) {
            console.error('Error opening productivity hub:', error)
        }
    }

    if (loading) {
        return (
            <div className="w-80 h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    return (
        <div className="w-80 bg-white">
            {/* Header */}
            <Card className="border-0 rounded-none">
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                                <Target className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-lg font-semibold">Productivity Hub</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={openProductivityHub}
                            className="h-8 w-8"
                        >
                            <ExternalLink className="w-4 h-4" />
                        </Button>
                    </CardTitle>
                </CardHeader>
            </Card>

            {/* Quick Stats */}
            <div className="p-4 border-b">
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{stats.todayCompleted}</div>
                        <div className="text-xs text-gray-500">Completed Today</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{stats.totalTodos - stats.completedTodos}</div>
                        <div className="text-xs text-gray-500">Pending Tasks</div>
                    </div>
                </div>
            </div>

            {/* Overview */}
            <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Total Tasks</span>
                    </div>
                    <Badge variant="secondary">{stats.totalTodos}</Badge>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4 text-red-500" />
                        <span className="text-sm">Blocked Sites</span>
                    </div>
                    <Badge variant="destructive">{stats.blockedSitesCount}</Badge>
                </div>

                {stats.totalTodos > 0 && (
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Progress</span>
                        <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                    style={{
                                        width: `${Math.round((stats.completedTodos / stats.totalTodos) * 100)}%`
                                    }}
                                />
                            </div>
                            <span className="text-xs text-gray-500">
                                {Math.round((stats.completedTodos / stats.totalTodos) * 100)}%
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="p-4 border-t bg-gray-50">
                <Button
                    onClick={openProductivityHub}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                    <Target className="w-4 h-4 mr-2" />
                    Open Productivity Hub
                </Button>
            </div>
        </div>
    )
}

export default PopupApp