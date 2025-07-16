import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
    Zap,
    Plus,
    X,
    Facebook,
    Youtube,
    Twitter,
    Instagram,
    Globe,
    Shield,
    ShieldOff
} from 'lucide-react'
import { BlockedSite } from '@/types'

interface QuickShortcutsProps {
    blockedSites: BlockedSite[]
    onBlockSite: (url: string) => void
    onUnblockSite: (url: string) => void
    theme: 'light' | 'dark'
}

interface ShortcutSite {
    name: string
    url: string
    icon: React.ReactNode
    color: string
    category: 'social' | 'entertainment' | 'news' | 'productivity' | 'custom'
}

const QuickShortcuts: React.FC<QuickShortcutsProps> = ({
    blockedSites,
    onBlockSite,
    onUnblockSite,
    theme
}) => {
    const [customShortcuts, setCustomShortcuts] = useState<ShortcutSite[]>([])
    const [newShortcutName, setNewShortcutName] = useState('')
    const [newShortcutUrl, setNewShortcutUrl] = useState('')
    const [showAddForm, setShowAddForm] = useState(false)

    const defaultShortcuts: ShortcutSite[] = [
        {
            name: 'Facebook',
            url: 'facebook.com',
            icon: <Facebook className="w-4 h-4" />,
            color: 'bg-blue-600',
            category: 'social'
        },
        {
            name: 'YouTube',
            url: 'youtube.com',
            icon: <Youtube className="w-4 h-4" />,
            color: 'bg-red-600',
            category: 'entertainment'
        },
        {
            name: 'Twitter',
            url: 'twitter.com',
            icon: <Twitter className="w-4 h-4" />,
            color: 'bg-blue-400',
            category: 'social'
        },
        {
            name: 'Instagram',
            url: 'instagram.com',
            icon: <Instagram className="w-4 h-4" />,
            color: 'bg-pink-600',
            category: 'social'
        },
        {
            name: 'Reddit',
            url: 'reddit.com',
            icon: <Globe className="w-4 h-4" />,
            color: 'bg-orange-600',
            category: 'social'
        },
        {
            name: 'TikTok',
            url: 'tiktok.com',
            icon: <Globe className="w-4 h-4" />,
            color: 'bg-black',
            category: 'entertainment'
        },
        {
            name: 'Netflix',
            url: 'netflix.com',
            icon: <Globe className="w-4 h-4" />,
            color: 'bg-red-700',
            category: 'entertainment'
        },
        {
            name: 'LinkedIn',
            url: 'linkedin.com',
            icon: <Globe className="w-4 h-4" />,
            color: 'bg-blue-700',
            category: 'productivity'
        }
    ]

    useEffect(() => {
        loadCustomShortcuts()
    }, [])

    const loadCustomShortcuts = async () => {
        try {
            const result = await chrome.storage.local.get(['customShortcuts'])
            setCustomShortcuts(result.customShortcuts || [])
        } catch (error) {
            console.error('Error loading custom shortcuts:', error)
        }
    }

    const saveCustomShortcuts = async (shortcuts: ShortcutSite[]) => {
        try {
            await chrome.storage.local.set({ customShortcuts: shortcuts })
            setCustomShortcuts(shortcuts)
        } catch (error) {
            console.error('Error saving custom shortcuts:', error)
        }
    }

    const isBlocked = (url: string): boolean => {
        return blockedSites.some(site => site.url === url)
    }

    const toggleSiteBlock = (site: ShortcutSite) => {
        if (isBlocked(site.url)) {
            onUnblockSite(site.url)
        } else {
            onBlockSite(site.url)
        }
    }

    const addCustomShortcut = () => {
        if (!newShortcutName.trim() || !newShortcutUrl.trim()) {
            return
        }

        const cleanUrl = newShortcutUrl.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].toLowerCase()

        const newShortcut: ShortcutSite = {
            name: newShortcutName.trim(),
            url: cleanUrl,
            icon: <Globe className="w-4 h-4" />,
            color: 'bg-gray-600',
            category: 'custom'
        }

        const updatedShortcuts = [...customShortcuts, newShortcut]
        saveCustomShortcuts(updatedShortcuts)

        setNewShortcutName('')
        setNewShortcutUrl('')
        setShowAddForm(false)
    }

    const removeCustomShortcut = (index: number) => {
        const updatedShortcuts = customShortcuts.filter((_, i) => i !== index)
        saveCustomShortcuts(updatedShortcuts)
    }

    const allShortcuts = [...defaultShortcuts, ...customShortcuts]
    const groupedShortcuts = allShortcuts.reduce((acc, shortcut) => {
        if (!acc[shortcut.category]) {
            acc[shortcut.category] = []
        }
        acc[shortcut.category].push(shortcut)
        return acc
    }, {} as Record<string, ShortcutSite[]>)

    const getCategoryTitle = (category: string) => {
        switch (category) {
            case 'social': return '👥 Social Media'
            case 'entertainment': return '🎬 Entertainment'
            case 'news': return '📰 News'
            case 'productivity': return '💼 Productivity'
            case 'custom': return '⚡ Custom'
            default: return category
        }
    }

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'social': return 'text-blue-600'
            case 'entertainment': return 'text-red-600'
            case 'news': return 'text-green-600'
            case 'productivity': return 'text-purple-600'
            case 'custom': return 'text-gray-600'
            default: return 'text-gray-600'
        }
    }

    return (
        <Card className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white/80 backdrop-blur-sm'} border-white/20 mb-6`}>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Zap className="w-5 h-5 text-yellow-500" />
                        <span>Quick Block/Unblock</span>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAddForm(!showAddForm)}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Custom
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {/* Add Custom Shortcut Form */}
                {showAddForm && (
                    <div className="mb-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-700">
                        <h4 className="text-sm font-semibold mb-3">Add Custom Shortcut</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Input
                                placeholder="Site name (e.g., GitHub)"
                                value={newShortcutName}
                                onChange={(e) => setNewShortcutName(e.target.value)}
                            />
                            <Input
                                placeholder="Site URL (e.g., github.com)"
                                value={newShortcutUrl}
                                onChange={(e) => setNewShortcutUrl(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center space-x-2 mt-3">
                            <Button
                                size="sm"
                                onClick={addCustomShortcut}
                                disabled={!newShortcutName.trim() || !newShortcutUrl.trim()}
                            >
                                Add Shortcut
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    setShowAddForm(false)
                                    setNewShortcutName('')
                                    setNewShortcutUrl('')
                                }}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}

                {/* Shortcuts by Category */}
                <div className="space-y-6">
                    {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
                        <div key={category}>
                            <h3 className={`text-sm font-semibold mb-3 ${getCategoryColor(category)}`}>
                                {getCategoryTitle(category)}
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {shortcuts.map((site, index) => {
                                    const blocked = isBlocked(site.url)
                                    return (
                                        <div key={`${category}-${index}`} className="relative">
                                            <Button
                                                variant={blocked ? "destructive" : "outline"}
                                                className={`w-full h-auto p-3 flex flex-col items-center space-y-2 transition-all duration-200 ${blocked
                                                        ? 'bg-red-500 hover:bg-red-600 text-white'
                                                        : 'hover:shadow-md'
                                                    }`}
                                                onClick={() => toggleSiteBlock(site)}
                                            >
                                                <div className={`p-2 rounded-full ${blocked ? 'bg-white/20' : site.color} text-white`}>
                                                    {blocked ? <ShieldOff className="w-4 h-4" /> : site.icon}
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-xs font-medium">{site.name}</div>
                                                    <div className="text-xs opacity-75">
                                                        {blocked ? 'Blocked' : 'Click to block'}
                                                    </div>
                                                </div>
                                            </Button>

                                            {/* Remove button for custom shortcuts */}
                                            {site.category === 'custom' && (
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        removeCustomShortcut(customShortcuts.findIndex(s => s.url === site.url))
                                                    }}
                                                >
                                                    <X className="w-3 h-3" />
                                                </Button>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Stats */}
                <div className="mt-6 pt-4 border-t">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>
                            {blockedSites.filter(site =>
                                allShortcuts.some(shortcut => shortcut.url === site.url)
                            ).length} of {allShortcuts.length} shortcuts blocked
                        </span>
                        <Badge variant="secondary">
                            {allShortcuts.length} total shortcuts
                        </Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default QuickShortcuts