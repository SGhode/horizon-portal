import { ApiError } from "@/lib/types/api";

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
}

export class ApiClientError extends Error implements ApiError {
  status?: number;
  code?: string;
  details?: unknown;

  constructor(message: string, status?: number, code?: string, details?: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function getBaseUrl(): string {
  // Browser requests go through this Next.js app so server-only backend URLs stay private.
  if (typeof window !== "undefined") {
    return "/api";
  }
  // Server-side
  return "http://localhost:3000/api";
}

function buildUrl(path: string, params?: RequestOptions["params"]): string {
  const baseUrl = getBaseUrl().replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${baseUrl}${normalizedPath}`, typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

  if (params) {
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        url.searchParams.append(key, String(val));
      }
    });
  }

  return url.toString();
}

export async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, headers, ...restOptions } = options;
  const fullUrl = buildUrl(path, params);

  const defaultHeaders: HeadersInit = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  try {
    const response = await fetch(fullUrl, {
      ...restOptions,
      credentials: restOptions.credentials ?? "same-origin",
      headers: {
        ...defaultHeaders,
        ...headers,
      },
    });

    if (!response.ok) {
      let errorMessage = `HTTP error ${response.status}: ${response.statusText}`;
      let errorDetails: unknown = null;

      try {
        const errorJson = await response.json();
        if (errorJson && typeof errorJson === "object") {
          errorMessage = errorJson.message || errorJson.error || errorMessage;
          errorDetails = errorJson;
        }
      } catch {
        // Response was not JSON
      }

      if (response.status === 401 && typeof window !== "undefined" &&
        !path.startsWith("/auth/login") && !path.startsWith("/auth/logout")) {
        const returnTo = `${window.location.pathname}${window.location.search}`;
        window.dispatchEvent(
          new CustomEvent("peopleportal:unauthorized", {
            detail: {
              returnTo: returnTo.startsWith("/") ? returnTo : "/dashboard",
            },
          })
        );
      }

      throw new ApiClientError(errorMessage, response.status, response.statusText, errorDetails);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    const data = await response.json();
    return data as T;
  } catch (err: unknown) {
    if (err instanceof ApiClientError) {
      throw err;
    }

    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiClientError("Request was cancelled", 0, "ABORT_ERROR");
    }

    const message = err instanceof Error ? err.message : "An unexpected network error occurred";
    throw new ApiClientError(
      message.includes("fetch") ? "Failed to connect to the server. Please check your network connection." : message,
      0,
      "NETWORK_ERROR"
    );
  }
}

export function apiGet<T>(path: string, options?: RequestOptions): Promise<T> {
  return request<T>(path, { ...options, method: "GET" });
}

export function apiPost<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
  return request<T>(path, {
    ...options,
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function apiPut<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
  return request<T>(path, {
    ...options,
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function apiDelete<T>(path: string, options?: RequestOptions): Promise<T> {
  return request<T>(path, { ...options, method: "DELETE" });
}
