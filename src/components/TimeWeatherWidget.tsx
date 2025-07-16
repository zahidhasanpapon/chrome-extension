import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Clock,
    MapPin,
    Thermometer,
    Cloud,
    Sun,
    CloudRain,
    CloudSnow,
    RefreshCw,
    Sunrise,
    Sunset
} from 'lucide-react'

interface WeatherData {
    location: string
    temperature: number
    condition: string
    description: string
    icon: string
    humidity: number
    windSpeed: number
    sunrise: string
    sunset: string
}

interface PrayerTime {
    name: string
    time: string
    isNext: boolean
}

interface TimeWeatherWidgetProps {
    theme: 'light' | 'dark'
}

const TimeWeatherWidget: React.FC<TimeWeatherWidgetProps> = ({ theme }) => {
    const [currentTime, setCurrentTime] = useState(new Date())
    const [weather, setWeather] = useState<WeatherData | null>(null)
    const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([])
    const [greeting, setGreeting] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null)

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date())
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    // Get user location and fetch weather data
    useEffect(() => {
        getUserLocation()
    }, [])

    // Update greeting based on time
    useEffect(() => {
        updateGreeting()
    }, [currentTime])

    // Fetch weather when location changes
    useEffect(() => {
        if (location) {
            fetchWeatherData()
            fetchPrayerTimes()
        }
    }, [location])

    const getUserLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    })
                },
                (error) => {
                    console.error('Error getting location:', error)
                    // Fallback to a default location (New York)
                    setLocation({ lat: 40.7128, lon: -74.0060 })
                }
            )
        } else {
            // Fallback location
            setLocation({ lat: 40.7128, lon: -74.0060 })
        }
    }

    const fetchWeatherData = async () => {
        if (!location) return

        try {
            // Using OpenWeatherMap API (you'll need to get a free API key)
            const API_KEY = 'demo_key' // Replace with actual API key
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${API_KEY}&units=metric`
            )

            if (response.ok) {
                const data = await response.json()
                setWeather({
                    location: data.name,
                    temperature: Math.round(data.main.temp),
                    condition: data.weather[0].main,
                    description: data.weather[0].description,
                    icon: data.weather[0].icon,
                    humidity: data.main.humidity,
                    windSpeed: data.wind.speed,
                    sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                    }),
                    sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                    })
                })
            } else {
                // Fallback weather data
                setWeather({
                    location: 'Unknown',
                    temperature: 22,
                    condition: 'Clear',
                    description: 'clear sky',
                    icon: '01d',
                    humidity: 65,
                    windSpeed: 3.5,
                    sunrise: '6:30 AM',
                    sunset: '7:45 PM'
                })
            }
        } catch (error) {
            console.error('Error fetching weather:', error)
            // Fallback weather data
            setWeather({
                location: 'Unknown',
                temperature: 22,
                condition: 'Clear',
                description: 'clear sky',
                icon: '01d',
                humidity: 65,
                windSpeed: 3.5,
                sunrise: '6:30 AM',
                sunset: '7:45 PM'
            })
        } finally {
            setIsLoading(false)
        }
    }

    const fetchPrayerTimes = async () => {
        if (!location) return

        try {
            // Using Aladhan API for prayer times
            const response = await fetch(
                `https://api.aladhan.com/v1/timings?latitude=${location.lat}&longitude=${location.lon}&method=2`
            )

            if (response.ok) {
                const data = await response.json()
                const timings = data.data.timings

                const prayers = [
                    { name: 'Fajr', time: timings.Fajr },
                    { name: 'Dhuhr', time: timings.Dhuhr },
                    { name: 'Asr', time: timings.Asr },
                    { name: 'Maghrib', time: timings.Maghrib },
                    { name: 'Isha', time: timings.Isha }
                ]

                // Determine next prayer
                const now = new Date()
                const currentTime = now.getHours() * 60 + now.getMinutes()

                const prayersWithNext = prayers.map(prayer => {
                    const [hours, minutes] = prayer.time.split(':').map(Number)
                    const prayerTime = hours * 60 + minutes
                    return {
                        ...prayer,
                        isNext: prayerTime > currentTime
                    }
                })

                setPrayerTimes(prayersWithNext)
            }
        } catch (error) {
            console.error('Error fetching prayer times:', error)
        }
    }

    const updateGreeting = () => {
        const hour = currentTime.getHours()
        let newGreeting = ''

        if (hour < 12) {
            newGreeting = 'Good Morning'
        } else if (hour < 17) {
            newGreeting = 'Good Afternoon'
        } else if (hour < 21) {
            newGreeting = 'Good Evening'
        } else {
            newGreeting = 'Good Night'
        }

        setGreeting(newGreeting)
    }

    const getWeatherIcon = (condition: string) => {
        switch (condition.toLowerCase()) {
            case 'clear':
                return <Sun className="w-8 h-8 text-yellow-500" />
            case 'clouds':
                return <Cloud className="w-8 h-8 text-gray-500" />
            case 'rain':
                return <CloudRain className="w-8 h-8 text-blue-500" />
            case 'snow':
                return <CloudSnow className="w-8 h-8 text-blue-300" />
            default:
                return <Sun className="w-8 h-8 text-yellow-500" />
        }
    }

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        })
    }

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    if (isLoading) {
        return (
            <Card className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white/80 backdrop-blur-sm'} border-white/20`}>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-center py-4">
                        <RefreshCw className="w-6 h-6 animate-spin" />
                        <span className="ml-2">Loading...</span>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {/* Time & Greeting */}
            <Card className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white/80 backdrop-blur-sm'} border-white/20`}>
                <CardContent className="pt-6">
                    <div className="text-center">
                        <div className="flex items-center justify-center mb-2">
                            <Clock className="w-6 h-6 text-blue-500 mr-2" />
                            <h3 className="text-lg font-semibold">Time</h3>
                        </div>
                        <div className="text-3xl font-bold text-blue-600 mb-2">
                            {formatTime(currentTime)}
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                            {formatDate(currentTime)}
                        </div>
                        <Badge variant="secondary" className="text-sm">
                            {greeting}! 👋
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Weather */}
            <Card className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white/80 backdrop-blur-sm'} border-white/20`}>
                <CardContent className="pt-6">
                    <div className="text-center">
                        <div className="flex items-center justify-center mb-2">
                            <MapPin className="w-5 h-5 text-green-500 mr-2" />
                            <h3 className="text-lg font-semibold">Weather</h3>
                        </div>
                        {weather && (
                            <>
                                <div className="flex items-center justify-center mb-2">
                                    {getWeatherIcon(weather.condition)}
                                    <span className="text-3xl font-bold ml-2">{weather.temperature}°C</span>
                                </div>
                                <div className="text-sm text-gray-600 mb-2 capitalize">
                                    {weather.description}
                                </div>
                                <div className="text-xs text-gray-500">
                                    📍 {weather.location}
                                </div>
                                <div className="flex justify-between text-xs text-gray-500 mt-2">
                                    <span>💧 {weather.humidity}%</span>
                                    <span>💨 {weather.windSpeed} m/s</span>
                                </div>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Prayer Times */}
            <Card className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white/80 backdrop-blur-sm'} border-white/20`}>
                <CardContent className="pt-6">
                    <div className="text-center">
                        <div className="flex items-center justify-center mb-3">
                            <Sunrise className="w-5 h-5 text-orange-500 mr-2" />
                            <h3 className="text-lg font-semibold">Prayer Times</h3>
                        </div>
                        {prayerTimes.length > 0 ? (
                            <div className="space-y-2">
                                {prayerTimes.slice(0, 3).map((prayer) => (
                                    <div
                                        key={prayer.name}
                                        className={`flex justify-between items-center text-sm ${prayer.isNext ? 'text-orange-600 font-semibold' : 'text-gray-600'
                                            }`}
                                    >
                                        <span>{prayer.name}</span>
                                        <span>{prayer.time}</span>
                                    </div>
                                ))}
                                <div className="text-xs text-gray-500 mt-2">
                                    Next prayer highlighted
                                </div>
                            </div>
                        ) : (
                            <div className="text-sm text-gray-500">
                                Prayer times unavailable
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default TimeWeatherWidget