const express = require('express');
const https = require('https');
const cors = require('cors');

const app = express();
const PORT = 3000;

// URL to fetch data for specific exoplanets from the NASA Exoplanet Archive
const url = "https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=select+*+from+pscomppars+where+pl_name+in+('Kepler-22+b','K2-141+b','WASP-121+b','Gliese+581+g')&format=json";
app.use(cors());
// Endpoint to serve exoplanet data
app.get('/exoplanets', (req, res) => {
  // Make HTTPS request to fetch exoplanet data
  https.get(url, (response) => {
    let data = '';

    // Listen for data chunks
    response.on('data', (chunk) => {
      data += chunk;
    });

    // When the response has ended
    response.on('end', () => {
      try {
        // Parse the JSON data
        const planets = JSON.parse(data);

        // Check if any data was received
        if (planets.length === 0) {
          res.status(404).send('No data found for the specified exoplanets.');
          return;
        }

        // Map the data to only include the desired fields
        const filteredPlanets = planets.map(planet => ({
          planetName: planet.pl_name,
          radius: planet.pl_rade,
          mass: planet.pl_bmasse,
          orbitalPeriod: planet.pl_orbper,
          equilibriumTemperature: planet.pl_eqt,
          discoveryMethod: planet.discoverymethod,
          discoveryYear: planet.disc_year,
          starName: planet.hostname
        }));

        // Send the filtered planet data as JSON response
        res.json(filteredPlanets);
      } catch (error) {
        console.error('Error parsing JSON:', error);
        res.status(500).send('Error parsing data.');
      }
    });
  }).on('error', (error) => {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data.');
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}/exoplanets`);
});
