// African cities and their IANA time zones.
// `id` is the URL-friendly key used by /api/time?city=<id>.
const CITIES = [
  { id: 'abidjan', city: 'Abidjan', country: "Côte d'Ivoire", timezone: 'Africa/Abidjan' },
  { id: 'accra', city: 'Accra', country: 'Ghana', timezone: 'Africa/Accra' },
  { id: 'addis-ababa', city: 'Addis Ababa', country: 'Ethiopia', timezone: 'Africa/Addis_Ababa' },
  { id: 'algiers', city: 'Algiers', country: 'Algeria', timezone: 'Africa/Algiers' },
  { id: 'antananarivo', city: 'Antananarivo', country: 'Madagascar', timezone: 'Indian/Antananarivo' },
  { id: 'bamako', city: 'Bamako', country: 'Mali', timezone: 'Africa/Bamako' },
  { id: 'cairo', city: 'Cairo', country: 'Egypt', timezone: 'Africa/Cairo' },
  { id: 'cape-town', city: 'Cape Town', country: 'South Africa', timezone: 'Africa/Johannesburg' },
  { id: 'casablanca', city: 'Casablanca', country: 'Morocco', timezone: 'Africa/Casablanca' },
  { id: 'dakar', city: 'Dakar', country: 'Senegal', timezone: 'Africa/Dakar' },
  { id: 'dar-es-salaam', city: 'Dar es Salaam', country: 'Tanzania', timezone: 'Africa/Dar_es_Salaam' },
  { id: 'gaborone', city: 'Gaborone', country: 'Botswana', timezone: 'Africa/Gaborone' },
  { id: 'harare', city: 'Harare', country: 'Zimbabwe', timezone: 'Africa/Harare' },
  { id: 'johannesburg', city: 'Johannesburg', country: 'South Africa', timezone: 'Africa/Johannesburg' },
  { id: 'juba', city: 'Juba', country: 'South Sudan', timezone: 'Africa/Juba' },
  { id: 'kampala', city: 'Kampala', country: 'Uganda', timezone: 'Africa/Kampala' },
  { id: 'khartoum', city: 'Khartoum', country: 'Sudan', timezone: 'Africa/Khartoum' },
  { id: 'kigali', city: 'Kigali', country: 'Rwanda', timezone: 'Africa/Kigali' },
  { id: 'kinshasa', city: 'Kinshasa', country: 'DR Congo', timezone: 'Africa/Kinshasa' },
  { id: 'lagos', city: 'Lagos', country: 'Nigeria', timezone: 'Africa/Lagos' },
  { id: 'luanda', city: 'Luanda', country: 'Angola', timezone: 'Africa/Luanda' },
  { id: 'lubumbashi', city: 'Lubumbashi', country: 'DR Congo', timezone: 'Africa/Lubumbashi' },
  { id: 'lusaka', city: 'Lusaka', country: 'Zambia', timezone: 'Africa/Lusaka' },
  { id: 'maputo', city: 'Maputo', country: 'Mozambique', timezone: 'Africa/Maputo' },
  { id: 'mogadishu', city: 'Mogadishu', country: 'Somalia', timezone: 'Africa/Mogadishu' },
  { id: 'nairobi', city: 'Nairobi', country: 'Kenya', timezone: 'Africa/Nairobi' },
  { id: 'port-louis', city: 'Port Louis', country: 'Mauritius', timezone: 'Indian/Mauritius' },
  { id: 'praia', city: 'Praia', country: 'Cabo Verde', timezone: 'Atlantic/Cape_Verde' },
  { id: 'tripoli', city: 'Tripoli', country: 'Libya', timezone: 'Africa/Tripoli' },
  { id: 'tunis', city: 'Tunis', country: 'Tunisia', timezone: 'Africa/Tunis' },
  { id: 'windhoek', city: 'Windhoek', country: 'Namibia', timezone: 'Africa/Windhoek' },
];

const byId = new Map(CITIES.map((c) => [c.id, c]));

// Look up a city by id or by name ("lagos", "Dar es Salaam", "dar-es-salaam").
function findCity(query) {
  if (!query) return undefined;
  const key = query.trim().toLowerCase().replace(/[\s_]+/g, '-');
  return byId.get(key);
}

// Current date/time for a city, computed with the built-in Intl API.
function timeIn(cityInfo, now = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: cityInfo.timezone,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(now)
      .map((p) => [p.type, p.value])
  );

  const monthIdx = new Intl.DateTimeFormat('en-GB', { timeZone: cityInfo.timezone, month: 'numeric' })
    .format(now) - 1;
  const monthNum = String(monthIdx + 1).padStart(2, '0');

  // UTC offset = local wall-clock time (read as if UTC) minus the real instant.
  const wallAsUtc = Date.UTC(+parts.year, monthIdx, +parts.day, +parts.hour, +parts.minute, +parts.second);
  const offsetMin = Math.round((wallAsUtc - Math.floor(now.getTime() / 1000) * 1000) / 60000);
  const abs = Math.abs(offsetMin);
  const offset = `${offsetMin < 0 ? '-' : '+'}${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(abs % 60).padStart(2, '0')}`;

  return {
    ...cityInfo,
    date: `${parts.year}-${monthNum}-${parts.day}`,
    time: `${parts.hour}:${parts.minute}:${parts.second}`,
    weekday: parts.weekday,
    utcOffset: offset,
    formatted: `${parts.weekday}, ${parts.day} ${parts.month} ${parts.year}, ${parts.hour}:${parts.minute}:${parts.second}`,
    timestamp: now.toISOString(),
  };
}

module.exports = { CITIES, findCity, timeIn };
