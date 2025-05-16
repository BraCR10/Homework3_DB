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
-- Description:	<Actualiza datos del empleado>
-- =============================================
CREATE PROCEDURE sp_actualizar_empleados
(
    @inValorDocIdentidad_Actual VARCHAR(16),
    @inNuevoNombre VARCHAR(64),
    @inNuevoValorDocIdentidad VARCHAR(16),
    @inNuevoIdPuesto INT,
    @outResultCode INT OUTPUT
)
AS
BEGIN
  SET NOCOUNT ON;
  BEGIN TRY
	BEGIN TRANSACTION;

    -- Validación de nombre
    IF (@inNuevoNombre LIKE '%[^a-zA-Z ]%')
    BEGIN
      SET @outResultCode = 50009; -- Nombre de empleado no alfabético

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

	  ROLLBACK;
      RETURN;
    END

    -- Validación de cédula
    IF (@inNuevoValorDocIdentidad LIKE '%[^0-9]%')
    BEGIN
      SET @outResultCode = 50010; -- Valor de documento de identidad no alfabético 
	  
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

	  ROLLBACK;
      RETURN;
    END

    DECLARE @idEmpleado INT;

    SELECT @idEmpleado = id
    FROM dbo.Empleado
    WHERE ValorDocumentoIdentidad = @inValorDocIdentidad_Actual AND EsActivo = 1;

    IF (@idEmpleado IS NULL)
    BEGIN
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

	  ROLLBACK;
      RETURN;
    END

    -- Validar que nuevo nombre no exista en otro empleado
    IF EXISTS (
        SELECT 1 FROM dbo.Empleado
        WHERE RTRIM(LTRIM(Nombre)) = RTRIM(LTRIM(@inNuevoNombre)) 
          AND id <> @idEmpleado
    )
    BEGIN
      SET @outResultCode = 50007; -- Empleado con mismo nombre ya existe en actualización

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

	  ROLLBACK;
      RETURN;
    END

    -- Validar que nuevo documento no exista en otro empleado
    IF EXISTS (
        SELECT 1 FROM dbo.Empleado 
        WHERE ValorDocumentoIdentidad = @inNuevoValorDocIdentidad
          AND id <> @idEmpleado
    )
    BEGIN
      SET @outResultCode = 50006; -- Empleado con ValorDocumentoIdentidad ya existe en actualizacion

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

	  ROLLBACK;
      RETURN;
    END

    -- Realizar actualización
    UPDATE dbo.Empleado
    SET 
      Nombre = @inNuevoNombre,
      ValorDocumentoIdentidad = @inNuevoValorDocIdentidad,
      IdPuesto = @inNuevoIdPuesto
    WHERE 
      id = @idEmpleado;

    SET @outResultCode = 0;

	SELECT Nombre AS message
	FROM dbo.TipoEvento
	WHERE Id = 8;

	SELECT @inNuevoNombre;
	SELECT @inNuevoIdPuesto;

	COMMIT;

  END TRY
  BEGIN CATCH

	IF @@TRANCOUNT > 0
        ROLLBACK;
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