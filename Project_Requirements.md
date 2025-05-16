# GUÍA DETALLADA: SISTEMA DE CONTROL DE ASISTENCIA Y PLANILLA OBRERA

## CONTEXTO GENERAL DEL SISTEMA

El sistema gestiona la planilla y asistencia de obreros en una fábrica que opera 24/7. Los empleados siguen un ciclo de 6 días de trabajo y 1 de descanso, con horarios rotativos que cambian semanalmente.

### Características Fundamentales del Negocio

1. **Jornadas de Trabajo:**
   - **Diurna:** 6:00 AM - 2:00 PM (8 horas)
   - **Vespertina:** 2:00 PM - 10:00 PM (8 horas)
   - **Nocturna:** 10:00 PM - 6:00 AM (8 horas)

2. **Ciclos de Pago:**
   - **Pago semanal:** Calculado cada jueves a medianoche
   - **Reporte mensual a CCSS:** Desde el viernes después del último jueves del mes anterior hasta el último jueves del mes actual

3. **Cálculo de Salario:**
   - **Horas ordinarias:** Valor base según puesto y jornada
   - **Horas extras normales:** 1.5x del valor hora base (no domingos/feriados)
   - **Horas extras dobles:** 2.0x del valor hora base (domingos/feriados)
   - Solo se pagan horas completas (7.5 horas = pago por 7 horas)

4. **Deducciones:**
   - **Porcentuales:** Aplicadas al salario bruto semanal (ej: 9% CCSS)
   - **Fijas:** Monto mensual dividido entre semanas del mes (4 o 5)
   - **Obligatorias:** No pueden eliminarse (ej: aportes por ley)
   - **No obligatorias:** Opcionales (ej: ahorro vacacional)

---

## REQUERIMIENTOS DETALLADOS PARA ADMINISTRADORES

### R01: LISTAR EMPLEADOS

**Descripción Completa:**
Mostrar todos los empleados activos ordenados alfabéticamente por nombre.

**Especificaciones Técnicas:**
- Esta vista DEBE cargarse automáticamente al iniciar sesión como administrador
- Implementar un grid/tabla con al menos estas columnas:
  - Nombre completo del empleado
  - Nombre del puesto
- La lista DEBE ordenarse alfabéticamente por nombre de empleado
- Cada fila DEBE tener opciones para editar, eliminar e impersonar al empleado
- Incluir paginación si hay muchos empleados (recomendado 20-25 por página)
- Mostrar únicamente empleados con estado "Activo = true"

**Consideraciones Importantes:**
- La interfaz debe ser limpia y responsiva
- No mostrar empleados inactivos (borrados lógicamente)
- Optimizar la consulta para rendimiento adecuado
- Implementar el SP correspondiente para esta consulta

### R02: LISTAR EMPLEADOS CON FILTRO

**Descripción Completa:**
Permitir búsqueda de empleados mediante un patrón aplicado al nombre.

**Especificaciones Técnicas:**
- Añadir campo de texto para ingresar patrón de búsqueda
- Implementar botón "Buscar" que active la filtración
- Mostrar resultados usando la misma interfaz que R01
- La lista filtrada DEBE mantener el orden alfabético por nombre
- La consulta debe usar patrón tipo "LIKE %patrón%" en SQL

**Consideraciones Importantes:**
- Implementar validación de entrada para evitar SQL injection
- Mantener el filtro visible después de aplicarlo
- Proporcionar forma de limpiar el filtro para volver a mostrar todos los empleados
- Implementar SP específico para esta consulta filtrada
- Realizar la búsqueda de forma eficiente (índices apropiados)

### R03: EDITAR EMPLEADO

**Descripción Completa:**
Modificar todos los datos pertinentes de un empleado seleccionado.

**Especificaciones Técnicas:**
- Implementar formulario con los siguientes campos editables:
  1. **Nombre completo:** Campo de texto (obligatorio)
  2. **Tipo de identificación:** Selector desplegable del catálogo de tipos de ID (obligatorio)
  3. **Valor del documento de identificación:** Campo de texto con validación según tipo (obligatorio)
  4. **Fecha de nacimiento:** Selector de fecha con calendario (obligatorio)
  5. **Puesto:** Selector desplegable del catálogo de puestos (obligatorio)
  6. **Departamento:** Selector desplegable del catálogo de departamentos (obligatorio)
- Implementar botones "Guardar" y "Cancelar"
- Mostrar todos los campos con sus valores actuales al cargar el formulario

**Consideraciones Importantes:**
- Validar TODOS los campos antes de guardar (formato, obligatoriedad)
- Implementar SP para actualizar los datos
- NO permitir editar el campo "Activo"
- Verificar unicidad de documentos de identificación
- Registrar en bitácora el estado anterior y posterior al cambio
- Implementar confirmación antes de guardar cambios
- No permitir editar empleados inactivos

### R04: INSERTAR EMPLEADO

**Descripción Completa:**
Crear un nuevo registro de empleado con todos sus datos correspondientes.

**Especificaciones Técnicas:**
- Utilizar formulario similar a R03 con los mismos campos
- Todos los campos son obligatorios
- Al guardar, asignar automáticamente deducciones obligatorias mediante TRIGGER
- Generar usuario y contraseña automáticos para acceso del empleado (la contraseña debe ser el número de identificación)

**Consideraciones Importantes:**
- Validar formato y unicidad del documento de identificación
- Asegurar que el TRIGGER de asignación de deducciones obligatorias funcione correctamente
- Registrar la creación en la bitácora
- Implementar SP específico para inserción
- Establecer el campo "Activo" como true automáticamente
- Verificar que la fecha de nacimiento sea válida (edad mínima requerida)
- El empleado nuevo DEBE poder iniciar a trabajar SOLO en el próximo inicio de semana

### R05: ELIMINAR EMPLEADO

**Descripción Completa:**
Realizar borrado lógico de un empleado (NO eliminar físicamente el registro).

**Especificaciones Técnicas:**
- Mostrar diálogo de confirmación con nombre del empleado antes de eliminar
- Cambiar el valor del campo "Activo" a false (NUNCA eliminar físicamente)
- Actualizar la vista para no mostrar más al empleado eliminado
- Implementar SP específico para el borrado lógico

**Consideraciones Importantes:**
- Registrar en bitácora el cambio de estado
- Verificar que el empleado eliminado no aparezca en ninguna consulta ni reporte
- El empleado eliminado NO debe poder acceder al sistema
- Mantener todas las relaciones y datos históricos intactos
- El borrado debe afectar solo al empleado, no a sus registros históricos

### R06: IMPERSONAR EMPLEADO

**Descripción Completa:**
Permitir al administrador ver y utilizar el sistema exactamente como lo haría el empleado seleccionado.

**Especificaciones Técnicas:**
- Agregar botón "Impersonar" en la lista de empleados
- Al activarse, cambiar completamente la interfaz a la vista de empleado
- La sesión debe mantener la información que es un administrador impersonando
- Proporcionar opción visible para volver a la vista de administrador (R09)

**Consideraciones Importantes:**
- Mantener la seguridad durante la impersonación
- Registrar en bitácora cuando inicia y termina una impersonación
- Asegurar que todas las consultas reflejen los datos específicos del empleado impersonado
- Las acciones realizadas durante impersonación deben registrarse como hechas por el administrador
- NO permitir impersonar a empleados inactivos

---

## REQUERIMIENTOS DETALLADOS PARA EMPLEADOS

### R07: CONSULTAR PLANILLA SEMANAL

**Descripción Completa:**
Mostrar historial detallado de las últimas 15 planillas semanales del empleado.

**Especificaciones Técnicas:**
- Implementar grid/tabla con estas columnas para cada semana:
  1. Fecha inicio y fin de la semana
  2. Salario bruto semanal
  3. Total de deducciones semanales
  4. Salario neto semanal
  5. Cantidad de horas ordinarias trabajadas
  6. Cantidad de horas extra normales (1.5x)
  7. Cantidad de horas extra dobles (2.0x)
- Ordenar por fecha descendente (más reciente primero)
- Al hacer click en "total de deducciones": mostrar ventana/grid con detalles de TODAS las deducciones aplicadas esa semana:
  - Nombre de cada deducción
  - Porcentaje aplicado (si es porcentual)
  - Monto específico de cada deducción
- Al hacer click en "salario bruto": mostrar ventana/grid con desglose diario:
  - Día de la semana
  - Hora de entrada y salida
  - Horas ordinarias y monto devengado
  - Horas extras normales y monto devengado
  - Horas extras dobles y monto devengado

**Consideraciones Importantes:**
- Implementar SP específicos para estas consultas
- Optimizar para rápida carga de datos
- Proporcionar opciones para cerrar ventanas emergentes
- Usar formato apropiado para fechas y montos
- Incluir totales al final de las ventanas de detalle
- Implementar opción para exportar a PDF (opcional pero recomendado)

### R08: CONSULTAR PLANILLA MENSUAL

**Descripción Completa:**
Mostrar historial detallado de los últimos 12 meses de planilla del empleado.

**Especificaciones Técnicas:**
- Implementar grid/tabla con estas columnas para cada mes:
  1. Mes/Año
  2. Salario bruto mensual
  3. Total de deducciones mensuales
  4. Salario neto mensual
- Ordenar por fecha descendente (más reciente primero)
- Al hacer click en "total de deducciones": mostrar ventana/grid con detalles de TODAS las deducciones aplicadas ese mes:
  - Nombre de cada deducción
  - Porcentaje aplicado (si es porcentual)
  - Monto específico de cada deducción

**Consideraciones Importantes:**
- Implementar SP específicos para estas consultas
- Optimizar para rápida carga de datos
- Proporcionar opciones para cerrar ventanas emergentes
- Usar formato apropiado para fechas y montos
- Incluir totales al final de las ventanas de detalle
- Recordar que el mes de planilla va desde el viernes después del último jueves del mes anterior hasta el último jueves del mes actual (NO es mes calendario)
- Implementar opción para exportar a PDF (opcional pero recomendado)

### R09: REGRESAR A INTERFAZ DE ADMINISTRADOR

**Descripción Completa:**
Permitir al administrador que ha impersonado a un empleado regresar a su interfaz normal.

**Especificaciones Técnicas:**
- Mostrar botón/opción visible "Volver a Vista Administrador" SOLO cuando es administrador impersonando
- Al activarse, restaurar completamente la interfaz de administrador (R01)
- Mantener la sesión del administrador intacta

**Consideraciones Importantes:**
- Este botón NUNCA debe ser visible para empleados reales
- Registrar en bitácora el fin de la impersonación
- Restaurar todos los privilegios de administrador
- Mostrar mensaje de confirmación del cambio

---

## REQUERIMIENTOS TÉCNICOS DETALLADOS

### R10: TRAZABILIDAD (BITÁCORA DE EVENTOS)

**Descripción Completa:**
Registrar detalladamente todas las acciones realizadas en el sistema.

**Especificaciones Técnicas:**
- Implementar tabla de bitácora que registre para cada evento:
  1. ID de Usuario que realiza la acción
  2. Dirección IP desde donde se ejecuta
  3. Timestamp (fecha y hora exacta)
  4. ID del tipo de evento (del catálogo de tipos de eventos)
  5. Parámetros utilizados en la operación (serializar como JSON o XML)
  6. Para operaciones CRUD: estado "antes" y "después" del cambio (serializar)

**Eventos a Registrar:**
1. Login (éxito y fracaso)
2. Logout
3. Listar empleados
4. Listar empleados con filtro
5. Insertar empleado
6. Editar empleado
7. Eliminar empleado
8. Impersonar empleado
9. Fin de impersonación
10. Consulta de planilla semanal
11. Consulta de planilla mensual
12. Consulta de detalle de deducciones
13. Consulta de detalle diario
14. Asignación de deducciones no obligatorias (desde script)
15. Desasignación de deducciones no obligatorias (desde script)

**Consideraciones Importantes:**
- Implementar SP específico para registro en bitácora
- Optimizar la tabla para rápida escritura
- NO permitir modificación manual de la bitácora
- Considerar estrategia de respaldo/purga para mantener tamaño manejable
- Implementar transacciones apropiadas para garantizar atomicidad

### AUTENTICACIÓN Y SEGURIDAD

**Descripción Completa:**
Gestionar acceso seguro y diferenciado según tipo de usuario.

**Especificaciones Técnicas:**
- Implementar pantalla de login con:
  - Campo para nombre de usuario
  - Campo para contraseña (enmascarada)
  - Botón de ingreso
- Validar credenciales contra la base de datos
- Diferenciar automáticamente entre usuarios administradores (tipo=1) y empleados (tipo=2)
- Mostrar interfaz apropiada según tipo de usuario

**Consideraciones Importantes:**
- NUNCA almacenar contraseñas en texto plano (usar hash)
- Implementar timeout de sesión por inactividad
- Registrar intentos fallidos de acceso
- Proporcionar opción de logout
- Considerar implementar bloqueo tras múltiples intentos fallidos
- Validar todas las entradas para prevenir inyecciones

### BASE DE DATOS

**Descripción Completa:**
Diseñar e implementar estructura completa de base de datos para el sistema.

**Especificaciones Técnicas:**
- Diseñar tablas para todas las entidades del sistema
- Implementar relaciones y constraints apropiados
- Crear TRIGGER para asociar automáticamente deducciones obligatorias a nuevos empleados
- Crear vistas para abstracción de consultas complejas
- Crear TODOS los procedimientos almacenados necesarios:
  - SP para operaciones CRUD
  - SP para consultas de planilla
  - SP para la simulación
  - SP para registro en bitácora

**Consideraciones Importantes:**
- Optimizar estructura con índices apropiados
- Implementar integridad referencial
- Documentar estructura y relaciones
- Mantener normalización adecuada
- Todo acceso a datos DEBE ser mediante procedimientos almacenados
- NO permitir SQL incrustado en capa lógica

### PROCESAMIENTO DE PLANILLA

**Descripción Completa:**
Implementar toda la lógica de cálculo y procesamiento de planilla.

**Especificaciones Detalladas para Cálculo de Horas:**
- **Horas ordinarias:** 
  - Son las trabajadas dentro del horario de jornada (8 horas)
  - Solo se pagan horas completas (truncar fracciones)
  - Valor = horas trabajadas * salario base por hora del puesto
- **Horas extras normales:** 
  - Son horas trabajadas después de completar la jornada normal
  - No aplica en domingos ni feriados
  - Solo se pagan horas completas (truncar fracciones)
  - Valor = horas extras * salario base por hora del puesto * 1.5
- **Horas extras dobles:** 
  - Son horas trabajadas después de completar la jornada normal en domingos o feriados
  - Solo se pagan horas completas (truncar fracciones)
  - Valor = horas extras * salario base por hora del puesto * 2.0

**Especificaciones Detalladas para Procesamiento Semanal (cada jueves):**
1. Calcular salario bruto semanal (suma de todos los movimientos de crédito)
2. Aplicar deducciones porcentuales sobre el salario bruto
3. Aplicar deducciones de monto fijo (dividiendo el monto mensual entre las semanas del mes)
4. Calcular salario neto (salario bruto - total deducciones)
5. Acumular en totales mensuales
6. Preparar estructuras para la siguiente semana

**Especificaciones Detalladas para Procesamiento Mensual:**
1. Al llegar al último jueves del mes, realizar cierre mensual
2. Acumular totales mensuales
3. Preparar estructuras para el siguiente mes
4. Los meses pueden tener 4 o 5 semanas dependiendo del calendario

**Consideraciones Críticas:**
- Toda la lógica de cálculo DEBE estar en procedimientos almacenados
- Implementar transacciones para garantizar integridad
- Registrar todos los movimientos con su descripción completa
- Manejar correctamente los casos especiales (jornadas que terminan en día siguiente)
- Implementar correctamente la división de montos fijos según semanas del mes
- Verificar todos los cálculos con pruebas exhaustivas

### SIMULACIÓN DEL SISTEMA

**Descripción Completa:**
Implementar script de simulación para procesar datos históricos de al menos 4 meses.

**Especificaciones Técnicas de la Simulación:**
1. **Procesamiento de XMLs:**
   - Cargar catálogos desde XML específico
   - Procesar XML de operación por fecha consecutiva

2. **Operaciones diarias a simular:**
   - Insertar nuevos empleados (con trigger para deducciones obligatorias)
   - Eliminar empleados (borrado lógico)
   - Asociar empleados con deducciones no obligatorias
   - Desasociar empleados de deducciones no obligatorias
   - Procesar marcas de asistencia y calcular pagos correspondientes

3. **Operaciones especiales de jueves:**
   - Cierre de planilla semanal
   - Cálculo de deducciones
   - Preparación para nueva semana
   - Asignación de jornadas para la siguiente semana

4. **Operaciones de fin de mes:**
   - Cierre mensual
   - Preparación para nuevo mes

**Consideraciones Importantes para la Simulación:**
- Los empleados nuevos solo pueden empezar en inicio de semana (viernes)
- Las asociaciones/desasociaciones de deducciones aplican desde el próximo inicio de semana
- Procesar correctamente jornadas nocturnas que terminan el día siguiente
- Validar estructura y contenido de XMLs antes de procesar
- Implementar manejo de errores robusto
- Realizar todo en una única transacción por empleado
- Documentar detalladamente el proceso de simulación
- NO modificar la estructura del XML proporcionado

### SITIO WEB Y CAPAS DE APLICACIÓN

**Descripción Completa:**
Desarrollar interfaz web completa con separación apropiada de capas.

**Especificaciones de la Capa de Presentación:**
- Implementar interfaz responsiva y amigable
- Diferenciar vistas de administrador y empleado
- Implementar todos los formularios y grids requeridos
- Garantizar usabilidad y navegación intuitiva

**Especificaciones de la Capa Lógica:**
- Implementar lógica de negocio separada de la interfaz
- Gestionar llamadas a procedimientos almacenados
- Implementar validaciones apropiadas
- Manejar errores adecuadamente

**Especificaciones de la Capa de Datos:**
- Toda interacción con BD mediante procedimientos almacenados
- NO permitir SQL incrustado en capa lógica
- Optimizar consultas para rendimiento

**Consideraciones Importantes:**
- Implementar arquitectura limpia y mantenible
- Documentar código adecuadamente
- Implementar seguridad en todas las capas
- Optimizar para rendimiento adecuado
- Validar compatibilidad con navegadores principales

---

## ENTREGABLES FINALES

1. **Base de Datos Física:**
   - Scripts de creación de tablas, relaciones, índices
   - Trigger para asignación automática de deducciones obligatorias
   - Vistas para abstracción de consultas
   - Procedimientos almacenados para todas las operaciones

2. **Código de Simulación:**
   - Script para carga de catálogos
   - Script para simulación de operación (al menos 4 meses)

3. **Sitio Web:**
   - Interfaz para administradores (R01-R06)
   - Interfaz para empleados (R07-R09)
   - Sistema de autenticación

4. **Documentación:**
   - Análisis de resultados
   - Bitácora de implementación
   - Diseño de base de datos

## CONSIDERACIONES PARA LA ENTREGA

- **Primera entrega (16 de junio 2025):** Proyecto completo (26.66%)
- **Segunda entrega (23 de junio 2025):** Correcciones si la primera entrega fue incompleta (13.33%)
- El motor de base de datos debe ser MS SQL 2014 o superior
- La capa lógica puede implementarse en cualquier lenguaje/framework
- El proyecto debe realizarse en grupos de 2 personas
