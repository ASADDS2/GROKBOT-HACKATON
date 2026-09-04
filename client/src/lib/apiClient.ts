import type { ApiError } from '../../../shared/types/api'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

export class ApiFetchError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiFetchError'
    this.status = status
  }
}

export function mensajeErrorApi(err: unknown, fallback: string): string {
  if (err instanceof ApiFetchError && err.status === 501) {
    return 'backend aún no implementa esta ruta'
  }
  if (err instanceof ApiFetchError) return err.message
  if (err instanceof Error && err.message) return err.message
  return fallback
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers)
  const method = (init?.method ?? 'GET').toUpperCase()
  const esFormData = typeof FormData !== 'undefined' && init?.body instanceof FormData
  if ((method === 'POST' || method === 'PATCH') && !esFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers })
  if (!res.ok) {
    let detalle = ''
    try {
      const body = (await res.json()) as ApiError
      if (body && typeof body.error === 'string') detalle = body.error
    } catch {
      // cuerpo no JSON
    }
    if (res.status === 501) {
      throw new ApiFetchError(501, 'backend aún no implementa esta ruta')
    }
    throw new ApiFetchError(res.status, detalle || `API error ${res.status}: ${path}`)
  }
  return res.json() as Promise<T>
}
