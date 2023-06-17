import fs from 'fs';
import { Sql, moment, User, Channel, Content, Runlog, LogEntry, Library } from '../modules';

import axios, { AxiosResponse } from 'axios';
import { each } from 'lodash';
import { Auth } from '../auth/auth.js';
import { report } from 'process';

export default class OpenWeather {
	static reports = new Map();
	static async getData(postBody: any, clientIp: string = ""): Promise<any> {
		const regtoken = postBody.user.regtoken;
		let weatherData: any = {};

		
		if (!this.reports.has(regtoken) || (new Date(this.reports.get(regtoken)?.current.dt) > new Date(this.reports.get(regtoken)?.current.dt + (60 * 10)))) {
			const location: WeatherLocation = await this.getLocation(`${postBody.user.City}, ${postBody.user.State}, ${postBody.user.Zip}`)
			console.log(`Getting weather info for ${location.name} ${location.state} [${location.lat} : ${location.lon}]`)
			const apiUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${location.lat}&lon=${location.lon}&us&units=${postBody.user.tempUnits}&appid=${Auth.openWeather.key}`;
			const apiResult = await axios.get(apiUrl);
			weatherData = apiResult.data
			weatherData.location = location;
			this.reports.set(regtoken, weatherData)
			// console.log(this.reports.get(regtoken))

			weatherData.minutely.forEach((minutelyData: any) => {

				const { dt, precipitation } = minutelyData;
				const formattedDt = new Date(dt * 1000).toISOString().slice(0, 19).replace('T', ' ');

				const query = `INSERT INTO weather_data_minutely (regtoken, dt, precipitation) VALUES ('${regtoken}', '${formattedDt}', ${precipitation}) ON DUPLICATE KEY UPDATE precipitation = VALUES(precipitation)`;
				Sql.query(query)
					.then((dataTable: any) => {
						// console.log('INSERT ON DUPLICATE UPDATE executed for minutely data.');
					})
					.catch((error: any) => {
						console.error('Error executing INSERT ON DUPLICATE UPDATE for minutely data:', error);
					});
			});

			weatherData.hourly.forEach((hourlyData: any) => {
				const { dt, timezone, lat, lon, temp, feels_like, pressure, humidity, dew_point, clouds, visibility, wind_speed, wind_deg, wind_gust, weather, pop, rain, snow } = hourlyData;

				const formattedDt = new Date(dt * 1000).toISOString().slice(0, 19).replace('T', ' ');

				// Extract weather details
				const { id: weatherId, main: weatherMain, description: weatherDescription, icon: weatherIcon } = weather[0];

				const query = `INSERT INTO weather_data_hourly (regtoken, dt, timezone, lat, lon, temp, feels_like, pressure, humidity, dew_point, clouds, visibility, wind_speed, wind_deg, wind_gust, weather_id, weather_main, weather_description, weather_icon, pop, rain, snow)
						VALUES ('${regtoken}', '${formattedDt}', '${weatherData.timezone}', ${weatherData.lat}, ${weatherData.lon}, ${temp}, ${feels_like}, ${pressure}, ${humidity}, ${dew_point}, ${clouds}, ${visibility}, ${wind_speed}, ${wind_deg}, ${wind_gust}, ${weatherId}, '${weatherMain}', '${weatherDescription}', '${weatherIcon}', ${pop}, ${rain ? rain['1h'] || 0 : 0}, ${snow ? snow['1h'] || 0 : 0})
						ON DUPLICATE KEY UPDATE
						temp = VALUES(temp),
						feels_like = VALUES(feels_like),
						pressure = VALUES(pressure),
						humidity = VALUES(humidity),
						dew_point = VALUES(dew_point),
						clouds = VALUES(clouds),
						visibility = VALUES(visibility),
						wind_speed = VALUES(wind_speed),
						wind_deg = VALUES(wind_deg),
						wind_gust = VALUES(wind_gust),
						weather_id = VALUES(weather_id),
						weather_main = VALUES(weather_main),
						weather_description = VALUES(weather_description),
						weather_icon = VALUES(weather_icon),
						pop = VALUES(pop),
						rain = VALUES(rain),
						snow = VALUES(snow)`;

				Sql.query(query)
					.then((dataTable: any) => {
						console.log('INSERT ON DUPLICATE UPDATE executed for hourly data.');
					})
					.catch((error: any) => {
						console.error('Error executing INSERT ON DUPLICATE UPDATE for hourly data:', error);
					});
			});


			weatherData.daily.forEach((dailyData: any) => {
				const { dt, sunrise, sunset, moonrise, moonset, moon_phase, moon_phase_lunation, temp, feels_like, pressure, humidity, dew_point, wind_speed, wind_deg, wind_gust, weather, clouds, pop, rain, snow, uvi } = dailyData;

				const formattedDt = new Date(dt * 1000).toISOString().slice(0, 19).replace('T', ' ');
				const formattedSunrise = new Date(sunrise * 1000).toISOString().slice(0, 19).replace('T', ' ');
				const formattedSunset = new Date(sunset * 1000).toISOString().slice(0, 19).replace('T', ' ');
				const formattedMoonrise = new Date(moonrise * 1000).toISOString().slice(0, 19).replace('T', ' ');
				const formattedMoonset = new Date(moonset * 1000).toISOString().slice(0, 19).replace('T', ' ');

				// Extract weather details
				const { id: weatherId, main: weatherMain, description: weatherDescription, icon: weatherIcon } = weather[0];

				const query = `INSERT INTO weather_data_daily (regtoken, dt, timezone, lat, lon, sunrise, sunset, moonrise, moonset, moon_phase, temp_morn, temp_day, temp_eve, temp_night, temp_min, temp_max, feels_like_morn, feels_like_day, feels_like_eve, feels_like_night, pressure, humidity, dew_point, wind_speed, wind_deg, wind_gust, weather_id, weather_main, weather_description, weather_icon, clouds, pop, rain, snow, uvi)
						VALUES ('${regtoken}', '${formattedDt}', '${weatherData.timezone}', ${weatherData.lat}, ${weatherData.lon}, '${formattedSunrise}', '${formattedSunset}', '${formattedMoonrise}', '${formattedMoonset}', ${moon_phase},  ${temp.morn}, ${temp.day}, ${temp.eve}, ${temp.night}, ${temp.min}, ${temp.max}, ${feels_like.morn}, ${feels_like.day}, ${feels_like.eve}, ${feels_like.night}, ${pressure}, ${humidity}, ${dew_point}, ${wind_speed}, ${wind_deg}, ${wind_gust}, ${weatherId}, '${weatherMain}', '${weatherDescription}', '${weatherIcon}', ${clouds}, ${pop}, ${rain || 0}, ${snow || 0}, ${uvi})
						ON DUPLICATE KEY UPDATE
						temp_morn = VALUES(temp_morn),
						temp_day = VALUES(temp_day),
						temp_eve = VALUES(temp_eve),
						temp_night = VALUES(temp_night),
						temp_min = VALUES(temp_min),
						temp_max = VALUES(temp_max),
						feels_like_morn = VALUES(feels_like_morn),
						feels_like_day = VALUES(feels_like_day),
						feels_like_eve = VALUES(feels_like_eve),
						feels_like_night = VALUES(feels_like_night),
						pressure = VALUES(pressure),
						humidity = VALUES(humidity),
						dew_point = VALUES(dew_point),
						wind_speed = VALUES(wind_speed),
						wind_deg = VALUES(wind_deg),
						wind_gust = VALUES(wind_gust),
						weather_id = VALUES(weather_id),
						weather_main = VALUES(weather_main),
						weather_description = VALUES(weather_description),
						weather_icon = VALUES(weather_icon),
						clouds = VALUES(clouds),
						pop = VALUES(pop),
						rain = VALUES(rain),
						snow = VALUES(snow),
						uvi = VALUES(uvi)`;

				Sql.query(query)
					.then((dataTable: any) => {
						console.log('INSERT ON DUPLICATE UPDATE executed for daily data.');
					})
					.catch((error: any) => {
						console.error('Error executing INSERT ON DUPLICATE UPDATE for daily data:', error);
					});
			});
			// Insert/update statements for alerts data
			if (weatherData.alerts) weatherData.alerts.forEach((alertsData: any) => {
				const { sender_name, event, start, end, description } = alertsData;

				// Format start and end as valid MySQL datetime strings
				const formattedStart = new Date(start * 1000).toISOString().slice(0, 19).replace('T', ' ');
				const formattedEnd = new Date(end * 1000).toISOString().slice(0, 19).replace('T', ' ');

				const query = `INSERT INTO weather_data_alerts (regtoken, sender_name, event, start, end, description)
						VALUES ('${regtoken}', '${sender_name}', '${event}', '${formattedStart}', '${formattedEnd}', '${description}')
						ON DUPLICATE KEY UPDATE
						sender_name = VALUES(sender_name),
						event = VALUES(event),
						start = VALUES(start),
						end = VALUES(end),
						description = VALUES(description)`;

				Sql.query(query)
					.then((dataTable: any) => {
						console.log('INSERT ON DUPLICATE UPDATE executed for alerts data.');
					})
					.catch((error: any) => {
						console.error('Error executing INSERT ON DUPLICATE UPDATE for alerts data:', error);
					});
			});

		} else {
			weatherData = this.reports.get(regtoken)
		}

		return weatherData;
	}

	static async getLocation(location: any): Promise<WeatherLocation> {
		console.log(`getting weather data for ${location}`);
		const apiUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${location}&appid=${Auth.openWeather.key}`;
		const apiResult = await axios.get(apiUrl);
		// console.log(apiResult.data);
		let result: WeatherLocation = {
			lat: apiResult.data[0].lat,
			lon: apiResult.data[0].lon,
			name: apiResult.data[0].name,
			state: apiResult.data[0].state,
		};
		return result;
	}

}


interface WeatherLocation {
	lat: number;
	lon: number;
	name: string;
	state: string;

}

