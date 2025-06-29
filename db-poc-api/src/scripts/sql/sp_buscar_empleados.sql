USE [DB_Tarea3]
GO
/****** Object:  StoredProcedure [dbo].[sp_buscar_empleados]    Script Date: 15/06/2025 22:35:05 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[sp_buscar_empleados]
@inIdUsuario INT,
@inIP VARCHAR(64),
@inBusqueda VARCHAR(64),
@outResultCode INT OUTPUT
AS
BEGIN
  SET NOCOUNT ON;
  BEGIN TRY
    -- Limpieza de espacios en blanco a la izq. y der. del filtro
    SET @inBusqueda = LTRIM(RTRIM(@inBusqueda));  
	
	-- Variables para bitacora
	DECLARE @jsonEventLog NVARCHAR(MAX);
	DECLARE @ParametrosSP NVARCHAR(MAX);
	SET @ParametrosSP = '{
				Descripcion del filtro: ' + @inBusqueda + '
			}';

    -- Si el filtro está vacío, se listan todos los empleados activos
    IF (@inBusqueda = '')
    BEGIN
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
    END
    -- búsqueda por nombre
    ELSE
    BEGIN
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
			AND E.Nombre LIKE '%' + @inBusqueda + '%'
		ORDER BY 
			E.Nombre ASC;
    END

	SET @outResultCode = 0;
	-- Registrar en EventLog
	EXEC dbo.sp_generar_json
			@inIdUsuario = @inIdUsuario,
			@inIP = @inIP,
			@inIdTipoEvento = 4,
			@inDetalle = 'Busqueda de empleados exitoso',
			@inParametros = @ParametrosSP,
			@inDatosAntes = NULL,
			@inDatosDespues = NULL,
			@outJson = @jsonEventLog OUTPUT;
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