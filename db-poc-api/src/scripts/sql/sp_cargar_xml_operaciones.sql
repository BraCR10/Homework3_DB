USE [DB_Tarea3]
GO
/****** Object:  StoredProcedure [dbo].[sp_cargar_operacion]    Script Date: 19/6/2025 00:15:07 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Brian Ramirez Arias>
-- Create date: <7/6/2025>
-- Description:	<Cargar datos del XML del operacion>
-- =============================================
ALTER   PROCEDURE [dbo].[sp_cargar_operacion] (
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

		--------------------------------------------------------------------
		-- Variables para bucle principal

		-- Variable para iteracion en el bucle principal 
		DECLARE @i INT = 1
				, @Cant INT
				, @TempOutResultCode INT = 0
				, @IPserver VARCHAR(64) = CONVERT(VARCHAR(64), CONNECTIONPROPERTY('local_net_address'))
				, @FechaTemp DATE;

		SELECT @Cant = COUNT(*)
		FROM @TempFechas;

		-- Variables temporales para XMLs de nodos hijos que pueden estar en cada fecha
		DECLARE @NuevosEmpleadosXML XML
				, @AsociacionEmpleadoDeduccionesXML XML
				, @JornadasProximaSemanaXML XML
				, @MarcasAsistenciaXML XML
				, @EliminarEmpleadosXML XML
				, @DesasociacionEmpleadoDeduccionesXML XML;
		--------------------------------------------------------------------

		--------------------------------------------------------------------
		-- Variables para bucle de insercion de empleado

		-- Variables temporales para el bucle de insercion de empleados
		DECLARE @CantEmpleadosInsertar INT = 0
				, @IteradorTemporalEmpleadosInsertar INT = 1;

		-- Tabla variable para insertar los empleados en la simulacion
		DECLARE @TempEmpleadoInsertar TABLE (
			Id INT IDENTITY(1,1) PRIMARY KEY
			, IdUsuario INT
			, Nombre VARCHAR(64)
			, EmpleadoUsuario VARCHAR(64)
			, EmpleadoContraseña VARCHAR(64)
			, IdDocTipo INT
			, ValorDoc VARCHAR(64)
			, FechaNacimiento DATE
			, IdPuesto INT
			, IdDepartamento INT
		);

		-- Variables para insertar empleados en la simulacion 
		DECLARE @IdUsuarioInsertar INT,
			@NombreInsertar VARCHAR(64),
			@EmpleadoUsuarioInsertar VARCHAR(64),
			@EmpleadoContraseñaInsertar VARCHAR(64),
			@IdDocTipoInsertar INT,
			@ValorDocInsertar VARCHAR(64),
			@FechaNacimientoInsertar DATE,
			@IdPuestoInsertar INT,
			@IdDepartamentoInsertar INT;

		-- Tabla variable para insertar los usuarios en la simulacion
		DECLARE @TempUsuarioInsertar TABLE (
			Nombre VARCHAR(64)
			, Contraseña VARCHAR(64)
			, IdTipoUsuario INT
		);
		--------------------------------------------------------------------

		--------------------------------------------------------------------

		-- Variables temporales para el bucle de eliminacion de empleados
		DECLARE @CantEmpleadosEliminar INT = 0
				, @IteradorTemporalEmpleadosEliminar INT = 1;


		-- Tabla variable para eliminar empleados
		DECLARE @TempEmpleadoEliminar TABLE (
			Id INT IDENTITY(1,1) PRIMARY KEY
			, IdUsuario INT
			, ValorDoc VARCHAR(64)
			, EmpleadoId INT
		);
	
		-- Varibles para eliminar uno a uno 
		DECLARE @IdUsuarioEliminar INT,
			@IdEmpleadoEliminar INT;

		--------------------------------------------------------------------

		--------------------------------------------------------------------

		-- Variables temporales para el bucle de asociacion deduccion con empleados
		DECLARE @CantEmpleadosAsociar INT = 0
				, @IteradorTemporalEmpleadosAsociar INT = 1;
				


		-- Tabla variable para insertar los registros de asociacion de deducciones semanales
		DECLARE @TempAsociacionDeducciones TABLE (
			Id INT PRIMARY KEY IDENTITY(1,1)
			, IdUsuario INT
			, IdTipoDeduccion INT
			, ValorEmpleadoDoc VARCHAR(64)
			, Monto DECIMAL(15,5)
			, Fecha DATE
		);

		-- Varibles para asociar uno a uno 
		DECLARE @IdUsuarioAsociar INT
			, @IdTipoDeduccionAsociar INT
			, @ValorEmpleadoDocAsociar VARCHAR(64)
			, @MontoAsociar DECIMAL(15,5) 
			, @FechaAsociar DATE;

		--------------------------------------------------------------------

		--------------------------------------------------------------------

		-- Variables temporales para el bucle de desasociacion deduccion con empleados
		DECLARE @CantEmpleadosDesasociar INT = 0
				, @IteradorTemporalEmpleadosDesasociar INT = 1;
				


		-- Tabla variable para insertar los registros de asociacion de deducciones semanales
		DECLARE @TempDesasociacionDeducciones TABLE (
			Id INT PRIMARY KEY IDENTITY(1,1)
			, IdUsuario INT
			, IdTipoDeduccion INT
			, ValorEmpleadoDoc VARCHAR(64)
			, Fecha DATE
		);

		-- Varibles para asociar uno a uno 
		DECLARE @IdUsuarioDesasociar INT
			, @IdTipoDeduccionDesasociar INT
			, @ValorEmpleadoDocDesasociar VARCHAR(64)
			, @FechaDesasociar DATE;

		--------------------------------------------------------------------
		
		BEGIN TRY
				WHILE (@i <= @Cant) -- Bucle principal 
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

					-- Fecha de este ciclo
					SELECT @FechaTemp = TF.FECHA
					FROM @TempFechas AS TF 
					WHERE (TF.Id=@i);

					-- SELECT @NuevosEmpleadosXML
					-- SELECT @AsociacionEmpleadoDeduccionesXML
					-- SELECT @JornadasProximaSemanaXML
					-- SELECT @MarcasAsistenciaXML
					-- SELECT @EliminarEmpleadosXML
					-- SELECT @DesasociacionEmpleadoDeduccionesXML
					
					---------------------------------------------------------------------------------------------
					-- Insertar nuevo empleado 
					
					-- Insertando los usuarios de los empleados masivamente en tablas temporales
					INSERT INTO @TempUsuarioInsertar (Nombre,Contraseña,IdTipoUsuario)
					SELECT 
						T.EmpleadoXML.value('@Usuario','VARCHAR(64)')
						, T.EmpleadoXML.value('@Password','VARCHAR(64)')
						, TU.Id
					FROM @NuevosEmpleadosXML.nodes('/NuevosEmpleados/NuevoEmpleado') AS T(EmpleadoXML)
					INNER JOIN dbo.TipoUsuario AS TU ON (TU.Nombre='Empleado');

					-- Insertando masivamente los empleados de la fecha en la tabla temporal
					INSERT INTO @TempEmpleadoInsertar (
								IdUsuario 
								, Nombre 
								, EmpleadoUsuario 
								, EmpleadoContraseña 
								, IdDocTipo 
								, ValorDoc 
								, FechaNacimiento 
								, IdPuesto 
								, IdDepartamento 
								 )
					SELECT 
						EU.Id -- Sistema
						, T.EmpleadoXML.value('@Nombre','VARCHAR(64)')
						, U.Nombre
						, U.Contraseña
						, T.EmpleadoXML.value('@IdTipoDocumento','INT')
						, T.EmpleadoXML.value('@ValorTipoDocumento','VARCHAR(64)')
						, T.EmpleadoXML.value('@FechaNacimiento','DATE')
						, P.Id
						, T.EmpleadoXML.value('@IdDepartamento','INT')
					FROM @NuevosEmpleadosXML.nodes('/NuevosEmpleados/NuevoEmpleado') AS T(EmpleadoXML)
					INNER JOIN @TempUsuarioInsertar AS U ON (U.Nombre=T.EmpleadoXML.value('@Usuario','VARCHAR(64)'))
					INNER JOIN dbo.Puesto AS P ON (P.Nombre=T.EmpleadoXML.value('@NombrePuesto','VARCHAR(64)'))
					INNER JOIN dbo.Usuario AS EU ON (EU.IdTipoUsuario=3); -- 3 Es el tipo de usuario sistema

					-- Calculando la cantidad de empleados a procesar 
					-- (tomando en cuenta que el ID de las tablas varibles no se pueden resetear)
					SELECT @CantEmpleadosInsertar = @CantEmpleadosInsertar + COUNT(*)
					FROM @TempEmpleadoInsertar;
					
					-- Insertando iterativamente empleado por empleado
					WHILE(@IteradorTemporalEmpleadosInsertar<=@CantEmpleadosInsertar)
					BEGIN
						SELECT 
							@IdUsuarioInsertar = TE.IdUsuario
							, @NombreInsertar = TE.Nombre
							, @EmpleadoUsuarioInsertar = TE.EmpleadoUsuario
							, @EmpleadoContraseñaInsertar = TE.EmpleadoContraseña
							, @IdDocTipoInsertar = TE.IdDocTipo
							, @ValorDocInsertar = TE.ValorDoc
							, @FechaNacimientoInsertar = TE.FechaNacimiento
							, @IdPuestoInsertar = TE.IdPuesto
							, @IdDepartamentoInsertar = TE.IdDepartamento
						FROM @TempEmpleadoInsertar AS TE
						WHERE (TE.Id = @IteradorTemporalEmpleadosInsertar);

						 EXEC dbo.sp_crear_empleado
							@IdUsuarioInsertar
							, @IPserver
							, @NombreInsertar
							, @EmpleadoUsuarioInsertar
							, @EmpleadoContraseñaInsertar
							, @IdDocTipoInsertar
							, @ValorDocInsertar
							, @FechaNacimientoInsertar
							, @IdPuestoInsertar
							, @IdDepartamentoInsertar
							, @FechaTemp
							, @TempOutResultCode;

						-- TODO: Se deveria hacer algo si la insercion no se logro? 

						SET @IteradorTemporalEmpleadosInsertar=@IteradorTemporalEmpleadosInsertar+1;
					END

					-- Limpiando tablas temporales para insercion de empleados
					-- Esto borra datos pero no reinicia el IDENTITY
					DELETE FROM @TempEmpleadoInsertar;
					DELETE FROM @TempUsuarioInsertar;
					---------------------------------------------------------------------------------------------

					-- Eliminar empleados 
					-- Insertando los empleados a eliminar masivamente en tablas temporales
					INSERT INTO @TempEmpleadoEliminar (IdUsuario,ValorDoc, EmpleadoId)
					SELECT 
						EU.Id
						, T.EmpleadoXML.value('@ValorTipoDocumento','VARCHAR(64)')
						, E.Id
					FROM @EliminarEmpleadosXML.nodes('/EliminarEmpleados/EliminarEmpleado ') AS T(EmpleadoXML)
					INNER JOIN dbo.Empleado AS E ON (E.ValorDNI=T.EmpleadoXML.value('@ValorTipoDocumento','VARCHAR(64)'))
					INNER JOIN dbo.Usuario AS EU ON (EU.IdTipoUsuario=3); -- 3 Es el tipo de usuario sistema

					-- Calculando la cantidad de empleados a procesar 
					-- (tomando en cuenta que el ID de las tablas varibles no se pueden resetear)
					SELECT @CantEmpleadosEliminar = @CantEmpleadosEliminar + COUNT(*)
					FROM @TempEmpleadoEliminar;


					-- Eliminando iterativamente empleado por empleado
					WHILE(@IteradorTemporalEmpleadosEliminar<=@CantEmpleadosEliminar)
					BEGIN
						
						SELECT 
							@IdUsuarioEliminar = TE.IdUsuario
							, @IdEmpleadoEliminar= TE.EmpleadoId
						FROM @TempEmpleadoEliminar AS TE
						WHERE(TE.Id=@IteradorTemporalEmpleadosEliminar);
						--SELECT @IdUsuarioEliminar , @IdEmpleadoEliminar , 
						EXEC dbo.sp_eliminar_empleados
							@IdUsuarioEliminar
							, @IPserver
							, @IdEmpleadoEliminar
							, @FechaTemp
							, @TempOutResultCode; 
						
						-- TODO: Se deveria hacer algo si la eliminacion no se logro? 

						SET @IteradorTemporalEmpleadosEliminar=@IteradorTemporalEmpleadosEliminar+1;
					END
						
					-- Limpiando tablas temporales para insercion de empleados
					-- Esto borra datos pero no reinicia el IDENTITY
					DELETE FROM @TempEmpleadoEliminar;
					---------------------------------------------------------------------------------------------

					-- Asociar deducciones
					
					-- Insertando asociaciones de los empleados masivamente en tablas temporales
					INSERT INTO @TempAsociacionDeducciones (IdUsuario , IdTipoDeduccion , ValorEmpleadoDoc, Monto, Fecha)
					SELECT 
						EU.Id
						,T.AsociacionXML.value('@IdTipoDeduccion','INT')
						, T.AsociacionXML.value('@ValorTipoDocumento','VARCHAR(64)')
						, T.AsociacionXML.value('@Monto','DECIMAL(15,5)')
						, @FechaTemp
					FROM @AsociacionEmpleadoDeduccionesXML.nodes('/AsociacionEmpleadoDeducciones/AsociacionEmpleadoConDeduccion ') AS T(AsociacionXML)
					INNER JOIN dbo.Usuario AS EU ON (EU.IdTipoUsuario=3); -- 3 Es el tipo de usuario sistema
	
					IF ('Friday' = (SELECT DATENAME(WEEKDAY, @FechaTemp)) OR @i=@Cant )
					BEGIN

						-- Calculando la cantidad de asociaciones de la semana
						-- (tomando en cuenta que el ID de las tablas varibles no se pueden resetear)
						SELECT @CantEmpleadosAsociar = @CantEmpleadosAsociar + COUNT(*)
						FROM @TempAsociacionDeducciones;

						-- Asociando iterativamente deduccion por deduccion
						WHILE(@IteradorTemporalEmpleadosAsociar<=@CantEmpleadosAsociar)
						BEGIN
						
							SELECT 
								@IdUsuarioAsociar = TE.IdUsuario
								, @IdTipoDeduccionAsociar =  TE.IdTipoDeduccion
								, @ValorEmpleadoDocAsociar = TE.ValorEmpleadoDoc
								, @MontoAsociar = TE.Monto
								, @FechaAsociar = TE.Fecha
							FROM @TempAsociacionDeducciones AS TE
							WHERE(TE.Id=@IteradorTemporalEmpleadosAsociar);


							EXEC dbo.sp_asociar_deduccion_simulacion
								@IdUsuarioAsociar
								, @IPserver
								, @IdTipoDeduccionAsociar
								, @ValorEmpleadoDocAsociar
								, @MontoAsociar
								, @FechaAsociar
								, @TempOutResultCode
						
							-- TODO: Se deveria hacer algo si la asociacion no se logro? 

							SET @IteradorTemporalEmpleadosAsociar=@IteradorTemporalEmpleadosAsociar+1;
						END
						
						-- Limpiando tablas temporales para asociacones 
						-- Esto borra datos pero no reinicia el IDENTITY
						DELETE FROM @TempAsociacionDeducciones;
					END
					---------------------------------------------------------------------------------------------
					-- Desasociar deducciones
					
					-- Insertando desasociaciones de los empleados masivamente en tablas temporales
					INSERT INTO @TempDesasociacionDeducciones (IdUsuario , IdTipoDeduccion , ValorEmpleadoDoc, Fecha)
					SELECT 
						EU.Id
						,T.DesasociacionXML.value('@IdTipoDeduccion','INT')
						, T.DesasociacionXML.value('@ValorTipoDocumento','VARCHAR(64)')
						, @FechaTemp
					FROM @DesasociacionEmpleadoDeduccionesXML.nodes('/DesasociacionEmpleadoDeducciones/DesasociacionEmpleadoConDeduccion') AS T(DesasociacionXML)
					INNER JOIN dbo.Usuario AS EU ON (EU.IdTipoUsuario=3); -- 3 Es el tipo de usuario sistema
	
					IF ('Friday' = (SELECT DATENAME(WEEKDAY, @FechaTemp)) OR @i=@Cant)
					BEGIN

						-- Calculando la cantidad de asociaciones de la semana
						-- (tomando en cuenta que el ID de las tablas varibles no se pueden resetear)
						SELECT @CantEmpleadosDesasociar = @CantEmpleadosDesasociar + COUNT(*)
						FROM @TempDesasociacionDeducciones;

						-- Asociando iterativamente deduccion por deduccion
						WHILE(@IteradorTemporalEmpleadosDesasociar<=@CantEmpleadosDesasociar)
						BEGIN
						
							SELECT 
								@IdUsuarioDesasociar = TE.IdUsuario
								, @IdTipoDeduccionDesasociar =  TE.IdTipoDeduccion
								, @ValorEmpleadoDocDesasociar = TE.ValorEmpleadoDoc
								, @FechaDesasociar = TE.Fecha
							FROM @TempDesasociacionDeducciones AS TE
							WHERE(TE.Id=@IteradorTemporalEmpleadosDesasociar);

							EXEC dbo.sp_desasociar_deduccion_simulacion
								@IdUsuarioDesasociar
								, @IPserver
								, @IdTipoDeduccionDesasociar
								, @ValorEmpleadoDocDesasociar
								, @FechaDesasociar
								, @TempOutResultCode
						
							-- TODO: Se deveria hacer algo si la desasociacion no se logro? 

							SET @IteradorTemporalEmpleadosDesasociar=@IteradorTemporalEmpleadosDesasociar+1;
						END
						
						-- Limpiando tablas temporales para desasociaciones  
						-- Esto borra datos pero no reinicia el IDENTITY
						DELETE FROM @TempDesasociacionDeducciones;
					END
					---------------------------------------------------------------------------------------------
					
					-- Lllamada SP para gestionar asistencias y cierres, se pidio en un requerimiento que fuera todo en una transaccion
					EXEC dbo.sp_asistencia_cierres 
						@inMarcasAsistenciaXML = @MarcasAsistenciaXML
						, @inJornadasProximaSemanaXML =@JornadasProximaSemanaXML
						, @inFecha  = @FechaTemp
						, @outResultCode = @TempOutResultCode
					
					SET @i=@i+1;
				END 
		END TRY
		BEGIN CATCH 
			
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
				
				RETURN;
		END CATCH



		SET @outResultCode = 0;
	SET NOCOUNT OFF;
END