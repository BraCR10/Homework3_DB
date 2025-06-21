# Stored Procedures Documentation

Esta documentación describe los procedimientos almacenados (Stored Procedures) del sistema de gestión de empleados y planillas.

## Parámetros Comunes

Todos los procedimientos almacenados utilizan los siguientes parámetros comunes:
- `@outResultCode INT OUTPUT`: Código de resultado de la operación (0 = éxito, X = error)
- `@IdUsuario INT`: ID del usuario que ejecuta la operación
- `@IP VARCHAR(64)`: Dirección IP del cliente

## 1. Autenticación

### sp_login
**Descripción**: Autentica un usuario en el sistema.

**Parámetros**:
- `@outResultCode INT OUTPUT`: Código de resultado
- `@Usuario VARCHAR(64)`: Nombre de usuario
- `@Password VARCHAR(64)`: Contraseña del usuario
- `@IP VARCHAR(64)`: Dirección IP del cliente

**Respuesta Exitosa** (`@outResultCode = 0`):
```json
{
  "Id": "number",
  "Username": "string", 
  "Role": "string"
}
```

**Respuesta de Error** (`@outResultCode = X`):
```json
{
  "message": "string"
}
```

### sp_logout
**Descripción**: Cierra la sesión de un usuario.

**Parámetros**:
- `@outResultCode INT OUTPUT`: Código de resultado
- `@IdUsuario INT`: ID del usuario
- `@IP VARCHAR(64)`: Dirección IP del cliente

**Respuesta Exitosa** (`@outResultCode = 0`):
```json
{}
```

**Respuesta de Error** (`@outResultCode = X`):
```json
{
  "message": "string"
}
```

## 2. Gestión de Empleados

### sp_listar_empleados
**Descripción**: Obtiene la lista completa de empleados.

**Parámetros**:
- `@outResultCode INT OUTPUT`: Código de resultado
- `@IdUsuario INT`: ID del usuario
- `@IP VARCHAR(64)`: Dirección IP del cliente

**Respuesta Exitosa** (`@outResultCode = 0`):
```json
[
  {
    "Id": "number",
    "Name": "string",
    "DateBirth": "date",
    "DNI": "string",
    "Position": "string",
    "Department": "string"
  }
]
```

**Respuesta de Error** (`@outResultCode = X`):
```json
{
  "message": "string"
}
```

### sp_buscar_empleados
**Descripción**: Busca empleados según un criterio de búsqueda.

**Parámetros**:
- `@outResultCode INT OUTPUT`: Código de resultado
- `@IdUsuario INT`: ID del usuario
- `@IP VARCHAR(64)`: Dirección IP del cliente
- `@Busqueda VARCHAR(64)`: Término de búsqueda

**Respuesta Exitosa** (`@outResultCode = 0`):
```json
[
  {
    "Id": "number",
    "Name": "string",
    "DateBirth": "date",
    "DNI": "string",
    "Position": "string",
    "Department": "string"
  }
]
```

**Respuesta de Error** (`@outResultCode = X`):
```json
{
  "message": "string"
}
```

### sp_consultar_empleado
**Descripción**: Obtiene los detalles de un empleado específico.

**Parámetros**:
- `@outResultCode INT OUTPUT`: Código de resultado
- `@IdUsuario INT`: ID del usuario
- `@IP VARCHAR(64)`: Dirección IP del cliente
- `@IdEmpleado INT`: ID del empleado a consultar

**Respuesta Exitosa** (`@outResultCode = 0`):
```json
{
  "Id": "number",
  "Name": "string",
  "DateBirth": "date",
  "DNI": "string",
  "Position": "string",
  "Department": "string"
}
```

**Respuesta de Error** (`@outResultCode = X`):
```json
{
  "message": "string"
}
```

### sp_crear_empleado
**Descripción**: Crea un nuevo empleado en el sistema.

**Parámetros**:
- `@outResultCode INT OUTPUT`: Código de resultado
- `@IdUsuario INT`: ID del usuario
- `@IP VARCHAR(64)`: Dirección IP del cliente
- `@Nombre VARCHAR(64)`: Nombre del empleado
- `@EmpleadoUsuario VARCHAR(64)`: Usuario del empleado
- `@EmpleadoContraseña VARCHAR(64)`: Contraseña del empleado
- `@IdDocTipo INT`: ID del tipo de documento
- `@ValorDoc VARCHAR(64)`: Valor del documento
- `@FechaNacimiento DATE`: Fecha de nacimiento
- `@IdPuesto INT`: ID del puesto
- `@IdDepartamento INT`: ID del departamento

**Respuesta Exitosa** (`@outResultCode = 0`):
```json
{
  "Id": "number",
  "Name": "string"
}
```

**Respuesta de Error** (`@outResultCode = X`):
```json
{
  "message": "string"
}
```

### sp_actualizar_empleado
**Descripción**: Actualiza la información de un empleado existente.

**Parámetros**:
- `@outResultCode INT OUTPUT`: Código de resultado
- `@IdUsuario INT`: ID del usuario
- `@IdEmpleado INT`: ID del empleado a actualizar
- `@IP VARCHAR(64)`: Dirección IP del cliente
- `@Nombre VARCHAR(64)`: Nombre del empleado
- `@IdDocTipo INT`: ID del tipo de documento
- `@ValorDoc VARCHAR(64)`: Valor del documento
- `@FechaNacimiento DATE`: Fecha de nacimiento
- `@IdPuesto INT`: ID del puesto
- `@IdDepartamento INT`: ID del departamento

**Respuesta Exitosa** (`@outResultCode = 0`):
```json
{
  "Id": "number",
  "Name": "string"
}
```

**Respuesta de Error** (`@outResultCode = X`):
```json
{
  "message": "string"
}
```

### sp_eliminar_empleados
**Descripción**: Elimina un empleado del sistema.

**Parámetros**:
- `@outResultCode INT OUTPUT`: Código de resultado
- `@IdUsuario INT`: ID del usuario
- `@IP VARCHAR(64)`: Dirección IP del cliente
- `@IdEmpleado INT`: ID del empleado a eliminar

**Respuesta Exitosa** (`@outResultCode = 0`):
```json
{}
```

**Respuesta de Error** (`@outResultCode = X`):
```json
{
  "message": "string"
}
```

## 3. Impersonación

### sp_impersonar_empleado
**Descripción**: Inicia la impersonación de un empleado.

**Parámetros**:
- `@outResultCode INT OUTPUT`: Código de resultado
- `@IdUsuario INT`: ID del usuario
- `@IP VARCHAR(64)`: Dirección IP del cliente
- `@IdEmpleado INT`: ID del empleado a impersonar

**Respuesta Exitosa** (`@outResultCode = 0`):
```json
{
  "Id": "number",
  "Name": "string",
  "DateBirth": "date",
  "DNI": "string",
  "Position": "string",
  "Department": "string"
}
```

**Respuesta de Error** (`@outResultCode = X`):
```json
{
  "message": "string"
}
```

### sp_terminar_impersonar_empleado
**Descripción**: Termina la impersonación de un empleado.

**Parámetros**:
- `@outResultCode INT OUTPUT`: Código de resultado
- `@IdUsuario INT`: ID del usuario
- `@IP VARCHAR(64)`: Dirección IP del cliente
- `@IdEmpleado INT`: ID del empleado impersonado

**Respuesta Exitosa** (`@outResultCode = 0`):
```json
{}
```

**Respuesta de Error** (`@outResultCode = X`):
```json
{
  "message": "string"
}
```

## 4. Consultas de Planillas

### sp_consultar_planillas_semanales
**Descripción**: Obtiene las planillas semanales de un empleado.

**Parámetros**:
- `@outResultCode INT OUTPUT`: Código de resultado
- `@IdUsuario INT`: ID del usuario
- `@IP VARCHAR(64)`: Dirección IP del cliente
- `@IdEmpleado INT`: ID del empleado

**Respuesta Exitosa** (`@outResultCode = 0`):
```json
[
  {
    "WeekId": "number",
    "StartDate": "date",
    "EndDate": "date",
    "GrossSalary": "number",
    "TotalDeductions": "number",
    "NetSalary": "number",
    "OrdinaryHours": "number",
    "NormalExtraHours": "number",
    "DobleExtraHours": "number"
  }
]
```

**Respuesta de Error** (`@outResultCode = X`):
```json
{
  "message": "string"
}
```

### sp_consultar_deducciones_semana
**Descripción**: Obtiene las deducciones de una semana específica para un empleado.

**Parámetros**:
- `@outResultCode INT OUTPUT`: Código de resultado
- `@IdUsuario INT`: ID del usuario
- `@IP VARCHAR(64)`: Dirección IP del cliente
- `@IdEmpleado INT`: ID del empleado
- `@IdSemana INT`: ID de la semana

**Respuesta Exitosa** (`@outResultCode = 0`):
```json
[
  {
    "DeductionType": "string",
    "isPercentage": "bool",
    "Percentage": "number",
    "Amount": "number"
  }
]
```

**Respuesta de Error** (`@outResultCode = X`):
```json
{
  "message": "string"
}
```

### sp_consultar_deducciones_mes
**Descripción**: Obtiene las deducciones de un mes especifico para un empleado.

**Parámetros**:
- `@outResultCode INT OUTPUT`: Código de resultado
- `@IdUsuario INT`: ID del usuario
- `@IP VARCHAR(64)`: Dirección IP del cliente
- `@IdEmpleado INT`: ID del empleado
- `@IdMes INT`: ID del mes

**Respuesta Exitosa** (`@outResultCode = 0`):
```json
[
  {
    "DeductionType": "string",
    "isPercentage": "bool",
    "Percentage": "number",
    "Amount": "number"
  }
]
```

**Respuesta de Error** (`@outResultCode = X`):
```json
{
  "message": "string"
}
```


### sp_consultar_salario_bruto_semanal
**Descripción**: Obtiene el detalle del salario bruto semanal por día.

**Parámetros**:
- `@outResultCode INT OUTPUT`: Código de resultado
- `@IdUsuario INT`: ID del usuario
- `@IP VARCHAR(64)`: Dirección IP del cliente
- `@IdEmpleado INT`: ID del empleado
- `@IdSemana INT`: ID de la semana

**Respuesta Exitosa** (`@outResultCode = 0`):
```json
[
  {
    "DateDay": "date",
    "EntryTime": "time",
    "ExitTime": "time",
    "OrdinaryHours": "number",
    "OrdinaryAmount": "number",
    "NormalExtraHours": "number",
    "NormalExtraAmount": "number",
    "DoubleExtraHours": "number",
    "DoubleExtraAmount": "number",
    "DayTotal": "number"
  }
]
```

**Respuesta de Error** (`@outResultCode = X`):
```json
{
  "message": "string"
}
```

### sp_consultar_plantilla_mensual
**Descripción**: Obtiene el resumen de planillas mensuales de un empleado.

**Parámetros**:
- `@outResultCode INT OUTPUT`: Código de resultado
- `@IdUsuario INT`: ID del usuario
- `@IP VARCHAR(64)`: Dirección IP del cliente
- `@IdEmpleado INT`: ID del empleado

**Respuesta Exitosa** (`@outResultCode = 0`):
```json
[
  {
    "Month": "number",
    "Year": "number",
    "MonthName": "string",
    "GrossSalary": "number",
    "TotalDeductions": "number",
    "NetSalary": "number",
    "IdMonth": number
  }
]
```

**Respuesta de Error** (`@outResultCode = X`):
```json
{
  "message": "string"
}
```

## 5. Consultas de Catálogos

### sp_consultar_tipos_documentos
**Descripción**: Obtiene los tipos de documentos disponibles.

**Parámetros**:
- `@outResultCode INT OUTPUT`: Código de resultado
- `@IdUsuario INT`: ID del usuario
- `@IP VARCHAR(64)`: Dirección IP del cliente

**Respuesta Exitosa** (`@outResultCode = 0`):
```json
[
  {
    "Id": "number",
    "Name": "string"
  }
]
```

**Respuesta de Error** (`@outResultCode = X`):
```json
{
  "message": "string"
}
```

### sp_consultar_puestos
**Descripción**: Obtiene los puestos de trabajo disponibles.

**Parámetros**:
- `@outResultCode INT OUTPUT`: Código de resultado
- `@IdUsuario INT`: ID del usuario
- `@IP VARCHAR(64)`: Dirección IP del cliente

**Respuesta Exitosa** (`@outResultCode = 0`):
```json
[
  {
    "Id": "number",
    "Name": "string",
    "HourlySalary": "number"
  }
]
```

**Respuesta de Error** (`@outResultCode = X`):
```json
{
  "message": "string"
}
```

### sp_consultar_departamentos
**Descripción**: Obtiene los departamentos disponibles.

**Parámetros**:
- `@outResultCode INT OUTPUT`: Código de resultado
- `@IdUsuario INT`: ID del usuario
- `@IP VARCHAR(64)`: Dirección IP del cliente

**Respuesta Exitosa** (`@outResultCode = 0`):
```json
[
  {
    "Id": "number",
    "Name": "string"
  }
]
```

**Respuesta de Error** (`@outResultCode = X`):
```json
{
  "message": "string"
}
```

### sp_consultar_tipos_deducciones
**Descripción**: Obtiene los tipos de deducciones disponibles.

**Parámetros**:
- `@outResultCode INT OUTPUT`: Código de resultado
- `@IdUsuario INT`: ID del usuario
- `@IP VARCHAR(64)`: Dirección IP del cliente

**Respuesta Exitosa** (`@outResultCode = 0`):
```json
[
  {
    "Id": "number",
    "Name": "string",
    "IsObligatory": "bool",
    "IsPercentage": "bool",
    "Percentage": "number"
  }
]
```

**Respuesta de Error** (`@outResultCode = X`):
```json
{
  "message": "string"
}
```

## Códigos de Resultado

- **0**: Operación exitosa
- **X**: Error en la operación (donde X es un código de error específico)

## Notas Importantes

1. Todos los procedimientos requieren autenticación previa mediante `sp_login`
2. El parámetro `@IdUsuario` identifica al usuario que ejecuta la operación para control de acceso y auditoría
3. El parámetro `@IP` debe contener la dirección IP del cliente para auditoría y rastreo de sesiones
4. Los errores siempre retornan un objeto con el campo `message` describiendo el problema
