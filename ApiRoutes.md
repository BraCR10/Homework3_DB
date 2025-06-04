# Documentación API - Sistema de Planillas

**URL Base**: `http://localhost:3001`

## Autenticación

### Login
```
POST /api/v2/login
```

**Descripción**: Inicia sesión de usuario en el sistema.

**Parámetros**: Ninguno

**Body**:
```json
{
  "Username": "string",
  "Password": "string"
}
```

**Respuesta exitosa** (200 OK):
```json
{
  "success": true,
  "data": {
    "loginStatus": {
      "Id": 1,
      "Username": "username",
      "Role": "Admin", //Admin o Employee
      "EmployeeId": 123
    }
  }
}
```

**Respuesta fallida** (401 Unauthorized):
```json
{
  "success": false,
  "error": {
    "code": 5001,
    "detail": "El usuario o contraseña son incorrectos"
  }
}
```

### Logout
```
POST /api/v2/logout
```

**Descripción**: Cierra la sesión del usuario actual.

**Parámetros**: Ninguno

**Body**: Ninguno

**Respuesta exitosa** (200 OK):
```json
{
  "success": true,
  "message": "Sesión cerrada exitosamente"
}
```

## Empleados

### Listar Empleados (Admin)
```
GET /api/v2/employees
```

**Descripción**: Lista todos los empleados con información básica.

**Parámetros**: Ninguno

**Body**: Ninguno

**Respuesta exitosa** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "Id": 1,
      "Name": "Juan Pérez",
      "Position": "Desarrollador",
      "Department": "IT",
      "IsActive": true
    }
  ]
}
```

### Listar Empleados con Filtro (Admin)
```
GET /api/v2/employees/search?filter={searchTerm}
```

**Descripción**: Busca empleados por nombre con filtro de texto.

**Body**: Ninguno


**Parámetros de query**: 
- `filter` (string): Término de búsqueda para filtrar por nombre

**Respuesta exitosa** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "Id": 1,
      "Name": "Juan Pérez",
      "Position": "Desarrollador",
      "Department": "IT",
      "IsActive": true
    }
  ]
}
```

### Obtener Empleado por ID (Admin)
```
GET /api/v2/employees/{id}
```

**Descripción**: Obtiene información detallada de un empleado específico.

**Parámetros**:
- `id` (int): ID del empleado

**Respuesta exitosa** (200 OK):
```json
{
  "success": true,
  "data": {
    "Id": 1,
    "Name": "Juan Pérez",
    "DocumentType": "Cedula",
    "DocumentValue": "123456789",
    "BirthDate": "1990-01-15",
    "Position": "Desarrollador",
    "Department": "IT",
    "IsActive": true
  }
}
```

### Crear Empleado (Admin)
```
POST /api/v2/employees
```

**Descripción**: Crea un nuevo empleado. Se asignan automáticamente las deducciones obligatorias.

**Body**:
```json
{
  "Name": "string",
  "DocumentTypeId": 1,
  "DocumentValue": "string",
  "BirthDate": "YYYY-MM-DD",
  "PositionId": 1,
  "DepartmentId": 1
}
```

**Respuesta exitosa** (201 Created):
```json
{
  "success": true,
  "data": {
    "Id": 1,
    "Name": "Juan Pérez",
    "Message": "Empleado creado exitosamente con deducciones obligatorias asignadas"
  }
}
```

### Actualizar Empleado (Admin)
```
PUT /api/v2/employees/{id}
```

**Descripción**: Actualiza la información de un empleado existente.

**Parámetros de URL**:
- `id` (int): ID del empleado

**Body**:
```json
{
  "Name": "string",
  "DocumentTypeId": 1,
  "DocumentValue": "string",
  "BirthDate": "YYYY-MM-DD",
  "PositionId": 1,
  "DepartmentId": 1
}
```

**Respuesta exitosa** (200 OK):
```json
{
  "success": true,
  "message": "Empleado actualizado exitosamente"
}
```

### Eliminar Empleado (Admin)
```
DELETE /api/v2/employees/{id}
```

**Descripción**: Realiza eliminación lógica del empleado.

**Parámetros de URL**:
- `id` (int): ID del empleado

**Respuesta exitosa** (200 OK):
```json
{
  "success": true,
  "message": "Empleado eliminado exitosamente"
}
```

### Impersonar Empleado (Admin)
```
POST /api/v2/employees/{id}/impersonate
```

**Descripción**: Permite al administrador impersonar a un empleado específico.

**Parámetros de URL**:
- `id` (int): ID del empleado a impersonar

**Respuesta exitosa** (200 OK):
```json
{
  "success": true,
  "data": {
    "impersonationToken": "string",
    "employeeInfo": {
      "Id": 1,
      "Name": "Juan Pérez",
      "Position": "Desarrollador"
    }
  }
}
```

### Terminar Impersonación (Admin)
```
POST /api/v2/employees/stop-impersonation
```

**Descripción**: Termina la impersonación y regresa al dashboard de administrador.

**Respuesta exitosa** (200 OK):
```json
{
  "success": true,
  "message": "Impersonación terminada exitosamente"
}
```

## Deducciones

### Asociar Deducción a Empleado (Admin)
```
POST /api/v2/employees/{employeeId}/deductions/{deductionId}
```

**Descripción**: Asocia una deducción no obligatoria a un empleado. Se aplica a partir de la siguiente semana.

**Parámetros de URL**:
- `employeeId` (int): ID del empleado
- `deductionId` (int): ID del tipo de deducción

**Body**:
```json
{
  "Amount": 50000.00
}
```

**Respuesta exitosa** (200 OK):
```json
{
  "success": true,
  "message": "Deducción asociada exitosamente. Se aplicará a partir de la siguiente semana."
}
```

### Desasociar Deducción de Empleado (Admin)
```
DELETE /api/v2/employees/{employeeId}/deductions/{deductionId}
```

**Descripción**: Desasocia una deducción no obligatoria de un empleado. Se deja de aplicar a partir de la siguiente semana.

**Parámetros de URL**:
- `employeeId` (int): ID del empleado
- `deductionId` (int): ID del tipo de deducción

**Respuesta exitosa** (200 OK):
```json
{
  "success": true,
  "message": "Deducción desasociada exitosamente. Se dejará de aplicar a partir de la siguiente semana."
}
```

## Planillas

### Consultar Planillas Semanales (Usuario/Empleado)
```
GET /api/v2/payroll/weekly
```

**Descripción**: Obtiene las últimas 15 planillas semanales del empleado.

**Respuesta exitosa** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "WeekNumber": 1,
      "Year": 2025,
      "StartDate": "2025-01-02",
      "EndDate": "2025-01-08",
      "GrossSalary": 150000.00,
      "TotalDeductions": 25000.00,
      "NetSalary": 125000.00,
      "OrdinaryHours": 40,
      "NormalExtraHours": 5,
      "DoubleExtraHours": 2
    }
  ]
}
```

### Detalle de Deducciones Semanales (Usuario/Empleado)
```
GET /api/v2/payroll/weekly/{weekId}/deductions
```

**Descripción**: Obtiene el detalle de deducciones de una semana específica.

**Parámetros de URL**:
- `weekId` (int): ID de la semana

**Respuesta exitosa** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "DeductionType": "Caja del Seguro",
      "Percentage": 10.5,
      "Amount": 15750.00
    },
    {
      "DeductionType": "Cuota Asociación Solidarista",
      "Percentage": 5.0,
      "Amount": 7500.00
    }
  ]
}
```

### Detalle de Salario Bruto Semanal (Usuario/Empleado)
```
GET /api/v2/payroll/weekly/{weekId}/gross-detail
```

**Descripción**: Obtiene el detalle diario del salario bruto de una semana específica.

**Parámetros de URL**:
- `weekId` (int): ID de la semana

**Respuesta exitosa** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "Date": "2025-01-02",
      "EntryTime": "08:00",
      "ExitTime": "17:00",
      "OrdinaryHours": 8,
      "OrdinaryAmount": 20000.00,
      "NormalExtraHours": 1,
      "NormalExtraAmount": 3750.00,
      "DoubleExtraHours": 0,
      "DoubleExtraAmount": 0.00,
      "DayTotal": 23750.00
    }
  ]
}
```

### Consultar Planillas Mensuales (Usuario/Empleado)
```
GET /api/v2/payroll/monthly
```

**Descripción**: Obtiene las planillas mensuales de los últimos 12 meses.

**Respuesta exitosa** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "Month": 1,
      "Year": 2025,
      "MonthName": "Enero",
      "GrossSalary": 600000.00,
      "TotalDeductions": 100000.00,
      "NetSalary": 500000.00
    }
  ]
}
```

## Catálogos

### Tipos de Documento
```
GET /api/v2/catalogs/document-types
```

**Descripción**: Obtiene los tipos de documento de identidad disponibles.

**Respuesta exitosa** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "Id": 1,
      "Name": "Cédula Nacional"
    },
    {
      "Id": 2,
      "Name": "Pasaporte"
    }
  ]
}
```

### Puestos
```
GET /api/v2/catalogs/positions
```

**Descripción**: Obtiene los puestos disponibles.

**Respuesta exitosa** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "Id": 1,
      "Name": "Desarrollador",
      "HourlySalary": 2500.00
    },
    {
      "Id": 2,
      "Name": "Analista",
      "HourlySalary": 3000.00
    }
  ]
}
```

### Departamentos
```
GET /api/v2/catalogs/departments
```

**Descripción**: Obtiene los departamentos disponibles.

**Respuesta exitosa** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "Id": 1,
      "Name": "Tecnología"
    },
    {
      "Id": 2,
      "Name": "Recursos Humanos"
    }
  ]
}
```

### Tipos de Deducción
```
GET /api/v2/catalogs/deduction-types
```

**Descripción**: Obtiene los tipos de deducción disponibles.

**Respuesta exitosa** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "Id": 1,
      "Name": "Embargo por pensión alimenticia",
      "IsObligatory": false,
      "IsPercentage": false
    },
    {
      "Id": 2,
      "Name": "Caja del Seguro",
      "IsObligatory": true,
      "IsPercentage": true,
      "Percentage": 10.5
    }
  ]
}
```

## Simulación

### Ejecutar Simulación
```
POST /api/v2/simulation/execute
```

**Descripción**: Ejecuta la simulación con datos de prueba desde XML.

**Body**:
```json
{
  "XmlData": "string", // Contenido del XML de simulación
  "SimulationDate": "YYYY-MM-DD"
}
```

**Respuesta exitosa** (200 OK):
```json
{
  "success": true,
  "message": "Simulación ejecutada exitosamente",
  "data": {
    "ProcessedEmployees": 10,
    "ProcessedAttendances": 50,
    "GeneratedPayrolls": 2
  }
}
```

## Reportes CCSS

### Generar Reporte Mensual CCSS (Admin)
```
GET /api/v2/reports/ccss/monthly/{year}/{month}
```

**Descripción**: Genera el reporte mensual para la CCSS (último jueves del mes).

**Parámetros de URL**:
- `year` (int): Año del reporte
- `month` (int): Mes del reporte

**Respuesta exitosa** (200 OK):
```json
{
  "success": true,
  "data": {
    "ReportDate": "2025-01-30",
    "TotalEmployees": 25,
    "TotalGrossSalary": 5000000.00,
    "TotalCCSSDeductions": 525000.00,
    "Employees": [
      {
        "EmployeeId": 1,
        "Name": "Juan Pérez",
        "DocumentValue": "123456789",
        "MonthlyGrossSalary": 200000.00,
        "CCSSDeduction": 21000.00
      }
    ]
  }
}
```

## Códigos de Error

### Errores de Autenticación
- `5001`: Usuario o contraseña incorrectos
- `5002`: Token de acceso inválido o expirado
- `5003`: Acceso denegado - permisos insuficientes

### Errores de Validación
- `4001`: Datos de entrada inválidos
- `4002`: Empleado no encontrado
- `4003`: Deducción no encontrada
- `4004`: Empleado ya tiene esta deducción asignada
- `4005`: No se puede eliminar deducción obligatoria

### Errores del Sistema
- `5000`: Error interno del servidor
- `5003`: Error en la base de datos
- `5004`: Error en el procesamiento de la simulación

## Notas Importantes

1. **Jornadas**: El sistema maneja 3 tipos de jornadas (Vespertina, Matutina y Nocturna)
2. **Cálculo de Salarios**: 
   - Feriados duplican el salario base
   - Horas extra normales se pagan a 1.5x
   - Jornada nocturna se paga a 1.5x
   - Horas extra dobles (domingos/feriados) se pagan a 2x
3. **Procesamiento de Planillas**: Se ejecuta todos los jueves a medianoche
4. **Deducciones**:
   - Porcentuales: Se aplican cada semana sobre el salario bruto
   - Fijas: Se dividen entre la cantidad de jueves del mes
5. **Bitácora**: Todas las operaciones se registran en bitácora con detalles completos
6. **Reportes CCSS**: Se generan el último jueves de cada mes