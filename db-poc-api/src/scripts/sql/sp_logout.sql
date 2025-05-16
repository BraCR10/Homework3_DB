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
-- Create date: <20/04/2025>
-- Description:	<Registrar logout>
-- =============================================
CREATE PROCEDURE [dbo].[sp_logout]
(
    @inUserId INT,
    @inIP VARCHAR(32),
    @outResultCode INT OUTPUT
)
AS
BEGIN
  SET NOCOUNT ON;
  BEGIN TRY
	BEGIN TRANSACTION;

	DECLARE @detail VARCHAR(64);

    INSERT INTO dbo.BitacoraEvento (
        IdTipoEvento,
        Descripcion,
        IdPostByUser,
        PostInIP,
        PostTime
    )
    VALUES (
        4,  -- Logout
        'Logout',
        @inUserId,
        @inIP,
        GETDATE()
    );

    SET @outResultCode = 0;

	SELECT @detail = 'Sesión finalizada correctamente';
	
	COMMIT;
  END TRY
  BEGIN CATCH

	IF @@TRANCOUNT > 0
        ROLLBACK;

    SET @outResultCode = 50008; -- Error en base de datos

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