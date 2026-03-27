import { NextRequest, NextResponse } from "next/server";

type OpenMeteoResponse = {
  current?: {
    temperature_2m: number;
    wind_speed_10m: number;
    weather_code: number;
    is_day: number;
    time: string;
  };
};

type ReverseGeocodeResponse = {
  display_name?: string;
};

type CitibikeStation = {
  stationId: string;
  name: string;
  distanceMeters: number;
  bikesAvailable: number;
  ebikesAvailable: number;
  docksAvailable: number;
};

type GbfsFeedIndex = {
  data?: {
    en?: {
      feeds?: Array<{ name: string; url: string }>;
    };
  };
};

type GbfsStationInfo = {
  station_id: string;
  name?: string;
  lat?: number;
  lon?: number;
};

type GbfsStationStatus = {
  station_id: string;
  num_bikes_available?: number;
  num_ebikes_available?: number;
  num_docks_available?: number;
};

const GBFS_INDEX_URL = "https://gbfs.citibikenyc.com/gbfs/2.3/gbfs.json";

function toNumber(value: string | null) {
  if (!value) return null;
  const result = Number(value);
  return Number.isFinite(result) ? result : null;
}

function haversineMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

async function fetchNearestCitibikeStations(
  lat: number,
  lon: number,
): Promise<{ stations: CitibikeStation[]; message: string | null }> {
  try {
    const indexRes = await fetch(GBFS_INDEX_URL, {
      next: { revalidate: 300 },
    });
    if (!indexRes.ok) {
      return {
        stations: [],
        message: "Citi Bike feed index is unavailable.",
      };
    }

    const index = (await indexRes.json()) as GbfsFeedIndex;
    const feeds = index.data?.en?.feeds;
    const infoUrl = feeds?.find((f) => f.name === "station_information")?.url;
    const statusUrl = feeds?.find((f) => f.name === "station_status")?.url;

    if (!infoUrl || !statusUrl) {
      return {
        stations: [],
        message: "Could not resolve Citi Bike station feeds from GBFS index.",
      };
    }

    const [infoRes, statusRes] = await Promise.all([
      fetch(infoUrl, { next: { revalidate: 60 } }),
      fetch(statusUrl, { next: { revalidate: 60 } }),
    ]);

    if (!infoRes.ok || !statusRes.ok) {
      return {
        stations: [],
        message: "Citi Bike station data is temporarily unavailable.",
      };
    }

    const infoJson = (await infoRes.json()) as {
      data?: { stations?: GbfsStationInfo[] };
    };
    const statusJson = (await statusRes.json()) as {
      data?: { stations?: GbfsStationStatus[] };
    };

    const statusById = new Map<string, GbfsStationStatus>();
    for (const s of statusJson.data?.stations ?? []) {
      statusById.set(s.station_id, s);
    }

    const withDistance: CitibikeStation[] = [];

    for (const station of infoJson.data?.stations ?? []) {
      const slat = station.lat;
      const slon = station.lon;
      if (slat === undefined || slon === undefined) continue;

      const st = statusById.get(station.station_id);
      withDistance.push({
        stationId: station.station_id,
        name: station.name ?? "Station",
        distanceMeters: haversineMeters(lat, lon, slat, slon),
        bikesAvailable: st?.num_bikes_available ?? 0,
        ebikesAvailable: st?.num_ebikes_available ?? 0,
        docksAvailable: st?.num_docks_available ?? 0,
      });
    }

    withDistance.sort((a, b) => a.distanceMeters - b.distanceMeters);

    const nearest = withDistance.slice(0, 5);
    return {
      stations: nearest,
      message:
        nearest.length > 0
          ? null
          : "No Citi Bike stations found to compare distance.",
    };
  } catch {
    return {
      stations: [],
      message: "Unable to load Citi Bike data right now.",
    };
  }
}

export async function GET(request: NextRequest) {
  const lat = toNumber(request.nextUrl.searchParams.get("lat"));
  const lon = toNumber(request.nextUrl.searchParams.get("lon"));

  if (lat === null || lon === null) {
    return NextResponse.json(
      { error: "Missing or invalid lat/lon query parameters." },
      { status: 400 },
    );
  }

  const locationPromise = fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=jsonv2`,
    {
      headers: {
        "User-Agent": "nextjs-localized-home/1.0",
      },
      next: { revalidate: 0 },
    },
  )
    .then(async (response) => {
      if (!response.ok) return null;
      const data = (await response.json()) as ReverseGeocodeResponse;
      return data.display_name ?? null;
    })
    .catch(() => null);

  const weatherPromise = fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,weather_code,is_day`,
    { next: { revalidate: 0 } },
  )
    .then(async (response) => {
      if (!response.ok) return null;
      const data = (await response.json()) as OpenMeteoResponse;
      if (!data.current) return null;

      return {
        temperature: data.current.temperature_2m,
        windSpeed: data.current.wind_speed_10m,
        weatherCode: data.current.weather_code,
        isDay: data.current.is_day === 1,
        time: data.current.time,
      };
    })
    .catch(() => null);

  const citibikePromise = fetchNearestCitibikeStations(lat, lon);

  const [locationName, weather, citibike] = await Promise.all([
    locationPromise,
    weatherPromise,
    citibikePromise,
  ]);

  return NextResponse.json({
    locationName: locationName ?? "Unknown location",
    weather,
    citibikeStations: citibike.stations,
    citibikeMessage: citibike.message,
  });
}
