# Aquanetix — Angular Migration

## ⚡ COMANDOS PARA ARRANCAR (en orden exacto)

### 1. Crear el proyecto Angular base

```bash
# En la carpeta donde quieras el proyecto
npm install -g @angular/cli@18
ng new aquanetix-angular --standalone --style=scss --routing=false --skip-tests
cd aquanetix-angular
```

### 2. Instalar dependencias adicionales

```bash
npm install @angular/material@18 @angular/cdk@18
npm install @ngx-translate/core @ngx-translate/http-loader
npm install json-server
```

### 3. Agregar Angular Material al proyecto

```bash
ng add @angular/material
# Cuando pregunte: elige "Indigo/Pink", YES a browser animations, YES a typography
```

### 4. Copiar los archivos de este proyecto

Copia TODO el contenido de esta carpeta encima del proyecto Angular recién creado:
- Reemplaza `src/` completo
- Reemplaza `angular.json`
- Reemplaza `tsconfig.json` y `tsconfig.app.json`
- Agrega la carpeta `server/`

```
aquanetix-angular/
├── angular.json
├── package.json         ← actualiza con las dependencias de aquí
├── tsconfig.json
├── tsconfig.app.json
├── server/
│   └── db.json          ← MISMO del proyecto Vue
└── src/
    ├── main.ts
    ├── index.html
    ├── styles.scss
    ├── environments/
    │   └── environment.ts
    └── app/
        ├── app.component.ts
        ├── app.config.ts
        ├── app.routes.ts
        ├── shared/
        │   ├── infrastructure/
        │   │   └── base-endpoint.ts
        │   └── presentation/components/
        │       ├── layout/layout.component.ts
        │       └── page-not-found/page-not-found.component.ts
        └── monitoring/
            ├── domain/model/
            │   ├── sensor.entity.ts
            │   ├── alert.entity.ts
            │   └── subscription.entity.ts
            ├── infrastructure/
            │   ├── sensor.assembler.ts
            │   └── alert.assembler.ts
            ├── application/
            │   └── monitoring.service.ts
            └── presentation/views/
                ├── dashboard-view/
                ├── sensor-list/
                ├── sensor-detail/
                ├── sensor-form/
                ├── alert-list/
                ├── alert-resolved/
                └── subscription-view/
```

### 5. Actualizar package.json

Agrega en `scripts`:
```json
"server": "json-server --watch server/db.json --port 3000"
```

### 6. Levantar el mock server (en terminal 1)

```bash
npm run server
# Corre en http://localhost:3000
```

### 7. Levantar Angular (en terminal 2)

```bash
ng serve
# Abre http://localhost:4200
```

---

## 🗺️ Equivalencias Vue → Angular

| Vue                          | Angular                              |
|------------------------------|--------------------------------------|
| `app.vue`                    | `app.component.ts`                   |
| `main.js` (bootstrap)        | `main.ts` + `app.config.ts`          |
| `router.js` + monitoring-routes | `app.routes.ts`                   |
| Pinia store                  | `MonitoringService` (Angular signals)|
| Vue components `.vue`        | Standalone components `.component.ts`|
| `vue-i18n`                   | `@ngx-translate/core`                |
| PrimeVue components          | Angular Material components          |
| Axios                        | `HttpClient` (Angular built-in)      |
| `BaseApi` + `BaseEndpoint`   | `BaseEndpoint<T>` (HttpClient)       |
| `ref()` / `computed()`       | Angular `signal()` / `computed()`    |

## 🏗️ Arquitectura (igual que Vue)

```
src/app/
├── shared/
│   ├── infrastructure/     ← BaseEndpoint genérico
│   └── presentation/       ← Layout, PageNotFound
└── monitoring/             ← Bounded context
    ├── domain/model/       ← Entidades: Sensor, Alert, Subscription
    ├── infrastructure/     ← Assemblers (mappers)
    ├── application/        ← MonitoringService (= store + api)
    └── presentation/views/ ← Componentes de pantalla
```

## 🌐 API

- **MockAPI** (producción): `https://6a01f74d0d92f63dd2531d8e.mockapi.io/api/v1`
- **JSON Server** (local): `http://localhost:3000`

Para usar local, edita `src/environments/environment.ts`:
```typescript
apiUrl: 'http://localhost:3000'
```

