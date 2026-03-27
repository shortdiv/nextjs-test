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

type NearbyStop = {
  id: string;
  name?: string;
};

type NearbyStopsResponse = NearbyStop[];

type DepartureRecord = {
  when?: string;
  line?: {
    name?: string;
  };
  direction?: string;
};

type StopDeparturesResponse = {
  departures?: DepartureRecord[];
};

type Departure = {
  line: string;
  destination: string;
  departure: string;
};

function toNumber(value: string | null) {
  if (!value) return null;
  const result = Number(value);
  return Number.isFinite(result) ? result : null;
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

  // Public endpoint from transport.rest (best-effort only).
  const departuresPromise = fetch(
    `https://v6.db.transport.rest/stops/nearby?latitude=${lat}&longitude=${lon}&results=1`,
    {
      headers: {
        "User-Agent": "nextjs-localized-home/1.0",
      },
      next: { revalidate: 0 },
    },
  )
    .then(async (response) => {
      if (!response.ok) {
        return { departures: [] as Departure[], transitMessage: "Transit API is unavailable." };
      }

      const nearbyStops = (await response.json()) as NearbyStopsResponse;
      const stopId = nearbyStops[0]?.id;

      if (!stopId) {
        return { departures: [] as Departure[], transitMessage: "No nearby transit stops found." };
      }

      const departuresResponse = await fetch(
        `https://v6.db.transport.rest/stops/${encodeURIComponent(stopId)}/departures?duration=90&results=5`,
        {
          headers: {
            "User-Agent": "nextjs-localized-home/1.0",
          },
          next: { revalidate: 0 },
        },
      );

      if (!departuresResponse.ok) {
        return { departures: [] as Departure[], transitMessage: "Could not load live departures." };
      }

      const departuresData =
        (await departuresResponse.json()) as StopDeparturesResponse;

      const departures =
        departuresData.departures
          ?.filter((item) => item.when)
          .slice(0, 5)
          .map((item) => ({
            line: item.line?.name ?? "Transit",
            destination: item.direction ?? "Unknown destination",
            departure: item.when as string,
          })) ?? [];

      return {
        departures,
        transitMessage:
          departures.length > 0 ? null : "No departures in the next 90 minutes.",
      };
    })
    .catch(() => ({
      departures: [] as Departure[],
      transitMessage: "Transit data unavailable in your region right now.",
    }));

  const [locationName, weather, transit] = await Promise.all([
    locationPromise,
    weatherPromise,
    departuresPromise,
  ]);

  return NextResponse.json({
    locationName: locationName ?? "Unknown location",
    weather,
    departures: transit.departures,
    transitMessage: transit.transitMessage,
  });
}
