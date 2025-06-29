USE [DB_Tarea3]
GO
/****** Object:  StoredProcedure [dbo].[sp_consultar_salario_bruto_semanal]    Script Date: 15/06/2025 22:42:22 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[sp_consultar_salario_bruto_semanal]
	@inIdUsuario INT
	, @inIP VARCHAR(64)
	, @inIdEmpleado INT
	, @inIdSemana INT
	, @outResultCode INT OUTPUT
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
		SELECT 
			VCH.Fecha AS DateDay,
			MIN(VCH.HoraIni) AS EntryTime -- Asigna la Hora de inicio del movimiento mas temprano de esa fecha
			, MAX(VCH.HoraFin) AS ExitTime -- Asigna la Hora de fin del movimiento mas tarde de esa fecha 
			, SUM(CASE 
				WHEN VCH.TipoMovimiento = 1 
				THEN VCH.Horas 
				ELSE 0 
				END) AS OrdinaryHours
			, SUM(CASE 
				WHEN VCH.TipoMovimiento = 1 
				THEN VCH.Monto 
				ELSE 0 END) AS OrdinaryAmount
			, SUM(CASE 
				WHEN VCH.TipoMovimiento = 2 
				THEN VCH.Horas 
				ELSE 0 
				END) AS NormalExtraHours
			, SUM(CASE 
				WHEN VCH.TipoMovimiento = 2 
				THEN VCH.Monto 
				ELSE 0 
				END) AS NormalExtraAmount
			, SUM(CASE 
				WHEN VCH.TipoMovimiento = 3 
				THEN VCH.Horas 
				ELSE 0 
				END) AS DoubleExtraHours
			, SUM(CASE 
				WHEN VCH.TipoMovimiento = 3 
				THEN VCH.Monto 
				ELSE 0 END) AS DoubleExtraAmount
			, SUM(VCH.Monto) AS DayTotal
		FROM 
			dbo.VistaCreditoHoras VCH
		WHERE 
			VCH.IdEmpleado = @inIdEmpleado 
			AND VCH.IdSemanaPlanilla = @inIdSemana
		GROUP BY 
			VCH.Fecha
		ORDER BY 
			VCH.Fecha;

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