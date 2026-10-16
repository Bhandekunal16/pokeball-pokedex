import {
  APIListResponse,
  APIResponseWrapper,
  NamedAPIResource,
  PokemonDetail,
  TypeDetail,
  MoveDetail,
  AbilityDetail,
  ItemDetail,
  LocationDetail,
  RegionDetail,
  ResourceCategory,
} from '../types/pokemon';

export const DEFAULT_API_BASE_URL = 'https://free-api-server.vercel.app/pokemon';
export const LOCAL_DEV_API_BASE_URL = 'http://localhost:3000/pokemon';
const STORAGE_KEY_API_URL = 'pokesphere_api_url';

export class ApiError extends Error {
  statusCode: number;
  url: string;

  constructor(message: string, statusCode: number, url: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.url = url;
  }
}

export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY_API_URL);
    if (saved && saved.trim()) return saved.trim();
  }
  return DEFAULT_API_BASE_URL;
}

export function setApiBaseUrl(url: string): void {
  if (typeof window !== 'undefined') {
    if (!url || url.trim() === DEFAULT_API_BASE_URL) {
      localStorage.removeItem(STORAGE_KEY_API_URL);
    } else {
      localStorage.setItem(STORAGE_KEY_API_URL, url.trim());
    }
  }
}

async function fetchFromApi<T>(endpointParams: Record<string, string | number | undefined>, signal?: AbortSignal): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const url = new URL(baseUrl);

  Object.entries(endpointParams).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      url.searchParams.set(key, String(val));
    }
  });

  const fullUrl = url.toString();

  try {
    const response = await fetch(fullUrl, {
      signal,
      headers: {
        Accept: 'application/json',
      },
    });

    const isJson = response.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await response.json() : null;

    if (!response.ok) {
      let errorMsg = `API Error (${response.status} ${response.statusText})`;
      if (response.status === 404) {
        errorMsg = 'Resource not found in the Pokémon database.';
      } else if (response.status === 500 || response.status === 502) {
        errorMsg = 'Upstream Pokémon server temporarily unavailable. Please retry.';
      } else if (data && data.message) {
        errorMsg = data.message;
      }
      throw new ApiError(errorMsg, response.status, fullUrl);
    }

    if (data && typeof data === 'object' && 'data' in data) {
      const wrapped = data as APIResponseWrapper<T>;
      if (wrapped.success === false) {
        throw new ApiError(wrapped.statusText || 'Failed to fetch resource', wrapped.statusCode || 400, fullUrl);
      }
      return wrapped.data;
    }

    return data as T;
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw err;
    }
    const message = err instanceof Error ? err.message : 'Network error: could not connect to Pokémon server.';
    throw new ApiError(message, 0, fullUrl);
  }
}

export async function getPokemonList(
  limit: number = 24,
  offset: number = 0,
  signal?: AbortSignal
): Promise<APIListResponse<NamedAPIResource>> {
  return fetchFromApi<APIListResponse<NamedAPIResource>>(
    {
      type: 'pokemon',
      limit,
      offset,
    },
    signal
  );
}

export async function getPokemonByNameOrId(value: string | number, signal?: AbortSignal): Promise<PokemonDetail> {
  const normalized = String(value).toLowerCase().trim();
  return fetchFromApi<PokemonDetail>(
    {
      type: 'pokemon',
      value: normalized,
    },
    signal
  );
}

export async function getResourceList<T = NamedAPIResource>(
  type: ResourceCategory | string,
  limit: number = 24,
  offset: number = 0,
  signal?: AbortSignal
): Promise<APIListResponse<T>> {
  return fetchFromApi<APIListResponse<T>>(
    {
      type,
      limit,
      offset,
    },
    signal
  );
}

export async function getResourceByValue<T = unknown>(
  type: ResourceCategory | string,
  value: string | number,
  signal?: AbortSignal
): Promise<T> {
  const normalized = String(value).toLowerCase().trim();
  return fetchFromApi<T>(
    {
      type,
      value: normalized,
    },
    signal
  );
}

export async function getPokemonByType(typeName: string, signal?: AbortSignal): Promise<TypeDetail> {
  const normalized = typeName.toLowerCase().trim();
  return fetchFromApi<TypeDetail>(
    {
      type: 'type',
      value: normalized,
    },
    signal
  );
}

export async function getMoveDetails(moveNameOrId: string | number, signal?: AbortSignal): Promise<MoveDetail> {
  return getResourceByValue<MoveDetail>('move', moveNameOrId, signal);
}

export async function getAbilityDetails(abilityNameOrId: string | number, signal?: AbortSignal): Promise<AbilityDetail> {
  return getResourceByValue<AbilityDetail>('ability', abilityNameOrId, signal);
}

export async function getItemDetails(itemNameOrId: string | number, signal?: AbortSignal): Promise<ItemDetail> {
  return getResourceByValue<ItemDetail>('item', itemNameOrId, signal);
}

export async function getLocationDetails(locationNameOrId: string | number, signal?: AbortSignal): Promise<LocationDetail> {
  return getResourceByValue<LocationDetail>('location', locationNameOrId, signal);
}

export async function getRegionDetails(regionNameOrId: string | number, signal?: AbortSignal): Promise<RegionDetail> {
  return getResourceByValue<RegionDetail>('region', regionNameOrId, signal);
}

export async function testApiConnection(targetUrl?: string): Promise<{ success: boolean; message: string; count?: number; latencyMs: number }> {
  const urlToTest = targetUrl || getApiBaseUrl();
  const start = performance.now();
  try {
    const url = new URL(urlToTest);
    url.searchParams.set('type', 'pokemon');
    url.searchParams.set('limit', '1');
    url.searchParams.set('offset', '0');

    const res = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
    });
    const latencyMs = Math.round(performance.now() - start);

    if (!res.ok) {
      return {
        success: false,
        message: `HTTP ${res.status}: ${res.statusText}`,
        latencyMs,
      };
    }

    const data = await res.json();
    const count = data?.data?.count || data?.count || 0;
    return {
      success: true,
      message: `Connected successfully (${latencyMs}ms)`,
      count,
      latencyMs,
    };
  } catch (err: unknown) {
    const latencyMs = Math.round(performance.now() - start);
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Connection failed',
      latencyMs,
    };
  }
}
