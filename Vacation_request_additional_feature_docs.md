# Functionality: Vacation Requests

## Data Model

### Table SolicitudVacaciones

A table with the following structure is required:

- `Id` - INT IDENTITY(1,1) PRIMARY KEY
- `Estado` - VARCHAR(32) DEFAULT 'Pendiente' CHECK (Estado IN ('Pendiente', 'Aprobado', 'Rechazado'))
- `DNIEmpleado` - VARCHAR(64) UNIQUE
- `CantidadDias` - INT
- `FechaSolicitud` - DATETIME DEFAULT GETDATE()
- `FechaInicio` - DATETIME
- `FechaFin` - DATETIME

## Stored Procedures

### sp_crear_solicitudes_vacaciones

**Input parameters:**
- `@inValorDocumentoIdentidad VARCHAR(64)` - Employee's ID document
- `@inCantDias INT` - Number of days requested
- `@inFechaInicio`
- `@inFechaFin`
- `@outResultCode INT OUTPUT` - Operation result code

**Result codes:**
- `0` - Successful operation
- `50004` - Invalid ID document value
- `50008` - Employee doesn't exist in the system or database error
### *Return as detail the description of errors from the Error table in the recordset*

**Behavior:**
- Validate that the ID document is valid
- Verify that the employee exists in the system
- Create a new vacation request with 'Pendiente' status
- Does not return a recordset, only the result code

### sp_listar_solicitudes_vacaciones

**Input parameters:**
- `@outResultCode INT OUTPUT` - Operation result code

**Result:**
- Returns a recordset with all pending requests with the following structure:
  ```
  [
    {
      IdSolicitud: 1,
      Estado: "Pendiente",
      EmpleadoNombre: "Jose",
      EmpleadoDNI: "1254452",
      CantDias: 5
      FechaInicio: 
      FechaFin:
      FechaSolicitud: 
    },
    ...
  ]
  ```
- Result code 0 if the operation is successful

### sp_tramitar_solicitudes_vacaciones

**Input parameters:**
- `@inIdUsuario INT` - ID of the user processing the request
- `@inPostInIP VARCHAR(64)` - IP address from where the request is processed
- `@inIdSolicitud INT` - ID of the request to process
- `@inNuevoEstado VARCHAR(32)` - New status ('Aprobado' or 'Rechazado')
- `@outResultCode INT OUTPUT` - Operation result code

**Behavior:**
1. Validate that the user is ID 4 (Franco)
2. If the status is 'Rechazado', simply update the request
3. If the status is 'Aprobado':
   - Extract the number of days and the employee's ID from the request
   - Use movement type ID 4 (vacation enjoyment)
   - Call `sp_insertar_movimiento` with the corresponding parameters
   - Handle the result code from `sp_insertar_movimiento`
   - If successful, update the request as 'Aprobada'
4. Does not return a recordset, only the result code

**Result codes:**
- `0` - Successful operation
- `50015` - User must have permissions for processing
### *Return as detail the description of errors from the Error table in the recordset*

**Reference of the called SP:**
```
sp_insertar_movimiento
(
    @inValorDocumentoIdentidad VARCHAR(16),
    @inIdTipoMovimiento INT,
    @inMonto FLOAT,
    @inPostByUserId INT,
    @inPostInIP VARCHAR(64),
    @outResultCode INT OUTPUT
)
```

## API Routes

### Create vacation request
```
POST /api/v2/vacation_request
```

**Description**: Creates a new vacation request.

**Body**:
```json
{
  "ValorDocumentoIdentidad": "string",
  "CantidadDias": "number"
  "FechaInicio": date
  "FechaFin": date
}
```

**Successful response** (201 Created):
```json
{
  "success": true,
  "data": {
    "message": "Solicitud de vacaciones creada exitosamente"
  }
}
```

**Failed response** (400 Bad Request):
```json
{
  "success": false,
  "error": {
    "code": 50008,
    "detail": "Valor de documento de identidad no válido"
  }
}
```

### List vacation requests
```
GET /api/v2/vacation_request
```

**Description**: Gets the list of pending vacation requests.

**Successful response** (200 OK):
```json
{
  "success": true,
  "data": {
    "total": 2,
    "solicitudes": [
      {
        "IdSolicitud": 1,
        "Estado": "Pendiente",
        "EmpleadoNombre": "Jose",
        "EmpleadoDNI": "1254452",
        "CantDias": 5,
        "FechaInicio": ,
        "FechaFin": ,
        "FechaSoicitud": ,
      },
      {
        "IdSolicitud": 2,
        "Estado": "Pendiente",
        "EmpleadoNombre": "Maria",
        "EmpleadoDNI": "3265897",
        "CantDias": 3,
        "FechaInicio": ,
        "FechaFin": ,
        "FechaSoicitud" ,
      }
    ]
  }
}
```

### Process vacation request
```
PATCH /api/v2/vacation_request/:idSolicitud
```

**Description**: Processes a vacation request (approves or rejects).

**Parameters**:
- `idSolicitud`: ID of the request to process

**Body**:
```json
{
  "IdUsuario": "number",
  "NuevoEstado": "string" // "Aprobado" or "Rechazado"
}
```

**Successful response** (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "Solicitud de vacaciones procesada exitosamente"
  }
}
```

**Failed response** (403 Forbidden):
```json
{
  "success": false,
  "error": {
    "code": 50014,
    "detail": "Usuario no autorizado para tramitar solicitudes"
  }
}
```

**Failed response** (500 Server error):
```json
{
  "success": false,
  "error": {
    "code": 50011,
    "detail": "Monto del movimiento rechazado pues si se aplicar el saldo seria negativo."
  }
}
```
