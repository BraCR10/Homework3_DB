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
-- Author:		<Brian Ramirez>
-- Create date: <26/4/2025>
-- Description:	<SP para listar puestos y gastos>
-- =============================================
CREATE PROCEDURE sp_listar_estadisticas_plantilla(
	@outResultCode INT OUTPUT
)
AS
BEGIN
	SET NOCOUNT ON;
	BEGIN TRY
		SELECT 
			P.Nombre AS Nombre
			, P.SalarioXHora AS SalarioXHora
			, COUNT(e.Id) as CantEmpleados
		FROM 
			dbo.Puesto AS P
			INNER JOIN dbo.Empleado AS E ON P.Id = E.IdPuesto
		WHERE
			(E.EsActivo=1)
		GROUP BY 
			P.Nombre
			, P.SalarioXHora
		ORDER BY
			P.Nombre;

		SET @outResultCode=0;
	END TRY
	BEGIN CATCH 
		SET @outResultCode = 50008; --No existe el puesto y no hay uno en específico

		SELECT Descripcion AS detail
		FROM dbo.Error
		WHERE Codigo = @outResultCode;

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
	END CATCH 
	SET NOCOUNT OFF;
END
GO
