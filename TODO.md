# TODO - Ajuste módulo Entregas API JSON

- [x] Actualizar `src/app/pages/modulos/entregas/entregas.ts`
  - [x] Cambiar payload a `{ puerta, protocolo, paciente }`
  - [x] Cambiar endpoint a `/entregas`
  - [x] Cambiar request de blob a JSON tipado
  - [x] Agregar estado de respuesta para mostrar en UI
- [x] Actualizar `src/app/pages/modulos/entregas/entregas.html`
  - [x] Mostrar bloque de resultado (filtros, total, estado PDF)
  - [x] Mantener mensaje de error
- [x] Agregar timeout de 10s en búsqueda de entregas
  - [x] Aplicar timeout al request HTTP
  - [x] Mostrar mensaje específico cuando hay timeout
  - [x] Rehabilitar botón para reintentar automáticamente al cortar por timeout
