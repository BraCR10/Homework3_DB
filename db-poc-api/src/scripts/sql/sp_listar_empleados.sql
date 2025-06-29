USE [DB_Tarea3]
GO
/****** Object:  StoredProcedure [dbo].[sp_listar_empleados]    Script Date: 15/06/2025 22:34:40 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[sp_listar_empleados](
	@inIdUsuario INT,
	@inIP VARCHAR(64),
	@outResultCode INT OUTPUT
)
AS
BEGIN
    SET NOCOUNT ON;
	BEGIN TRY
		-- Recordset/consulta
        SELECT
            E.Id AS Id,
			E.Nombre AS 'Name',
			E.FechaNacimiento AS DateBirth,
			E.ValorDNI AS DNI,
            P.Nombre AS Position,
			D.Nombre AS Department
        FROM 
            dbo.Empleado E
            INNER JOIN dbo.Puesto P ON E.IdPuesto = P.Id
			INNER JOIN dbo.Departamento D ON E.IdDepartamento = D.Id
        WHERE 
            E.Activo = 1
        ORDER BY 
            E.Nombre ASC;
		
		-- Variables para bitacora
		DECLARE @jsonEventLog NVARCHAR(MAX);
		DECLARE @ParametrosBitacora NVARCHAR(MAX);
		SET @ParametrosBitacora = '{}';
		-- Registrar en EventLog
		EXEC dbo.sp_generar_json
				@inIdUsuario = @inIdUsuario,
				@inIP = @inIP,
				@inIdTipoEvento = 3,
				@inDetalle = 'Listado de empleados exitoso',
				@inParametros = @ParametrosBitacora,
				@inDatosAntes = NULL,
				@inDatosDespues = NULL,
				@outJson = @jsonEventLog OUTPUT;
		
		INSERT INTO dbo.EventLog (ArchivoJSON, IdTipoEvento) --IdTipoEvento = 3 = ListarEmpleado
		VALUES (@jsonEventLog, 3);
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