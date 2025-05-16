-- ================================================
-- Template generated from Template Explorer using:
-- Create Procedure (New Menu).SQL
--
-- ================================================
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Santiago Valverde>
-- Create date: <19/04/2025>
-- Description:	<Hace un borrado lógico del empleado, o sea, cambia el valor de activo a 0.>
-- =============================================
CREATE PROCEDURE sp_borrado_logico_empleado
(
    @inValorDocumentoIdentidad VARCHAR(16),
    @outResultCode INT OUTPUT
)
AS
BEGIN
  SET NOCOUNT ON;
  BEGIN TRY
	BEGIN TRANSACTION;

	DECLARE @canDelete BIT;

    -- Verificar existencia
    IF NOT EXISTS (
        SELECT 1 FROM dbo.Empleado
        WHERE ValorDocumentoIdentidad = @inValorDocumentoIdentidad AND EsActivo = 1
    )
    BEGIN
		SET @outResultCode = 50008; --No existe el empleado y no hay uno en específico

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

		SET @canDelete = 0;
		SELECT @canDelete;
		
	  ROLLBACK;
      RETURN;
    END

    -- Realizar borrado lógico
    UPDATE dbo.Empleado
    SET EsActivo = 0
    WHERE ValorDocumentoIdentidad = @inValorDocumentoIdentidad;

	SELECT Nombre AS detail
	FROM dbo.TipoEvento
	WHERE Id = 10;

	SET @canDelete = 1;
	SELECT @canDelete;

    SET @outResultCode = 0;

	COMMIT;
  END TRY
  BEGIN CATCH
	 IF @@TRANCOUNT > 0
		ROLLBACK;

    SET @outResultCode = 50008; --No se pudo actualizar correctamente.

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

	SET @canDelete = 0;
	SELECT @canDelete;

  END CATCH
  SET NOCOUNT OFF;
END
GO