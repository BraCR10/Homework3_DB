USE [DB_Tarea3]
GO
/****** Object:  StoredProcedure [dbo].[sp_consultar_planillas_semanales]    Script Date: 15/06/2025 22:37:54 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[sp_consultar_planillas_semanales]
    @inIdUsuario INT,
    @inIP VARCHAR(64),
    @inIdEmpleado INT,
    @outResultCode INT OUTPUT
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

        ------ Obtener las 15 planillas semanales ----------
        DECLARE @ultimas15SemanaPlanilla TABLE (
            IdSemanaPlanilla INT
            , FechaFin DATE
            , FechaIni DATE
            , IdMesPlanilla INT
            , IdEmpleadoXMesPlanilla INT
        );
        INSERT INTO @ultimas15SemanaPlanilla
        SELECT TOP 15 
            SP.Id
            , SP.FechaFin
            , SP.FechaIni
            , SP.IdMesPlanilla
            , SP.IdEmpleadoXMesPlanilla
        FROM dbo.SemanaPlanilla SP
        ORDER BY Id DESC
        ------ Obtener las 15 planillas semanales ----------

        --Obtener la planilla del empleado
        SELECT SP15.IdSemanaPlanilla AS WeekId
        , SP15.FechaIni AS StartDate
        , SP15.FechaFin AS EndDate
        , (EXSP.SalarioNeto + EXSP.SumaDeducciones) AS GrossSalary
        , EXSP.SumaDeducciones AS TotalDeductions
        , EXSP.SalarioNeto AS NetSalary
         -- Suma de horas ordinarias
        , SUM(CASE 
                WHEN MP.IdTipoMovimiento = 1 
                THEN MP.Monto
                ELSE 0
            END) AS OrdinaryHours
         -- horas normales extra
         , SUM(CASE 
                WHEN MP.IdTipoMovimiento = 2
                THEN MP.Monto 
                ELSE 0
            END) AS NormalExtraHours
         -- horas extra dobles
         , SUM(CASE 
                WHEN MP.IdTipoMovimiento = 3
                THEN MP.Monto
                ELSE 0 
            END) AS DoubleExtraHours
        FROM dbo.EmpleadoXSemanaPlanilla EXSP
        INNER JOIN @ultimas15SemanaPlanilla SP15 ON (SP15.IdEmpleadoXMesPlanilla = EXSP.Id)
        INNER JOIN dbo.MovimientoPlanilla MP ON (MP.IdEmpleadoXSemanaPlanilla = EXSP.Id)
        WHERE EXSP.IdEmpleado = @inIdEmpleado
        GROUP BY 
            SP15.IdSemanaPlanilla
            , SP15.FechaIni
            , SP15.FechaFin
            , EXSP.SalarioNeto
            , EXSP.SumaDeducciones

        -- Registrar en EventLog con fechas de cada semana de planilla
        DECLARE @jsonEventLog NVARCHAR(MAX);
        DECLARE @Parametros NVARCHAR(MAX);
        
        -- Crear JSON con array de semanas consultadas
        SET @Parametros = (
            SELECT 
                '{
                    "Empleado.Id": "' + ISNULL(CAST(@inIdEmpleado AS VARCHAR), '') + '",
                    "SemanasConsultadas": [' + 
                    STRING_AGG(
                        '{
                            "SemanaId": "' + CAST(SP15.IdSemanaPlanilla AS VARCHAR) + '",
                            "FechaInicio": "' + CONVERT(VARCHAR, SP15.FechaIni, 23) + '",
                            "FechaFin": "' + CONVERT(VARCHAR, SP15.FechaFin, 23) + '"
                        }', 
                        ','
                    ) + ']
                }'
            FROM @ultimas15SemanaPlanilla SP15
            INNER JOIN dbo.EmpleadoXSemanaPlanilla EXSP ON EXSP.Id = SP15.IdEmpleadoXMesPlanilla
            WHERE EXSP.IdEmpleado = @inIdEmpleado
        );

        EXEC dbo.sp_generar_json
                @inIdUsuario = @inIdUsuario,
                @inIP = @inIP,
                @inIdTipoEvento = 10,
                @inDetalle = 'Consulta de planillas semanales exitosa',
                @inParametros = @Parametros,
                @inDatosAntes = NULL,
                @inDatosDespues = NULL,
                @outJson = @jsonEventLog OUTPUT;

        INSERT INTO dbo.EventLog (ArchivoJSON, IdTipoEvento) --IdTipoEvento = 10 = consultar planilla semanal
        VALUES (@jsonEventLog, 10);
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