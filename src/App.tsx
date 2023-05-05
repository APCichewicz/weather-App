import { useState } from 'react'
import './App.css'
import axios from 'axios'
import React from 'react'
// import the logo from assets folder
import logo from './assets/logo.png'
import { useEffect } from 'react'


const apiKey = import.meta.env.VITE_API_KEY;
interface current {
  last_updated_epoch: number,
  last_updated: string,
  temp_c: number,
  temp_f: number,
  feelslike_c: number,
  feelslike_f: number,
  gust_kph: number,
  gust_mph: number,
  humidity: number,
  is_day: number,
  precip_in: number,
  precip_mm: number,
  pressure_in: number,
  pressure_mb: number,
  uv: number,
  vis_km: number,
  vis_miles: number,
  wind_degree: number,
  wind_dir: string,
  wind_kph: number,
  wind_mph: number,
  cloud: number,
  condition_text: string,
  condition_icon: string,
  condition_code: number
}
interface hourForecast {
  time: number,
  temp_f: number,
  temp_c: number,
  condition: {
    text: string,
    icon: string
  },
}
interface dayForecast {
  date: string,
  temp_f: number,
  temp_c: number,
  condition: {
    text: string,
    icon: string
  },
}



function App() {
  // set up state for the current weather, hourly forecast, and daily forecast
  const [currentWeather, setCurrentWeather] = useState<current>()
  const [hourlyForecast, setHourlyForecast] = useState<hourForecast[]>()
  const [dailyForecast, setDailyForecast] = useState<dayForecast[]>()
  // set up state for the city and unit of measurement
  const [city, setCity] = useState('')
  const [unit, setUnit] = useState('imperial')
  // a reference to the input field
  const inputRef = React.createRef<HTMLInputElement>()
  // function to toggle the unit of measurement
  const toggleUnit = () => {
    if (unit === 'imperial') {
      setUnit('metric')
    } else {
      setUnit('imperial')
    }
  }
const handleSubmit = () => {
  setCity(inputRef.current?.value || '')
}
  const getWeatherFromApi = async (signal: AbortSignal) => {
    try {
      let response;
      if (city === '') {
        // if the city is not input or an empty string, use the geolocation coordinates to get the weather
        response = await axios.get(
          `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=auto:ip&days=5`, { signal: signal }
        )
      } else {
      response = await axios.get(
        `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=5`, { signal: signal }
      )
      }
      // destructure the response object to get the data we need
      const { current, forecast } = response.data
      // set the state for the current weather
      setCurrentWeather({
        last_updated_epoch: current.last_updated_epoch,
        last_updated: current.last_updated,
        temp_c: current.temp_c,
        temp_f: current.temp_f,
        feelslike_c: current.feelslike_c,
        feelslike_f: current.feelslike_f,
        gust_kph: current.gust_kph,
        gust_mph: current.gust_mph,
        humidity: current.humidity,
        is_day: current.is_day,
        precip_in: current.precip_in,
        precip_mm: current.precip_mm,
        pressure_in: current.pressure_in,
        pressure_mb: current.pressure_mb,
        uv: current.uv,
        vis_km: current.vis_km,
        vis_miles: current.vis_miles,
        wind_degree: current.wind_degree,
        wind_dir: current.wind_dir,
        wind_kph: current.wind_kph,
        wind_mph: current.wind_mph,
        cloud: current.cloud,
        condition_text: current.condition.text,
        condition_icon: current.condition.icon,
        condition_code: current.condition.code
      })
      // set the state for the hourly forecast
      setHourlyForecast(forecast.forecastday[0].hour.map((hour: any) => {
        return {
          time: new Date(hour.time).getHours(),
          temp_f: hour.temp_f,
          temp_c: hour.temp_c,
          condition: {
            text: hour.condition.text,
            icon: hour.condition.icon
          }
        }
      }))
      // set the state for the daily forecast
      setDailyForecast(forecast.forecastday.map((day: any) => {
        return {
          date: new Date(day.date).toString().split(" ").slice(0, 3).join(" "), 
          temp_f: day.day.maxtemp_f,
          temp_c: day.day.maxtemp_c,
          condition: {
            text: day.day.condition.text,
            icon: day.day.condition.icon
          }
        }
      }))


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
  }, [city])




  return (
    <>
      {/* header section: includes logo, input bar for searching cities, and celcus/farenheight toggle button */}
      <header className="grid h-auto grid-cols-12 px-12 py-4 bg-slate-700">
        <div className="col-span-2 col-start-1">
          <img src={logo} alt="logo" />
        </div>
        <div className="grid items-center justify-center grid-cols-12 col-span-7 col-start-4">
          <input ref={inputRef} type="text" placeholder="Search for a city" required className='h-12 col-span-8 px-4 border-0 outline-none rounded-s-3xl'/>
          <button onClick={handleSubmit} type="submit" className='h-12 col-span-3 px-6 text-2xl font-semibold transition-colors duration-100 ease-in-out bg-orange-600 rounded-e-3xl hover:bg-orange-900'>Search</button>
        </div>
        <div className="grid items-center justify-end col-span-2 col-start-11">
          <button className='px-8 py-2 text-black transition-all duration-200 ease-in-out bg-slate-300 rounded-3xl hover:bg-slate-500 hover:shadow-inner' onClick={toggleUnit}>°C/°F</button>
        </div>
      </header>
      {/* Main section, includes a card displaying the current weatehr nd then an hourly forcast 
          beneath that will be a section to hold weather information beyond the temperature i.e wind, sunrise/sunset times, chance of rain, humidity, the "feels like" temp
          pressure and visibility. beneath that will be a table containing the 5 day forecasts. each of these sections will be handled by a separate component with part of the api call response
          passed to them to populate the data. */}
      <main className="grid grid-cols-12">
        <section className="grid items-center justify-center grid-cols-12 col-span-12 col-start-1 h-96 bg-slate-400">
          <div className='grid w-3/4 grid-cols-1 col-span-4 py-4 mx-auto shadow-lg bg-slate-500 rounded-xl h-5/6'>
            {/* current weather card */}
            <h2 className='text-6xl font-bold'>
              {unit === 'imperial' ? currentWeather?.temp_f : currentWeather?.temp_c}&deg;{unit === 'imperial' ? 'F' : 'C'}
            </h2>
            <h3 className='text-2xl font-semibold'>
              {currentWeather?.condition_text}
            </h3>
            <img src={currentWeather?.condition_icon} alt="weather icon" className='w-1/2 mx-auto'/>
          </div>
          <div id='hourlyForecast' className='w-4/5 col-span-8 mx-auto shadow-xl h-5/6 bg-slate-500 rounded-xl'>
              {/* hourly forecast */}
              <h2 className='row-start-1 text-4xl font-bold'>Hourly Forecast</h2>
              <div className='grid h-full row-start-2 gap-4 overflow-x-scroll overflow-y-hidden'>
                {hourlyForecast?.map((hour: hourForecast, index) => {
                  return (
                    <div key={index} className='grid items-center justify-center w-48 col-span-2 grid-rows-4 row-start-2 gap-6 h-36'>
                      <h3 className='text-2xl font-semibold'>{hour.time}</h3>
                      <h4 className='text-xl font-semibold'>{unit === 'imperial' ? hour.temp_f : hour.temp_c}&deg;{unit === 'imperial' ? 'F' : 'C'}</h4>
                      <img src={hour.condition.icon} alt="weather icon" className='w-1/4 mx-auto'/>
                      <h4 className='text-xl font-semibold'>{hour.condition.text}</h4>
                    </div>
                  )
                })}
              </div>
          </div>
        </section>
        <section className="grid h-64 grid-cols-12 col-span-12 col-start-1 bg-slate-700 auto-rows-min">
          <h2 className='col-span-12 col-start-1 text-4xl font-bold'>Weather Information</h2>
          <div className="grid items-center justify-center grid-cols-4 col-span-8 col-start-3 grid-rows-2 row-start-2 gap-4 pt-10">
           {/* weather information aka all information not already presented by the hero card */}
            <div>
              <h3 className='text-xl font-semibold'>Humidity</h3>
              <h4>{currentWeather?.humidity}</h4>
            </div>
            <div>
              <h3 className='text-xl font-semibold'>Chance of Rain</h3>
              <h4>{currentWeather?.precip_in}</h4>
            </div>
            <div>
              <h3 className='text-xl font-semibold'>Wind Speed</h3>
              <h4>{currentWeather?.wind_mph}</h4>
            </div>
            <div>
              <h3 className='text-xl font-semibold'>Pressure</h3>
              <h4>{currentWeather?.pressure_in}</h4>
            </div>
            <div>
              <h3 className='text-xl font-semibold'>Visibility</h3>
              <h4>{currentWeather?.vis_miles}</h4>
            </div>
            <div>
              <h3 className='text-xl font-semibold'>UV Index</h3>
              <h4>{currentWeather?.uv}</h4>
            </div>
            <div>
              <h3 className='text-xl font-semibold'>Feels Like</h3>
              <h4>{unit === 'imperial' ? currentWeather?.feelslike_f : currentWeather?.feelslike_c}&deg;{unit === 'imperial' ? 'F' : 'C'}</h4>
            </div>
            <div>
              <h3 className='text-xl font-semibold'>Cloud</h3>
              <h4>{currentWeather?.cloud}</h4>
            </div>


          </div>
        </section>
        <section className="h-auto col-span-12 col-start-1 bg-slate-400">
          <h2 className='text-4xl font-bold'>5 Day Forecast</h2>
          <div className="grid items-center justify-center grid-cols-1 col-span-10 col-start-2 row-start-2 gap-4 pt-10 auto-rows-min">
            {/* 5 day forecast */}
            {dailyForecast?.map((day: dayForecast, index) => {
              return (
                <div key={index} className='grid items-center justify-center w-full h-auto grid-cols-4 gap-6 border-b-2 shadow-lg'>
                  <h3 className='text-2xl font-semibold'>{day.date}</h3>
                  <h4 className='text-xl font-semibold'>{unit === 'imperial' ? day.temp_f : day.temp_c}&deg;{unit === 'imperial' ? 'F' : 'C'}</h4>
                  <img src={day.condition.icon} alt="weather icon" className='w-1/4 mx-auto'/>
                  <h4 className='text-xl font-semibold'>{day.condition.text}</h4>
                </div>
              )
            })}
          </div>

        </section>

    </main>
    </>
  )
}

export default App
