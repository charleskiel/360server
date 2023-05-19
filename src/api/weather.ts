const fetch = require('node-fetch');
const Sql = require('./Sql'); // replace with your Sql class

class OpenWeatherMap {
  static async getData(user) {
    const zip = user.Zip;
    const units = user.units;
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?zip=${zip},us&units=${units}&appid=${process.env.OPENWEATHERMAP_API_KEY}`;
    const dbResult = await Sql.query('SELECT * FROM Weather WHERE Zip = $1 AND datetime_updated > NOW() - INTERVAL \'5 minutes\'', [zip]);

    if (dbResult.rowCount === 1) {
      // data exists in the database and is recent
      return dbResult.rows[0].data;
    } else {
      // data does not exist in the database or is not recent
      const apiResult = await fetch(apiUrl);
      const jsonData = await apiResult.json();
      const sql = `INSERT INTO Weather (Zip, datetime_updated, data) VALUES ($1, $2, $3) ON CONFLICT (Zip) DO UPDATE SET datetime_updated = $2, data = $3 RETURNING data`;
      const dbInsert = await Sql.query(sql, [zip, new Date(), jsonData]);
      return dbInsert.rows[0].data;
    }
  }
}
