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
-- Create date: <10/6/2025>
-- Description:	<Asociar deducciones>
-- =============================================
CREATE OR ALTER PROCEDURE sp_asociar_deduccion_simulacion(
		@inIdUsuarioAsociar INT
		, @inIP VARCHAR(64)
		, @inIdTipoDeduccionAsociar INT
		, @inValorEmpleadoDocAsociar VARCHAR(64)
		, @inMontoAsociar DECIMAL(15,5)
		, @inFechaAsociar DATE
		, @outResultCode INT
)
AS
BEGIN
	SET NOCOUNT ON;

	SET NOCOUNT OFF;
END
GO
