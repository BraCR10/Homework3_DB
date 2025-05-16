-- ================================================
-- Template generated from Template Explorer using:
-- Create Procedure (New Menu).SQL
-- ================================================
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Santiago Valverde>
-- Create date: <23/04/2025>
-- Description:	<Listar Tipos de movimientos>
-- =============================================
CREATE PROCEDURE [dbo].[sp_listar_tipos_movimientos]
(
    @outResultCode INT OUTPUT
)
AS
BEGIN
  SET NOCOUNT ON;
  BEGIN TRY

    SELECT 
        Id,
        Nombre,
        TipoAccion
    FROM 
        dbo.TipoMovimiento
    ORDER BY 
        Nombre ASC;

    SET @outResultCode = 0;

  END TRY
  BEGIN CATCH
    SET @outResultCode = 50008; -- Error de base de datos

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

  END CATCH
  SET NOCOUNT OFF;
END
GO