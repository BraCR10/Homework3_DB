USE [DB_Tarea3]
GO
/****** Object:  StoredProcedure [dbo].[sp_terminar_impersonar_empleado]    Script Date: 15/06/2025 22:37:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[sp_terminar_impersonar_empleado]
	@inIdUsuario INT,
	@inIP VARCHAR(64),
	@inIdEmpleado INT,
	@outResultCode INT OUTPUT

AS
BEGIN
	SET NOCOUNT ON;
	BEGIN TRY
		IF NOT EXISTS (SELECT 1 FROM dbo.Empleado WHERE Id = @inIdEmpleado AND Activo = 1)
		BEGIN
			-- recordset
			SET @outResultCode = 50011; -- no existe empleado con ese Id
			SELECT E.Descripcion AS 'message'  FROM dbo.Error AS E WHERE (E.Codigo=@outResultCode); -- recordset
			RETURN;
		END
		-- Registrar intento exitoso en EventLog
			DECLARE @jsonEventLog NVARCHAR(MAX);
			EXEC dbo.sp_generar_json
					@inIdUsuario = @inIdUsuario,
					@inIP = @inIP,
					@inIdTipoEvento = 13,
					@inDetalle = 'Fin de impersonar empleado',
					@inParametros = '{}',
					@inDatosAntes = NULL,
					@inDatosDespues = NULL,
					@outJson = @jsonEventLog OUTPUT;

			INSERT INTO dbo.EventLog (ArchivoJSON, IdTipoEvento) --IdTipoEvento = 13 = regresar a administrador
			VALUES (@jsonEventLog, 13);
			SET @outResultCode = 0
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