const axios = require('axios');

class Geolocation 
{
    constructor() 
    {
        this.apiUrl = 'http://ip-api.com/json/';
    }

    async getLocation(ipAddress)
    {
        try {
            const response = await axios.get(`${this.apiUrl}${ipAddress}`);

            if(response && response.data)
            {
                const { query: ip, lat: latitude, lon: longitude, city, regionName: region_name, country } = response.data;
                return {
                    ip,
                    location: {
                        latitude,
                        longitude,
                        city,
                        region_name,
                        country_name: country,
                        count: 1
                    },
                };
            } 
            else 
            {
                throw new Error('Failed to fetch location data.');
            }
        } catch(err) {
            return null;
        }
    }
}

module.exports = Geolocation;