USE [DB_Tarea3]
GO
/****** Object:  StoredProcedure [dbo].[sp_eliminar_empleados]    Script Date: 11/6/2025 12:04:22 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[sp_eliminar_empleados]
	@inIdUsuario INT,
	@inIP VARCHAR(64),
	@inIdEmpleado INT,
	@inFecha DATE = NULL,
	@outResultCode INT OUTPUT
AS
BEGIN
	SET NOCOUNT ON;
	BEGIN TRY
		-- Verificar existencia
		IF NOT EXISTS (
			SELECT 1 FROM dbo.Empleado
			WHERE Id = @inIdEmpleado AND Activo = 1
		)
		BEGIN
			SET @outResultCode = 50008; --No existe el empleado y no hay uno en específico
			SELECT 'El empleado con dicho ID no existe' AS 'message' ; -- recordset
			RETURN;
		END

		-- Obtener datos para el eventlog antes del borrado
		DECLARE @Parametros NVARCHAR(MAX);
		SET @Parametros = (
			SELECT 
				'{
					"Nombre": "' + ISNULL(E.Nombre, '') + '",
					"ValorDNI": "' + ISNULL(E.ValorDNI, '') + '",
					"FechaNacimiento": "' + ISNULL(CONVERT(VARCHAR, E.FechaNacimiento, 120), '') + '",
					"IdDepartamento": "' + ISNULL(CAST(E.IdDepartamento AS VARCHAR), '') + '",
					"IdTipoDocumentoIdentidad": "' + ISNULL(CAST(E.IdTipoDocumentoIdentidad AS VARCHAR), '') + '",
					"IdUsuario": "' + ISNULL(CAST(E.IdUsuario AS VARCHAR), '') + '",
					"IdPuesto": "' + ISNULL(CAST(E.IdPuesto AS VARCHAR), '') + '"
				}'
			FROM dbo.Empleado E
			WHERE E.Id = @inIdEmpleado
		);

		-- Realizar borrado lógico
		UPDATE dbo.Empleado
		SET Activo = 0
		WHERE Id = @inIdEmpleado;

		-- Registrar en EventLog
		DECLARE @jsonEventLog NVARCHAR(MAX);
		EXEC dbo.sp_generar_json
				@inIdUsuario = @inIdUsuario,
				@inIP = @inIP,
				@inIdTipoEvento = 6,
				@inDetalle = 'Intento de eliminar empleado exitoso',
				@inParametros = @Parametros,
				@inFecha=@inFecha,
				@inDatosAntes = NULL,
				@inDatosDespues = NULL,
				@outJson = @jsonEventLog OUTPUT;

		INSERT INTO dbo.EventLog (ArchivoJSON, IdTipoEvento) --IdTipoEvento = 7 = eliminar EMPLEADO
		VALUES (@jsonEventLog, 6);
		-- recordset
		SET @outResultCode = 0;
	END TRY

	BEGIN CATCH
		IF @@TRANCOUNT > 0
			ROLLBACK;
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
