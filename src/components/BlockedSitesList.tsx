import React, { useState } from 'react'
import { Plus, Shield, Globe, Trash2, AlertTriangle, ExternalLink, Download, Upload, FileText, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { BlockedSite } from '@/types'
import { cleanUrl, isValidUrl } from '@/lib/utils'

interface BlockedSitesListProps {
    blockedSites: BlockedSite[]
    onAddSite: (url: string) => void
    onRemoveSite: (url: string) => void
    theme: 'light' | 'dark'
}

const BlockedSitesList: React.FC<BlockedSitesListProps> = ({
    blockedSites,
    onAddSite,
    onRemoveSite,
    theme
}) => {
    const [newSiteUrl, setNewSiteUrl] = useState('')
    const [error, setError] = useState('')
    const [selectedSites, setSelectedSites] = useState<Set<string>>(new Set())
    const [showBulkActions, setShowBulkActions] = useState(false)

    const handleAddSite = () => {
        if (!newSiteUrl.trim()) {
            setError('Please enter a website URL')
            return
        }

        const cleanedUrl = cleanUrl(newSiteUrl)

        if (!isValidUrl(cleanedUrl)) {
            setError('Please enter a valid website URL (e.g., facebook.com)')
            return
        }

        if (blockedSites.some(site => site.url === cleanedUrl)) {
            setError('This site is already blocked')
            return
        }

        onAddSite(cleanedUrl)
        setNewSiteUrl('')
        setError('')
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAddSite()
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewSiteUrl(e.target.value)
        if (error) setError('')
    }

    const getFaviconUrl = (url: string) => {
        return `https://www.google.com/s2/favicons?domain=${url}&sz=32`
    }

    const toggleSiteSelection = (url: string) => {
        const newSelected = new Set(selectedSites)
        if (newSelected.has(url)) {
            newSelected.delete(url)
        } else {
            newSelected.add(url)
        }
        setSelectedSites(newSelected)
        setShowBulkActions(newSelected.size > 0)
    }

    const selectAllSites = () => {
        const allUrls = new Set(blockedSites.map(site => site.url))
        setSelectedSites(allUrls)
        setShowBulkActions(true)
    }

    const clearSelection = () => {
        setSelectedSites(new Set())
        setShowBulkActions(false)
    }

    const deleteSelectedSites = () => {
        if (selectedSites.size === 0) return

        if (confirm(`Are you sure you want to unblock ${selectedSites.size} selected sites?`)) {
            selectedSites.forEach(url => onRemoveSite(url))
            clearSelection()
        }
    }

    const exportBlockedSites = () => {
        try {
            if (blockedSites.length === 0) {
                setError('No blocked sites to export')
                return
            }

            const exportData = {
                blockedSites: blockedSites.map(site => ({
                    url: site.url,
                    addedAt: site.addedAt,
                    category: 'general' // Could be enhanced with categories
                })),
                exportDate: new Date().toISOString(),
                version: '2.0',
                totalSites: blockedSites.length,
                metadata: {
                    exportedBy: 'Productivity Hub',
                    format: 'enhanced'
                }
            }

            const dataStr = JSON.stringify(exportData, null, 2)
            const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
            const exportFileDefaultName = `blocked-sites-${new Date().toISOString().split('T')[0]}.json`

            const linkElement = document.createElement('a')
            linkElement.setAttribute('href', dataUri)
            linkElement.setAttribute('download', exportFileDefaultName)
            linkElement.click()

            // Show success message
            setError('')
        } catch (error) {
            console.error('Export error:', error)
            setError('Failed to export blocked sites')
        }
    }

    const importBlockedSites = () => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.json'
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0]
            if (!file) return

            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('File is too large (max 5MB)')
                return
            }

            const reader = new FileReader()
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target?.result as string)
                    let importedSites: string[] = []

                    // Handle different import formats
                    if (Array.isArray(data)) {
                        // Legacy format: simple array
                        importedSites = data.filter(item => typeof item === 'string')
                    } else if (data.blockedSites && Array.isArray(data.blockedSites)) {
                        // Enhanced format: object with metadata
                        importedSites = data.blockedSites.map((site: any) =>
                            typeof site === 'string' ? site : site.url
                        ).filter(Boolean)
                    } else {
                        setError('Invalid file format. Expected array of URLs or proper export format.')
                        return
                    }

                    // Validate and clean imported sites
                    const validSites = importedSites
                        .map(site => cleanUrl(site))
                        .filter(site => isValidUrl(site))
                        .filter(site => !isLocalOrPrivateUrl(site))

                    if (validSites.length === 0) {
                        setError('No valid sites found in the imported file')
                        return
                    }

                    // Check for duplicates
                    const existingUrls = new Set(blockedSites.map(site => site.url))
                    const newSites = validSites.filter(site => !existingUrls.has(site))

                    if (newSites.length === 0) {
                        setError('All sites from the file are already blocked')
                        return
                    }

                    // Add new sites
                    newSites.forEach(site => onAddSite(site))

                    const skippedCount = validSites.length - newSites.length
                    let message = `Successfully imported ${newSites.length} new blocked sites!`
                    if (skippedCount > 0) {
                        message += ` (${skippedCount} duplicates skipped)`
                    }

                    setError('') // Clear any previous errors
                    // Could show success message here
                } catch (error) {
                    console.error('Import error:', error)
                    setError('Error reading file. Please make sure it\'s a valid JSON file.')
                }
            }

            reader.onerror = () => {
                setError('Error reading file')
            }

            reader.readAsText(file)
        }
        input.click()
    }

    const isLocalOrPrivateUrl = (url: string): boolean => {
        const localPatterns = [
            'localhost',
            '127.0.0.1',
            '0.0.0.0',
            '::1',
            /^192\.168\./,
            /^10\./,
            /^172\.(1[6-9]|2[0-9]|3[0-1])\./
        ]

        return localPatterns.some(pattern => {
            if (typeof pattern === 'string') {
                return url.includes(pattern)
            } else {
                return pattern.test(url)
            }
        })
    }

    return (
        <div className="space-y-6">
            {/* Add Site Form */}
            <Card className="glass-card border-white/20">
                <CardHeader>
                    <CardTitle className="flex items-center text-gray-900">
                        <Shield className="w-5 h-5 mr-2 text-red-500" />
                        Block New Website
                    </CardTitle>
                    <CardDescription>
                        Add websites you want to block to help you stay focused
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex space-x-3">
                            <Input
                                value={newSiteUrl}
                                onChange={handleInputChange}
                                onKeyPress={handleKeyPress}
                                placeholder="Enter website URL (e.g., facebook.com, youtube.com)"
                                className="flex-1"
                            />
                            <Button
                                onClick={handleAddSite}
                                disabled={!newSiteUrl.trim()}
                                variant="destructive"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Block Site
                            </Button>
                        </div>

                        {error && (
                            <div className="flex items-center space-x-2 text-red-600 text-sm">
                                <AlertTriangle className="w-4 h-4" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="text-xs text-gray-500 space-y-1">
                            <p className="font-medium">Tips:</p>
                            <ul className="space-y-1 ml-4 list-disc">
                                <li>Enter just the domain name (e.g., "facebook.com" not "https://www.facebook.com")</li>
                                <li>Subdomains will also be blocked (e.g., blocking "youtube.com" blocks "m.youtube.com")</li>
                                <li>Use the most specific domain to avoid blocking unintended sites</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Bulk Actions & Import/Export */}
            {blockedSites.length > 0 && (
                <Card className="glass-card border-white/20">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                                <Button variant="outline" size="sm" onClick={selectAllSites}>
                                    Select All
                                </Button>
                                <Button variant="outline" size="sm" onClick={clearSelection}>
                                    Clear
                                </Button>
                                {selectedSites.size > 0 && (
                                    <Badge variant="secondary">
                                        {selectedSites.size} selected
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={exportBlockedSites}
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Export
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={importBlockedSites}
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    Import
                                </Button>
                                {selectedSites.size > 0 && (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={deleteSelectedSites}
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Unblock Selected
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Blocked Sites List */}
            <div className="space-y-3">
                {blockedSites.length === 0 ? (
                    <Card className="glass-card border-white/20">
                        <CardContent className="pt-6">
                            <div className="text-center py-8 text-gray-500">
                                <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p className="text-lg font-medium">No blocked sites</p>
                                <p className="text-sm">Add websites you want to block to stay focused</p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    blockedSites.map((site) => (
                        <Card
                            key={site.url}
                            className="glass-card border-white/20 transition-all duration-200 hover:shadow-lg"
                        >
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="flex-shrink-0">
                                            <img
                                                src={getFaviconUrl(site.url)}
                                                alt={`${site.url} favicon`}
                                                className="w-8 h-8 rounded"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement
                                                    target.style.display = 'none'
                                                    const fallback = target.nextElementSibling as HTMLElement
                                                    if (fallback) fallback.style.display = 'flex'
                                                }}
                                            />
                                            <div
                                                className="hidden w-8 h-8 rounded bg-red-100 items-center justify-center"
                                                style={{ display: 'none' }}
                                            >
                                                <Globe className="w-4 h-4 text-red-500" />
                                            </div>
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center space-x-2">
                                                <h3 className="text-sm font-medium text-gray-900 truncate">
                                                    {site.url}
                                                </h3>
                                                <Badge variant="destructive" className="text-xs">
                                                    Blocked
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                Added {new Date(site.addedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => window.open(`https://${site.url}`, '_blank')}
                                            className="text-gray-500 hover:text-gray-700"
                                            title="Visit site (will be blocked)"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onRemoveSite(site.url)}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            title="Unblock this site"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Stats */}
            {blockedSites.length > 0 && (
                <Card className="glass-card border-white/20">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2">
                                <Shield className="w-4 h-4 text-red-500" />
                                <span className="text-gray-600">
                                    {blockedSites.length} site{blockedSites.length !== 1 ? 's' : ''} blocked
                                </span>
                            </div>
                            <span className="text-xs text-gray-500">
                                Stay focused and productive! 🎯
                            </span>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

export default BlockedSitesList