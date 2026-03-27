"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

/** Downtown Brooklyn — fixed for demo (no browser geolocation). */
const BROOKLYN = { latitude: 40.6782, longitude: -73.9442 } as const;

type CitibikeStation = {
  stationId: string;
  name: string;
  distanceMeters: number;
  bikesAvailable: number;
  ebikesAvailable: number;
  docksAvailable: number;
};

type LocalizedData = {
  locationName: string;
  weather: {
    temperature: number;
    windSpeed: number;
    weatherCode: number;
    isDay: boolean;
    time: string;
  } | null;
  citibikeStations: CitibikeStation[];
  citibikeMessage: string | null;
};

function getWeatherLabel(code: number) {
  if (code === 0) return "Clear sky";
  if ([1, 2, 3].includes(code)) return "Partly cloudy";
  if ([45, 48].includes(code)) return "Fog";
  if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
  if ([61, 63, 65, 66, 67].includes(code)) return "Rain";
  if ([71, 73, 75, 77].includes(code)) return "Snow";
  if ([80, 81, 82].includes(code)) return "Rain showers";
  if ([85, 86].includes(code)) return "Snow showers";
  if ([95, 96, 99].includes(code)) return "Thunderstorm";
  return "Unknown";
}

function formatDistanceMeters(meters: number) {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localizedData, setLocalizedData] = useState<LocalizedData | null>(null);

  const weatherLabel = useMemo(() => {
    if (!localizedData?.weather) return null;
    return getWeatherLabel(localizedData.weather.weatherCode);
  }, [localizedData]);

  const loadLocalizedInfo = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/localized?lat=${BROOKLYN.latitude}&lon=${BROOKLYN.longitude}`,
      );

      if (!response.ok) {
        throw new Error("Unable to load localized information right now.");
      }

      const data = (await response.json()) as LocalizedData;
      setLocalizedData(data);
    } catch {
      setError("Unable to fetch localized information at the moment.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLocalizedInfo();
  }, [loadLocalizedInfo]);

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-10 font-sans text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold">Brooklyn snapshot</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Weather and nearest Citi Bike stations from public GBFS data.
          </p>
        </header>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void loadLocalizedInfo()}
            disabled={isLoading}
            className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            {isLoading ? "Loading..." : "Refresh"}
          </button>

          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Coordinates: {BROOKLYN.latitude.toFixed(4)}, {BROOKLYN.longitude.toFixed(4)}
          </p>
        </div>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
            {error}
          </p>
        )}

        {localizedData && (
          <section className="grid gap-4 md:grid-cols-2">
            <article className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Weather
              </h2>
              {localizedData.weather ? (
                <div className="mt-3 space-y-1">
                  <p className="text-3xl font-semibold">
                    {localizedData.weather.temperature.toFixed(1)} C
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300">
                    {weatherLabel} - Wind {localizedData.weather.windSpeed} km/h
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Updated {new Date(localizedData.weather.time).toLocaleTimeString()}
                  </p>
                </div>
              ) : (
                <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
                  Weather data is currently unavailable for your location.
                </p>
              )}
            </article>

            <article className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Citi Bike (nearest)
              </h2>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Data via{" "}
                <a
                  className="underline decoration-zinc-400 underline-offset-2 hover:text-zinc-700 dark:hover:text-zinc-200"
                  href="https://gbfs.citibikenyc.com/gbfs/2.3/gbfs.json"
                  target="_blank"
                  rel="noreferrer"
                >
                  NYC Citi Bike GBFS
                </a>
              </p>
              {localizedData.citibikeStations.length > 0 ? (
                <ul className="mt-3 space-y-2">
                  {localizedData.citibikeStations.map((station) => (
                    <li
                      key={station.stationId}
                      className="rounded-md bg-zinc-100 px-3 py-2 text-sm dark:bg-zinc-800"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-medium leading-snug">{station.name}</span>
                        <span className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400">
                          {formatDistanceMeters(station.distanceMeters)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                        {station.bikesAvailable} classic bikes
                        {station.ebikesAvailable > 0
                          ? `, ${station.ebikesAvailable} e-bikes`
                          : ""}
                        {" · "}
                        {station.docksAvailable} docks free
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
                  {localizedData.citibikeMessage ??
                    "No Citi Bike stations found for this area."}
                </p>
              )}
            </article>
          </section>
        )}

        {localizedData?.locationName && (
          <footer className="text-xs text-zinc-500 dark:text-zinc-400">
            Location: {localizedData.locationName}
          </footer>
        )}
      </main>
    </div>
  );
}
