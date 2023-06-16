import fs from 'fs';
import { Sql, moment, User, Channel, Content, Runlog, LogEntry, Library } from '../modules';

import axios, { AxiosResponse } from 'axios';
import { each } from 'lodash';

export default class OpenWeather {
	static async getData(): Promise<any> {
		console.log("getting weather data");
		const apiUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=39.6632&lon=104.8280&us&units=${"imperial"}&appid=${"16ac2cbff7dcb2d9f36d6a4b94ea002c"}`;
		const apiResult = await axios.get(apiUrl);
		console.log(apiResult)
		apiResult.data.minutely.forEach((minutelyData : any) => {
			const { regtoken, dt, precipitation } = minutelyData;
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

		apiResult.data.hourly.forEach((hourlyData : any) => {
			const { regtoken, dt, timezone, lat, lon, temp, feels_like, pressure, humidity, dew_point, clouds, visibility, wind_speed, wind_deg, wind_gust, weather, pop, rain, snow } = hourlyData;

			const formattedDt = new Date(dt * 1000).toISOString().slice(0, 19).replace('T', ' ');

			// Extract weather details
			const { id: weatherId, main: weatherMain, description: weatherDescription, icon: weatherIcon } = weather[0];

			const query = `INSERT INTO weather_data_hourly (regtoken, dt, timezone, lat, lon, temp, feels_like, pressure, humidity, dew_point, clouds, visibility, wind_speed, wind_deg, wind_gust, weather_id, weather_main, weather_description, weather_icon, pop, rain, snow)
				VALUES ('${regtoken}', '${formattedDt}', '${apiResult.data.timezone}', ${apiResult.data.lat}, ${apiResult.data.lon}, ${temp}, ${feels_like}, ${pressure}, ${humidity}, ${dew_point}, ${clouds}, ${visibility}, ${wind_speed}, ${wind_deg}, ${wind_gust}, ${weatherId}, '${weatherMain}', '${weatherDescription}', '${weatherIcon}', ${pop}, ${rain ? rain['1h'] || 0 : 0}, ${snow ? snow['1h'] || 0 : 0})
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

		
		apiResult.data.daily.forEach((dailyData: any) => {
			const { regtoken, dt, sunrise, sunset, moonrise, moonset, moon_phase, moon_phase_lunation, temp, feels_like, pressure, humidity, dew_point, wind_speed, wind_deg, wind_gust, weather, clouds, pop, rain, snow, uvi } = dailyData;

			const formattedDt = new Date(dt * 1000).toISOString().slice(0, 19).replace('T', ' ');
			const formattedSunrise = new Date(sunrise * 1000).toISOString().slice(0, 19).replace('T', ' ');
			const formattedSunset = new Date(sunset * 1000).toISOString().slice(0, 19).replace('T', ' ');
			const formattedMoonrise = new Date(moonrise * 1000).toISOString().slice(0, 19).replace('T', ' ');
			const formattedMoonset = new Date(moonset * 1000).toISOString().slice(0, 19).replace('T', ' ');

			// Extract weather details
			const { id: weatherId, main: weatherMain, description: weatherDescription, icon: weatherIcon } = weather[0];

			const query = `INSERT INTO weather_data_daily (regtoken, dt, timezone, lat, lon, sunrise, sunset, moonrise, moonset, moon_phase, temp_morn, temp_day, temp_eve, temp_night, temp_min, temp_max, feels_like_morn, feels_like_day, feels_like_eve, feels_like_night, pressure, humidity, dew_point, wind_speed, wind_deg, wind_gust, weather_id, weather_main, weather_description, weather_icon, clouds, pop, rain, snow, uvi)
				VALUES ('${regtoken}', '${formattedDt}', '${apiResult.data.timezone}', ${apiResult.data.lat}, ${apiResult.data.lon}, '${formattedSunrise}', '${formattedSunset}', '${formattedMoonrise}', '${formattedMoonset}', ${moon_phase},  ${temp.morn}, ${temp.day}, ${temp.eve}, ${temp.night}, ${temp.min}, ${temp.max}, ${feels_like.morn}, ${feels_like.day}, ${feels_like.eve}, ${feels_like.night}, ${pressure}, ${humidity}, ${dew_point}, ${wind_speed}, ${wind_deg}, ${wind_gust}, ${weatherId}, '${weatherMain}', '${weatherDescription}', '${weatherIcon}', ${clouds}, ${pop}, ${rain || 0}, ${snow || 0}, ${uvi})
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
		if (apiResult.data.alerts) apiResult.data.alerts.forEach((alertsData: any) => {
			const { regtoken, sender_name, event, start, end, description } = alertsData;

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

		return apiResult.data;
	}
}
