USE [DB_Tarea3]
GO
/****** Object:  StoredProcedure [dbo].[sp_consultar_tipos_deducciones]    Script Date: 15/06/2025 22:44:06 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[sp_consultar_tipos_deducciones]
	@inIdUsuario INT,
	@inIP VARCHAR(64),
	@outResultCode INT OUTPUT
AS
BEGIN
	SET NOCOUNT ON;
	BEGIN TRY
		SELECT 
			TD.Id,
			TD.Nombre AS 'Name',
			TD.FlagObligatorio AS 'IsObligatory',
			TD.FlagPorcentual AS 'IsPercentage',
			TDP.ValorPorcentaje AS 'Percentage'
		FROM 
			dbo.TipoDeduccion TD
		LEFT JOIN 
			dbo.TipoDeduccionPorcentual TDP ON TDP.IdTipoDeduccion = TD.Id
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