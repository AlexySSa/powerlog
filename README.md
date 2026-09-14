# PowerLog

Aplicación web de planificación y seguimiento de powerlifting, como complemento de Hevy. Conserva la base existente: Next.js 16.2, React 19, TypeScript estricto, Tailwind CSS 4, Recharts y Prisma/MySQL. No hay integración automática con Hevy.

## Inicio rápido sin cuenta

Requiere Node.js 22 y npm. Desde esta carpeta:

```bash
npm ci
npm run db:generate
npm run dev
```

Abre http://localhost:3000/auth y elige **Empezar sin cuenta**. Introduce nombre, peso corporal y las tres marcas iniciales; la opción de demostración usa 405/275/365 lb convertidas a kg. Se crea un ciclo de ocho semanas. La demo no incluye entrenamientos históricos ficticios.

No necesitas MySQL ni credenciales para el modo local. Los registros se guardan en `localStorage`, con validación y versión de formato. Al salir del modo local se conservan; **borrar los datos del navegador los elimina**. No hay sincronización entre equipos ni migración automática hacia una cuenta.

El modo local no hace llamadas a la API para leer o guardar entrenamientos una vez cargado. **Todavía no hay service worker: abrir o recargar la aplicación sin conexión al servidor no está garantizado.**

## Flujo disponible

1. Configura o retoma el perfil local en `/auth`.
2. Consulta el bloque y la próxima sesión en Inicio (`/dashboard`).
3. Inicia una sesión desde Inicio o Ciclos: se precargan ciclo, semana, día, ejercicios, series y repeticiones.
4. Revisa la prescripción e introduce los pesos y RPE realmente realizados. Puedes añadir o quitar ejercicios y usar el temporizador de descanso.
5. Guarda y abre Progreso: volumen, e1RM por levantamiento y marcas reales separadas.
6. Registra recuperación, PRs y una evaluación semanal desde sus pantallas.

El porcentaje semanal cuenta días de sesión **registrados**, no certifica que se haya completado toda la prescripción. Las cargas realizadas comienzan en cero para que el atleta las introduzca; las recomendaciones nunca modifican el ciclo automáticamente.

## Plantilla

Los ciclos nuevos usan esta distribución:

| Semanas | Fase | RPE principal |
| --- | --- | --- |
| 1–3 | Acumulación y técnica | 6–7.5 |
| 4–6 | Intensificación | 7–8.5 |
| 7 | Descarga | 5–6 |
| 8 | Taper y evaluación técnica | 6–7 |

La semana 8 permite elegir manualmente una repetición controlada a RPE 8 como máximo. No prescribe intentos máximos ni incrementos automáticos. Las plantillas ya guardadas se conservan: los cambios de código solo afectan ciclos nuevos.

## Cálculos y decisiones

- `src/lib/training-math.ts`: e1RM, conversión kg/lb, porcentajes y propuesta prudente de progresión. Fórmula: Epley ajustado por repeticiones en reserva (`10 - RPE`); una repetición a RPE 10 devuelve el peso realizado. Sin RPE se asumen cero repeticiones en reserva. Es una estimación, especialmente incierta con muchas repeticiones o RPE bajo.
- La conversión usa 1 lb = 0.45359237 kg y no redondea el almacenamiento. La interfaz actual registra y muestra kg; el selector global de unidades sigue pendiente.
- `src/lib/metrics.ts`: fecha de sesión para ordenar rendimiento, semanas de siete días desde el inicio del ciclo, agregaciones semanales que distinguen años y resúmenes sin modificar el dataset.
- Las gráficas de e1RM excluyen las marcas reales; estas se muestran aparte. Los levantamientos se detectan por nombre y pueden agrupar variantes, incluido peso muerto rumano. Falta filtrado por variante y ejercicio normalizado.
- Las estimaciones históricas guardadas no se recalculan al actualizar la fórmula. La función de progresión exige confirmación en su contrato, pero aún no está conectada a una pantalla de aprobación.
- Se conserva Next.js porque el proyecto ya estaba desarrollado en esa tecnología. Esto es una aplicación web adaptable, no una aplicación Expo nativa.

## Modo servidor con cuentas (opcional)

Copia `.env.example` a `.env`, configura MySQL y reemplaza los valores de ejemplo. Nunca publiques `.env`.

```env
DATABASE_URL="mysql://USER:PASSWORD@127.0.0.1:3306/powerlog_8_weeks"
AUTH_SECRET="un-secreto-largo-y-aleatorio"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Crea la base `powerlog_8_weeks` en MySQL; `mysql/init.sql` contiene el script de creación. Después:

```bash
npm run db:generate
npm run db:push
npm run dev
```

`db:push` modifica el esquema de la base configurada; úsalo en desarrollo. La autenticación utiliza bcrypt, JWT y cookies HttpOnly. Las API validan los formularios y comprueban que los ciclos relacionados pertenecen al usuario. Crear un ciclo y desactivar el anterior ocurre en una transacción.

El modo servidor existente se conserva; esta revisión no valida registro/login contra una instalación MySQL real ni certifica preparación para un despliegue público.

## Estructura

```text
src/app/                       Rutas, pantallas y API
src/components/forms/          Formularios y onboarding local
src/components/providers/      Sesión, datos, idioma y tema
src/components/sections/       Programa y listas
src/components/charts/         Gráficas reutilizables
src/lib/types.ts               Contratos del dominio existente
src/lib/local-data.ts          Persistencia local validada y versionada
src/lib/program.ts             Plantilla de ocho semanas
src/lib/cycle-utils.ts         Sesiones planificadas y fechas de ciclo
src/lib/training-math.ts       Cálculos puros
src/lib/metrics.ts             Resúmenes y series para gráficas
src/lib/api-validation.ts      Respuestas 400 para entradas inválidas
prisma/schema.prisma           Modelo MySQL
mysql/init.sql                 Creación de la base
scripts/run-tests.mjs          Compilación y ejecución de pruebas
tests/                         Pruebas de dominio, datos, fechas y validación
.github/workflows/ci.yml        Verificación en GitHub Actions
```

## Comandos de verificación

```bash
npm run lint
npm test
npm run build
npm run typecheck
```

Las pruebas utilizan `node:test`, se compilan con TypeScript en `.test-build` y no requieren MySQL. Cubren e1RM, unidades, porcentajes, progresión, calendario, agrupaciones, persistencia, corrupción de datos, errores de almacenamiento, validación de entradas y resolución de sesiones. GitHub Actions ejecuta instalación, generación Prisma, lint, pruebas, build y typecheck.

La revisión de septiembre de 2026 verificó 31 pruebas y el flujo en navegador: perfil local → sesión planificada → guardado → gráficas → recarga con persistencia. Incluye una regresión para fechas en `America/El_Salvador`. Los registros de prueba del navegador no se incluyen en el repositorio.

Para producción local:

```bash
npm run build
npm start
```

## Estado y plan por fases

Esta entrega es una mejora funcional de la base existente, **no el cumplimiento completo del documento MVP**.

- **Fase 1, integrada:** repositorio independiente; guardado local sin cuenta; onboarding básico y ciclo inicial; recorrido ciclo → entrenamiento → resultados → progreso; fórmulas y pruebas; separación real/estimado; validación API; documentación y CI.
- **Fase 2:** ciclos de 4–12 semanas y edición completa; cinco secciones principales; perfil con unidades, experiencia, días, variantes y objetivos; series individuales, calentamientos y estados completado/modificado/fallado.
- **Fase 3:** check-in de seis variables 1–5, indicador combinado de fatiga, revisión semanal automática, prioridad única y aprobación visible de ajustes; filtros de PR por variante/ciclo/RPE/fecha/tipo y gráficas adicionales.
- **Fase 4:** PWA con recarga offline verificada, exportación/copia de seguridad, migraciones, importación CSV y futura sincronización. Integración con Hevy solo si se verifica un mecanismo oficial.

Por ahora la recuperación conserva las escalas anteriores de 0–10/1–10 y la evaluación semanal es manual. El esquema todavía usa `Profile`, `Cycle`, `Workout`, agrupaciones `WorkoutSet`, `RecoveryLog`, `PRRecord` y `WeeklyReview`; falta normalizar todas las entidades del documento original. No se hacen diagnósticos médicos.
