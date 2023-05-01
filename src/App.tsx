import { useState } from 'react'
import './App.css'
import axios from 'axios'
// import the logo from assets folder
import logo from './assets/logo.png'
import { useEffect } from 'react'
import hourlyForecast from './Interfaces/hourlyforcast'

const apiKey = import.meta.env.VITE_API_KEY;

interface dailyForecast {
  date: string,
  maxTemp: number,
  minTemp: number,
  icon: string,
  condition: string
}
interface currentWeather {
  temp: number,
  icon: string,
  condition: string,
  wind: number,
  sunrise: string,
  sunset: string,
  chanceOfRain: number,
  humidity: number,
  feelsLike: number,
  pressure: number,
  visibility: number
}


// use state for the current weather data, hourly forecast data, and daily forecast data
const hourlyForecastData: hourlyForecast[] = []
const dailyForecastData: dailyForecast[] = []
const currentWeatherData: currentWeather = {
  temp: 0,
  icon: '',
  condition: '',
  wind: 0,
  sunrise: '',
  sunset: '',
  chanceOfRain: 0,
  humidity: 0,
  feelsLike: 0,
  pressure: 0,
  visibility: 0
}


function App() {

  const [currentWeather, setCurrentWeather] = useState(currentWeatherData)
  const [hourlyForecast, setHourlyForecast] = useState(hourlyForecastData)
  const [dailyForecast, setDailyForecast] = useState(dailyForecastData)


  const [city, setCity] = useState('')
  const [unit, setUnit] = useState('imperial')
  const toggleUnit = () => {
    if (unit === 'imperial') {
      setUnit('metric')
    } else {
      setUnit('imperial')
    }
  }
  const getWeatherFromApi = async (signal: AbortSignal) => {
    try {
      const response = await axios.get(
        `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=London`, { signal: signal }
      )
      // push all hourly data to the hourlyForecastData array if it satisifies the predicate of hour is after current hour
      response.data.forecast.forecastday[0].hour.forEach((hour: any) => {
        if (hour.time_epoch > response.data.location.localtime_epoch) {
          hourlyForecastData.push({
            time: hour.time,
            temp_f: hour.temp_f,
            condition: {
              text: hour.condition.text,
              icon: hour.condition.icon
            }
          })
        }
      })

      // push all daily data to the dailyForecastData array
      response.data.forecast.forecastday.forEach((day: any) => {
        dailyForecastData.push({
          date: day.date,
          maxTemp: day.day.maxtemp_f,
          minTemp: day.day.mintemp_f,
          icon: day.day.condition.icon,
          condition: day.day.condition.text
        })
      })
    }
    catch (error: any) {
        if (axios.isCancel(error)) {
        // Handle abort error
        console.log('Request canceled:', error.message);
      } else if (error.response) {
        // Handle server error
        console.log('Server error:', error.response.data);
      } else if (error.request) {
        // Handle network error
        console.log('Network error:', error.request);
      } else {
        // Handle other errors
        console.log('Error:', error.message);
      }
    }
  }
  // use effect to handle the promise from the api call with cleanup and using the built in abort controller to cancel the request if the user types in a new city before the first request is finished or if the user leaves the page before the request is finished
  useEffect(() => {
    const abortController = new AbortController()
    const signal = abortController.signal
    getWeatherFromApi(signal)
    return function cleanup() {
      abortController.abort()
    }
  }, [city, unit])




  return (
    <>
      {/* header section: includes logo, input bar for searching cities, and celcus/farenheight toggle button */}
      <header className="grid h-24 grid-cols-12 p-12 bg-slate-700">
        <div className="col-span-2 col-start-1">
          <img src={logo} alt="logo" />
        </div>
        <div className="flex col-span-7 col-start-3">
          <input type="text" placeholder="Search for a city" required />
          <button type="submit">Search</button>
        </div>
        <div className="toggle">
          <button onClick={toggleUnit}>°C/°F</button>
        </div>
      </header>
      {/* Main section, includes a card displaying the current weatehr nd then an hourly forcast 
          beneath that will be a section to hold weather information beyond the temperature i.e wind, sunrise/sunset times, chance of rain, humidity, the "feels like" temp
          pressure and visibility. beneath that will be a table containing the 5 day forecasts. each of these sections will be handled by a separate component with part of the api call response
          passed to them to populate the data. */}
      <main className="grid grid-cols-12">
        <section className="h-64 col-span-12 col-start-1"></section>
        <section className="h-64 col-span-12 col-start-1"></section>
        <section className="h-64 col-span-12 col-start-1"></section>
    </main>
    </>
  )
}

export default App
