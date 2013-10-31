weather-forecast
================

Generate a weather forecast for a GPS location

```javascript

var forecast = require('weather-forecast');

var location = {
  latitude: "34.103987",
  longitude: "-118.406723"
};

forecast.getForecast(location.latitude, location.longitude, function(forecast) {
  var forecastStr = forecast.map(function(f){
    return "in " + f.hoursFromNow + "h: " + f.tempC + "˚C " + f.tempF + "F˚ ";
  }).join(" ..... ");

  console.log("Forecast for " + location.latitude + ", " + location.longitude + ": " + forecastStr);
});

```