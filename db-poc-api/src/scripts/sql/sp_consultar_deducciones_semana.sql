USE [DB_Tarea3]
GO
/****** Object:  StoredProcedure [dbo].[sp_consultar_deducciones_semana]    Script Date: 15/06/2025 22:42:01 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[sp_consultar_deducciones_semana]
	@inIdUsuario INT,
	@inIP VARCHAR(64),
	@inIdEmpleado INT,
	@inIdSemana INT,
	@outResultCode INT OUTPUT
AS
BEGIN
	SET NOCOUNT ON;
	BEGIN TRY
		-- validar que exista el empleado
		IF NOT EXISTS (SELECT 1 FROM dbo.Empleado WHERE Id = @inIdEmpleado AND Activo = 1)
		BEGIN
			-- recordset
			SET @outResultCode = 50011; -- no existe empleado con ese Id
			SELECT E.Descripcion AS 'message'  FROM dbo.Error AS E WHERE (E.Codigo=@outResultCode); -- recordset
			RETURN;
		END
		-- Validar que exista la semana 
		IF NOT EXISTS (SELECT 1 FROM dbo.SemanaPlanilla WHERE Id = @inIdSemana)
		BEGIN
			-- recordset
			SET @outResultCode = 50012; -- no existe una semana con ese Id
			SELECT E.Descripcion AS 'message'  FROM dbo.Error AS E WHERE (E.Codigo=@outResultCode); -- recordset
			RETURN;
		END

		-- obtener las deducciones de una semana específica para un empleado.
		SELECT VD.Nombre AS DeductionType
		, VD.FlagPorcentual AS isPercentage
		, VD.ValorPorcentaje AS 'Percentage'
		, VD.Valor AS Amount
		FROM dbo.VistaDeducciones VD
		WHERE VD.IdEmpleado = @inIdEmpleado AND VD.IdSemanaPlanilla = @inIdSemana
		SET @outResultCode = 0; 
		-- No hay eventlog
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