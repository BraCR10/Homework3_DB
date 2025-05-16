# DB POC Project ![TypeScript](https://img.shields.io/badge/TypeScript-%23007ACC?style=for-the-badge&logo=typescript&logoColor=white)

## Descripción / Description

📱 Este proyecto es una prueba de concepto (POC) que demuestra la implementación de una API REST para gestionar empleados, utilizando TypeScript, Express y SQL Server. La aplicación está dividida en dos partes: una API backend (db-poc-api) y una interfaz de usuario frontend (db-poc-ui) desarrollada con Next.js.

📱 This project is a proof of concept (POC) that demonstrates the implementation of a REST API to manage employees, using TypeScript, Express, and SQL Server. The application is divided into two parts: a backend API (db-poc-api) and a frontend user interface (db-poc-ui) developed with Next.js.

Bitacoras del proyecto: [Medium Blog](https://medium.com/@bracr10/list/pocdb1t1-ccd45d4c7d49)

## Tecnologías / Technologies

### Backend (db-poc-api)
- ![TypeScript](https://img.shields.io/badge/TypeScript-%23007ACC?style=for-the-badge&logo=typescript&logoColor=white) **TypeScript for strong typing**
- ![Express](https://img.shields.io/badge/Express-%23000000?style=for-the-badge&logo=express&logoColor=white) **Express for API development**
- ![SQL Server](https://img.shields.io/badge/SQL%20Server-%23CC2927?style=for-the-badge&logo=microsoft-sql-server&logoColor=white) **SQL Server for database**
- ![NodeJS](https://img.shields.io/badge/Node.js-%23339933?style=for-the-badge&logo=node.js&logoColor=white) **Node.js environment**

### Frontend (db-poc-ui)
- ![Next.js](https://img.shields.io/badge/Next.js-%23000000?style=for-the-badge&logo=next.js&logoColor=white) **Next.js 15 for frontend**
- ![React](https://img.shields.io/badge/React-%2361DAFB?style=for-the-badge&logo=react&logoColor=black) **React 19 for UI components**
- ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-%2338B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white) **TailwindCSS for styling**

## Funcionalidades / Features

- ✅ Creación de empleados / Employee creation
- ✅ Listado de empleados / Employee listing
- ✅ Ordenación por nombre / Sorting by name
- ✅ Consulta de empleado por ID / Employee query by ID
- ✅ Validación de datos / Data validation
- ✅ Manejo de errores / Error handling

## Estructura del Proyecto / Project Structure

```
db-poc/
├── db-poc-api/           # Backend API
│   ├── src/              # Source code
│   │   ├── config/       # Database configuration
│   │   ├── controllers/  # Route controllers
│   │   ├── models/       # Data models
│   │   ├── scripts/      # SQL scripts
│   │   ├── services/     # Business logic
│   │   ├── types/        # TypeScript types
│   │   ├── app.ts        # Application entry point
│   │   └── routes.ts     # API routes
│   └── package.json      # Backend dependencies
│
└── db-poc-ui/            # Frontend UI
    ├── app/              # Next.js application
    │   ├── globals.css   # Global styles
    │   ├── layout.tsx    # Root layout
    │   └── page.tsx      # Main page
    ├── public/           # Static assets
    └── package.json      # Frontend dependencies
```

## Instalación / Installation

### Backend (db-poc-api)

1. Clone el repositorio / Clone the repository:  
   `git clone <repository_url>`
2. Navegue al directorio de la API / Navigate to the API directory:  
   `cd db-poc-api`
3. Instale las dependencias / Install dependencies:  
   `npm install`
4. Configure las variables de entorno / Set up environment variables:  
   ```
   SQL_USER=your_username
   SQL_PASSWORD=your_password
   SQL_SERVER=your_server
   SQL_PORT=1433
   SQL_DATABASE=your_database
   ```
5. Ejecute el servidor de desarrollo / Run the development server:  
   `npm run dev`

### Frontend (db-poc-ui)

1. Navegue al directorio de la UI / Navigate to the UI directory:  
   `cd db-poc-ui`
2. Instale las dependencias / Install dependencies:  
   `npm install`
3. Ejecute el servidor de desarrollo / Run the development server:  
   `npm run dev`
4. Abra [http://localhost:3000](http://localhost:3000) en su navegador / Open in your browser

## API Endpoints

- `GET /api/health`: Verificar estado del servicio / Check service status
- `POST /api/employee`: Crear un nuevo empleado / Create a new employee
- `GET /api/employee`: Obtener todos los empleados / Get all employees
- `GET /api/employee/:id`: Obtener empleado por ID / Get employee by ID
- `GET /api/sorted_employees`: Obtener empleados ordenados por nombre / Get employees sorted by name

## Proyecto Didáctico / Educational Project

📚 Este proyecto es una prueba de concepto para demostrar la implementación de una API REST con TypeScript y Express, conectada a una base de datos SQL Server. El propósito es educativo y sirve como referencia para futuros desarrollos.

📚 This project is a proof of concept to demonstrate the implementation of a REST API with TypeScript and Express, connected to a SQL Server database. The purpose is educational and serves as a reference for future developments.

## Licencia / License

📜 Este proyecto está bajo la Licencia Pública General de GNU v3 (GPL v3). La GPL v3 protege el código contra el **plagio** al exigir que cualquier persona que redistribuya o modifique el código debe dar **crédito adecuado** a los autores originales. Si alguien utiliza el código sin dar el crédito correspondiente o lo redistribuye sin cumplir con los términos de esta licencia, estaría incurriendo en **plagio**. Además, cualquier modificación del código debe ser compartida bajo la misma licencia. Esto asegura que el trabajo original y cualquier derivado sigan siendo abiertos y accesibles para otros, y protege los derechos de los autores.

📜 This project is licensed under the GNU General Public License v3 (GPL v3). GPL v3 protects the code against **plagiarism** by requiring that anyone redistributing or modifying the code must give **proper attribution** to the original authors. If someone uses the code without giving the appropriate credit or redistributes it without complying with the terms of this license, they would be committing **plagiarism**. Additionally, any modification of the code must be shared under the same license. This ensures that the original work and any derivatives remain open and accessible to others, and protects the rights of the authors.

Consulta el archivo [LICENSE](./LICENSE) para más detalles.

GPL v3 License ![GPL v3](https://img.shields.io/badge/License-GPL%20v3-blue.svg?style=flat)
