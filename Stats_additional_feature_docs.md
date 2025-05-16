# Additional Features

## Employee Staff Statistics

### Stored Procedure (SP)

A stored procedure named `listar_estadisticas_plantilla` must be created that does the following:

**Input parameters:**
- `@outResultCode INT OUTPUT` - Operation result code

**Result:**
The SP must return a recordset with the following structure:
- `Nombre` - Position name
- `SalarioXHora` - Hourly salary for the position
- `CantEmpleados` - Number of employees in that position

**Example result:**
```json
[
  {
    "Nombre": "Albanil",
    "SalarioXHora": 400000,
    "CantEmpleados": 10
  },
  {
    "Nombre": "Consejero",
    "SalarioXHora": 300000,
    "CantEmpleados": 10
  },
  ...
]
```

### API Route

```
GET /api/v2/stats_salaries
```

**Description**: Gets salary statistics and employee count by position.

**Parameters**: None

**Body**: None

**Successful response** (200 OK):
```json
{
  "success": true,
  "data": {
    "totalPuestos": 5,
    "totalEmpleados": 50,
    "totalGasto": 15000000,
    "fecha": "2025-04-26T20:23:56.876Z"
    "puestos": [
      {
        "Nombre": "Albanil",
        "SalarioXHora": 400000,
        "CantEmpleados": 10,
        "GastoTotal": 4000000
      },
      {
        "Nombre": "Consejero",
        "SalarioXHora": 300000,
        "CantEmpleados": 10,
        "GastoTotal": 3000000
      },
      ...
    ]
  }
}
```

> Note: The calculation of the `GastoTotal`, `totalEmpleados` and `totalGasto` fields is performed in the backend. The `GastoTotal` field is calculated by multiplying SalarioXHora by CantEmpleados for each position, while `totalEmpleados` sums all employees and `totalGasto` sums all total expenses by position.

### Frontend

A screen should be created in the frontend that:

1. Consumes the API `/api/v2/stats_salaries`
2. Presents the data visually with charts showing:
   - Distribution of employees by position (bar chart)
   - Salary comparison by position (bar chart)
   - Total expense by position (bar chart)

3. Includes informative cards displaying:
   - Total expense of the entire staff
   - Current date
   - Total number of employees
    - Total number positions 
## MockUp:
![image](https://github.com/user-attachments/assets/4be4c8a1-7565-46ed-b8a5-d0f18e2f52f4)





