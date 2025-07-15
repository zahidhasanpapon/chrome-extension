# Weather and Prayer Time Setup Guide

## Overview

Your Productivity Hub Chrome extension now includes:

- ⏰ **Real-time clock** with current time and date
- 🌤️ **Weather information** with temperature display
- ☀️ **UV Index** with safety level indicators
- 🕌 **Islamic prayer times** (Namaz) with current prayer highlighting

## Features

### Time Display

- Shows current time in 12-hour format with seconds
- Displays full date with weekday, month, and year
- Updates every second automatically

### Weather Information

- Current temperature in Celsius
- Location-based weather data
- UV Index with safety levels (Low, Moderate, High, Very High, Extreme)
- Automatic geolocation detection

### Prayer Times (Namaz)

- All 5 daily prayer times plus Sunrise
- Times displayed in 12-hour format
- Current prayer time is highlighted
- Automatic location-based calculation
- Uses Islamic Society of North America (ISNA) calculation method

## Setup Instructions

### 1. Weather API Setup (Optional)

The extension works with mock data by default. For real weather data:

1. Go to [OpenWeatherMap](https://openweathermap.org/api) and create a free account
2. Get your API key from the dashboard
3. Open `newtab.js` and find this line:
   ```javascript
   const API_KEY = "YOUR_OPENWEATHER_API_KEY";
   ```
4. Replace `'YOUR_OPENWEATHER_API_KEY'` with your actual API key:
   ```javascript
   const API_KEY = "your-actual-api-key-here";
   ```

### 2. Location Permissions

The extension will request location access to:

- Show weather for your current location
- Calculate accurate prayer times
- Display location-specific information

If you deny location access, the extension will:

- Use Dhaka, Bangladesh as default location
- Show mock weather data
- Display prayer times for the default location

### 3. Loading the Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (top right toggle)
3. Click "Load unpacked" and select your extension folder
4. The extension will automatically load and display the new features

## How It Works

### Prayer Time Calculation

- Uses the Aladhan API (Islamic prayer times service)
- Calculates times based on your GPS location
- Follows ISNA calculation method
- Updates daily automatically
- Highlights current prayer time (within 30 minutes)

### Weather Data

- Uses OpenWeatherMap API for real-time data
- Shows temperature in Celsius
- Displays UV Index with safety recommendations
- Updates based on your current location

### Mock Data

Without API keys, the extension shows:

- **Temperature**: 28°C
- **Location**: Dhaka, Bangladesh
- **UV Index**: 7 (High)
- **Prayer Times**: Sample times for Dhaka

## Customization Options

### Changing Default Location

If you want to change the default location, edit these lines in `newtab.js`:

```javascript
resolve({
  latitude: 23.8103, // Your latitude
  longitude: 90.4125, // Your longitude
});
```

### Prayer Time Calculation Method

To change the calculation method, modify the API URL in `loadPrayerTimes()`:

```javascript
const prayerUrl = `https://api.aladhan.com/v1/timings/${day}-${month}-${year}?latitude=${location.latitude}&longitude=${location.longitude}&method=2`;
```

Available methods:

- `method=1`: University of Islamic Sciences, Karachi
- `method=2`: Islamic Society of North America (ISNA)
- `method=3`: Muslim World League
- `method=4`: Umm Al-Qura University, Makkah
- `method=5`: Egyptian General Authority of Survey

### Styling

The weather and prayer time section styling can be customized in the `<style>` section of `newtab.html`:

- `.info-section`: Main container
- `.info-card`: Individual info cards
- `.prayer-times`: Prayer times grid
- `.prayer-time.current`: Current prayer highlighting

## Troubleshooting

### Location Not Working

- Ensure you've allowed location access in Chrome
- Check if your browser supports geolocation
- Verify you're using HTTPS (required for geolocation)

### Weather Not Loading

- Check your API key is correctly entered
- Ensure you have internet connectivity
- Verify the API key has not exceeded rate limits

### Prayer Times Showing "Loading..."

- Check internet connection
- Verify the Aladhan API is accessible
- Location services must be working

## Privacy & Security

- Location data is only used for weather and prayer time calculations
- No personal information is stored or transmitted
- All API calls are made directly from your browser
- Extension works offline with cached data

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify all permissions are granted
3. Ensure internet connectivity for API calls
4. Try refreshing the new tab page

The extension gracefully handles API failures and will show mock data when services are unavailable.
