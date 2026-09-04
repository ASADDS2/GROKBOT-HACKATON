const CLAVE = 'gota_sesion_id'

export function getSesionId(): string {
  const previa = sessionStorage.getItem(CLAVE)
  if (previa) return previa
  const id = crypto.randomUUID()
  sessionStorage.setItem(CLAVE, id)
  return id
}
