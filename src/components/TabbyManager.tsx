import React, { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    FolderOpen,
    Plus,
    RefreshCw,
    X,
    ExternalLink,
    Check,
    Folder,
    Globe,
    ChevronDown,
    ChevronRight
} from 'lucide-react'
import { ChromeTab, TabGroup } from '@/types'
import { StorageManager } from '@/lib/utils'

interface TabbyManagerProps {
    theme: 'light' | 'dark'
}

const TabbyManager: React.FC<TabbyManagerProps> = ({ theme }) => {
    const [currentTabs, setCurrentTabs] = useState<ChromeTab[]>([])
    const [selectedTabs, setSelectedTabs] = useState<Set<number>>(new Set())
    const [tabGroups, setTabGroups] = useState<TabGroup[]>([])
    const [newGroupName, setNewGroupName] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [autoRefresh, setAutoRefresh] = useState(false)
    const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null)
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

    useEffect(() => {
        loadCurrentTabs()
        loadTabGroups()
    }, [])

    useEffect(() => {
        if (autoRefresh) {
            const interval = setInterval(loadCurrentTabs, 2000)
            setRefreshInterval(interval)
        } else {
            if (refreshInterval) {
                clearInterval(refreshInterval)
                setRefreshInterval(null)
            }
        }

        return () => {
            if (refreshInterval) {
                clearInterval(refreshInterval)
            }
        }
    }, [autoRefresh])

    const loadCurrentTabs = async () => {
        try {
            const tabs = await chrome.tabs.query({ currentWindow: true })
            const filteredTabs: ChromeTab[] = tabs
                .filter(tab =>
                    tab.url &&
                    !tab.url.startsWith('chrome://') &&
                    !tab.url.startsWith('chrome-extension://') &&
                    !tab.url.startsWith('moz-extension://')
                )
                .map(tab => ({
                    id: tab.id!,
                    title: tab.title || 'Untitled',
                    url: tab.url!,
                    favIconUrl: tab.favIconUrl,
                    windowId: tab.windowId,
                    active: tab.active,
                    pinned: tab.pinned,
                    selected: selectedTabs.has(tab.id!)
                }))

            setCurrentTabs(filteredTabs)
            setIsLoading(false)
        } catch (error) {
            console.error('Error loading tabs:', error)
            setIsLoading(false)
        }
    }

    const loadTabGroups = async () => {
        try {
            const groups = await StorageManager.get<TabGroup[]>('tabGroups')
            setTabGroups(groups || [])
        } catch (error) {
            console.error('Error loading tab groups:', error)
        }
    }



    const toggleTabSelection = (tabId: number) => {
        const newSelected = new Set(selectedTabs)
        if (newSelected.has(tabId)) {
            newSelected.delete(tabId)
        } else {
            newSelected.add(tabId)
        }
        setSelectedTabs(newSelected)
    }

    const selectAllTabs = () => {
        const allTabIds = new Set(currentTabs.map(tab => tab.id))
        setSelectedTabs(allTabIds)
    }

    const clearSelection = () => {
        setSelectedTabs(new Set())
    }

    const createTabGroup = async () => {
        if (!newGroupName.trim() || selectedTabs.size === 0) {
            return
        }

        const selectedTabsData = currentTabs.filter(tab => selectedTabs.has(tab.id))
        const newGroup: TabGroup = {
            id: Date.now().toString(),
            name: newGroupName.trim(),
            tabs: selectedTabsData,
            createdAt: new Date().toISOString(),
            color: getRandomColor()
        }

        const updatedGroups = [...tabGroups, newGroup]
        setTabGroups(updatedGroups)
        await StorageManager.set('tabGroups', updatedGroups)

        setNewGroupName('')
        setSelectedTabs(new Set())
    }

    const deleteTabGroup = async (groupId: string) => {
        const updatedGroups = tabGroups.filter(group => group.id !== groupId)
        setTabGroups(updatedGroups)
        await StorageManager.set('tabGroups', updatedGroups)
    }

    const openTabGroup = async (group: TabGroup) => {
        try {
            for (const tab of group.tabs) {
                await chrome.tabs.create({ url: tab.url, active: false })
            }
        } catch (error) {
            console.error('Error opening tab group:', error)
        }
    }

    const toggleGroupExpansion = (groupId: string) => {
        const newExpanded = new Set(expandedGroups)
        if (newExpanded.has(groupId)) {
            newExpanded.delete(groupId)
        } else {
            newExpanded.add(groupId)
        }
        setExpandedGroups(newExpanded)
    }

    const deleteTabFromGroup = async (groupId: string, tabId: number) => {
        const updatedGroups = tabGroups.map(group => {
            if (group.id === groupId) {
                return {
                    ...group,
                    tabs: group.tabs.filter(tab => tab.id !== tabId)
                }
            }
            return group
        }).filter(group => group.tabs.length > 0) // Remove empty groups

        setTabGroups(updatedGroups)
        await StorageManager.set('tabGroups', updatedGroups)
    }

    const openSingleTab = async (url: string) => {
        try {
            await chrome.tabs.create({ url, active: true })
        } catch (error) {
            console.error('Error opening tab:', error)
        }
    }

    const closeSelectedTabs = async () => {
        try {
            const tabIds = Array.from(selectedTabs)
            await Promise.all(tabIds.map(id => chrome.tabs.remove(id)))
            setSelectedTabs(new Set())
            await loadCurrentTabs()
        } catch (error) {
            console.error('Error closing tabs:', error)
        }
    }

    const getRandomColor = () => {
        const colors = ['blue', 'green', 'purple', 'red', 'yellow', 'pink', 'indigo']
        return colors[Math.floor(Math.random() * colors.length)]
    }

    const getFaviconUrl = (url?: string) => {
        if (!url) return null
        try {
            const domain = new URL(url).hostname
            return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
        } catch {
            return null
        }
    }

    if (isLoading) {
        return (
            <Card className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-center py-8">
                        <RefreshCw className="w-6 h-6 animate-spin" />
                        <span className="ml-2">Loading tabs...</span>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            <Card className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <FolderOpen className="w-5 h-5 text-blue-500" />
                            <span>Tabby - Tab Manager</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setAutoRefresh(!autoRefresh)}
                            >
                                <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                                {autoRefresh ? 'Auto' : 'Manual'}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={loadCurrentTabs}
                            >
                                <RefreshCw className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardTitle>
                </CardHeader>
            </Card>

            <Tabs defaultValue="current" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="current">Current Tabs ({currentTabs.length})</TabsTrigger>
                    <TabsTrigger value="groups">Tab Groups ({tabGroups.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="current" className="space-y-4">
                    {/* Tab Selection Controls */}
                    <Card className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-2">
                                    <Button variant="outline" size="sm" onClick={selectAllTabs}>
                                        Select All
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={clearSelection}>
                                        Clear
                                    </Button>
                                    <Badge variant="secondary">
                                        {selectedTabs.size} selected
                                    </Badge>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={closeSelectedTabs}
                                        disabled={selectedTabs.size === 0}
                                    >
                                        <X className="w-4 h-4 mr-2" />
                                        Close Selected
                                    </Button>
                                </div>
                            </div>

                            {/* Create Group Controls */}
                            <div className="flex items-center space-x-2">
                                <Input
                                    placeholder="Group name..."
                                    value={newGroupName}
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                    className="flex-1"
                                />
                                <Button
                                    onClick={createTabGroup}
                                    disabled={!newGroupName.trim() || selectedTabs.size === 0}
                                >
                                    <FolderOpen className="w-4 h-4 mr-2" />
                                    Create Tab Group
                                </Button>

                            </div>
                        </CardContent>
                    </Card>

                    {/* Current Tabs Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {currentTabs.map((tab) => (
                            <Card
                                key={tab.id}
                                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${selectedTabs.has(tab.id)
                                    ? 'ring-2 ring-blue-500 bg-blue-50'
                                    : theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                                    }`}
                                onClick={() => toggleTabSelection(tab.id)}
                            >
                                <CardContent className="pt-4">
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0">
                                            {selectedTabs.has(tab.id) && (
                                                <div className="absolute -top-2 -left-2 bg-blue-500 text-white rounded-full p-1">
                                                    <Check className="w-3 h-3" />
                                                </div>
                                            )}
                                            <img
                                                src={getFaviconUrl(tab.url) || ''}
                                                alt=""
                                                className="w-6 h-6 rounded"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement
                                                    target.style.display = 'none'
                                                    const fallback = target.nextElementSibling as HTMLElement
                                                    if (fallback) fallback.style.display = 'flex'
                                                }}
                                            />
                                            <div className="hidden w-6 h-6 bg-gray-200 rounded flex items-center justify-center">
                                                <Globe className="w-4 h-4 text-gray-500" />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-medium truncate" title={tab.title}>
                                                {tab.title}
                                            </h3>
                                            <p className="text-xs text-gray-500 truncate" title={tab.url}>
                                                {tab.url}
                                            </p>
                                            <div className="flex items-center space-x-2 mt-2">
                                                {tab.active && (
                                                    <Badge variant="default" className="text-xs">Active</Badge>
                                                )}
                                                {tab.pinned && (
                                                    <Badge variant="secondary" className="text-xs">Pinned</Badge>
                                                )}
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                chrome.tabs.update(tab.id, { active: true })
                                            }}
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {currentTabs.length === 0 && (
                        <Card className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                            <CardContent className="pt-6">
                                <div className="text-center py-8 text-gray-500">
                                    <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p className="text-lg font-medium">No tabs available</p>
                                    <p className="text-sm">Open some tabs to manage them here</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="groups" className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                        {tabGroups.map((group) => (
                            <Card key={group.id} className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => toggleGroupExpansion(group.id)}
                                                className="p-1"
                                            >
                                                {expandedGroups.has(group.id) ? (
                                                    <ChevronDown className="w-4 h-4" />
                                                ) : (
                                                    <ChevronRight className="w-4 h-4" />
                                                )}
                                            </Button>
                                            <Folder className="w-5 h-5 text-blue-500" />
                                            <span>{group.name}</span>
                                            <Badge variant="secondary">{group.tabs.length} tabs</Badge>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => openTabGroup(group)}
                                                title="Open all tabs"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => deleteTabGroup(group.id)}
                                                title="Delete group"
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {/* Show preview tabs when collapsed */}
                                    {!expandedGroups.has(group.id) && (
                                        <div className="space-y-2">
                                            {group.tabs.slice(0, 3).map((tab) => (
                                                <div key={tab.id} className="flex items-center space-x-2 text-sm">
                                                    <img
                                                        src={getFaviconUrl(tab.url) || ''}
                                                        alt=""
                                                        className="w-4 h-4 rounded"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement
                                                            target.style.display = 'none'
                                                        }}
                                                    />
                                                    <span className="truncate">{tab.title}</span>
                                                </div>
                                            ))}
                                            {group.tabs.length > 3 && (
                                                <p className="text-xs text-gray-500">
                                                    +{group.tabs.length - 3} more tabs
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Show all tabs when expanded */}
                                    {expandedGroups.has(group.id) && (
                                        <div className="space-y-2">
                                            {group.tabs.map((tab) => (
                                                <div key={tab.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                                    <div
                                                        className="flex items-center space-x-2 text-sm cursor-pointer flex-1"
                                                        onClick={() => openSingleTab(tab.url)}
                                                    >
                                                        <img
                                                            src={getFaviconUrl(tab.url) || ''}
                                                            alt=""
                                                            className="w-4 h-4 rounded"
                                                            onError={(e) => {
                                                                const target = e.target as HTMLImageElement
                                                                target.style.display = 'none'
                                                                const fallback = target.nextElementSibling as HTMLElement
                                                                if (fallback) fallback.style.display = 'flex'
                                                            }}
                                                        />
                                                        <div className="hidden w-4 h-4 bg-gray-200 rounded flex items-center justify-center">
                                                            <Globe className="w-3 h-3 text-gray-500" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="truncate font-medium">{tab.title}</div>
                                                            <div className="truncate text-xs text-gray-500">{tab.url}</div>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            deleteTabFromGroup(group.id, tab.id)
                                                        }}
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        title="Remove tab from group"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <p className="text-xs text-gray-500 mt-3 pt-3 border-t">
                                        Created {new Date(group.createdAt).toLocaleDateString()}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {tabGroups.length === 0 && (
                        <Card className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                            <CardContent className="pt-6">
                                <div className="text-center py-8 text-gray-500">
                                    <Folder className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p className="text-lg font-medium">No tab groups</p>
                                    <p className="text-sm">Select tabs and create your first group</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default TabbyManager