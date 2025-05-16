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
-- Create date: <24/04/2025>
-- Description:	<Inserta un error a la bitacora de errores>
-- =============================================
CREATE PROCEDURE [dbo].[sp_intento_borrado_no_confirmado]
(
  @inEmpleadoId INT,
  @inUserId INT,
  @inIP VARCHAR(32),
  @outResultCode INT OUTPUT
)
AS
BEGIN
  SET NOCOUNT ON;
  BEGIN TRY
	BEGIN TRANSACTION;

    DECLARE @docIdentidad VARCHAR(16);
    DECLARE @nombreEmpleado VARCHAR(64);
    DECLARE @nombrePuesto VARCHAR(64);
    DECLARE @saldo DECIMAL(10,2);
    DECLARE @descripcion VARCHAR(256);

    SELECT 
      @docIdentidad = E.ValorDocumentoIdentidad,
      @nombreEmpleado = E.Nombre,
      @saldo = E.SaldoVacaciones,
      @nombrePuesto = P.Nombre
    FROM dbo.Empleado E
    JOIN dbo.Puesto P ON E.IdPuesto = P.Id
    WHERE E.Id = @inEmpleadoId;

    SET @descripcion = 'Intento de borrado: Documento = ' + @docIdentidad + 
                       ', Nombre = ' + @nombreEmpleado + 
                       ', Puesto = ' + @nombrePuesto + 
                       ', SaldoVacaciones = ' + CAST(@saldo AS NVARCHAR(20));

    INSERT INTO dbo.BitacoraEvento (
      IdTipoEvento, Descripcion, IdPostByUser, PostInIP, PostTime
    )
    VALUES (
      9, @descripcion, @inUserId, @inIP, GETDATE()
    );
	
    SET @outResultCode = 0;

	COMMIT;
  END TRY
  BEGIN CATCH
	IF @@TRANCOUNT > 0
		ROLLBACK;

    SET @outResultCode = 50014; -- Error de base de datos

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