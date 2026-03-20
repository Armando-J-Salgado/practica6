# Práctica 6 - Sistema de Gestión de Servicios y Reservas con Next.js

Una aplicación web moderna construida con **Next.js 16**, **React 19**, **Prisma 7** y **PostgreSQL** para gestionar servicios y sus reservas con validación automática de conflictos de horarios.

## 🎯 Descripción General

Este proyecto es un sistema integral de reservas que permite:

- **Gestionar Servicios**: Crear, listar y eliminar servicios con duración específica
- **Crear Reservas**: Solicitar reservas de servicios con validación automática de disponibilidad
- **Detectar Conflictos**: Prevenir solapamientos automáticamente comparando rangos de tiempo
- **Interfaz Moderna**: UI responsiva con Tailwind CSS y componentes optimizados

### Casos de Uso Principales

1. **Administrador crea un servicio** → Especifica nombre, descripción y duración (ej: 30 minutos)
2. **Usuario solicita una reserva** → Elige servicio y fecha/hora
3. **Sistema valida automáticamente** → Comprueba si el horario está disponible
4. **Reserva confirmada** → Se registra en la base de datos

## 📁 Arquitectura de Carpetas

```
practica6/
├── app/
│   ├── layout.tsx                 # Layout raíz con Nav
│   ├── page.tsx                   # Página principal (dashboard)
│   ├── globals.css                # Estilos globales
│   │
│   ├── actions/
│   │   ├── reservas.ts            # Server Actions para reservas
│   │   └── servicios.ts           # Server Actions para servicios
│   │
│   ├── components/
│   │   └── nav.tsx                # Navegación principal
│   │
│   ├── servicios/
│   │   ├── page.tsx               # Listado de servicios
│   │   ├── boton-eliminar.tsx     # Botón eliminar servicio
│   │   └── nuevo/
│   │       └── page.tsx           # Crear nuevo servicio
│   │
│   └── reservas/
│       ├── page.tsx               # Listado de reservas
│       ├── boton-eliminar.tsx     # Botón eliminar reserva
│       ├── boton-confirmar.tsx    # Botón confirmar reserva
│       └── nueva/
│           ├── page.tsx           # Crear nueva reserva
│           └── formulario.tsx     # Componente de formulario
│
├── lib/
│   ├── prisma.ts                  # Cliente Prisma con PrismaPg
│   └── estilos.ts                 # Utilidades de estilos (Tailwind)
│
├── prisma/
│   ├── schema.prisma              # Definición de modelos (Servicio, Reserva)
│   └── migrations/                # Historial de migraciones
│
├── .env.local                      # Variables de entorno (NO versionado)
├── package.json                   # Dependencias
├── tsconfig.json                  # Configuración TypeScript
├── next.config.ts                 # Configuración Next.js
└── README.md                       # Este archivo
```

## 🏗️ Conceptos de Next.js Implementados

### 1. **App Router**
- Routing basado en convenciones de carpetas (`app/` directory)
- Rutas dinámicas implícitas (ej: `app/servicios/nuevo/page.tsx` → `/servicios/nuevo`)

### 2. **Server Components y Server Actions**
- Componentes React que se renderizan en servidor (`default: "use server"`)
- **Server Actions**: `crearReserva()`, `eliminarReserva()`, `crearServicio()` ejecutadas en servidor
- Evita exponer lógica sensible al cliente

### 3. **Validación con Zod**
- Schema validation en `app/actions/reservas.ts` y `app/actions/servicios.ts`
- Mensajes de error reutilizables y tipados

### 4. **Revalidation Automática**
- `revalidatePath()`: Invalida el caché después de crear/eliminar
- `redirect()`: Redirecciona tras acción completada

### 5. **Server-Side Database Access**
- **Prisma ORM** (v7) con adaptador PostgreSQL (`@prisma/adapter-pg`)
- Queries ejecutadas en servidor, cliente nunca accede a BD directamente

### 6. **Styling Optimizado**
- **Tailwind CSS** v4 para estilos utility-first
- Global styles en `globals.css`
- Sin compilación de CSS en tiempo de ejecución

## 🔧 Principales Funciones y Acceso

### 📋 Servicios

| Funcionalidad | Ruta | Método | Descripción |
|---|---|---|---|
| Listar servicios | `/servicios` | GET | Ver todos los servicios disponibles |
| Crear servicio | `/servicios/nuevo` | POST (form) | Formulario para registrar nuevo servicio |
| Eliminar servicio | `/servicios` | DELETE (action) | Botón de eliminar en cada fila |

**Campos del modelo Servicio:**
- `id` (Int, PK)
- `nombre` (String, max 100)
- `descripcion` (String, nullable)
- `duracion` (Int, en minutos)
- `createdAt` (DateTime)
- Relación: `reservas[]`

### 📅 Reservas

| Funcionalidad | Ruta | Método | Descripción |
|---|---|---|---|
| Listar reservas | `/reservas` | GET | Ver todas las reservas (ordenadas por fecha) |
| Crear reserva | `/reservas/nueva` | POST (form) | Formulario para nueva reserva con validación de conflictos |
| Eliminar reserva | `/reservas` | DELETE (action) | Botón de eliminar en cada reserva |

**Campos del modelo Reserva:**
- `id` (Int, PK)
- `nombre` (String, max 100)
- `correo` (String, max 150)
- `fecha` (DateTime)
- `estado` (String, default: "pendiente")
- `servicioId` (Int, FK)
- `createdAt` (DateTime)
- Relación: `servicio` (Servicio)

### 🎯 Lógica de Validación de Conflictos

En `app/actions/reservas.ts`:

```ts
// Cálculo de rango de tiempo
const testedStart = new Date(campos.data.fecha);
const testedEnd = new Date(testedStart.getTime() + servicio.duracion * 60000);

// Detección de solapamiento con otras reservas del mismo servicio
const overlaps = existingStart <= testedStart && existingEnd >= testedStart;
```

**Regla**: Si la nueva reserva comienza dentro del rango `[existingStart, existingEnd)` de otra reserva, se rechaza.

## 📦 Instalación

### Requisitos Previos
- **Node.js** 20.19+ ó 22.12+ ó 24.0+
- **npm** 10+ (o `yarn`, `pnpm`, `bun`)
- **PostgreSQL** 13+ accesible localmente o por URL

### Pasos

1. **Clonar o descargar el proyecto:**
   ```bash
   cd practica6
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   
   Crea `.env.local` en la raíz:
   ```env
   DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/practica6"
   NODE_ENV="development"
   ```
   
   > **Nota**: Reemplaza `usuario`, `contraseña` y URL según tu setup de PostgreSQL

4. **Generar cliente Prisma:**
   ```bash
   npx prisma generate
   ```

5. **Ejecutar migraciones (crear tablas):**
   ```bash
   npx prisma migrate deploy
   ```
   
   Si es la primera vez:
   ```bash
   npx prisma migrate dev --name init
   ```

6. **(Opcional) Seed de datos de prueba:**
   ```bash
   npx prisma db seed
   ```

## 🚀 Lanzar la Aplicación

### Desarrollo

```bash
npm run dev
```

- Abre [http://localhost:3000](http://localhost:3000)
- La app se recarga automáticamente al editar archivos
- Modo debug activado en consola del servidor

### Compilación Producción

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## 📊 Modelo de Datos (Prisma Schema)

```prisma
model Servicio {
  id          Int       @id @default(autoincrement())
  nombre      String    @db.VarChar(100)
  descripcion String?
  duracion    Int       // en minutos
  createdAt   DateTime  @default(now())
  reservas    Reserva[]
}

model Reserva {
  id         Int      @id @default(autoincrement())
  nombre     String   @db.VarChar(100)
  correo     String   @db.VarChar(150)
  fecha      DateTime
  estado     String   @default("pendiente")
  servicioId Int
  servicio   Servicio @relation(fields: [servicioId], references: [id], onDelete: Cascade)
  createdAt  DateTime @default(now())
}
```

## 🔌 Stack Tecnológico

| Capa | Tecnología |
|---|---|
| **Framework** | Next.js 16 |
| **Runtime JS** | Node.js 20+ |
| **Componentes** | React 19 |
| **Estilos** | Tailwind CSS 4 |
| **ORM** | Prisma 7 |
| **BD** | PostgreSQL 13+ |
| **Validación** | Zod |
| **Lenguaje** | TypeScript 5 |

## 🛠️ Estructura de Server Actions

Las Server Actions están centralizadas en `app/actions/`:

1. **`crearReserva()`**
   - Valida entrada (nombre, correo, fecha, servicioId)
   - Calcula rango de tiempo: `[fecha, fecha + duracion]`
   - Busca conflictos con otras reservas
   - Retorna error si hay solapamiento
   - Crea reserva si es válida

2. **`eliminarReserva(id)`**
   - Elimina por ID con validación de error
   - Revalida caché de listado

3. **`crearServicio()`, `eliminarServicio()`**
   - Patrón similar a reservas

## 📝 Variables de Entorno Requeridas

```env
# Obligatorio
DATABASE_URL="postgresql://..."

# Opcional (defaults)
NODE_ENV="development"
```

## 🎓 Conceptos de Aprendizaje

- ✅ Server Components y Server Actions (sin API routes)
- ✅ Validación con Zod en backend
- ✅ Comparación de DateTime y cálculos de ranges
- ✅ Revalidation y caché en Next.js
- ✅ Prisma ORM con adaptador moderno
- ✅ Formularios con FormData y useActionState
- ✅ Relaciones One-to-Many en Prisma

## 📖 Recursos

- [Next.js 16 Docs](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zod Validation](https://zod.dev)

---

**Última actualización**: Marzo 2026  
**Versión**: 1.0.0
```

Este README es completamente fiel a tu proyecto actual y profesional. Úsalo directamente en tu repositorio. 🚀Este README es completamente fiel a tu proyecto actual y profesional. Úsalo directamente en tu repositorio. 🚀