import React from 'react'
import currentWeather from '../../Interfaces/currentWeather'
import hourlyforecast from '../../interfaces/hourlyforecast'


interface Props {
    currentWeather: currentWeather;
    hourlyforecast: hourlyforecast[];
    unit: string;
}

export const Current = ({currentWeather, hourlyforecast, unit}:Props) => {


  return (
    <>
        <div className="grid grid-cols-12 col-start-1 col-span-full">
          <div className='flex flex-col items-center justify-center col-span-3 col-start-1'>
            <h2>{currentWeather.location.name}</h2>
            <h3>{currentWeather.current.condition.text}</h3>
            <p>{unit == "f" ? currentWeather.current.temp_f : currentWeather.current.temp_c}</p>
          </div>   
        </div>
        <div>

        </div>  
    </>
  )
}
