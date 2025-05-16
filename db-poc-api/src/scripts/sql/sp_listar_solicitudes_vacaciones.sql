-- ================================================
-- Template generated from Template Explorer using:
-- Create Procedure (New Menu).SQL
--
-- Use the Specify Values for Template Parameters 
-- command (Ctrl-Shift-M) to fill in the parameter 
-- values below.
--
-- This block of comments will not be included in
-- the definition of the procedure.
-- ================================================
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Brian Ramirez Arias>
-- Create date: <26/4/2025>
-- Description:	<SP para consultar movimientos>
-- =============================================
CREATE PROCEDURE sp_listar_solicitudes_vacaciones(
	@outResultCode INT OUTPUT
) 
AS
BEGIN

	SET NOCOUNT ON;

	BEGIN TRY	
		SELECT 
			S.Id AS IdSolicitud
			, S.Estado AS Estado
			, S.DNIEmpleado AS EmpleadoDNI
			, E.Nombre AS EmpleadoNombre
			, S.CantidadDias AS CantDias
			, S.FechaInicio AS FechaInicio
			, S.FechaFin AS FechaFin
			, S.FechaSolicitud AS FechaSolicitud

		FROM
			dbo.Solicitud AS S
			INNER JOIN dbo.Empleado AS E ON S.DNIEmpleado = E.ValorDocumentoIdentidad
		WHERE
			(S.Estado = 'Pendiente' AND
			 E.EsActivo = 1);

		SET @outResultCode = 0;
	END TRY
	BEGIN CATCH

		SET @outResultCode = 50008; --  Error de DB
      
			INSERT INTO dbo.DBError (
					UserName
					, Number
					, Estado
					, Severidad
					, Linea
					, ProcedureError
					, Mensaje
					, FechaHora
				)
				VALUES (
					SUSER_NAME()
					, ERROR_NUMBER()
					, ERROR_STATE()
					, ERROR_SEVERITY()
					, ERROR_LINE()
					, ERROR_PROCEDURE()
					, ERROR_MESSAGE()
					, GETDATE()
				);

			SELECT Descripcion AS detail
			FROM dbo.Error
			WHERE Codigo = @outResultCode;
			RETURN;
	END CATCH
	SET NOCOUNT OFF;

END
GO
