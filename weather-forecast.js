var request = require('request');
var cheerio = require('cheerio');
var _ = require('underscore');

// TODO: allow this to be configurable by API
var FORECASTS_COUNT = 4;

// return the closest N forecasts in the future to current time with the smallest time range
var closestInstantForecasts = function($, times, N) {
  N = typeof N === 'undefined' ? 24 : N;

  return _.chain(times).map(function(time){
    // map to back to cheerio'fied object so we can read attr()
    return $(time);
  }).filter(function(time){
    // filter by instantaneous forecasts only
    return time.attr("from") == time.attr("to");
  }).sortBy(function(time){
    // sort by closest to most distant time
    var from = new Date(time.attr("from"));
    return Math.abs((new Date()).getTime() - from.getTime());
  }).first(N).value();
};

// return an object with temperature in C and F and a relative ETA in hours for that temperature.
var createForecastItem = function(time){
  var tempC = parseFloat(time.find('temperature').eq(0).attr('value'));
  return {
    hoursFromNow: Math.ceil(((new Date(time.attr("from"))).getTime() - (new Date()).getTime()) / 1000 / 60 / 60),

    // Celcius is kept decimal since met.no returns a pleasant formatted value. 
    // Fahrenheit is rounded for reasons of laziness. 
    // TODO: format Fahrenheit value.
    tempC: tempC,
    tempF: Math.round((9 / 5 * tempC) + 32)
  };
};

module.exports = {

  // call done with weather forecast results for GPS location lat, lon
  getForecast: function(lat, lon, done){

    var url = "http://api.met.no/weatherapi/locationforecast/1.8/?lat=" + lat + ";lon=" + lon;

    request(url, function(error, response, body) {

      if (!error && response.statusCode == 200) {

        var $ = cheerio.load(body);
        var nearbyForecasts = closestInstantForecasts($, $("product time"), FORECASTS_COUNT);

        done(nearbyForecasts.map(createForecastItem));

      } else {
        console.error("error requesting met.no forecast");
      }
    });
  }

};