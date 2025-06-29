USE [DB_Tarea3]
GO
/****** Object:  StoredProcedure [dbo].[sp_impersonar_empleado]    Script Date: 15/06/2025 22:37:12 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[sp_impersonar_empleado]
	@inIdUsuario INT,
	@inIP VARCHAR(64),
	@inIdEmpleado INT,
	@outResultCode INT OUTPUT
AS
BEGIN
	SET NOCOUNT ON;
	BEGIN TRY 
		IF EXISTS (SELECT 1 FROM dbo.Empleado WHERE Id = @inIdEmpleado AND Activo = 1)
		BEGIN
			SELECT
				E.Id AS Id,
				E.Nombre AS 'Name',
				E.FechaNacimiento AS DateBirth,
				E.ValorDNI AS DNI,
				P.Nombre AS Position,
				D.Nombre AS Department
			FROM 
				dbo.Empleado E
				INNER JOIN dbo.Puesto P ON E.IdPuesto = P.Id
				INNER JOIN dbo.Departamento D ON E.IdDepartamento = D.Id
			WHERE 
				E.Activo = 1 AND E.Id = @inIdEmpleado
			SET @outResultCode = 0;

			
			-- Registrar intento exitoso en EventLog
			DECLARE @jsonEventLog NVARCHAR(MAX);
			DECLARE @ParametrosBitacora NVARCHAR(MAX);
			SET @ParametrosBitacora = '{
				"Id del empleado impersonado": "' + ISNULL(CAST(@inIdEmpleado AS VARCHAR), '') + '"
				}';
			EXEC dbo.sp_generar_json
					@inIdUsuario = @inIdUsuario,
					@inIP = @inIP,
					@inIdTipoEvento = 12,
					@inDetalle = 'Impersonar empleado',
					@inParametros = @ParametrosBitacora,
					@inDatosAntes = NULL,
					@inDatosDespues = NULL,
					@outJson = @jsonEventLog OUTPUT;

			INSERT INTO dbo.EventLog (ArchivoJSON, IdTipoEvento) --IdTipoEvento = 12 = impersonar empleado
			VALUES (@jsonEventLog, 12);
		END

		ELSE -- No existe
		BEGIN
			-- recordset
			SET @outResultCode = 50011; -- no existe empleado con ese Id
			SELECT E.Descripcion AS 'message'  FROM dbo.Error AS E WHERE (E.Codigo=@outResultCode); -- recordset
			RETURN;
		END
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