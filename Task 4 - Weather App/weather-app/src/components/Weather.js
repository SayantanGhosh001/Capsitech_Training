import React, { useState, useEffect } from "react";
import axios from "axios";


const Weather = () => {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [day, setDay] = useState("");
  const [date, setDate] = useState("");
  const API_KEY = "6230a002bb5a530131cffeccc2bf5a4e";

  useEffect(() => {
    const getCurrentDate = () => {
      const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const today = new Date();
      setDay(days[today.getDay()]);
      setDate(
        `${today.getDate()} ${today.toLocaleString("en-US", {
          month: "short",
        })}`
      );
    };

    getCurrentDate();
  }, []);

  const fetchWeather = async (event) => {
    event.preventDefault();
    if (!city) return;

    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      );
      setWeatherData(response.data);
      console.log(response.data);
    } catch (error) {
      alert("City not found!");
      setWeatherData(null);
    }
  };

  // Function to get weather icon dynamically
  const getWeatherIcon = (condition) => {
    switch (condition) {
      case "Clear":
        return <i className="fa-solid fa-sun text-yellow-500"></i>;
      case "Clouds":
        return <i className="fa-solid fa-cloud text-blue-600"></i>;
      case "Rain":
        return (
          <i className="fa-solid fa-cloud-showers-heavy text-blue-500"></i>
        );
      case "Fog":
      case "Mist":
        return <i className="fa-solid fa-smog text-gray-500"></i>;
      default:
        return <i className="fa-solid fa-sun text-yellow-500"></i>;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center bg-gray-900 px-4 sm:px-8 min-h-screen">
      {/* Input Form */}
      <form
        className="w-full max-w-md flex items-center mb-4 mt-4"
        onSubmit={fetchWeather}
      >
        <input
          type="text"
          placeholder="Enter Your City Name"
          className="flex-1 bg-gray-800 text-white p-3 rounded-full border-none focus:outline-none"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-white hover:text-blue-500 text-white font-bold py-2 px-4 rounded-full ml-[-87px]"
        >
          Search
        </button>
      </form>

      {/* Weather Info */}
      <div className="w-full max-w-md bg-gray-800 text-white rounded-lg shadow-lg mb-4 info-div">
        <div className="flex justify-between p-3 text-sm shadow-lg">
          <p>{day}</p>
          <p>{date}</p>
        </div>
        <div className="flex flex-col items-center p-6 min-h-[315px]">
          <p className="text-white-500 text-lg font-semibold">
            {weatherData
              ? `${weatherData.name}, ${weatherData.sys.country}`
              : "Get Output Here"}
          </p>

          {weatherData && (
            <>
              <p className="text-6xl mt-2">
                {getWeatherIcon(weatherData.weather[0].main)}
              </p>
              <div className="flex items-center space-x-6 mt-4 text-5xl">
                <p className="text-white">
                  <span>{weatherData.main.temp}</span>
                  &deg;C
                </p>
              </div>
              <div className="flex justify-between mt-4 weather-info">
                <div className="humidity bg-[#ffffff24] text-white m-3 p-2 rounded text-center hover:bg-[#00000000] hover:shadow-xl">
                  Humidity: <p>{weatherData.main.humidity}%</p>
                </div>
                <div className="feels-like  bg-[#ffffff24] text-white m-3 p-2 rounded text-center hover:bg-[#00000000] hover:shadow-xl">
                  Feels like: <p>{weatherData.main.feels_like}&deg;C</p>
                </div>
                <div className="wind-speed text-white m-3 p-2 rounded text-center bg-[#ffffff24] hover:bg-[#00000000] hover:shadow-xl">
                  Wind Speed:{" "}
                  <p>
                    {Math.ceil(weatherData.wind.speed * 3.6 * 100) / 100}km/h
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Weather;
