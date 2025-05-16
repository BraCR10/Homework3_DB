USE [DB_Tarea2]
GO
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
-- Author:		<Brian>
-- Create date: <23/4/2025>
-- Description:	<SP para cargar el XML>
-- =============================================
CREATE PROCEDURE sp_cargar_xml
(
	@inXMLData NVARCHAR(MAX), -- Maximo permitido
	@outResultCode int OUTPUT
)AS
BEGIN
	SET NOCOUNT ON

	BEGIN TRY
		
		-- Procesando XML
		DECLARE @XML XML;
        SET @XML = CAST(@inXMLData AS XML);

		-- Tablas variables
		DECLARE @TempEmpleandos TABLE (
			Id INT IDENTITY(1,1) PRIMARY KEY
			, IdPuesto  INT 
			, ValorDocumentoIdentidad VARCHAR(64)
			, Nombre VARCHAR(64)
			, FechaContratacion DATE
			, SaldoVacaciones DECIMAL(10,2)
			, EsActivo BIT
		);

		DECLARE @TempMovimientos TABLE(
			Id INT IDENTITY(1,1) PRIMARY KEY
			, IdEmpleado INT
			, IdTipoMovimiento INT
			, Fecha DATE
			, Monto DECIMAL(10,2)
			, NuevoSaldo DECIMAL(10,2)
			, IdPostByUser INT
			, PostInIP VARCHAR(64)
			, PostTime DATETIME 
		);

		DECLARE @TempPuestos TABLE(
			Id INT  PRIMARY KEY
			, Nombre VARCHAR(64)
			, SalarioxHora DECIMAL(10,2)
		);

		DECLARE @TempErrores TABLE(
			Id INT IDENTITY(1,1) PRIMARY KEY
			, Codigo INT
			, Descripcion VARCHAR(512)
		);

		DECLARE @TempTiposEvento TABLE(
			Id  INT  PRIMARY KEY
			, Nombre VARCHAR(64)
		);

		DECLARE @TempTiposMovimiento TABLE(
			Id  INT  PRIMARY KEY
			, Nombre VARCHAR(64)
			, TipoAccion VARCHAR(64)
		);

		DECLARE @TempUsuarios TABLE(
			Id INT  PRIMARY KEY
			, Username VARCHAR(64)
			, Password VARCHAR(64)
		)

		DECLARE @TempFeriados TABLE(
			Id INT IDENTITY(1,1) PRIMARY KEY
			, Fecha DATE
			, Descripcion VARCHAR(512)
		);


		DECLARE @TempXML TABLE (
			Id INT IDENTITY(1,1)
			, NodeVar XML
		);

		-- Reutilizables
		DECLARE @i INT
		, @total INT;

		DECLARE @Id INT
		, @Nombre VARCHAR(64);
		
		-- Cargar Puestos
		INSERT INTO @TempXML (NodeVar)
		SELECT T.P.query('.') 
		FROM @XML.nodes('/Datos/Puestos/Puesto') AS T(P);

		SET @i = 1;
		SET @total = (SELECT COUNT(*) FROM @TempXML);
		
		DECLARE  @SalarioxHora DECIMAL(10,2);

		WHILE (@i <= @total)
		BEGIN
			SELECT
				@Id = NodeVar.value('(/Puesto/@Id)[1]', 'INT')
				, @Nombre = NodeVar.value('(/Puesto/@Nombre)[1]', 'VARCHAR(64)')
				, @SalarioxHora = NodeVar.value('(/Puesto/@SalarioxHora)[1]', 'DECIMAL(10,2)')
			FROM @TempXML AS X
			WHERE (X.Id = @i);

			INSERT INTO @TempPuestos (Id, Nombre, SalarioxHora)
			VALUES (@Id, @Nombre, @SalarioxHora);

			SET @i = @i + 1;
		END

		-- Cargar TiposEvento

		INSERT INTO @TempXML (NodeVar)
		SELECT T.TE.query('.') 
		FROM @XML.nodes('/Datos/TiposEvento/TipoEvento') AS T(TE);

		SET @i = @total+1;
		SET @total = (SELECT COUNT(*) FROM @TempXML);

		WHILE (@i <= @total)
		BEGIN
			SELECT
				@Id = NodeVar.value('(/TipoEvento/@Id)[1]', 'INT')
				, @Nombre = NodeVar.value('(/TipoEvento/@Nombre)[1]', 'VARCHAR(64)')
			FROM @TempXML AS X
			WHERE (X.Id = @i);

			INSERT INTO @TempTiposEvento (Id, Nombre)
			VALUES (@Id, @Nombre);

			SET @i = @i + 1;
		END

		-- Cargar TiposMovimiento
		INSERT INTO @TempXML (NodeVar)
		SELECT T.TM.query('.') 
		FROM @XML.nodes('/Datos/TiposMovimientos/TipoMovimiento') AS T(TM);

		SET @i = @total+1;
		SET @total = (SELECT COUNT(*) FROM @TempXML);
		DECLARE  @TipoAccion VARCHAR(64);

		WHILE (@i <= @total)
		BEGIN
			SELECT
				@Id = NodeVar.value('(/TipoMovimiento/@Id)[1]', 'INT')
				, @Nombre = NodeVar.value('(/TipoMovimiento/@Nombre)[1]', 'VARCHAR(64)')
				, @TipoAccion = NodeVar.value('(/TipoMovimiento/@TipoAccion)[1]', 'VARCHAR(64)')
			FROM @TempXML AS X
			WHERE (X.Id = @i);

			INSERT INTO @TempTiposMovimiento (Id, Nombre, TipoAccion)
			VALUES (@Id, @Nombre, @TipoAccion);

			SET @i = @i + 1;
		END

		-- Cargar Empleados
		INSERT INTO @TempXML (NodeVar)
		SELECT T.E.query('.') 
		FROM @XML.nodes('/Datos/Empleados/empleado') AS T(E);

		SET @i = @total+1;
		SET @total = (SELECT COUNT(*) FROM @TempXML);

		DECLARE @IdPuesto INT
		, @Cedula VARCHAR(64)
		, @FechaContratacion DATE
		, @Saldo DECIMAL(10,2)
		, @EsActivo BIT;

		WHILE (@i <= @total)
		BEGIN

			SELECT
				@IdPuesto = NodeVar.value('(/empleado/@IdPuesto)[1]', 'INT')
				, @Cedula = NodeVar.value('(/empleado/@ValorDocumentoIdentidad)[1]', 'VARCHAR(64)')
				, @Nombre = NodeVar.value('(/empleado/@Nombre)[1]', 'VARCHAR(64)')
				, @FechaContratacion = NodeVar.value('(/empleado/@FechaContratacion)[1]', 'DATE')
				, @Saldo = NodeVar.value('(/empleado/@SaldoVacaciones)[1]', 'DECIMAL(10,2)')
				, @EsActivo = NodeVar.value('(/empleado/@EsActivo)[1]', 'BIT')
			FROM @TempXML AS X
			WHERE (X.Id = @i);

			INSERT INTO @TempEmpleandos (IdPuesto, ValorDocumentoIdentidad, Nombre, FechaContratacion, SaldoVacaciones, EsActivo)
			VALUES (@IdPuesto, @Cedula, @Nombre, @FechaContratacion, @Saldo, @EsActivo);

			SET @i = @i + 1;
		END

		
		-- Cargar Usuarios
		INSERT INTO @TempXML (NodeVar)
		SELECT T.U.query('.')
		FROM @XML.nodes('/Datos/Usuarios/usuario') AS T(U);

		SET @i = @total+1;
		SET @total = (SELECT COUNT(*) FROM @TempXML);
		DECLARE  @Username VARCHAR(64), @Password VARCHAR(64);

		WHILE (@i <= @total)
		BEGIN
			SELECT
				@Id = NodeVar.value('(/usuario/@Id)[1]', 'INT')
				, @Username = NodeVar.value('(/usuario/@Nombre)[1]', 'VARCHAR(64)')
				, @Password = NodeVar.value('(/usuario/@Pass)[1]', 'VARCHAR(64)')
			FROM @TempXML AS X 
			WHERE (X.Id = @i);

			INSERT INTO @TempUsuarios (Id, Username, Password)
			VALUES (@Id, @Username, @Password);

			SET @i = @i + 1;
		END

		-- Cargar Feriados
		INSERT INTO @TempXML (NodeVar)
		SELECT T.F.query('.') 
		FROM @XML.nodes('/Datos/Feriados/Feriado') AS T(F);

		SET @i = @total+1;
		SET @total = (SELECT COUNT(*) FROM @TempXML);
		DECLARE @Fecha DATE, @Descripcion VARCHAR(512);

		WHILE @i <= @total
		BEGIN
			SELECT
				@Fecha = NodeVar.value('(/Feriado/@Fecha)[1]', 'DATE')
				, @Descripcion = NodeVar.value('(/Feriado/@Descripcion)[1]', 'VARCHAR(512)')
			FROM @TempXML AS X
			WHERE (X.Id = @i);

			INSERT INTO @TempFeriados (Fecha, Descripcion)
			VALUES (@Fecha, @Descripcion);

			SET @i = @i + 1;
		END

		
		-- Cargar Errores
		INSERT INTO @TempXML (NodeVar)
		SELECT T.E.query('.') 
		FROM @XML.nodes('/Datos/Error/error') AS T(E);

		SET @i = @total+1;
		SET @total = (SELECT COUNT(*) FROM @TempXML);

		DECLARE @Codigo INT, @DescripcionE VARCHAR(512);

		WHILE @i <= @total
		BEGIN
			SELECT
				@Codigo = NodeVar.value('(/error/@Codigo)[1]', 'INT')
				, @DescripcionE = NodeVar.value('(/error/@Descripcion)[1]', 'VARCHAR(512)')
			FROM @TempXML AS X
			WHERE (X.Id = @i);

			INSERT INTO @TempErrores (Codigo, Descripcion)
			VALUES (@Codigo, @DescripcionE);

			SET @i = @i + 1;
		END

		
		-- Cargar Movimientos

		INSERT INTO @TempXML (NodeVar)
		SELECT T.M.query('.') 
		FROM @XML.nodes('/Datos/Movimientos/movimiento') AS T(M);

		SET @i = @total+1;
		SET @total = (SELECT COUNT(*) FROM @TempXML);

		DECLARE 
			@ValorDocId VARCHAR(64)
			, @IdTipoMovimiento INT
			, @Monto DECIMAL(10,2)
			, @NuevoSaldo DECIMAL(10,2)
			, @PostByUser VARCHAR(64)
			, @PostInIP VARCHAR(64)
			, @PostTime DATETIME;

		WHILE (@i <= @total)
		BEGIN
			SELECT
				@ValorDocId = NodeVar.value('(/movimiento/@ValorDocId)[1]', 'VARCHAR(64)')
				, @IdTipoMovimiento = NodeVar.value('(/movimiento/@IdTipoMovimiento)[1]', 'INT')
				, @Fecha = NodeVar.value('(/movimiento/@Fecha)[1]', 'DATE')
				, @Monto = NodeVar.value('(/movimiento/@Monto)[1]', 'DECIMAL(10,2)')
				, @PostByUser = NodeVar.value('(/movimiento/@PostByUser)[1]', 'VARCHAR(64)')
				, @PostInIP = NodeVar.value('(/movimiento/@PostInIP)[1]', 'VARCHAR(64)')
				, @PostTime = NodeVar.value('(/movimiento/@PostTime)[1]', 'DATETIME')
			FROM @TempXML AS X
			WHERE (X.Id = @i);

			DECLARE @IdPostByUser INT;
			SELECT @IdPostByUser = U.Id 
			FROM @TempUsuarios AS U 
			WHERE (U.Username = @PostByUser);
			
			DECLARE @IdEmpleado INT
				,@SaldoActual DECIMAL(10,2);
			SELECT 
				@IdEmpleado = E.Id
				,	@SaldoActual = E.SaldoVacaciones
			FROM @TempEmpleandos AS E
			WHERE(E.ValorDocumentoIdentidad = @ValorDocId);

			SET @NuevoSaldo = @SaldoActual - @Monto;

			IF (@NuevoSaldo<0 )
			BEGIN
				SET @NuevoSaldo = 0;
			END 
		
			INSERT INTO @TempMovimientos (
				 IdEmpleado, IdTipoMovimiento, Fecha, Monto,
				NuevoSaldo, IdPostByUser, PostInIP, PostTime)
			VALUES (
				 @IdEmpleado, @IdTipoMovimiento, @Fecha, @Monto,
				@NuevoSaldo, @IdPostByUser, @PostInIP, @PostTime
			);

			SET @i = @i + 1;
		END

		-- Cargar datos a la BD
		BEGIN TRY
			BEGIN TRANSACTION 
				-- Insert TiposMovimiento 
				SET IDENTITY_INSERT dbo.TipoMovimiento ON;
				SET @i = 1;
				SET @total = (SELECT COUNT(*) FROM @TempTiposMovimiento);
				WHILE(@i <= @total)
				BEGIN
					SELECT 
						@Id = TM.Id
						, @Nombre = TM.Nombre
						, @TipoAccion = TM.TipoAccion
					FROM 
						@TempTiposMovimiento AS TM 
					WHERE(TM.Id = @i);

					IF NOT EXISTS (SELECT 1 FROM dbo.TipoMovimiento WHERE Id = @Id)
					BEGIN
						INSERT INTO dbo.TipoMovimiento (
							Id
							, Nombre
							, TipoAccion
						)
						VALUES(
							@Id  
							, @Nombre 
							, @TipoAccion
						);
					END
            
					SET @i = @i + 1;
				END
				SET IDENTITY_INSERT dbo.TipoMovimiento OFF;
				
				-- Insert Puestos
				SET IDENTITY_INSERT dbo.Puesto ON;
				SET @i = 1;
				SET @total = (SELECT COUNT(*) FROM @TempPuestos);
				WHILE(@i <= @total)
				BEGIN
					SELECT 
						@Id = P.Id
						, @Nombre = P.Nombre
						, @SalarioxHora = P.SalarioxHora
					FROM 
						@TempPuestos AS P 
					WHERE(P.Id = @i);

					IF NOT EXISTS (SELECT 1 FROM dbo.Puesto WHERE Id = @Id)
					BEGIN
						INSERT INTO dbo.Puesto (
							Id
							, Nombre
							, SalarioxHora
						)
						VALUES(
							@Id  
							, @Nombre 
							, @SalarioxHora 
						);
					END
            
					SET @i = @i + 1;
				END
				SET IDENTITY_INSERT dbo.Puesto OFF;
				
				-- Insert TiposEvento
				SET IDENTITY_INSERT dbo.TipoEvento ON;
				SET @i = 1;
				SET @total = (SELECT COUNT(*) FROM @TempTiposEvento);
				WHILE(@i <= @total)
				BEGIN
					SELECT 
						@Id = TE.Id
						, @Nombre = TE.Nombre
					FROM 
						@TempTiposEvento AS TE 
					WHERE(TE.Id = @i);

					IF NOT EXISTS (SELECT 1 FROM dbo.TipoEvento WHERE Id = @Id)
					BEGIN
						INSERT INTO dbo.TipoEvento (
							Id
							, Nombre
						)
						VALUES(
							@Id  
							, @Nombre 
						);
					END
            
					SET @i = @i + 1;
				END
				SET IDENTITY_INSERT dbo.TipoEvento OFF;
				
				-- Insert Usuarios
				SET IDENTITY_INSERT dbo.Usuario ON;
				SET @i = 1;
				SET @total = (SELECT COUNT(*) FROM @TempUsuarios);
				WHILE(@i <= @total)
				BEGIN
					SELECT 
						@Id = U.Id
						, @Username = U.Username
						, @Password = U.Password
					FROM 
						@TempUsuarios AS U 
					WHERE(U.Id = @i);

					IF NOT EXISTS (SELECT 1 FROM dbo.Usuario WHERE Id = @Id)
					BEGIN
						INSERT INTO dbo.Usuario (
							Id
							, Username
							, Password
						)
						VALUES(
							@Id  
							, @Username 
							, @Password
						);
					END
            
					SET @i = @i + 1;
				END
				SET IDENTITY_INSERT dbo.Usuario OFF;

				-- Insert Feriados
				SET @i = 1;
				SET @total = (SELECT COUNT(*) FROM @TempFeriados);
				WHILE(@i <= @total)
				BEGIN
					SELECT 
						@Fecha = F.Fecha
						, @Descripcion = F.Descripcion
					FROM 
						@TempFeriados AS F 
					WHERE(F.Id = @i);

					IF NOT EXISTS (SELECT 1 FROM dbo.Feriado WHERE Fecha = @Fecha)
					BEGIN
						INSERT INTO dbo.Feriado (
							Fecha
							, Descripcion
						)
						VALUES(
							@Fecha  
							, @Descripcion 
						);
					END
            
					SET @i = @i + 1;
				END

				-- Insert Errores
				SET IDENTITY_INSERT dbo.Error ON;
				SET @i = 1;
				SET @total = (SELECT COUNT(*) FROM @TempErrores);
				WHILE(@i <= @total)
				BEGIN
					SELECT 
						@Id = E.Id
						, @Codigo = E.Codigo
						, @DescripcionE = E.Descripcion
					FROM 
						@TempErrores AS E 
					WHERE(E.Id = @i);

					IF NOT EXISTS (SELECT 1 FROM dbo.Error WHERE Codigo = @Codigo)
					BEGIN
						INSERT INTO dbo.Error (
							Id
							, Codigo
							, Descripcion
						)
						VALUES(
						    @Id
							, @Codigo  
							, @DescripcionE 
						);
					END
            
					SET @i = @i + 1;
				END
				SET IDENTITY_INSERT dbo.Error OFF;
				-- Insert Empleados
				SET IDENTITY_INSERT dbo.Empleado ON;
				SET @i = 1;
				SET @total = (SELECT COUNT(*) FROM @TempEmpleandos);
				WHILE(@i <= @total)
				BEGIN
					SELECT 
						@Id = E.Id
						, @IdPuesto = E.IdPuesto
						, @Cedula = E.ValorDocumentoIdentidad
						, @Nombre = E.Nombre
						, @FechaContratacion = E.FechaContratacion
						, @Saldo = E.SaldoVacaciones
						, @EsActivo = E.EsActivo
					FROM 
						@TempEmpleandos AS E 
					WHERE(E.Id = @i);

					IF NOT EXISTS (SELECT 1 FROM dbo.Empleado WHERE Id = @Id)
					BEGIN
						INSERT INTO dbo.Empleado (
							Id
							, IdPuesto
							, ValorDocumentoIdentidad
							, Nombre 
							, FechaContratacion
							, SaldoVacaciones
							, EsActivo
						)
						VALUES(
							@Id
							, @IdPuesto 
							, @Cedula 
							, @Nombre 
							, @FechaContratacion 
							, @Saldo 
							, @EsActivo 
						);
					END
            
					SET @i = @i + 1;
				END
				SET IDENTITY_INSERT dbo.Empleado OFF;

				-- Insert Movimientos 
				SET IDENTITY_INSERT dbo.Movimiento ON;

				SET @i = 1;
				SET @total = (SELECT COUNT(*) FROM @TempMovimientos);
				WHILE(@i <= @total)
				BEGIN
					SELECT 
						@Id = M.Id
						, @IdEmpleado = M.IdEmpleado
						, @IdTipoMovimiento = M.IdTipoMovimiento
						, @Fecha = M.Fecha
						, @Monto = M.Monto
						, @NuevoSaldo = M.NuevoSaldo
						, @IdPostByUser = M.IdPostByUser
						, @PostInIP = M.PostInIP
						, @PostTime = M.PostTime
					FROM 
						@TempMovimientos AS M 
					WHERE(M.Id = @i);

					INSERT INTO dbo.Movimiento (
						Id
						, IdEmpleado
						, IdTipoMovimiento
						, Fecha
						, Monto
						, NuevoSaldo
						, IdPostByUser
						, PostInIP
						, PostTime
					)
					VALUES(
						@Id
						, @IdEmpleado
						, @IdTipoMovimiento
						, @Fecha
						, @Monto
						, @NuevoSaldo
						, @IdPostByUser
						, @PostInIP
						, @PostTime
					);
            
					SET @i = @i + 1;
				END
				SET IDENTITY_INSERT dbo.Movimiento OFF;

			COMMIT TRANSACTION;

			SET @outResultCode = 0;
    
		END TRY
		BEGIN CATCH
			IF @@TRANCOUNT>0 
			BEGIN
				ROLLBACK TRANSACTION;
			END
			
			SET @outResultCode=50008;

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
		END CATCH 
	END TRY
	BEGIN CATCH
		SET @outResultCode=50008;

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
	END CATCH

	SET NOCOUNT OFF
END
GO