const CITY_COORDS = {
  "CALOOCAN CITY": [14.7566, 121.0447],
  "LAS PINAS CITY": [14.4453, 120.9830],
  "MAKATI CITY": [14.5547, 121.0244],
  "MALABON CITY": [14.6625, 120.9570],
  "MANDALUYONG CITY": [14.5794, 121.0359],
  "MANILA CITY": [14.5995, 120.9842],
  "MARIKINA CITY": [14.6507, 121.1029],
  "MUNTINLUPA CITY": [14.4081, 121.0415],
  "NAVOTAS CITY": [14.6730, 120.9350],
  "PARANAQUE CITY": [14.4793, 121.0198],
  "PASAY CITY": [14.5378, 120.9896],
  "PASIG CITY": [14.5764, 121.0851],
  "PATEROS": [14.5440, 121.0680],
  "QUEZON CITY": [14.6760, 121.0437],
  "SAN JUAN CITY": [14.6019, 121.0355],
  "TAGUIG CITY": [14.5176, 121.0509],
  "VALENZUELA CITY": [14.7000, 120.9830]
};

const map = L.map("map", { scrollWheelZoom: true }).setView([14.59, 121.03], 10);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 18,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

let allRows = [];
let markerLayer = L.layerGroup().addTo(map);

const yearFilter = document.getElementById("yearFilter");
const cityFilter = document.getElementById("cityFilter");
const metricFilter = document.getElementById("metricFilter");

function numberFormat(value) {
  return Math.round(Number(value) || 0).toLocaleString("en-US");
}

function readableName(name) {
  return name.toLowerCase().replace(/\b\w/g, letter => letter.toUpperCase());
}

function getFilteredRows() {
  const year = yearFilter.value;
  const city = cityFilter.value;
  return allRows.filter(row => {
    const rowYear = row.date.slice(0, 4);
    return (year === "all" || rowYear === year) &&
           (city === "all" || row.location === city);
  });
}

function aggregateRows(rows) {
  const result = {};
  rows.forEach(row => {
    if (!result[row.location]) {
      result[row.location] = { location: row.location, cases: 0, deaths: 0, records: 0, firstDate: row.date, lastDate: row.date };
    }
    result[row.location].cases += Number(row.cases) || 0;
    result[row.location].deaths += Number(row.deaths) || 0;
    result[row.location].records += 1;
    if (row.date < result[row.location].firstDate) result[row.location].firstDate = row.date;
    if (row.date > result[row.location].lastDate) result[row.location].lastDate = row.date;
  });
  return Object.values(result);
}

function colorFor(value, maxValue) {
  const ratio = maxValue > 0 ? value / maxValue : 0;
  if (ratio >= 0.67) return "#bb303c";
  if (ratio >= 0.34) return "#e87548";
  return "#e5b24b";
}

function render() {
  const rows = getFilteredRows();
  const totals = aggregateRows(rows);
  const metric = metricFilter.value;
  const metricLabel = metric === "cases" ? "Reported cases" : "Reported deaths";
  const metricShort = metric === "cases" ? "Cases" : "Deaths";
  const totalCases = rows.reduce((sum, row) => sum + (Number(row.cases) || 0), 0);
  const totalDeaths = rows.reduce((sum, row) => sum + (Number(row.deaths) || 0), 0);

  document.getElementById("totalCases").textContent = numberFormat(totalCases);
  document.getElementById("totalDeaths").textContent = numberFormat(totalDeaths);
  document.getElementById("locationCount").textContent = totals.length.toLocaleString("en-US");
  document.getElementById("mapMetricLabel").textContent = metricLabel;
  document.getElementById("tableMetricHeading").textContent = metricShort;

  const ranked = [...totals].sort((a, b) => b[metric] - a[metric]);
  const top = ranked[0];
  document.getElementById("highestLocation").textContent = top ? readableName(top.location) : "—";
  document.getElementById("highestValue").textContent = top ? `${numberFormat(top[metric])} ${metricLabel.toLowerCase()}` : "No data selected";

  markerLayer.clearLayers();
  const maxValue = Math.max(0, ...totals.map(item => item[metric]));
  totals.forEach(item => {
    const coords = CITY_COORDS[item.location];
    if (!coords) return;
    const value = item[metric];
    const radius = maxValue > 0 ? 7 + (Math.sqrt(value / maxValue) * 20) : 7;
    const marker = L.circleMarker(coords, {
      radius,
      color: colorFor(value, maxValue),
      fillColor: colorFor(value, maxValue),
      fillOpacity: 0.72,
      weight: 1.5
    });
    marker.bindPopup(`
      <div class="popup-title">${readableName(item.location)}</div>
      <div class="popup-row"><span>Reported cases</span><strong>${numberFormat(item.cases)}</strong></div>
      <div class="popup-row"><span>Reported deaths</span><strong>${numberFormat(item.deaths)}</strong></div>
      <div class="popup-row"><span>Records included</span><strong>${numberFormat(item.records)}</strong></div>
      <div class="popup-row"><span>Date range</span><strong>${item.firstDate} to ${item.lastDate}</strong></div>
    `);
    marker.addTo(markerLayer);
  });

  const tbody = document.getElementById("locationTable");
  tbody.innerHTML = "";
  ranked.forEach(item => {
    const tr = document.createElement("tr");
    const nameCell = document.createElement("td");
    nameCell.textContent = readableName(item.location);
    const valueCell = document.createElement("td");
    valueCell.className = "text-end";
    const badge = document.createElement("span");
    badge.className = "value-badge";
    badge.textContent = numberFormat(item[metric]);
    valueCell.appendChild(badge);
    tr.appendChild(nameCell);
    tr.appendChild(valueCell);
    tbody.appendChild(tr);
  });
  document.getElementById("emptyMessage").classList.toggle("d-none", ranked.length > 0);
}

function populateCities() {
  const cities = [...new Set(allRows.map(row => row.location))].sort();
  cities.forEach(city => {
    const option = document.createElement("option");
    option.value = city;
    option.textContent = readableName(city);
    cityFilter.appendChild(option);
  });
}

fetch("/api/dengue")
  .then(response => {
    if (!response.ok) throw new Error("Could not load the dengue dataset.");
    return response.json();
  })
  .then(data => {
    allRows = data;
    populateCities();
    render();
  })
  .catch(error => {
    console.error(error);
    document.getElementById("locationTable").innerHTML =
      '<tr><td colspan="2" class="text-danger p-3">Could not load data. Check that Flask is running and the CSV file is in the project folder.</td></tr>';
  });

yearFilter.addEventListener("change", render);
cityFilter.addEventListener("change", render);
metricFilter.addEventListener("change", render);
document.getElementById("resetButton").addEventListener("click", () => {
  yearFilter.value = "all";
  cityFilter.value = "all";
  metricFilter.value = "cases";
  render();
});
