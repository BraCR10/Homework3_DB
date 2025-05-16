# Modelos de Datos

## Empleado
```typescript
interface Empleado {
    Id: number;
    IdPuesto: number;
    ValorDocumentoIdentidad: string;
    Nombre: string;
    FechaContratacion: Date;
    SaldoVaciones: number;
    EsActivo: boolean;
}
```

## Puesto
```typescript
interface Puesto {
    Id: number;
    Nombre: string;
    SalarioPorHora: number;
}
```

## TipoMovimiento
```typescript
interface TipoMovimiento {
    Id: number;
    Nombre: string;
    TipoAccion: string;
}
```

## Movimiento
```typescript
interface Movimiento {
    Id: number;
    IdEmpleado: number;
    IdTipoMovimiento: number;
    Fecha: Date;
    Monto: number;
    NuevoSaldo: number;
    IdPostByUser: number; // usuario que postió el movimiento
    PostInIp: string;
    PostTime: Date;
}
```

## Usuario
```typescript
interface Usuario {
    Id: number;
    Username: string;
    Password: string; 
}
```

## TipoEvento
```typescript
interface TipoEvento {
    Id: number;
    Nombre: string;
}
```

## BitacoraEvento
```typescript
interface BitacoraEvento {
    Id: number;
    IdTipoEvento: number;
    Descripcion: string;
    IdPostByUser: number;
    PostInIp: string;
    PostTime: Date;
}
```

## DBError
```typescript
interface DBError {
    Id: number;
    Username: string;
    Number: number;
    State: number;
    Severity: number;
    Line: number;
    Procedure: string;
    Message: string;
    DateTime: Date;
}
```

## Error
```typescript
interface Error {
    Id: number;
    Codigo: number;
    Descripcion: string;
}
```

## UserStatus
```typescript
 enum UserStatus {
    ACCEPTED,
    DENIED,
    BLOCKED
}
```