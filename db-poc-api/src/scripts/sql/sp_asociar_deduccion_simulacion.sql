USE [DB_Tarea3]
GO
/****** Object:  StoredProcedure [dbo].[sp_asociar_deduccion_simulacion]    Script Date: 19/6/2025 00:19:32 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[sp_asociar_deduccion_simulacion](
		@inIdUsuarioAsociar INT,
		@inIP VARCHAR(64),
		@inIdTipoDeduccionAsociar INT,
		@inValorEmpleadoDocAsociar VARCHAR(64),
		@inMontoAsociar DECIMAL(15,5),
		@inFechaAsociar DATE,
		@outResultCode INT
)
AS
BEGIN
	SET NOCOUNT ON;

	BEGIN TRY
		DECLARE @empleadoId INT
				, @empleadoActivo BIT;

		SELECT @empleadoId = E.Id , @empleadoActivo =E.Activo
		FROM dbo.Empleado AS E
		WHERE E.ValorDNI = @inValorEmpleadoDocAsociar;

		DECLARE @FlagObligatorio BIT,
				@FlagPorcentual BIT;

		SELECT @FlagObligatorio = D.FlagObligatorio,
			   @FlagPorcentual = D.FlagPorcentual
		FROM dbo.TipoDeduccion AS D 
		WHERE D.Id = @inIdTipoDeduccionAsociar;

		DECLARE @ParametrosBitacora NVARCHAR(MAX);
		DECLARE @jsonEventLog NVARCHAR(MAX);

		IF (@FlagObligatorio = 0 AND @FlagPorcentual = 0)
		BEGIN
			INSERT INTO dbo.EmpleadoXTipoDeduccion(IdEmpleado, IdTipoDeduccion)
			VALUES (@empleadoId, @inIdTipoDeduccionAsociar);

			DECLARE @id INT = SCOPE_IDENTITY();

			INSERT INTO dbo.EmpleadoXTipoDeduccionNoObligatoria(idEmpleadoXTipoDeduccion, FechaIni)
			VALUES (@id, @inFechaAsociar);

			INSERT INTO dbo.EmpleadoXTipoDeduccionNoObligatoriaNoPorcentual(idEmpleadoXTipoDeduccionNoObligatoria, Valor)
			VALUES (@id, @inMontoAsociar);


			SET @ParametrosBitacora = 
			'{
				"EmpleadoId": ' + CAST(@empleadoId AS VARCHAR) + ',
				"TipoDeduccionId": ' + CAST(@inIdTipoDeduccionAsociar AS VARCHAR) + ',
				"EsFija": "SI",
				"Valor": "' + CAST(@inMontoAsociar AS VARCHAR) + '",
				"Fecha": "' + CONVERT(VARCHAR(10), @inFechaAsociar, 120) + '"
			}';
		END

		IF (@FlagObligatorio = 0 AND @FlagPorcentual = 1)
		BEGIN
			INSERT INTO dbo.EmpleadoXTipoDeduccion(IdEmpleado, IdTipoDeduccion)
			VALUES (@empleadoId, @inIdTipoDeduccionAsociar);

			INSERT INTO dbo.EmpleadoXTipoDeduccionNoObligatoria(idEmpleadoXTipoDeduccion, FechaIni)
			VALUES (SCOPE_IDENTITY(), @inFechaAsociar);

			DECLARE @valorPorcentaje DECIMAL(15,5);

			SELECT @valorPorcentaje = TDP.ValorPorcentaje
			FROM dbo.TipoDeduccionPorcentual AS TDP
			WHERE TDP.IdTipoDeduccion = @inIdTipoDeduccionAsociar;

			SET @ParametrosBitacora = 
			'{
				"EmpleadoId": ' + CAST(@empleadoId AS VARCHAR) + ',
				"TipoDeduccionId": ' + CAST(@inIdTipoDeduccionAsociar AS VARCHAR) + ',
				"EsPorcentual": "SI",
				"Valor": "' + CAST(@valorPorcentaje AS VARCHAR) + '",
				"Fecha": "' + CONVERT(VARCHAR(10), @inFechaAsociar, 120) + '"
			}';
		END

		DECLARE @TempEmpleadoXMesPlanillaId INT;
		DECLARE @TempMesPlanillaId INT;

		-- Crear instancia en los empleados por mes planilla por cada deduccion para acumular en 
		-- el historial
		-- Mes plantilla actual
		SELECT TOP 1 @TempMesPlanillaId = Id 
		FROM dbo.MesPlanilla 
		ORDER BY Id DESC;

		-- Hay 1 caso en la simulacion en el que un empleado recien creado se le asigan una deduccion
		-- esto genera un error pues el empleado aun no se le ha creado la instancia del mes
		-- por eso se le crea desde aqui para todos los que pase
		IF (NOT EXISTS(SELECT 1 FROM dbo.EmpleadoXMesPlanilla AS MP 
		WHERE (MP.IdMesPlanilla=@TempMesPlanillaId AND MP.IdEmpleado = @empleadoId)) 
		AND @empleadoActivo=1) 
		BEGIN
			-- Insertar EmpleadoXMesPlanilla
			INSERT INTO dbo.EmpleadoXMesPlanilla(IdEmpleado,IdMesPlanilla)
			VALUES (@empleadoId,@TempMesPlanillaId );
		END

		SELECT  @TempEmpleadoXMesPlanillaId = EMP.Id 
		FROM dbo.EmpleadoXMesPlanilla AS EMP
		WHERE(EMP.IdEmpleado = @empleadoId AND EMP.IdMesPlanilla=@TempMesPlanillaId);
		
		-- Insertar como deduccion en el mes actual
		INSERT  INTO dbo.EmpleadoXMesPlanillaXTipoDeduccion (MontoTotal,IdEmpleadoXMesPlanilla,IdTipoDeduccion)
		VALUES( 0,@TempEmpleadoXMesPlanillaId,@inIdTipoDeduccionAsociar);

		-- Registrar en EventLog
		EXEC dbo.sp_generar_json
			@inIdUsuario = @inIdUsuarioAsociar,
			@inIP = @inIP,
			@inIdTipoEvento = 8,
			@inFecha= @inFechaAsociar,
			@inDetalle = 'Asociación de deduccion exitosa',
			@inParametros = @ParametrosBitacora,
			@inDatosAntes = NULL,
			@inDatosDespues = NULL,
			@outJson = @jsonEventLog OUTPUT;

		INSERT INTO dbo.EventLog (ArchivoJSON, IdTipoEvento)
		VALUES (@jsonEventLog, 8);

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
			, CONCAT(@inFechaAsociar,@inIdTipoDeduccionAsociar,@inValorEmpleadoDocAsociar)
		);
	END CATCH

	SET NOCOUNT OFF;
END