USE [DB_Tarea3]
GO
/****** Object:  StoredProcedure [dbo].[sp_asistencia_cierres]    Script Date: 22/6/2025 15:46:58 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[sp_asistencia_cierres] (
	@inMarcasAsistenciaXML XML
	, @inJornadasProximaSemanaXML XML
	, @inFecha DATE
	, @outResultCode INT OUTPUT
)AS
BEGIN
	SET NOCOUNT ON;

	BEGIN TRY
		-- Tabla variable para insertar los registros de asistencias
		DECLARE @TempAsistencias TABLE (
			Id INT PRIMARY KEY IDENTITY(1,1)
			, ValorEmpleadoDoc VARCHAR(64)
			, HoraEntrada DATETIME
			, HoraSalida DATETIME
			, Fecha DATE
		);

		DECLARE @TempJornadas TABLE (
			Id INT PRIMARY KEY IDENTITY(1,1)
			, ValorEmpleadoDoc VARCHAR(64)
			, TipoJornada INT
		);

		-- Tabla variables para manejar deducciones
		DECLARE @TempDeduccionesSemanaObligatoriaPorcentual TABLE(
			Id INT PRIMARY KEY IDENTITY(1,1)
			, IdEmpelado INT
			, IdEmpleadoTipoDeduccion INT
			, IdTipoDeduccion INT
			, Valor DECIMAL(15,5)
		);
		DECLARE @TempDeduccionesSemanaPorcentual TABLE(
			Id INT PRIMARY KEY IDENTITY(1,1)
			, IdEmpelado INT
			, IdEmpleadoTipoDeduccion INT
			, IdTipoDeduccion INT
			, FlagObligatoria BIT
			, Valor DECIMAL(15,5)
		);
		DECLARE @TempDeduccionesSemanaFija TABLE(
			Id INT PRIMARY KEY IDENTITY(1,1)
			, IdEmpelado INT
			, IdTipoDeduccion INT
			, IdEmpleadoTipoDeduccion INT
			, FlagObligatoria BIT
			, Valor DECIMAL(15,5)
		);

		-- Variables principales del procedimiento
		DECLARE @flagPagoDobleDiaActual BIT = 0;
		DECLARE @flagPagoDobleDiaSig BIT = 0;
		DECLARE @flagEsJueves BIT = 0;
		DECLARE @semanaActualId INT;
		DECLARE @MaxEmpleados INT;
		DECLARE @CurrentEmpleado INT = 1;

		-- Variables para datos del empleado actual
		DECLARE @idEmpleado INT;
		DECLARE @dniEmpleado VARCHAR(64);
		DECLARE @salarioxHora DECIMAL(15,5);
		DECLARE @jornadaEmpleadoIni TIME;
		DECLARE @jornadaEmpleadoFin TIME;
		DECLARE @EmpleadoActivo BIT;

		-- Variables para asistencia
		DECLARE @HoraEntradaAsistencia DATETIME;
		DECLARE @HoraSalidaAsistencia DATETIME;

		-- Variables para calculo de horas
		DECLARE @QhorasOrdinarias DECIMAL(15,5);
		DECLARE @QhorasExtra DECIMAL(15,5);
		DECLARE @QhorasDobles DECIMAL(15,5);
		DECLARE @QhorasExtrasDobles DECIMAL(15,5);
		DECLARE @QhorasOrdinariasDiaSig DECIMAL(15,5);
		DECLARE @QhorasExtraDiaSig DECIMAL(15,5);
		DECLARE @QhorasDoblesDiaSig DECIMAL(15,5);
		DECLARE @QhorasExtrasDoblesDiaSig DECIMAL(15,5);
		DECLARE @HorasTrabajadasDiaActual DECIMAL(15,5);
		DECLARE @HorasTrabajadasDiaSig DECIMAL(15,5);
		DECLARE @HorasJornadaRestantes DECIMAL(15,5);

		-- Variables auxiliares para calculos de asistencias
		DECLARE @medianoche DATETIME = DATEADD(DAY, 1, CAST(@inFecha AS DATETIME));
		DECLARE @TempIniHoraAsistencia TIME;
		DECLARE @TempFinHoraAsistencia TIME;
		DECLARE @SalarioOrdinario DECIMAL(15,5) = 0;
		DECLARE @SalarioHorasExtras DECIMAL(15,5) = 0;
		DECLARE @SalarioHorasDobles DECIMAL(15,5) = 0;
		DECLARE @EsTurnoNocturno BIT = 0;
		DECLARE @CruzaMedianoche BIT = 0;
		DECLARE @MinutosTrabajados INT = 0;
		DECLARE @MinutosJornada INT = 0;
		DECLARE @ErrorAlCalcularMarca BIT = 0;

		-- Variables para interseccion de jornadas 
		DECLARE @InicioInterseccion DATETIME;
		DECLARE @FinInterseccion DATETIME;
		DECLARE @MinutosInterseccion INT = 0;
		DECLARE @JornadaInicioCompleta DATETIME;
		DECLARE @JornadaFinCompleta DATETIME;
		DECLARE @TempInicioJornadaNocturnoMediaNoche DATETIME;
		DECLARE @FinJornadaManana DATETIME;
		DECLARE @TempFinJornadaHoyMedianocheSinExtras DATETIME;
		DECLARE @TempInicioJornadaMediaNoche DATETIME;
		DECLARE @TempFinJornadaHoyMedianocheConExtrasAntes DATETIME;
		DECLARE @TempFinJornadaHoyMedianocheConExtrasDespues DATETIME;
		DECLARE @TotalHorasCalculadas DECIMAL(10,5);
		DECLARE @TotalHorasTrabajadas DECIMAL(10,5);
		DECLARE @InicioJornadaNocturna DATETIME;

		-- Variables para manejar los jueves
		DECLARE @NumeroJueves INT;
		DECLARE @TotalJueves INT;
		DECLARE @UltimoJueves DATE;
		DECLARE @UltimoJuevesMesSig DATE;
		DECLARE @ViernesSiguiente DATE;
		DECLARE @JuevesSiguiente DATE;
		DECLARE @TempMesPlanillaId INT;
		DECLARE @TempSemanaPlanillaId INT;
		DECLARE @TempEmpleadoXMesPlanillaId INT;
		DECLARE @TempJornadaEmpleado INT;

		-- Variables para manejo diario 
		DECLARE @TempEmpleadoXTipoJornadaXSemanaId INT;
		DECLARE @IdEmpleadoXSemanaPlanillaActual INT;
		DECLARE @TempSalarioBruto INT;
		DECLARE @TempMarcaAsistencia INT;
		DECLARE @TempMovPlanillaID INT;

		-- Variables para deducciones
		DECLARE @TempValor DECIMAL(15,5);
		DECLARE @TempTipoDeduccion INT;
		DECLARE @TempEmpleadoTipoDeduccion INT;
		DECLARE @TempFlagObligatorio BIT;
		DECLARE @ContadorDeduccion INT;
		DECLARE @TotalDeducciones INT;
		
		-- Flags para controlar procesamiento
		DECLARE @flagTieneDeduccionesFijas BIT = 0;
		DECLARE @flagTieneDeduccionesPorcentuales BIT = 0;
		DECLARE @flagTieneDeduccionesObligatorias BIT = 0;
		DECLARE @flagDebeCalcularDeducciones BIT = 0;

		-- Variables adicionales necesarias para los índices
		DECLARE @DeduccionesSemanaFijaIndice INT = 1;
		DECLARE @DeduccionesSemanaFijaCant INT = 0;
		DECLARE @DeduccionesSemanaPorcentualIndice INT = 1;
		DECLARE @DeduccionesSemanaPorcentualCant INT = 0;
		DECLARE @DeduccionesSemanaObligatoriaPorcentualIndice INT = 1;
		DECLARE @DeduccionesSemanaObligatoriaPorcentualaCant INT = 0;

		-- Variables para almacenar datos de deducciones antes de la transacción
		DECLARE @TempDeduccionesFijasData TABLE (
			Indice INT,
			Valor DECIMAL(15,5),
			IdTipoDeduccion INT,
			IdEmpleadoTipoDeduccion INT,
			FlagObligatoria BIT
		);

		DECLARE @TempDeduccionesPorcentualesData TABLE (
			Indice INT,
			Valor DECIMAL(15,5),
			IdTipoDeduccion INT,
			IdEmpleadoTipoDeduccion INT,
			FlagObligatoria BIT
		);

		DECLARE @TempDeduccionesObligatoriasData TABLE (
			Indice INT,
			Valor DECIMAL(15,5),
			IdTipoDeduccion INT,
			IdEmpleadoTipoDeduccion INT
		);

		---------------------------------------------------------------------------------------------------------------------
		-- INICIALIZACION Y CONFIGURACION

		-- Verificar que las tablas existan
		IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'MarcaAsistencia' AND schema_id = SCHEMA_ID('dbo'))
		BEGIN
			SET @outResultCode = 50009; -- Error: tabla no existe
			SELECT 'La tabla MarcaAsistencia no existe. Ejecute sp_generar_tablas primero.' AS 'message';
			RETURN;
		END

		-- Insertando asistencias del XML
		INSERT INTO @TempAsistencias (
			ValorEmpleadoDoc
			, HoraEntrada
			, HoraSalida
			, Fecha
		)
		SELECT 
			T.AsistenciaXML.value('@ValorTipoDocumento','VARCHAR(64)')
			, T.AsistenciaXML.value('@HoraEntrada','DATETIME') 
			, T.AsistenciaXML.value('@HoraSalida','DATETIME') 
			, @inFecha
		FROM @inMarcasAsistenciaXML.nodes('/MarcasAsistencia/MarcaDeAsistencia') AS T(AsistenciaXML);

		-- Insertando jornadas del XML (Si esta vacio simplemente estan en blanco)
		INSERT INTO @TempJornadas (
			ValorEmpleadoDoc
			, TipoJornada
		)
		SELECT 
			T.JornadasXML.value('@ValorTipoDocumento','VARCHAR(64)')
			, T.JornadasXML.value('@IdTipoJornada','INT') 
		FROM @inJornadasProximaSemanaXML.nodes('/JornadasProximaSemana/TipoJornadaProximaSemana') AS T(JornadasXML);

		-- Determinar si es jueves
		IF ('Thursday' = (SELECT DATENAME(WEEKDAY, @inFecha)))
		BEGIN
			SET @flagEsJueves = 1;
		END

		-- Determinar si debe calcular deducciones
		IF (@flagEsJueves = 1 AND @inFecha <> '2023-06-01')
		BEGIN
			SET @flagDebeCalcularDeducciones = 1;
		END

		-- Determinar si hay pago doble
		-- Dia actual 
		IF (EXISTS(SELECT 1 FROM dbo.Feriado WHERE (Fecha = @inFecha))
		OR DATENAME(WEEKDAY, @inFecha) = 'Sunday')
		BEGIN
			SET @flagPagoDobleDiaActual = 1;
		END

		-- Dia siguiente
		IF (EXISTS(SELECT 1 FROM dbo.Feriado WHERE (Fecha = DATEADD(DAY, 1, @inFecha))) 
		OR DATENAME(WEEKDAY, DATEADD(DAY, 1, @inFecha)) = 'Sunday')
		BEGIN
			SET @flagPagoDobleDiaSig = 1;
		END

		-- Obteniendo la semana actual
		SELECT TOP 1 @semanaActualId = Id 
		FROM dbo.SemanaPlanilla 
		ORDER BY Id DESC;

		-- Tabla para almacenar empleados con sus datos
		DECLARE @EmpleadosConDatos TABLE (
			RowNum INT
			, IdEmpleado INT
			, DNI VARCHAR(64)
			, EmpleadoActivo BIT
			, SalarioXHora DECIMAL(15,5)
			, HoraIniJornada TIME
			, HoraFinJornada TIME
		);

		-- Cargar todos los empleados activos con sus datos
		INSERT INTO @EmpleadosConDatos
		SELECT 
			ROW_NUMBER() OVER (ORDER BY E.Id) as RowNum
			, E.Id
			, E.ValorDNI
			, EmpleadoActivo = E.Activo
			, ISNULL(P.SalarioXHora, 0)
			, TJ.HoraIni
			, TJ.HoraFin
		FROM dbo.Empleado E
		LEFT JOIN dbo.Puesto P ON (E.IdPuesto = P.Id)
		LEFT JOIN dbo.EmpleadoXTipoJornadaXSemana ETS ON (E.Id = ETS.IdEmpleado AND ETS.IdSemanaPlantilla = @semanaActualId)
		LEFT JOIN dbo.TipoJornada TJ ON (ETS.IdTipoJornada = TJ.Id);

		-- Variables para el bucle
		SELECT @MaxEmpleados = COUNT(*) FROM @EmpleadosConDatos;

		-- Obteniendo mes actual
		-- Variable temporal usada para abrir nuevos mes
		SELECT TOP 1 @TempMesPlanillaId = Id 
		FROM dbo.MesPlanilla 
		ORDER BY Id DESC;

		-- Variable temporal usada para abrir nuevas semanas
		SET @TempSemanaPlanillaId = @semanaActualId;

		-- Datos del jueves actual (solo si es jueves)
		IF (@flagEsJueves = 1)
		BEGIN
			EXEC [dbo].[sp__verificar_jueves_del_mes]
				 @inFecha = @inFecha
				, @outNumeroJueves = @NumeroJueves OUTPUT -- Numero de jueves segun el mes
				, @outTotalJueves = @TotalJueves OUTPUT -- Total de jueves del mes
				, @outUltimoJuevesMesActual = @UltimoJueves OUTPUT -- Fecha del ultimo jueves del mes
				, @outUltimoJuevesMesSiguiente = @UltimoJuevesMesSig OUTPUT -- Fecha del ultimo jueves del mes siguiente
				, @outViernesSiguiente = @ViernesSiguiente OUTPUT -- Fecha del viernes siguiente al jueves actual
				, @outJuevesSiguiente = @JuevesSiguiente OUTPUT; -- Fecha del siguiente jueves (8 dias despues)
		END

		---------------------------------------------------------------------------------------------------------------------
		-- BUCLE PRINCIPAL POR CADA EMPLEADO
		WHILE (@CurrentEmpleado <= @MaxEmpleados)
		BEGIN
			-- Obtener datos del empleado actual
			SELECT 
				@idEmpleado = IdEmpleado
				, @dniEmpleado = DNI
				, @salarioxHora = SalarioXHora
				, @jornadaEmpleadoIni = HoraIniJornada
				, @jornadaEmpleadoFin = HoraFinJornada
				, @EmpleadoActivo = EmpleadoActivo
			FROM @EmpleadosConDatos 
			WHERE (RowNum = @CurrentEmpleado);
			---------------------------------------------------------------------------------------------------------------------
			-- MODULO PARA MANEJO DE ASISTENCIAS 
			-- Buscar asistencia del empleado
			SELECT 
				@HoraEntradaAsistencia = TE.HoraEntrada
				, @HoraSalidaAsistencia = TE.HoraSalida
			FROM @TempAsistencias AS TE
			WHERE (TE.ValorEmpleadoDoc = @dniEmpleado);

			-- Inicializar variables de horas
			SET @QhorasOrdinarias = 0;
			SET @QhorasExtra = 0;
			SET @QhorasDobles = 0;
			SET @QhorasExtrasDobles = 0;
			SET @QhorasOrdinariasDiaSig = 0;
			SET @QhorasExtraDiaSig = 0;
			SET @QhorasDoblesDiaSig = 0;
			SET @QhorasExtrasDoblesDiaSig = 0;
			SET @SalarioOrdinario = 0;
			SET @SalarioHorasExtras = 0;
			SET @SalarioHorasDobles = 0;

			-- Inicializar variables auxiliares
			SET @EsTurnoNocturno = 0;
			SET @CruzaMedianoche = 0;
			SET @MinutosTrabajados = 0;
			SET @MinutosJornada = 0;
			SET @ErrorAlCalcularMarca = 0;

			-- Determinar si es turno nocturno
			IF (@jornadaEmpleadoFin < @jornadaEmpleadoIni)
			BEGIN
				SET @EsTurnoNocturno = 1;
			END
			
			IF (@EmpleadoActivo = 1)
			BEGIN
				-- Si no tiene asistencia, continuar con siguiente empleado
				IF (@HoraEntradaAsistencia IS NOT NULL)
				BEGIN
					-- VALIDACIONES INICIALES
					IF (@HoraSalidaAsistencia <= @HoraEntradaAsistencia AND CAST(@HoraSalidaAsistencia AS DATE) = CAST(@HoraEntradaAsistencia AS DATE))
					BEGIN
						SET @ErrorAlCalcularMarca = 1;
					END

					IF (@salarioxHora <= 0)
					BEGIN
						SET @ErrorAlCalcularMarca = 1;
					END

					-- Solo procesar si no hay errores
					IF (@ErrorAlCalcularMarca = 0)
					BEGIN
						-- LOGICA DE CALCULO DE HORAS
						SET @TempIniHoraAsistencia = CAST(@HoraEntradaAsistencia AS TIME);
						SET @TempFinHoraAsistencia = CAST(@HoraSalidaAsistencia AS TIME);
					
						-- Determinar si cruza medianoche
						IF (CAST(@HoraSalidaAsistencia AS DATE) > CAST(@HoraEntradaAsistencia AS DATE))
						BEGIN
							SET @CruzaMedianoche = 1;
						END

						-- Calcular minutos totales trabajados
						IF (@CruzaMedianoche = 1)
						BEGIN
							SET @MinutosTrabajados = DATEDIFF(MINUTE, @HoraEntradaAsistencia, @medianoche) +
												   DATEDIFF(MINUTE, CAST(@HoraSalidaAsistencia AS DATE), @HoraSalidaAsistencia);
												   -- @HoraSalidaAsistencia es DATETIME al hacerlo DATE se pone como 00:00
						END
						ELSE
						BEGIN
							SET @MinutosTrabajados = DATEDIFF(MINUTE, @HoraEntradaAsistencia, @HoraSalidaAsistencia);
						END

						-- Construir fechas completas de jornada 
						SET @JornadaInicioCompleta = DATEADD(SECOND, DATEDIFF(SECOND, '00:00:00', @jornadaEmpleadoIni), CAST(@inFecha AS DATETIME));
						SET @JornadaFinCompleta = DATEADD(SECOND, DATEDIFF(SECOND, '00:00:00', @jornadaEmpleadoFin), CAST(@inFecha AS DATETIME));

						-- Turno nocturno con cruce de medianoche
						IF (@EsTurnoNocturno = 1 AND @CruzaMedianoche = 1)
						BEGIN
    
							-- Calcular interseccion en dia actual desde entrada hasta medianoche
							IF (@TempIniHoraAsistencia >= @jornadaEmpleadoIni) -- Entro en horario o despues
							BEGIN
								SET @MinutosInterseccion = DATEDIFF(MINUTE, @HoraEntradaAsistencia, @medianoche);
								SET @QhorasOrdinarias = @MinutosInterseccion / 60.0;
							END
							ELSE IF (@TempIniHoraAsistencia < @jornadaEmpleadoIni)-- Entro antes
							BEGIN
								SET @TempInicioJornadaNocturnoMediaNoche = DATEADD(SECOND, DATEDIFF(SECOND, '00:00:00', @jornadaEmpleadoIni), CAST(@inFecha AS DATETIME));
								SET @MinutosInterseccion = DATEDIFF(MINUTE, @TempInicioJornadaNocturnoMediaNoche, @medianoche);
								SET @QhorasOrdinarias = @MinutosInterseccion / 60.0;
								SET @QhorasExtra = DATEDIFF(MINUTE, @HoraEntradaAsistencia, @TempInicioJornadaNocturnoMediaNoche) / 60.0;
							END

							-- Calcular interseccion en dia siguiente
							IF (@TempFinHoraAsistencia <= @jornadaEmpleadoFin)--  Sale antes o en horario
							BEGIN
								SET @QhorasOrdinariasDiaSig = DATEDIFF(MINUTE, CAST(@HoraSalidaAsistencia AS DATE), @HoraSalidaAsistencia) / 60.0;
							END
							ELSE -- Sale despues 
							BEGIN
								SET @FinJornadaManana = CAST(CAST(@HoraSalidaAsistencia AS DATE) AS DATETIME) + 
													   CAST(@jornadaEmpleadoFin AS DATETIME);
								SET @QhorasOrdinariasDiaSig = DATEDIFF(MINUTE, CAST(@HoraSalidaAsistencia AS DATE), @FinJornadaManana) / 60.0;
								SET @QhorasExtraDiaSig = DATEDIFF(MINUTE, @FinJornadaManana, @HoraSalidaAsistencia) / 60.0;
							END
						END
						ELSE IF (@EsTurnoNocturno = 1 AND @CruzaMedianoche = 0)
						BEGIN
    
							-- En este caso, el trabajo es completamente fuera de la jornada nocturna
							-- Todo se considera como horas extra
							SET @QhorasExtra = @MinutosTrabajados / 60.0;
    
							-- Verificar si hay alguna interseccion con la jornada del dia actual
							-- La jornada nocturna inicia a las 22:00, verificar si trabaja despues de esa hora
							IF (@TempFinHoraAsistencia > @jornadaEmpleadoIni)
							BEGIN
								-- Calcular interseccion desde las 22:00 hasta el final del trabajo o medianoche
								SET @InicioJornadaNocturna = DATEADD(SECOND, 
									DATEDIFF(SECOND, '00:00:00', @jornadaEmpleadoIni), 
									CAST(@inFecha AS DATETIME));
        
								IF (@HoraSalidaAsistencia <= @medianoche)
								BEGIN
									-- El trabajo termina antes de medianoche
									IF (@HoraEntradaAsistencia >= @InicioJornadaNocturna)
									BEGIN
										-- Toda la asistencia esta dentro de la jornada nocturna
										SET @QhorasOrdinarias = @MinutosTrabajados / 60.0;
										SET @QhorasExtra = 0;
									END
									ELSE
									BEGIN
										-- Parte del trabajo esta en jornada, parte fuera
										SET @QhorasOrdinarias = DATEDIFF(MINUTE, @InicioJornadaNocturna, @HoraSalidaAsistencia) / 60.0;
										SET @QhorasExtra = DATEDIFF(MINUTE, @HoraEntradaAsistencia, @InicioJornadaNocturna) / 60.0;
									END
								END
								ELSE 
								BEGIN
									-- El trabajo termina despues de medianoche
									IF (@HoraEntradaAsistencia >= @InicioJornadaNocturna)
									BEGIN
										SET @QhorasOrdinarias = DATEDIFF(MINUTE, @HoraEntradaAsistencia, @medianoche) / 60.0;
									END
									ELSE
									BEGIN
										SET @QhorasOrdinarias = DATEDIFF(MINUTE, @InicioJornadaNocturna, @medianoche) / 60.0;
										SET @QhorasExtra = DATEDIFF(MINUTE, @HoraEntradaAsistencia, @InicioJornadaNocturna) / 60.0;
									END
								END
							END
							ELSE
							BEGIN
								-- No hay interseccion con la jornada nocturna, todo es extra
								SET @QhorasExtra = @MinutosTrabajados / 60.0;
								SET @QhorasOrdinarias = 0;
							END
						END
						ELSE IF (@EsTurnoNocturno = 0 AND @CruzaMedianoche = 1)
						BEGIN
							-- Sin turno nocturno con cruce de media noche    
							-- Todo en dia actual como ordinario hasta fin de jornada
							IF (@TempIniHoraAsistencia >= @jornadaEmpleadoIni AND @TempIniHoraAsistencia < @jornadaEmpleadoFin)
							BEGIN
								SET @TempFinJornadaHoyMedianocheSinExtras = DATEADD(SECOND, DATEDIFF(SECOND, '00:00:00', @jornadaEmpleadoFin), CAST(@inFecha AS DATETIME));
								SET @QhorasOrdinarias = DATEDIFF(MINUTE, @HoraEntradaAsistencia, @TempFinJornadaHoyMedianocheSinExtras) / 60.0;
							END
							ELSE IF (@TempIniHoraAsistencia < @jornadaEmpleadoIni)
							BEGIN
								SET @TempInicioJornadaMediaNoche = DATEADD(SECOND, DATEDIFF(SECOND, '00:00:00', @jornadaEmpleadoIni), CAST(@inFecha AS DATETIME));
								SET @TempFinJornadaHoyMedianocheConExtrasAntes = DATEADD(SECOND, DATEDIFF(SECOND, '00:00:00', @jornadaEmpleadoFin), CAST(@inFecha AS DATETIME));
								SET @QhorasOrdinarias = DATEDIFF(MINUTE, @TempInicioJornadaMediaNoche, @TempFinJornadaHoyMedianocheConExtrasAntes) / 60.0;
								SET @QhorasExtra = DATEDIFF(MINUTE, @HoraEntradaAsistencia, @TempInicioJornadaMediaNoche) / 60.0;
							END

							-- Todo el dia siguiente como extra
							SET @QhorasExtraDiaSig = DATEDIFF(MINUTE, CAST(@HoraSalidaAsistencia AS DATE), @HoraSalidaAsistencia) / 60.0;
    
							-- Agregar horas extra desde fin de jornada hasta medianoche
							IF (@TempIniHoraAsistencia < @jornadaEmpleadoFin)
							BEGIN
								SET @TempFinJornadaHoyMedianocheConExtrasDespues = DATEADD(SECOND, DATEDIFF(SECOND, '00:00:00', @jornadaEmpleadoFin), CAST(@inFecha AS DATETIME));
								SET @QhorasExtra = @QhorasExtra + DATEDIFF(MINUTE, @TempFinJornadaHoyMedianocheConExtrasDespues, @medianoche) / 60.0;
							END
						END
						ELSE IF (@EsTurnoNocturno = 0 AND @CruzaMedianoche = 0)
						BEGIN
							-- Turno de mismo dia    
							-- Calcular interseccion con jornada
							IF (@HoraEntradaAsistencia > @JornadaInicioCompleta) 
							BEGIN
								SET @InicioInterseccion = @HoraEntradaAsistencia;
							END
							ELSE
							BEGIN
								SET @InicioInterseccion = @JornadaInicioCompleta;
							END
    
							IF (@HoraSalidaAsistencia < @JornadaFinCompleta)
							BEGIN
								SET @FinInterseccion = @HoraSalidaAsistencia;
							END
							ELSE
							BEGIN
								SET @FinInterseccion = @JornadaFinCompleta;
							END

							-- Horas ordinarias (interseccion)
							IF (@FinInterseccion > @InicioInterseccion)
							BEGIN
								SET @QhorasOrdinarias = DATEDIFF(MINUTE, @InicioInterseccion, @FinInterseccion) / 60.0;
							END

							-- Horas extra (todo lo que este fuera de la jornada)
							SET @QhorasExtra = (@MinutosTrabajados - (@QhorasOrdinarias * 60)) / 60.0;
						END

						-- Aplicar pago doble si corresponde
						IF (@flagPagoDobleDiaActual = 1)
						BEGIN 
							SET @QhorasDobles = @QhorasOrdinarias;
							SET @QhorasExtrasDobles = @QhorasExtra;
							SET @QhorasExtra = 0;
							SET @QhorasOrdinarias = 0;
						END 
        
						IF (@flagPagoDobleDiaSig = 1)
						BEGIN 
							SET @QhorasDoblesDiaSig = @QhorasOrdinariasDiaSig;
							SET @QhorasExtrasDoblesDiaSig = @QhorasExtraDiaSig;
							SET @QhorasExtraDiaSig = 0;
							SET @QhorasOrdinariasDiaSig = 0;
						END

						-- Aplicar floor para solo pagar horas completas
						SET @QhorasOrdinarias = FLOOR(@QhorasOrdinarias);
						SET @QhorasExtra = FLOOR(@QhorasExtra);
						SET @QhorasDobles = FLOOR(@QhorasDobles);
						SET @QhorasExtrasDobles = FLOOR(@QhorasExtrasDobles);
						SET @QhorasOrdinariasDiaSig = FLOOR(@QhorasOrdinariasDiaSig);
						SET @QhorasExtraDiaSig = FLOOR(@QhorasExtraDiaSig);
						SET @QhorasDoblesDiaSig = FLOOR(@QhorasDoblesDiaSig);
						SET @QhorasExtrasDoblesDiaSig = FLOOR(@QhorasExtrasDoblesDiaSig);

						SET @TotalHorasCalculadas = @QhorasOrdinarias + @QhorasExtra + @QhorasDobles + @QhorasExtrasDobles +
												   @QhorasOrdinariasDiaSig + @QhorasExtraDiaSig + @QhorasDoblesDiaSig + @QhorasExtrasDoblesDiaSig;
						SET @TotalHorasTrabajadas = FLOOR(@MinutosTrabajados / 60.0);

						IF (@QhorasOrdinarias < 0 OR @QhorasExtra < 0 OR @QhorasDobles < 0 OR @QhorasExtrasDobles < 0 OR
							@QhorasOrdinariasDiaSig < 0 OR @QhorasExtraDiaSig < 0 OR @QhorasDoblesDiaSig < 0 OR @QhorasExtrasDoblesDiaSig < 0)
						BEGIN
							SET @ErrorAlCalcularMarca = 1;
						END

						IF (@TotalHorasCalculadas = 0 AND @TotalHorasTrabajadas > 0)
						BEGIN
							SET @ErrorAlCalcularMarca = 1;
						END
					END
				END
			END
			
			-- Calculando salarios
			IF (@ErrorAlCalcularMarca = 0)
			BEGIN
				SET @SalarioOrdinario = (@QhorasOrdinarias + @QhorasOrdinariasDiaSig) * @salarioxHora;
				SET @SalarioHorasExtras = (@QhorasExtra + @QhorasExtraDiaSig) * 1.5 * @salarioxHora;
				SET @SalarioHorasDobles = (@QhorasDobles + @QhorasExtrasDobles + @QhorasDoblesDiaSig + @QhorasExtrasDoblesDiaSig) * 2 * @salarioxHora;
			END

			---------------------------------------------------------------------------------------------------------------------
			-- MODULO PARA MANEJO DE APERTURA DE SEMANA Y MES

			-- Obtener datos de semana actual para el empleado
			SELECT @TempEmpleadoXTipoJornadaXSemanaId = ETJS.Id
			FROM dbo.EmpleadoXTipoJornadaXSemana as ETJS
			WHERE (ETJS.IdEmpleado = @idEmpleado AND ETJS.IdSemanaPlantilla = @semanaActualId)
			
			SELECT  @IdEmpleadoXSemanaPlanillaActual = ESP.id
					, @TempSalarioBruto = ESP.SalarioBruto
			FROM dbo.EmpleadoXSemanaPlanilla AS ESP
			WHERE(ESP.IdEmpleado = @idEmpleado AND ESP.IdSemanaPlanilla = @semanaActualId);

			---------------------------------------------------------------------------------------------------------------------
			-- MODULO PARA MANEJO DE DEDUCCIONES Y CIERRES DE SEMANA (SOLO JUEVES)
			IF (@flagEsJueves = 1)
			BEGIN 
				-- Obteniendo jornada de la nueva semana
				SELECT @TempJornadaEmpleado = TJ.TipoJornada
				FROM @TempJornadas AS TJ
				WHERE(TJ.ValorEmpleadoDoc = @dniEmpleado);

				-- Obteniendo instancia empleado por mes
				SELECT  @TempEmpleadoXMesPlanillaId = EMP.Id 
				FROM dbo.EmpleadoXMesPlanilla AS EMP
				WHERE(EMP.IdEmpleado = @idEmpleado AND EMP.IdMesPlanilla = @TempMesPlanillaId);

				-- Resetear flags de deducciones para cada empleado
				SET @flagTieneDeduccionesFijas = 0;
				SET @flagTieneDeduccionesPorcentuales = 0;
				SET @flagTieneDeduccionesObligatorias = 0;

				-- Obtener deducciones solo si debe calcularlas
				IF (@flagDebeCalcularDeducciones = 1)
				BEGIN
					-- Obteniendo deducciones porcentuales no obligatorias
					INSERT INTO @TempDeduccionesSemanaPorcentual (
						IdEmpelado
						, FlagObligatoria
						, Valor
						, IdTipoDeduccion
						, IdEmpleadoTipoDeduccion
					)
					SELECT 
						ETD.IdEmpleado
						, TD.FlagObligatorio
						, (TDP.ValorPorcentaje * @TempSalarioBruto)
						, TD.Id
						, ETD.Id
					FROM dbo.EmpleadoXTipoDeduccion AS ETD
					INNER JOIN dbo.TipoDeduccion AS TD ON (TD.Id = ETD.IdTipoDeduccion)
					INNER JOIN dbo.TipoDeduccionPorcentual AS TDP ON (TDP.IdTipoDeduccion = TD.Id)
					INNER JOIN dbo.EmpleadoXTipoDeduccionNoObligatoria AS ETDNO ON (ETDNO.IdEmpleadoXTipoDeduccion = ETD.Id)
					LEFT JOIN dbo.EmpleadoXTipoDeduccionHistorial AS ETDH ON (ETDH.IdEmpleadoXTipoDeduccionNoObligatoria = ETDNO.IdEmpleadoXTipoDeduccion)
					WHERE (ETD.IdEmpleado = @idEmpleado 
					  AND TD.FlagObligatorio = 0 
					  AND TD.FlagPorcentual = 1
					  AND ETDH.IdEmpleadoXTipoDeduccionNoObligatoria IS NULL
					  AND @EmpleadoActivo=1); 

					-- Verificar si tiene deducciones porcentuales
					IF EXISTS(SELECT 1 FROM @TempDeduccionesSemanaPorcentual)
					BEGIN
						SET @flagTieneDeduccionesPorcentuales = 1;
					END

					-- Obteniendo deducciones fijas no obligatorias
					INSERT INTO @TempDeduccionesSemanaFija (
						IdEmpelado
						, FlagObligatoria
						, Valor
						, IdTipoDeduccion
						, IdEmpleadoTipoDeduccion
					)
					SELECT 
						ETD.IdEmpleado
						, TD.FlagObligatorio
						, (ETDNONP.Valor / @TotalJueves)
						, TD.Id
						, ETD.Id
					FROM dbo.EmpleadoXTipoDeduccion AS ETD
					INNER JOIN dbo.TipoDeduccion AS TD ON (TD.Id = ETD.IdTipoDeduccion)
					INNER JOIN dbo.EmpleadoXTipoDeduccionNoObligatoria AS ETDNO ON (ETDNO.IdEmpleadoXTipoDeduccion = ETD.Id)
					INNER JOIN dbo.EmpleadoXTipoDeduccionNoObligatoriaNoPorcentual AS ETDNONP ON (ETDNONP.IdEmpleadoXTipoDeduccionNoObligatoria = ETDNO.IdEmpleadoXTipoDeduccion)
					LEFT JOIN dbo.EmpleadoXTipoDeduccionHistorial AS ETDH ON (ETDH.IdEmpleadoXTipoDeduccionNoObligatoria = ETDNO.IdEmpleadoXTipoDeduccion)
					WHERE (ETD.IdEmpleado = @idEmpleado 
					  AND TD.FlagObligatorio = 0 
					  AND TD.FlagPorcentual = 0
					  AND ETDH.IdEmpleadoXTipoDeduccionNoObligatoria IS NULL
					  AND @EmpleadoActivo=1); 

					-- Verificar si tiene deducciones fijas
					IF EXISTS(SELECT 1 FROM @TempDeduccionesSemanaFija)
					BEGIN
						SET @flagTieneDeduccionesFijas = 1;
					END

					-- Obteniendo deducciones porcentuales obligatorias
					INSERT INTO @TempDeduccionesSemanaObligatoriaPorcentual (
						IdEmpelado
						, Valor
						, IdTipoDeduccion
						, IdEmpleadoTipoDeduccion
					)
					SELECT 
						ETD.IdEmpleado
						, (TDP.ValorPorcentaje * @TempSalarioBruto)
						, TD.Id
						, ETD.Id
					FROM dbo.EmpleadoXTipoDeduccion AS ETD
					INNER JOIN dbo.TipoDeduccion AS TD ON (TD.Id = ETD.IdTipoDeduccion)
					INNER JOIN dbo.TipoDeduccionPorcentual AS TDP ON(TDP.IdTipoDeduccion = TD.Id)
					WHERE(ETD.IdEmpleado = @idEmpleado AND TD.FlagObligatorio = 1 AND TD.FlagPorcentual = 1 AND @EmpleadoActivo=1);

					-- Verificar si tiene deducciones obligatorias
					IF EXISTS(SELECT 1 FROM @TempDeduccionesSemanaObligatoriaPorcentual)
					BEGIN
						SET @flagTieneDeduccionesObligatorias = 1;
					END
				END

				-- Preparar datos de deducciones ANTES de la transacción
				-- Limpiar tablas de datos de deducciones
				DELETE FROM @TempDeduccionesFijasData;
				DELETE FROM @TempDeduccionesPorcentualesData;
				DELETE FROM @TempDeduccionesObligatoriasData;
				
				-- Preparar datos de deducciones fijas
				IF (@flagTieneDeduccionesFijas = 1)
				BEGIN
					SELECT @DeduccionesSemanaFijaCant = COUNT(*) 
					FROM @TempDeduccionesSemanaFija 
					WHERE IdEmpelado = @idEmpleado;
					
					-- Usar ROW_NUMBER para crear índices secuenciales desde 1
					INSERT INTO @TempDeduccionesFijasData (Indice, Valor, IdTipoDeduccion, IdEmpleadoTipoDeduccion, FlagObligatoria)
					SELECT 
						ROW_NUMBER() OVER (ORDER BY TF.Id) as Indice,
						TF.Valor,
						TF.IdTipoDeduccion,
						TF.IdEmpleadoTipoDeduccion,
						TF.FlagObligatoria
					FROM @TempDeduccionesSemanaFija AS TF
					WHERE TF.IdEmpelado = @idEmpleado;
				END
				
				-- Preparar datos de deducciones porcentuales
				IF (@flagTieneDeduccionesPorcentuales = 1)
				BEGIN
					SELECT @DeduccionesSemanaPorcentualCant = COUNT(*) 
					FROM @TempDeduccionesSemanaPorcentual 
					WHERE IdEmpelado = @idEmpleado;
					
					-- Usar ROW_NUMBER para crear índices secuenciales desde 1
					INSERT INTO @TempDeduccionesPorcentualesData (Indice, Valor, IdTipoDeduccion, IdEmpleadoTipoDeduccion, FlagObligatoria)
					SELECT 
						ROW_NUMBER() OVER (ORDER BY TP.Id) as Indice,
						TP.Valor,
						TP.IdTipoDeduccion,
						TP.IdEmpleadoTipoDeduccion,
						TP.FlagObligatoria
					FROM @TempDeduccionesSemanaPorcentual AS TP
					WHERE TP.IdEmpelado = @idEmpleado;
				END
				
				-- Preparar datos de deducciones obligatorias
				IF (@flagTieneDeduccionesObligatorias = 1)
				BEGIN
					SELECT @DeduccionesSemanaObligatoriaPorcentualaCant = COUNT(*) 
					FROM @TempDeduccionesSemanaObligatoriaPorcentual 
					WHERE IdEmpelado = @idEmpleado;
					
					-- Usar ROW_NUMBER para crear índices secuenciales desde 1
					INSERT INTO @TempDeduccionesObligatoriasData (Indice, Valor, IdTipoDeduccion, IdEmpleadoTipoDeduccion)
					SELECT 
						ROW_NUMBER() OVER (ORDER BY TO1.Id) as Indice,
						TO1.Valor,
						TO1.IdTipoDeduccion,
						TO1.IdEmpleadoTipoDeduccion
					FROM @TempDeduccionesSemanaObligatoriaPorcentual AS TO1
					WHERE TO1.IdEmpelado = @idEmpleado;
				END
			END

			---------------------------------------------------------------------------------------------------------------------
			-- MODULO PARA REGISTRO DE MOVIMIENTOS EN BASE DE DATOS
			BEGIN TRANSACTION
				-- Registro de asistencia de empleado por dia
				-- Verificar si ambas horas están definidas
				INSERT INTO dbo.MarcaAsistencia(
					HoraIni
					, HoraFin
					, Fecha
					, IdEmpleadoXTipoJornadaXSemana
				)
				SELECT 
					@HoraEntradaAsistencia
					, @HoraSalidaAsistencia
					, @inFecha
					, @TempEmpleadoXTipoJornadaXSemanaId
				WHERE (@HoraEntradaAsistencia IS NOT NULL) 
					AND (@HoraSalidaAsistencia IS NOT NULL);

				-- Obtener el ID de la marca de asistencia insertada
				SELECT @TempMarcaAsistencia = SCOPE_IDENTITY()
				WHERE (@HoraEntradaAsistencia IS NOT NULL) 
					AND (@HoraSalidaAsistencia IS NOT NULL);

				-- Insertar movimiento de planilla para salario ordinario
				INSERT INTO dbo.MovimientoPlanilla(
					FechaIni
					, Monto
					, IdEmpleadoXSemanaPlanilla
					, IdTipoMovimiento
				)
				SELECT 
					@inFecha
					, @SalarioOrdinario
					, @IdEmpleadoXSemanaPlanillaActual
					, 1
				WHERE (@HoraEntradaAsistencia IS NOT NULL) 
					AND (@HoraSalidaAsistencia IS NOT NULL)
					AND (@SalarioOrdinario > 0);

				-- Obtener ID del movimiento de planilla para salario ordinario
				SELECT @TempMovPlanillaID = SCOPE_IDENTITY()
				WHERE (@HoraEntradaAsistencia IS NOT NULL) 
					AND (@HoraSalidaAsistencia IS NOT NULL)
					AND (@SalarioOrdinario > 0);

				-- Insertar movimiento de asistencia para salario ordinario
				INSERT INTO dbo.MovimientoAsistencia (
					IdMovimientoPlanilla
					, QHoras
					, IdMarcaAsistencia
				)
				SELECT
					@TempMovPlanillaID
					, (@QhorasOrdinarias + @QhorasOrdinariasDiaSig)
					, @TempMarcaAsistencia
				WHERE (@HoraEntradaAsistencia IS NOT NULL) 
					AND (@HoraSalidaAsistencia IS NOT NULL)
					AND (@SalarioOrdinario > 0);

				-- Insertar movimiento de planilla para horas extras
				INSERT INTO dbo.MovimientoPlanilla(
					FechaIni
					, Monto
					, IdEmpleadoXSemanaPlanilla
					, IdTipoMovimiento
				)
				SELECT 
					@inFecha
					, @SalarioHorasExtras
					, @IdEmpleadoXSemanaPlanillaActual
					, 2
				WHERE (@HoraEntradaAsistencia IS NOT NULL) 
					AND (@HoraSalidaAsistencia IS NOT NULL)
					AND (@SalarioHorasExtras > 0);

				-- Obtener ID del movimiento de planilla para horas extras
				SELECT @TempMovPlanillaID = SCOPE_IDENTITY()
				WHERE (@HoraEntradaAsistencia IS NOT NULL) 
					AND (@HoraSalidaAsistencia IS NOT NULL)
					AND (@SalarioHorasExtras > 0);

				-- Insertar movimiento de asistencia para horas extras
				INSERT INTO dbo.MovimientoAsistencia (
					IdMovimientoPlanilla
					, QHoras
					, IdMarcaAsistencia
				)
				SELECT
					@TempMovPlanillaID
					, (@QhorasExtra + @QhorasExtraDiaSig)
					, @TempMarcaAsistencia
				WHERE (@HoraEntradaAsistencia IS NOT NULL) 
					AND (@HoraSalidaAsistencia IS NOT NULL)
					AND (@SalarioHorasExtras > 0);

				-- Insertar movimiento de planilla para horas dobles
				INSERT INTO dbo.MovimientoPlanilla(
					FechaIni
					, Monto
					, IdEmpleadoXSemanaPlanilla
					, IdTipoMovimiento
				)
				SELECT 
					@inFecha
					, @SalarioHorasDobles
					, @IdEmpleadoXSemanaPlanillaActual
					, 3
				WHERE (@HoraEntradaAsistencia IS NOT NULL) 
					AND (@HoraSalidaAsistencia IS NOT NULL)
					AND (@SalarioHorasDobles > 0);

				-- Obtener ID del movimiento de planilla para horas dobles
				SELECT @TempMovPlanillaID = SCOPE_IDENTITY()
				WHERE (@HoraEntradaAsistencia IS NOT NULL) 
					AND (@HoraSalidaAsistencia IS NOT NULL)
					AND (@SalarioHorasDobles > 0);

				-- Insertar movimiento de asistencia para horas dobles
				INSERT INTO dbo.MovimientoAsistencia (
					IdMovimientoPlanilla
					, QHoras
					, IdMarcaAsistencia
				)
				SELECT
					@TempMovPlanillaID
					, (@QhorasDobles + @QhorasExtrasDobles + @QhorasDoblesDiaSig + @QhorasExtrasDoblesDiaSig)
					, @TempMarcaAsistencia
				WHERE (@HoraEntradaAsistencia IS NOT NULL) 
					AND (@HoraSalidaAsistencia IS NOT NULL)
					AND (@SalarioHorasDobles > 0);

				-- Actualizar salario bruto 
				UPDATE dbo.EmpleadoXSemanaPlanilla 
				SET SalarioBruto = SalarioBruto + (@SalarioOrdinario + @SalarioHorasDobles + @SalarioHorasExtras)
				WHERE (Id = @IdEmpleadoXSemanaPlanillaActual)
					AND (@HoraEntradaAsistencia IS NOT NULL) 
					AND (@HoraSalidaAsistencia IS NOT NULL);
				
				-- Limpiar variables para siguiente iteracion
				SET @HoraEntradaAsistencia = NULL;
				SET @HoraSalidaAsistencia = NULL;

				---------------------------------------------------------------------------------------------------------------------
				-- MODULO PARA PROCESAMIENTO DE DEDUCCIONES Y CIERRES (SOLO JUEVES)
			
				-- Procesamiento de deducciones usando flags y bucles WHILE
				SET @DeduccionesSemanaFijaIndice = 1;
						
				WHILE(@DeduccionesSemanaFijaCant >= @DeduccionesSemanaFijaIndice AND @flagTieneDeduccionesFijas = 1 AND @flagEsJueves = 1)
				BEGIN 
					SELECT 
						@TempValor = TFD.Valor
						,@TempTipoDeduccion = TFD.IdTipoDeduccion
						,@TempEmpleadoTipoDeduccion = TFD.IdEmpleadoTipoDeduccion
						,@TempFlagObligatorio = TFD.FlagObligatoria
					FROM @TempDeduccionesFijasData AS TFD
					WHERE( TFD.Indice = @DeduccionesSemanaFijaIndice);

					-- Se tiene salario bruto pues puede ser un empleado recien insertado
					IF(@TempValor>0)
					BEGIN
						-- Movimiento no obligatorios (IdTipoMovimiento = 5)
						INSERT INTO dbo.MovimientoPlanilla(
							FechaIni,
							IdEmpleadoXSemanaPlanilla,
							IdTipoMovimiento,
							Monto
						)
						VALUES(
							@inFecha,
							@IdEmpleadoXSemanaPlanillaActual,
							5,
							@TempValor
						);

						INSERT INTO dbo.MovimientoDeduccion(
							IdEmpleadoXTipoDeduccion,
							IdMovimientoPlanilla
						)
						VALUES(
							@TempEmpleadoTipoDeduccion,
							SCOPE_IDENTITY()
						);

						UPDATE dbo.EmpleadoXMesPlanillaXTipoDeduccion 
						SET MontoTotal = MontoTotal + @TempValor
						WHERE(IdEmpleadoXMesPlanilla = @TempEmpleadoXMesPlanillaId 
								AND IdTipoDeduccion = @TempTipoDeduccion);

						-- Actualizar suma de deducciones en EmpleadoXSemanaPlanilla
						UPDATE dbo.EmpleadoXSemanaPlanilla 
						SET SumaDeducciones = SumaDeducciones + @TempValor
						WHERE (Id = @IdEmpleadoXSemanaPlanillaActual);
					END
					SET @DeduccionesSemanaFijaIndice = @DeduccionesSemanaFijaIndice + 1;
				END

				SET @DeduccionesSemanaPorcentualIndice = 1;
						
				WHILE(@DeduccionesSemanaPorcentualCant >= @DeduccionesSemanaPorcentualIndice AND @flagTieneDeduccionesPorcentuales = 1
				AND @flagEsJueves = 1)
				BEGIN 
					SELECT 
						@TempValor = TPD.Valor,
						@TempTipoDeduccion = TPD.IdTipoDeduccion,
						@TempEmpleadoTipoDeduccion = TPD.IdEmpleadoTipoDeduccion,
						@TempFlagObligatorio = TPD.FlagObligatoria
					FROM @TempDeduccionesPorcentualesData AS TPD
					WHERE TPD.Indice = @DeduccionesSemanaPorcentualIndice;
					-- Se tiene salario bruto pues puede ser un empleado recien insertado
					IF(@TempValor>0)
					BEGIN
						-- Movimiento no obligatorio porcentual (IdTipoMovimiento = 5)
						INSERT INTO dbo.MovimientoPlanilla(
							FechaIni,
							IdEmpleadoXSemanaPlanilla,
							IdTipoMovimiento,
							Monto
						)
						VALUES(
							@inFecha,
							@IdEmpleadoXSemanaPlanillaActual,
							5,
							@TempValor
						);

						INSERT INTO dbo.MovimientoDeduccion(
							IdEmpleadoXTipoDeduccion,
							IdMovimientoPlanilla
						)
						VALUES(
							@TempEmpleadoTipoDeduccion,
							SCOPE_IDENTITY()
						);

						UPDATE dbo.EmpleadoXMesPlanillaXTipoDeduccion 
						SET MontoTotal = MontoTotal + @TempValor
						WHERE(IdEmpleadoXMesPlanilla = @TempEmpleadoXMesPlanillaId 
								AND IdTipoDeduccion = @TempTipoDeduccion);

						-- Actualizar suma de deducciones en EmpleadoXSemanaPlanilla
						UPDATE dbo.EmpleadoXSemanaPlanilla 
						SET SumaDeducciones = SumaDeducciones + @TempValor
						WHERE (Id = @IdEmpleadoXSemanaPlanillaActual);
					END
					SET @DeduccionesSemanaPorcentualIndice = @DeduccionesSemanaPorcentualIndice + 1;
				END

				SET @DeduccionesSemanaObligatoriaPorcentualIndice = 1;
						
				WHILE(@DeduccionesSemanaObligatoriaPorcentualaCant >= @DeduccionesSemanaObligatoriaPorcentualIndice
						AND @flagTieneDeduccionesObligatorias = 1
						AND @flagEsJueves = 1)
				BEGIN 
					SELECT 
						@TempValor = TOD.Valor,
						@TempTipoDeduccion = TOD.IdTipoDeduccion,
						@TempEmpleadoTipoDeduccion = TOD.IdEmpleadoTipoDeduccion
					FROM @TempDeduccionesObligatoriasData AS TOD
					WHERE TOD.Indice = @DeduccionesSemanaObligatoriaPorcentualIndice;

					-- Movimiento obligatorio (IdTipoMovimiento = 4 para deducciones obligatorias)
					IF(@TempValor>0)
					BEGIN
						INSERT INTO dbo.MovimientoPlanilla(
							FechaIni,
							IdEmpleadoXSemanaPlanilla,
							IdTipoMovimiento,
							Monto
						)
						VALUES(
							@inFecha,
							@IdEmpleadoXSemanaPlanillaActual,
							4,
							@TempValor
						);

						INSERT INTO dbo.MovimientoDeduccion(
							IdEmpleadoXTipoDeduccion,
							IdMovimientoPlanilla
						)
						VALUES(
							@TempEmpleadoTipoDeduccion,
							SCOPE_IDENTITY()
						);

						UPDATE dbo.EmpleadoXMesPlanillaXTipoDeduccion 
						SET MontoTotal = MontoTotal + @TempValor
						WHERE(IdEmpleadoXMesPlanilla = @TempEmpleadoXMesPlanillaId 
								AND IdTipoDeduccion = @TempTipoDeduccion);

						-- Actualizar suma de deducciones en EmpleadoXSemanaPlanilla
						UPDATE dbo.EmpleadoXSemanaPlanilla 
						SET SumaDeducciones = SumaDeducciones + @TempValor
						WHERE (Id = @IdEmpleadoXSemanaPlanillaActual);
					END
					SET @DeduccionesSemanaObligatoriaPorcentualIndice = @DeduccionesSemanaObligatoriaPorcentualIndice + 1;
				END
				
				---------------------------------------------------------------------------------------------------------------------
				-- MODULO PARA APERTURA DE MES Y SEMANA (SOLO JUEVES)
					
				-- Abriendo mes, solo a empleados activos
				-- Insertar MesPlanilla solo si no existe
				INSERT INTO dbo.MesPlanilla (
					Fechaini, FechaFin
				)
				SELECT @ViernesSiguiente, @UltimoJueves
				WHERE (NOT EXISTS(SELECT 1 FROM dbo.MesPlanilla AS MP WHERE (MP.FechaFin = @UltimoJueves)))
					AND (@NumeroJueves = 1) 
					AND (@inFecha = '2023-06-01') 
					AND (@EmpleadoActivo = 1
					AND (@flagEsJueves = 1));

				-- OBTENER SIEMPRE EL ID (ya sea recién insertado o existente)
				SELECT @TempMesPlanillaId = Id 
				FROM dbo.MesPlanilla 
				WHERE (FechaFin = @UltimoJueves)
					AND (@NumeroJueves = 1) 
					AND (@inFecha = '2023-06-01') 
					AND (@EmpleadoActivo = 1)
					AND (@flagEsJueves = 1);
					
				-- Para cualquier otro jueves que sea el último del mes
				-- Insertar MesPlanilla solo si no existe y se cumplen las condiciones
				INSERT INTO dbo.MesPlanilla (
					Fechaini
					, FechaFin
				)
				SELECT 
					@ViernesSiguiente
					, @UltimoJuevesMesSig
				WHERE (NOT EXISTS(SELECT 1 FROM dbo.MesPlanilla AS MP WHERE (MP.FechaFin = @UltimoJuevesMesSig)))
					AND (@NumeroJueves = @TotalJueves) 
					AND (@EmpleadoActivo = 1)
					AND (@flagEsJueves = 1);

				-- Obtener el ID del MesPlanilla (ya sea recién insertado o existente)
				SELECT @TempMesPlanillaId = Id 
				FROM dbo.MesPlanilla 
				WHERE (FechaFin = @UltimoJuevesMesSig)
					AND (@NumeroJueves = @TotalJueves) 
					AND (@EmpleadoActivo = 1)
					AND (@flagEsJueves = 1);


				-- Si el empleado se insertó en la ejecución de la simulación o se abrió un nuevo mes
				-- Insertar EmpleadoXMesPlanilla solo si no existe y empleado está activo
				INSERT INTO dbo.EmpleadoXMesPlanilla(
					IdEmpleado
					, IdMesPlanilla
				)
				SELECT 
					@idEmpleado
					, @TempMesPlanillaId
				WHERE (NOT EXISTS(SELECT 1 FROM dbo.EmpleadoXMesPlanilla AS MP 
						WHERE (MP.IdMesPlanilla = @TempMesPlanillaId) AND (MP.IdEmpleado = @idEmpleado))) 
					AND (@EmpleadoActivo = 1)
					AND (@flagEsJueves = 1)
					AND ((@NumeroJueves=@TotalJueves) OR (@inFecha = '2023-06-01'));

				-- Obtener el ID del EmpleadoXMesPlanilla (ya sea recién insertado o existente)
				SELECT @TempEmpleadoXMesPlanillaId = Id
				FROM dbo.EmpleadoXMesPlanilla 
				WHERE (IdMesPlanilla = @TempMesPlanillaId) 
					AND (IdEmpleado = @idEmpleado)
					AND (@EmpleadoActivo = 1)
					AND (@flagEsJueves = 1)
					AND ((@NumeroJueves=@TotalJueves) OR (@inFecha = '2023-06-01'));

				-- Insertar deducciones solo si se cumplieron las condiciones originales
				INSERT INTO dbo.EmpleadoXMesPlanillaXTipoDeduccion (
					MontoTotal
					, IdEmpleadoXMesPlanilla
					, IdTipoDeduccion
				)
				SELECT 
					0
					, @TempEmpleadoXMesPlanillaId
					, ET.IdTipoDeduccion 
				FROM dbo.EmpleadoXTipoDeduccion AS ET
				WHERE (ET.IdEmpleado = @idEmpleado)
					AND ( NOT EXISTS(SELECT 1 FROM dbo.EmpleadoXMesPlanillaXTipoDeduccion AS MP 
							WHERE (MP.IdEmpleadoXMesPlanilla = @TempEmpleadoXMesPlanillaId) AND (MP.IdTipoDeduccion = ET.IdTipoDeduccion))) 
					AND (@EmpleadoActivo = 1)
					AND (@TempEmpleadoXMesPlanillaId IS NOT NULL)
					AND (@flagEsJueves = 1)
					AND ((@NumeroJueves=@TotalJueves) OR (@inFecha = '2023-06-01'));
;

				-- Abriendo semana
				-- Insertar SemanaPlanilla solo si no existe
				INSERT INTO dbo.SemanaPlanilla(
					FechaIni
					, FechaFin
					, IdMesPlanilla
				)
				SELECT 
					@inFecha
					, @JuevesSiguiente
					, @TempMesPlanillaId
				WHERE (NOT EXISTS(SELECT 1 FROM dbo.SemanaPlanilla AS MP WHERE (MP.FechaFin = @JuevesSiguiente))
						AND (@flagEsJueves = 1));

				-- Obtener el ID del SemanaPlanilla (ya sea recién insertado o existente)
				SELECT @TempSemanaPlanillaId = Id
				FROM dbo.SemanaPlanilla 
				WHERE (FechaFin = @JuevesSiguiente AND (@flagEsJueves = 1) );

				-- Insertar EmpleadoXTipoJornadaXSemana si hay jornada que asignar
				INSERT INTO dbo.EmpleadoXTipoJornadaXSemana (
					IdSemanaPlantilla
					, IdTipoJornada
					, IdEmpleado
				)
				SELECT 
					@TempSemanaPlanillaId
					, @TempJornadaEmpleado
					, @idEmpleado
				WHERE (@TempJornadaEmpleado IS NOT NULL) 
					AND (@EmpleadoActivo = 1)
					AND (@TempSemanaPlanillaId IS NOT NULL)
					AND (@flagEsJueves = 1);

				-- Obtener el ID del EmpleadoXTipoJornadaXSemana para usar en MarcaAsistencia
				SELECT @TempEmpleadoXTipoJornadaXSemanaId = Id
				FROM dbo.EmpleadoXTipoJornadaXSemana
				WHERE (IdSemanaPlantilla = @TempSemanaPlanillaId)
					AND (IdTipoJornada = @TempJornadaEmpleado)
					AND (IdEmpleado = @idEmpleado)
					AND (@TempJornadaEmpleado IS NOT NULL) 
					AND (@EmpleadoActivo = 1)
					AND (@flagEsJueves = 1);

				-- Insertar EmpleadoXSemanaPlanilla para empleados activos
				INSERT INTO dbo.EmpleadoXSemanaPlanilla (
					IdEmpleado
					, IdSemanaPlanilla
					, IdEmpleadoXMesPlanilla
					, SalarioBruto
					, SumaDeducciones
				) 
				SELECT 
					@idEmpleado
					, @TempSemanaPlanillaId
					, @TempEmpleadoXMesPlanillaId
					, 0
					, 0
				WHERE (@EmpleadoActivo = 1)
					AND (@TempSemanaPlanillaId IS NOT NULL)
					AND (@TempEmpleadoXMesPlanillaId IS NOT NULL)
					AND (@flagEsJueves = 1);

				-- Obtener el ID del EmpleadoXSemanaPlanilla para usar posteriormente
				SELECT @IdEmpleadoXSemanaPlanillaActual = Id
				FROM dbo.EmpleadoXSemanaPlanilla
				WHERE (IdEmpleado = @idEmpleado)
					AND (IdSemanaPlanilla = @TempSemanaPlanillaId)
					AND (@EmpleadoActivo = 1)
					AND (@flagEsJueves = 1);
				
			COMMIT TRANSACTION

			-- Limpiando tablas variables por empleado para manejar deducciones
			DELETE FROM @TempDeduccionesSemanaFija;
			DELETE FROM @TempDeduccionesSemanaObligatoriaPorcentual;
			DELETE FROM @TempDeduccionesSemanaPorcentual;

			-- Siguiente empleado
			SET @CurrentEmpleado = @CurrentEmpleado + 1;
		END
		
		
		SET @outResultCode = 0; -- Exito
		
	END TRY 
	BEGIN CATCH
		IF @@TRANCOUNT > 0
			ROLLBACK;
		SET @outResultCode = 50008; -- Error general de base de datos
		SELECT E.Descripcion AS 'message'  FROM dbo.Error AS E WHERE (E.Codigo = @outResultCode); -- recordset

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