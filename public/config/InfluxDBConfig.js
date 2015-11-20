/**
 *	<LumenFX: An FX system designed and built by thecitysecret>
 *  Copyright (C) 2015 thecitysecret
 *
 *	This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * Configuration files for Influx Database
 */
module.exports = {  //cluster configuration 
  hosts : [
    {
      host : 'YOUR_HOST',
      port : 8086, //optional. default 8086 
      protocol : 'http' //optional. default 'http' 
    }
  ],
  // or single-host configuration 
  host : 'YOUR_HOST',
  port : 8086, // optional, default 8086 
  protocol : 'http', // optional, default 'http' 
  username : 'YOUR_INFLUXDB_USERNAME',
  password : 'YOUR_INFLUXDB_PASSWORD',
  database : 'YOUR_INFLUXDB_DATABASE_NAME',
  measurement : 'YOUR_INFLUXDB_MEASUREMENT_NAME'
}
