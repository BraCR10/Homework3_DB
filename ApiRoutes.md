# Documentación API

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
  "detail": "Sesión finalizada correctamente"
}
```

## Empleados

### Obtener todos los empleados
```
GET /api/v2/employee
```

**Descripción**: Obtiene la lista de todos los empleados.

**Parámetros**: Ninguno

**Body**: Ninguno

**Respuesta exitosa** (200 OK):
```json
{
  "success": true,
  "data": {
    "total": 25,
    "empleados": [
      {
        "Id": 1,
        "IdPuesto": 1,
        "NombrePuesto": "",
        "ValorDocumentoIdentidad": "",
        "Nombre": "",
        "FechaContratacion": "",
        "SaldoVaciones": 15,
        "EsActivo": true
      },
      ...
    ]
  }
}
```

### Crear nuevo empleado
```
POST /api/v2/employee
```

**Descripción**: Crea un nuevo registro de empleado.

**Parámetros**: Ninguno

**Body**:
```json
{
  "IdPuesto": "number",
  "ValorDocumentoIdentidad": "string",
  "NombreEmpleado": "string"
}
```

**Respuesta exitosa** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "detail": "Empleado creado exitosamente"
  }
}
```

**Respuesta fallida** (400 Bad Request):
```json
{
  "success": false,
  "error": {
    "code": 5010,
    "detail": "El documento de identidad ya existe en el sistema",
  }
}
```

### Actualizar empleado
```
PATCH /api/v2/employee/:DNI
```

**Descripción**: Actualiza información de un empleado existente.

**Parámetros**: 
- `DNI`: DNI del empleado 


**Body**:
```json
{
  "IdPuestoNuevo": "number", 
  "ValorDocumentoIdentidadNuevo": "string", 
  "NombreEmpleadoNuevo": "string" 
}
```

**Respuesta exitosa** (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "Empleado actualizado correctamente",
    "updatedFields": [
            "NombrePuesto",
            "ValorDocumentoIdentidad",
            "NombreEmpleado"
        ]
  }
}
```

**Respuesta fallida** (404 Not Found):
```json
{
  "success": false,
  "error": {
    "code": 5009,
    "detail": "No se encontró el empleado con ID 1"
  }
}
```

### Eliminar empleado
```
DELETE /api/v2/employee/:IdEmpelado
```

**Descripción**: Elimina permanentemente un empleado.

**Parámetros**: 
- `DNI`: DNI del empleado 


**Body**: Ninguno

**Respuesta exitosa** (200 OK):
```json
{
  "success": true,
  "data": {
    "detail": "Empleado eliminado correctamente"
  }
}
```

### Intentar eliminar empleado (verificación)
```
POST /api/v2/employee/deleteTry/:IdEmpelado
```

**Descripción**: Verifica si un empleado puede ser eliminado sin afectar la integridad de datos.

**Parámetros**: 
- `IdEmpelado`: Id del empleado

**Body**: 
```json
{
  "IdUser": "number", 
}
```

**Respuesta exitosa** (200 OK):
```json
{
  "success": true,
  "data": {
    "canDelete": true,
    "detail": "El empleado puede ser eliminado sin conflictos"
  }
}
```

**Respuesta exitosa con advertencia** (200 OK):
```json
{
  "success": true,
  "data": {
    "canDelete": false,
    "detail": "El empleado no puede ser eliminado",
  }
}
```

### Buscar empleados por nombre
```
GET /api/v2/employee/name/:employeeName
```

**Descripción**: Busca empleados por nombre o parte del nombre.

**Parámetros**:
- `employeeName`: Nombre o parte del nombre del empleado

**Body**: Ninguno

**Respuesta exitosa** (200 OK):
```json
{
  "success": true,
  "data": {
    "total": 3,
    "empleados": [
      {
        "Id": 1,
        "IdPuesto": 1,
        "NombrePuesto": "",
        "ValorDocumentoIdentidad": "",
        "Nombre": "",
        "FechaContratacion": "",
        "SaldoVaciones": 15,
        "EsActivo": true
      },
      // Más empleados...
    ]
  }
}
```

### Buscar empleados por DNI
```
GET /api/v2/employee/DNI/:employeeDNI
```

**Descripción**: Busca empleados por documento de identidad.

**Parámetros**:
- `employeeDNI`: Valor del documento de identidad

**Body**: Ninguno

**Respuesta exitosa** (200 OK):
```json
{
  "success": true,
  "data": {
    "total": 1,
    "empleados": [
      {
        "Id": 1,
        "IdPuesto": 1,
        "NombrePuesto": "",
        "ValorDocumentoIdentidad": "",
        "Nombre": "",
        "FechaContratacion": "",
        "SaldoVaciones": 1,
        "EsActivo": true
      }
    ]
  }
}
```

## Movimientos

### Obtener movimientos de un empleado
```
GET /api/v2/movement/:DNI
```

**Descripción**: Obtiene todos los movimientos asociados a un empleado específico.

**Parámetros**:
- `DNI`: DNI del empleado

**Body**: Ninguno

**Respuesta exitosa** (200 OK):
```json
{
  "success": true,
  "data": {
    "empleado": {
      "Id": 1,
      "Nombre": "Juan Pérez"
    },
    "total": 2,
    "movimientos": [
      {
        "Id": 123,
        "IdEmpleado": 1,
        "IdTipoMovimiento": 2,
        "NombreTipoMovimiento": "Vacaciones",
        "Fecha": "2024-03-10T00:00:00Z",
        "Monto": 3,
        "NuevoSaldo": 12,
        "IdPostByUser": 5,
        "UsernamePostByUser": "admin",
        "PostInIp": "192.168.1.5",
        "PostTime": "2024-03-10T14:30:22Z"
      },
      // Más movimientos...
    ]
  }
}
```

### Crear nuevo movimiento
```
POST /api/v2/movement/
```

**Descripción**: Registra un nuevo movimiento para un empleado.

**Parámetros**: Ninguno

**Body**:
```json
{
  "IdTipoMovimiento": "number",
  "Monto": "number",
  "DNIEmpleado": "string",
  "IdUser": "number"
}
```

**Respuesta exitosa** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": 124,
    "message": "Movimiento registrado correctamente",
  }
}
```

**Respuesta fallida** (400 Bad Request):
```json
{
  "success": false,
  "error": {
    "code": 5999,
    "detail": "Saldo insuficiente para realizar esta operación"
  }
}
```

## Catálogos

### Obtener tipos de movimiento
```
GET /api/v2/movementType
```

**Descripción**: Obtiene la lista de todos los tipos de movimiento disponibles.

**Parámetros**: Ninguno

**Body**: Ninguno

**Respuesta exitosa** (200 OK):
```json
{
  "success": true,
  "data": {
    "total": 3,
    "tiposMovimiento": [
      {
        "Id": 1,
        "Nombre": "Asignación",
        "TipoAccion": "SUMA"
      },
      {
        "Id": 2,
        "Nombre": "Vacaciones",
        "TipoAccion": "RESTA"
      },
      {
        "Id": 3,
        "Nombre": "Ajuste",
        "TipoAccion": "NEUTRO"
      }
    ]
  }
}
```

### Obtener puestos
```
GET /api/v2/position
```

**Descripción**: Obtiene la lista de todos los puestos disponibles.

**Parámetros**: Ninguno

**Body**: Ninguno

**Respuesta exitosa** (200 OK):
```json
{
  "success": true,
  "data": {
    "total": 4,
    "puestos": [
      {
        "Id": 1,
        "Nombre": "Gerente",
        "SalarioPorHora": 25.50
      },
      {
        "Id": 2,
        "Nombre": "Analista",
        "SalarioPorHora": 18.75
      },
      {
        "Id": 3,
        "Nombre": "Desarrollador",
        "SalarioPorHora": 20.00
      },
      {
        "Id": 4,
        "Nombre": "Diseñador",
        "SalarioPorHora": 19.25
      }
    ]
  }
}
```

### TODO: Continue with aditional routes