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
-- Create date: <7/6/2025>
-- Description:	<Cargar datos del XML del operacion>
-- =============================================
CREATE OR ALTER PROCEDURE sp_cargar_operacion (
	@inXMLData NVARCHAR(MAX), -- Maximo permitido
	@outResultCode int OUTPUT
)AS
BEGIN
	SET NOCOUNT ON;
		-- PROCESAR XML
		DECLARE @XMLArchivo XML = CAST(@inXMLData AS XML);

		-- Tabla temporarl para guadar operaciones por fecha
		DECLARE @TempFechas TABLE (
			Id INT IDENTITY(1,1) PRIMARY KEY
			, FECHA DATE
			, XMLFECHA XML
		);

		-- Carga masiva de opearaciones por fecha
		INSERT INTO @TempFechas (FECHA, XMLFECHA)
		SELECT 
			T.FechaXML.value('@Fecha', 'DATE') 
			, T.FechaXML.query('.') 
		FROM @XMLArchivo.nodes('/Operacion/FechaOperacion') AS T(FechaXML);

		-- Variable para iteracion 
		DECLARE @i INT = 1
				, @Cant INT;

		SELECT @Cant = COUNT(*)
		FROM @TempFechas;

		-- Variables temporales para XMLs de nodos hijos que pueden estar en cada fecha
		DECLARE @NuevosEmpleadosXML XML
				, @AsociacionEmpleadoDeduccionesXML XML
				, @JornadasProximaSemanaXML XML
				, @MarcasAsistenciaXML XML
				, @EliminarEmpleadosXML XML
				, @DesasociacionEmpleadoDeduccionesXML XML;

		BEGIN TRY
			BEGIN TRANSACTION
				WHILE (@i < @Cant)
				BEGIN

					-- Obtener cada sub nodo por fecha si no esta el nodo la variable queda como null
					SELECT @NuevosEmpleadosXML = T.XMLFECHA.query('/FechaOperacion/NuevosEmpleados')
					FROM @TempFechas AS T
					WHERE (T.Id=@i);

					SELECT @AsociacionEmpleadoDeduccionesXML = T.XMLFECHA.query('/FechaOperacion/AsociacionEmpleadoDeducciones')
					FROM @TempFechas AS T
					WHERE (T.Id=@i);

					SELECT @JornadasProximaSemanaXML = T.XMLFECHA.query('/FechaOperacion/JornadasProximaSemana')
					FROM @TempFechas AS T
					WHERE (T.Id=@i);

					SELECT @MarcasAsistenciaXML = T.XMLFECHA.query('/FechaOperacion/MarcasAsistencia')
					FROM @TempFechas AS T
					WHERE (T.Id=@i);

					SELECT @EliminarEmpleadosXML = T.XMLFECHA.query('/FechaOperacion/EliminarEmpleados')
					FROM @TempFechas AS T
					WHERE (T.Id=@i);

					SELECT @DesasociacionEmpleadoDeduccionesXML = T.XMLFECHA.query('/FechaOperacion/DesasociacionEmpleadoDeducciones')
					FROM @TempFechas AS T
					WHERE (T.Id=@i);

					-- SELECT @NuevosEmpleadosXML
					-- SELECT @AsociacionEmpleadoDeduccionesXML
					-- SELECT @JornadasProximaSemanaXML
					-- SELECT @MarcasAsistenciaXML
					-- SELECT @EliminarEmpleadosXML
					-- SELECT @DesasociacionEmpleadoDeduccionesXML
					
					-- Insercion de empleados, se pueden insertar en cualquier momento pero comienzan a trabajar hasta el jueves proximo
					INSERT INTO dbo.Usuario (Nombre,Contraseña,IdTipoUsuario)
					SELECT 
						T.EmpleadoXML.value('@Usuario','VARCHAR(64)')
						, T.EmpleadoXML.value('@Password','VARCHAR(64)')
						, TU.Id
					FROM @NuevosEmpleadosXML.nodes('/NuevosEmpleados/NuevoEmpleado') AS T(EmpleadoXML)
					INNER JOIN dbo.TipoUsuario AS TU ON (TU.Nombre='Empleado');

					SET @i=@i+1;
				END 
				SELECT * FROM  dbo.Usuario
			COMMIT TRANSACTION 
		END TRY
		BEGIN CATCH 
			IF @@TRANCOUNT>0
				 ROLLBACK TRANSACTION;
			
			SET @outResultCode=50008;
			SELECT E.Descripcion AS 'message'  FROM dbo.Error AS E WHERE (E.Codigo=@outResultCode);

			INSERT INTO dbo.DBErrors( 
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



		SET @outResultCode = 0;
	SET NOCOUNT OFF;
END
GO
