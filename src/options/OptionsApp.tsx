import React from 'react'
import { Settings, Target } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const OptionsApp: React.FC = () => {
    const openProductivityHub = async () => {
        try {
            await chrome.tabs.create({ url: 'chrome://newtab/' })
        } catch (error) {
            console.error('Error opening productivity hub:', error)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                            <Settings className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Productivity Hub Settings</h1>
                            <p className="text-gray-600">Manage your productivity preferences</p>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Welcome to Productivity Hub</CardTitle>
                            <CardDescription>
                                Your new tab page has been transformed into a productivity hub.
                                Manage your todos and block distracting websites to stay focused.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button onClick={openProductivityHub} className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                                <Target className="w-4 h-4 mr-2" />
                                Open Productivity Hub
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Features</CardTitle>
                            <CardDescription>
                                What you can do with Productivity Hub
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-gray-900">📝 Todo Management</h3>
                                    <p className="text-sm text-gray-600">
                                        Create, manage, and track your daily tasks with priority levels and completion statistics.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-gray-900">🚫 Website Blocking</h3>
                                    <p className="text-sm text-gray-600">
                                        Block distracting websites to maintain focus and boost productivity.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-gray-900">📊 Progress Tracking</h3>
                                    <p className="text-sm text-gray-600">
                                        Monitor your productivity with detailed statistics and completion rates.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-gray-900">🎯 Focus Mode</h3>
                                    <p className="text-sm text-gray-600">
                                        Beautiful block pages with motivational quotes to keep you on track.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Getting Started</CardTitle>
                            <CardDescription>
                                Quick tips to maximize your productivity
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-start space-x-3">
                                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">1</div>
                                    <div>
                                        <p className="font-medium">Add your first todo</p>
                                        <p className="text-sm text-gray-600">Start by adding tasks you want to accomplish today</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">2</div>
                                    <div>
                                        <p className="font-medium">Block distracting sites</p>
                                        <p className="text-sm text-gray-600">Add websites that distract you to the blocked sites list</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">3</div>
                                    <div>
                                        <p className="font-medium">Track your progress</p>
                                        <p className="text-sm text-gray-600">Use the statistics tab to monitor your productivity trends</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default OptionsApp