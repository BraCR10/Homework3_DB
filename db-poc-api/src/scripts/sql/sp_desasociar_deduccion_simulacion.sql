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
-- Description:	<Desasociar deducciones>
-- =============================================
CREATE OR ALTER PROCEDURE sp_desasociar_deduccion_simulacion(
		@inIdUsuarioDesasociar INT
		, @inIP VARCHAR(64)
		, @inIdTipoDeduccionDesasociar INT
		, @inValorEmpleadoDocDesasociar VARCHAR(64)
		, @inFechaDesasociar DATE
		, @outResultCode INT
)
AS
BEGIN
	SET NOCOUNT ON;

	SET NOCOUNT OFF;
END
GO