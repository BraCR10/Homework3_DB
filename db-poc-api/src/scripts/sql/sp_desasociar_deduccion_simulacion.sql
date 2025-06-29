USE [DB_Tarea3]
GO
/****** Object:  StoredProcedure [dbo].[sp_desasociar_deduccion_simulacion]    Script Date: 19/6/2025 00:20:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Brian Ramirez Arias>
-- Create date: <10/6/2025>
-- Description:	<Desasociar deducciones>
-- =============================================
ALTER   PROCEDURE [dbo].[sp_desasociar_deduccion_simulacion](
		@inIdUsuarioDesasociar INT
		, @inIP VARCHAR(64)
		, @inIdTipoDeduccionDesasociar INT
		, @inValorEmpleadoDocDesasociar VARCHAR(64)
		, @inFechaDesasociar DATE
		, @outResultCode INT
)
AS
BEGIN
	SET NOCOUNT ON;

	BEGIN TRY
		
		DECLARE @empleadoId INT
				, @IdEmpleadoXTipoDeduccionNoObligatoria INT
				, @FechaIni DATE;

		SELECT @empleadoId = E.Id
		FROM dbo.Empleado AS E
		WHERE E.ValorDNI = @inValorEmpleadoDocDesasociar;
		
		SELECT
			@IdEmpleadoXTipoDeduccionNoObligatoria = ETDN.IdEmpleadoXTipoDeduccion 
			, @FechaIni = ETDN.FechaIni
		FROM  dbo.EmpleadoXTipoDeduccionNoObligatoria AS ETDN
		INNER JOIN dbo.EmpleadoXTipoDeduccion AS ETD ON (ETDN.IdEmpleadoXTipoDeduccion = ETD.Id)
		WHERE (ETD.IdEmpleado=@empleadoId AND ETD.IdTipoDeduccion = @inIdTipoDeduccionDesasociar); 

		INSERT INTO dbo.EmpleadoXTipoDeduccionHistorial(FechaIni, FechaFin, IdEmpleadoXTipoDeduccionNoObligatoria)
		VALUES (@FechaIni, @inFechaDesasociar, @IdEmpleadoXTipoDeduccionNoObligatoria);

		DECLARE @ParametrosBitacora NVARCHAR(MAX);
		DECLARE @jsonEventLog NVARCHAR(MAX);


		SET @ParametrosBitacora = 
		'{
			"EmpleadoId": ' + ISNULL(CAST(@empleadoId AS VARCHAR), 'null') + ',
			"TipoDeduccionId": ' + ISNULL(CAST(@inIdTipoDeduccionDesasociar AS VARCHAR), 'null') + '
		}';


		-- Registrar en EventLog
		EXEC dbo.sp_generar_json
			@inIdUsuario = @inIdUsuarioDesasociar,
			@inIP = @inIP,
			@inIdTipoEvento = 9,
			@inFecha= @inFechaDesasociar,
			@inDetalle = 'Desasociación de deduccion exitosa',
			@inParametros = @ParametrosBitacora,
			@inDatosAntes = NULL,
			@inDatosDespues = NULL,
			@outJson = @jsonEventLog OUTPUT;

		INSERT INTO dbo.EventLog (ArchivoJSON, IdTipoEvento)
		VALUES (@jsonEventLog, 9);

		SET @outResultCode = 0;
	END TRY
	BEGIN CATCH
		SET @outResultCode = 5008;

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
			, CONCAT (ERROR_MESSAGE(),@inValorEmpleadoDocDesasociar,@inIdTipoDeduccionDesasociar,@inFechaDesasociar )
		);
	END CATCH

	SET NOCOUNT OFF;
END