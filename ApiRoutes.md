# Documentación API - Sistema de Planillas

**URL Base**: `http://localhost:3001`

## Headers Requeridos (Todas las rutas excepto login)
```javascript
{
  "User-Id": 123,
  "Content-Type": "application/json"
}
```

**Ejemplo de request completo**:
```javascript
// GET /api/v2/employees
{
  "headers": {
    "User-Id": "123",
    "Content-Type": "application/json"
  }
}
```

## Formato de Respuesta Estándar
```javascript
{
  "success": boolean,
  "data": any,
  "message": string,
  "timestamp": date
}
```

## Respuesta de Error Estándar
```javascript
{
  "success": false,
  "error": {
    "code": number,
    "detail": string
  },
  "timestamp": string
}
```

## Autenticación

### Login
```
POST /api/v2/login
```

**Body**:
```javascript
{
  "Username": string,
  "Password": string
}
```

**Respuesta**:
```javascript
{
  "success": true,
  "data": {
    "loginStatus": {
      "Id": number,
      "Username": string,
      "Role": string, // "Administrador" o "Empleado"
    }
  },
  "message": string,
  "timestamp": string
}
```

### Logout
```
POST /api/v2/logout
```

**Respuesta**:
```javascript
{
  "success": true,
  "message": "Sesión cerrada exitosamente",
  "timestamp": string
}
```

## Empleados

### Listar Empleados (Admin)
```
GET /api/v2/employees
```

**Respuesta**:
```javascript
{
  "success": true,
  "data": [
     {
      "Id": number,
      "Name": string,
      "DateBirth" : date
      "DNI": string,
      "Position": string,
      "Department": string,
    }
  ],
  "message": string,
  "timestamp": string
}
```

### Buscar Empleados (Admin)
```
GET /api/v2/employees/search?filter={searchTerm}
```

**Query Parameters**:
- `filter`: string - Término de búsqueda

**Respuesta**:
```javascript
{
  "success": true,
  "data": [
     {
      "Id": number,
      "Name": string,
      "DateBirth" : date
      "DNI": string,
      "Position": string,
      "Department": string,
    }
  ],
  "message": string,
  "timestamp": string
}
```

### Obtener Empleado por ID (Admin)
```
GET /api/v2/employees/{id}
```

**Path Parameters**:
- `id`: number - ID del empleado

**Respuesta**:
```javascript
{
  "success": true,
  "data": {
      "Id": number,
      "Name": string,
      "DateBirth" : date
      "DNI": string,
      "Position": string,
      "Department": string,
    },
  "message": string,
  "timestamp": string
}
```

### Crear Empleado (Admin)
```
POST /api/v2/employees
```

**Body**:
```javascript
{
  "Name": string,
  "NameUser": string,
  "PasswordUser": string,
  "DocumentTypeId": number,
  "DateBirth" : string?  //importante formatear YYYY-MM-DD
  "DocumentValue": string,
  "PositionId": number,
  "DepartmentId": number
}
```

**Respuesta**:
```javascript
{
  "success": true,
  "data": {
    "Id": number,
    "Name": string
  },
  "message": "Empleado creado exitosamente con deducciones obligatorias asignadas",
  "timestamp": string
}
```

### Actualizar Empleado (Admin)
```
PUT /api/v2/employees/{id}
```

**Path Parameters**:
- `id`: number - ID del empleado

**Body**:
```javascript
{
  "Name": string?,
  "DocumentTypeId": number?,
  "DateBirth" : date?
  "DocumentValue": string?,
  "PositionId": number?,
  "DepartmentId": number?
}
```

**Respuesta**:
```javascript
{
  "success": true,
  "message": "Empleado actualizado exitosamente",
  "data": {
    "Id": number,
    "Name": string
  },
  "timestamp": string
}
```

### Eliminar Empleado (Admin)
```
DELETE /api/v2/employees/{id}
```

**Path Parameters**:
- `id`: number - ID del empleado

**Respuesta**:
```javascript
{
  "success": true,
  "message": "Empleado eliminado exitosamente",
  "data': {},
  "timestamp": string
}
```

### Impersonar Empleado (Admin)
```
POST /api/v2/employees/{id}/impersonate
```

**Path Parameters**:
- `id`: number - ID del empleado a impersonar

**Respuesta**:
```javascript
{
  "success": true,
  "data": {
    "employeeInfo":  {
      "Name": string,
      "DateBirth" : date?
      "DNI": string,
      "Position": string,
      "Department": string,
    }
  },
  "message": string,
  "timestamp": string
}
```

### Terminar Impersonación (Admin)
```
POST /api/v2/employees/{id}/stop-impersonation
```



**Path Parameters**:
- `id`: number - ID del empleado

**Respuesta**:
```javascript
{
  "success": true,
  "message": "Impersonación terminada exitosamente",
  "data': {},
  "timestamp": string
}
```

## Planillas

### Consultar Planillas Semanales (Usuario/Empleado)
```
GET /api/v2/employees/{id}/payroll/weekly/
```

**Path Parameters**:
- `id`: number - ID del empleado

**Respuesta**:
```javascript
{
  "success": true,
  "data": [
    {
      "WeekId" : Number
      "StartDate": string, // YYYY-MM-DD
      "EndDate": string, // YYYY-MM-DD
      "GrossSalary": number,
      "TotalDeductions": number,
      "NetSalary": number,
      "OrdinaryHours": number,
      "NormalExtraHours": number,
      "DoubleExtraHours": number
    }
  ],
  "message": string,
  "timestamp": string
}
```

### Detalle de Deducciones Semanales (Usuario/Empleado)
```
GET /api/v2/employees/{id}/payroll/weekly/{weekId}/deductions
```

**Path Parameters**:
- `weekId`: number - ID de la semana
- `id`: number - ID del empleado

**Respuesta**:
```javascript
{
  "success": true,
  "data": [
    {
      "DeductionType": string,
      "isPercentage" : bool,
      "Percentage": number,
      "Amount": number
    }
  ],
  "message": string,
  "timestamp": string
}
```

### Detalle de Deducciones mensuales (Usuario/Empleado)
```
GET /api/v2/employees/{id}/payroll/monthly/{monthId}/deductions
```

**Path Parameters**:
- `monthId`: number - ID del mes
- `id`: number - ID del empleado

**Respuesta**:
```javascript
{
  "success": true,
  "data": [
    {
      "DeductionType": string,
      "isPercentage" : bool,
      "Percentage": number,
      "Amount": number
    }
  ],
  "message": string,
  "timestamp": string
}
```

### Detalle de Salario Bruto Semanal (Usuario/Empleado)
```
GET /api/v2/employees/{id}/payroll/weekly/{weekId}/gross-detail
```

**Path Parameters**:
- `weekId`: number - ID de la semana
- `id`: number - ID del empleado


**Respuesta**:
```javascript
{
  "success": true,
  "data": [
    {
      "DateDay": date, // YYYY-MM-DD
      "EntryTime": time, // HH:MM
      "ExitTime": time, // HH:MM
      "OrdinaryHours": number,
      "OrdinaryAmount": number,
      "NormalExtraHours": number,
      "NormalExtraAmount": number,
      "DoubleExtraHours": number,
      "DoubleExtraAmount": number,
      "DayTotal": number
    }
  ],
  "message": string,
  "timestamp": string
}
```

### Consultar Planillas Mensuales (Usuario/Empleado)
```
GET /api/v2/employees/{id}/payroll/monthly
```
**Path Parameters**:
- `id`: number - ID del empleado

**Respuesta**:
```javascript
{
  "success": true,
  "data": [
    {
      "Month": number,
      "Year": number,
      "MonthName": string,
      "GrossSalary": number,
      "TotalDeductions": number,
      "NetSalary": number,
      "IdMonth": number
    }
  ],
  "message": string,
  "timestamp": string
}
```

## Catálogos

### Tipos de Documento
```
GET /api/v2/catalogs/document-types
```

**Respuesta**:
```javascript
{
  "success": true,
  "data": [
    {
      "Id": number,
      "Name": string
    }
  ],
  "message": string,
  "timestamp": string
}
```

### Puestos
```
GET /api/v2/catalogs/positions
```

**Respuesta**:
```javascript
{
  "success": true,
  "data": [
    {
      "Id": number,
      "Name": string,
      "HourlySalary": number
    }
  ],
  "message": string,
  "timestamp": string
}
```

### Departamentos
```
GET /api/v2/catalogs/departments
```

**Respuesta**:
```javascript
{
  "success": true,
  "data": [
    {
      "Id": number,
      "Name": string
    }
  ],
  "message": string,
  "timestamp": string
}
```

### Tipos de Deducción
```
GET /api/v2/catalogs/deduction-types
```

**Respuesta**:
```javascript
{
  "success": true,
  "data": [
    {
      "Id": number,
      "Name": string,
      "IsObligatory": boolean,
      "IsPercentage": boolean,
      "Percentage": number? // Solo si IsPercentage es true
    }
  ],
  "message": string,
  "timestamp": string
}
```

## Notas Importantes

1. **User-Id Header**: Todas las rutas (excepto login) requieren el header `User-Id` con el ID del usuario autenticado
2. **Números Decimales**: Los montos se manejan como números decimales
