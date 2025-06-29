USE [DB_Tarea3]
GO
/****** Object:  StoredProcedure [dbo].[sp_consultar_plantilla_mensual]    Script Date: 15/06/2025 22:42:42 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[sp_consultar_plantilla_mensual]
    @inIdUsuario INT
    , @inIP VARCHAR(64)
    , @inIdEmpleado INT
    , @outResultCode INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
    -- Validación: que el empleado exista
    IF NOT EXISTS (SELECT 1 FROM dbo.Empleado WHERE Id = @inIdEmpleado AND Activo = 1)
    BEGIN
        SET @outResultCode = 50008; -- No se encontro el empleado
        SELECT 'No se encontro el empleado' AS 'message'; -- recordset
        RETURN;
    END

    ------ Obtener los ultimos 12 meses de todos los empleados ----------
    DECLARE @ultimos12MesesPlanilla TABLE (
            IdMesPlanilla INT
            , FechaFin DATE
            , FechaIni DATE
            , Mes INT
            , Año INT
            , NombreMes VARCHAR(64)
        );
    INSERT INTO @ultimos12MesesPlanilla
    SELECT TOP 12
        MP.Id
        , MP.FechaFin
        , MP.FechaIni
        , MONTH(MP.FechaIni)  -- Extrae el número del mes (1=enero, 12=diciembre)
        , YEAR(MP.FechaIni)     -- Extrae el año (ej: 2023, 2024)
        , FORMAT(MP.FechaIni, 'MMMM', 'es-ES') -- Obtener el nombre del mes
    FROM dbo.MesPlanilla MP
    ORDER BY Id DESC
    ------ Obtener los ultimos 12 meses ----------

    --Obtener los ultimos 12 meses del empleado
    SELECT u12.Mes AS 'Month'
    , u12.Año AS 'Year'
    , u12.NombreMes AS 'MonthName'
    , SUM(ESP.SalarioNeto + ESP.SumaDeducciones) AS GrossSalary
    , SUM(ESP.SumaDeducciones) AS TotalDeductions
    , SUM(ESP.SalarioNeto) AS NetSalary
    FROM dbo.EmpleadoXMesPlanilla EMP
    INNER JOIN @ultimos12MesesPlanilla u12 ON (EMP.IdMesPlanilla = u12.IdMesPlanilla)
    INNER JOIN dbo.SemanaPlanilla AS SP ON (SP.IdEmpleadoXMesPlanilla = EMP.Id)
    INNER JOIN dbo.EmpleadoXSemanaPlanilla AS ESP ON (ESP.IdSemanaPlanilla = SP.Id)
    WHERE EMP.IdEmpleado = @inIdEmpleado
    GROUP BY u12.Mes, u12.Año, u12.NombreMes  -- se asegura de sumar correctamente los valores de SalarioNeto, SumaDeducciones y GrossSalary para cada mes.
    ORDER BY u12.Año, u12.Mes; -- Ordenar cronológicamente
        
    -- Registrar en EventLog con fechas de cada mes de planilla
    DECLARE @jsonEventLog NVARCHAR(MAX);
    DECLARE @Parametros NVARCHAR(MAX);
    
    -- Crear JSON con array de meses consultados
    SET @Parametros = (
        SELECT 
            '{
                "Empleado.Id": "' + ISNULL(CAST(@inIdEmpleado AS VARCHAR), '') + '",
                "MesesConsultados": [' + 
                STRING_AGG(
                    '{
                        "Mes": "' + CAST(u12.Mes AS VARCHAR) + '",
                        "Año": "' + CAST(u12.Año AS VARCHAR) + '",
                        "NombreMes": "' + u12.NombreMes + '",
                        "FechaInicio": "' + CONVERT(VARCHAR, u12.FechaIni, 23) + '",
                        "FechaFin": "' + CONVERT(VARCHAR, u12.FechaFin, 23) + '"
                    }', 
                    ','
                ) + ']
            }'
        FROM @ultimos12MesesPlanilla u12
        INNER JOIN dbo.EmpleadoXMesPlanilla EMP ON EMP.IdMesPlanilla = u12.IdMesPlanilla
        WHERE EMP.IdEmpleado = @inIdEmpleado
    );

    EXEC dbo.sp_generar_json
            @inIdUsuario = @inIdUsuario,
            @inIP = @inIP,
            @inIdTipoEvento = 11,
            @inDetalle = 'Consulta de planillas semanales exitosa',
            @inParametros = @Parametros,
            @inDatosAntes = NULL,
            @inDatosDespues = NULL,
            @outJson = @jsonEventLog OUTPUT;

    INSERT INTO dbo.EventLog (ArchivoJSON, IdTipoEvento) --IdTipoEvento = 11 = consultar planilla mensual
    VALUES (@jsonEventLog, 11);
    SET @outResultCode = 0; 
    END TRY

    BEGIN CATCH
        SET @outResultCode = 50008; -- Error general de base de datos
        SELECT E.Descripcion AS 'message'  FROM dbo.Error AS E WHERE (E.Codigo=@outResultCode); -- recordset

        INSERT INTO dbo.DBErrors (
                    UserNombre
                    , Numero
                    , Estado
                    , Severidad
                    , Linea
                    , ProcedureError
                    , Mensaje
                )
                VALUES (
                    SUSER_NAME()
                    , ERROR_NUMBER()
                    , ERROR_STATE()
                    , ERROR_SEVERITY()
                    , ERROR_LINE()
                    , ERROR_PROCEDURE()
                    , ERROR_MESSAGE()
                );
    END CATCH
    SET NOCOUNT OFF;
END