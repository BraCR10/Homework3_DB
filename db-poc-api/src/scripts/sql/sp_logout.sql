USE [DB_Tarea3]
GO
/****** Object:  StoredProcedure [dbo].[sp_logout]    Script Date: 15/06/2025 22:34:11 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[sp_logout](
    @inUserId INT,
    @inIP VARCHAR(32),
    @outResultCode INT OUTPUT
)
AS
BEGIN
	SET NOCOUNT ON;
	BEGIN TRY
		-- Variables para bitacora
		DECLARE @jsonEventLog NVARCHAR(MAX);
		DECLARE @ParametrosSP NVARCHAR(MAX);
		SET @ParametrosSP = '{}';
					
		-- Registrar logout en EventLog
		EXEC dbo.sp_generar_json
				@inIdUsuario = @inUserId,
				@inIP = @inIP,
				@inIdTipoEvento = 2,
				@inDetalle = 'Logout exitoso',
				@inParametros = @ParametrosSP,
				@inDatosAntes = NULL,
				@inDatosDespues = NULL,
				@outJson = @jsonEventLog OUTPUT;

		INSERT INTO dbo.EventLog (ArchivoJSON, IdTipoEvento) --IdTipoEvento = 2 = Logout
		VALUES (@jsonEventLog, 2);

		SET @outResultCode = 0;	
		RETURN;
		-- No hay recordset
	END TRY

	BEGIN CATCH

		SET @outResultCode = 50008; -- Error general de base de datos
		SELECT E.Descripcion AS 'message'  FROM dbo.Error AS E WHERE (E.Codigo=@outResultCode);

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