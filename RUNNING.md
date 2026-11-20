# Continuar el curso localmente

Este repositorio personal incorpora el código y el historial de `main` del [repositorio del profesor ememc/course-sdd](https://github.com/ememc/course-sdd). Las carpetas `specs/`, `openspec/`, `.specify/` y `.gemini/` también forman parte del material original. No es necesario ejecutar instrucciones de asistentes para abrir la aplicación.

La aplicación tiene un backend ASP.NET Core con SQL Server y un frontend React/Vite. Las correcciones de este fork permiten instalar las dependencias del frontend, inicializar los usuarios de ejemplo, generar Swagger y conectar el servidor de desarrollo con la API. No se modificó el objetivo del curso ni se sustituyó el motor SQL Server.

## Requisitos

- Visual Studio 2022 con herramientas web y SDK .NET 8, o un SDK compatible para compilar los proyectos `net8.0`.
- Runtime ASP.NET Core 8 para ejecutar con la configuración predeterminada de .NET.
- SQL Server LocalDB o una instancia SQL Server de desarrollo.
- Node 24 y npm 11. Usa VS Code, Antigravity o tu editor habitual para el frontend.

## Backend en una base dedicada

La aplicación aplica migraciones y carga usuarios de ejemplo al arrancar. Además ejecuta una limpieza periódica de borradores. Usa una base desechable de desarrollo, nunca una conexión de producción.

```powershell
# Crear una instancia separada una sola vez, si usas LocalDB:
sqllocaldb create GHCourseSDD -s
cd backend/src/API
$env:ASPNETCORE_ENVIRONMENT = 'Development'
$env:ConnectionStrings__DefaultConnection = 'Server=(localdb)\GHCourseSDD;Database=CourseSDDLocal;Trusted_Connection=True;TrustServerCertificate=True'
# Clave aleatoria para esta sesión, sin guardarla en Git:
$env:JwtSettings__Secret = [Guid]::NewGuid().ToString('N') + [Guid]::NewGuid().ToString('N')
dotnet run --no-launch-profile --urls http://127.0.0.1:5081
```

Abre `http://127.0.0.1:5081/swagger`. En Visual Studio abre `backend/backend.sln`, establece API como inicio y configura las mismas variables de entorno mediante un perfil local. No publiques claves en `launchSettings.json` ni en `appsettings.json`.

Usuarios iniciales para la base de práctica: `admin@test.com` / `Admin@123!`, `supervisor1@test.com` / `Sup@123!` y `empleado1@test.com` / `Emp@123!`. Son datos públicos de demostración del curso; no uses esas cuentas en un despliegue accesible por Internet.

## Frontend en una segunda terminal

```powershell
cd frontend
npm ci --ignore-scripts
npm run build
npm run lint
npm run dev -- --host 127.0.0.1
```

Abre la URL que muestra Vite. Su proxy envía `/api` al backend en `127.0.0.1:5081`; ambos procesos deben estar activos. Para producción debes configurar por separado el alojamiento, HTTPS, el proxy de API, credenciales, base de datos y cuentas reales. La salida `dist/` por sí sola no incluye el backend.

## Comprobaciones y continuación

Con el backend activo en modo Development y la base de práctica inicializada, ejecuta desde la raíz `python tools/smoke-local.py`. No crea solicitudes ni modifica registros; comprueba Swagger, rechazo de una contraseña incorrecta, login de demostración y consulta autenticada.

Se verifican la compilación de los cuatro proyectos .NET, la compilación del frontend, Swagger, el inicio de sesión y una consulta autenticada en una base LocalDB aislada. El lint conserva advertencias del material de clase; compilar y estas pruebas no certifican todos los flujos de negocio.

`origin` es tu repositorio personal. `upstream` contiene el material del profesor y tiene push deshabilitado localmente. Para seguir nuevas clases, descarga e integra `upstream/main` en una rama de trabajo y conserva tus ejercicios. El repositorio no contiene necesariamente los vídeos; usa los enlaces que te facilite el profesor.

<!-- improvements-20261119:start -->
## Mejoras y verificación — 2026-11-19 (Mejoras de accesibilidad y manejo de teclado en Login y Header React)

- En `Login.tsx`: añadido botón accesible para mostrar/ocultar contraseña, alerta `role="alert" aria-live="polite"`, atributos `autoComplete` y limpieza de espacios en el correo.
- En `Header.tsx`: añadido cierre con tecla `Escape`, atributos ARIA (`aria-expanded`, `aria-haspopup`, `role="menu"`) y navegación resiliente ante fallos transitorios al marcar notificaciones.
- Validación: `npm run build` (`tsc -b && vite build`) y `npm run lint` (`oxlint`) en `frontend/` aprobados sin errores.
<!-- improvements-20261119:end -->
