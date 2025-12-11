const axios = require('axios');

async function fetchByZip() {
  const query = `
    [out:json][timeout:25];
    area["postal_code"="${11373}"]->.searchArea;
    (
      node["shop"="car_parts"](area.searchArea);
      way["shop"="car_parts"](area.searchArea);
      relation["shop"="car_parts"](area.searchArea);
    );
    out center;
  `;

  const response = await axios.post('https://overpass-api.de/api/interpreter', query, {
    headers: { 'Content-Type': 'text/plain' },
  });

  return response.data.elements;
}

// Example
fetchByZip("10001").then(data => console.log(data.length));
