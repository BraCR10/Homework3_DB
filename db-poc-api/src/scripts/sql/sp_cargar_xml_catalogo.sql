USE [DB_Tarea3]
GO
/****** Object:  StoredProcedure [dbo].[sp_cargar_catalogo]    Script Date: 19/6/2025 00:16:41 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Brian Ramirez Arias>
-- Create date: <7/6/2025>
-- Description:	<Cargar datos del XML del catalogo>
-- =============================================
ALTER   PROCEDURE [dbo].[sp_cargar_catalogo](
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
		DECLARE @TempTiposDeduccion TABLE(
			Id  INT  PRIMARY KEY
			, Nombre VARCHAR(64)
			, FlagObligatorio  VARCHAR(16)
			, FlagPorcentual  VARCHAR(16) 
			, Valor DECIMAL(15,5)
		);

		DECLARE @TempXML TABLE (
			Id INT IDENTITY(1,1)
			, NombreNodo VARCHAR(32)
			, NodeVar XML
		);

		-- Insertando masivamente nodos pades en la tabla temporal 
		INSERT INTO @TempXML (NombreNodo,NodeVar)
		SELECT 'TiposdeDocumentodeIdentidad' ,T.P.query('.') 
		FROM @XML.nodes('/Catalogo/TiposdeDocumentodeIdentidad') AS T(P);

		INSERT INTO @TempXML (NombreNodo,NodeVar)
		SELECT 'TiposDeJornada' ,T.P.query('.') 
		FROM @XML.nodes('/Catalogo/TiposDeJornada') AS T(P);

		INSERT INTO @TempXML (NombreNodo,NodeVar)
		SELECT 'Puestos' ,T.P.query('.') 
		FROM @XML.nodes('/Catalogo/Puestos') AS T(P);

		INSERT INTO @TempXML (NombreNodo,NodeVar)
		SELECT 'Departamentos' ,T.P.query('.') 
		FROM @XML.nodes('/Catalogo/Departamentos') AS T(P);

		INSERT INTO @TempXML (NombreNodo,NodeVar)
		SELECT 'Feriados' ,T.P.query('.') 
		FROM @XML.nodes('/Catalogo/Feriados') AS T(P);

		INSERT INTO @TempXML (NombreNodo,NodeVar)
		SELECT 'TiposDeMovimiento' ,T.P.query('.') 
		FROM @XML.nodes('/Catalogo/TiposDeMovimiento') AS T(P);

		INSERT INTO @TempXML (NombreNodo,NodeVar)
		SELECT 'TiposDeDeduccion' ,T.P.query('.') 
		FROM @XML.nodes('/Catalogo/TiposDeDeduccion') AS T(P);

		INSERT INTO @TempXML (NombreNodo,NodeVar)
		SELECT 'Errores' ,T.P.query('.') 
		FROM @XML.nodes('/Catalogo/Errores') AS T(P);

		INSERT INTO @TempXML (NombreNodo,NodeVar)
		SELECT 'Usuarios' ,T.P.query('.') 
		FROM @XML.nodes('/Catalogo/Usuarios') AS T(P);

		INSERT INTO @TempXML (NombreNodo,NodeVar)
		SELECT 'UsuariosAdministradores' ,T.P.query('.') 
		FROM @XML.nodes('/Catalogo/UsuariosAdministradores') AS T(P);

		INSERT INTO @TempXML (NombreNodo,NodeVar)
		SELECT 'TiposdeEvento' ,T.P.query('.') 
		FROM @XML.nodes('/Catalogo/TiposdeEvento') AS T(P);

		INSERT INTO @TempXML (NombreNodo,NodeVar)
		SELECT 'Empleados' ,T.P.query('.') 
		FROM @XML.nodes('/Catalogo/Empleados') AS T(P);

		DECLARE @xmlTemp XML

		-- Deducciones necesitan pre-procesamiento con tabla temporal para saber si son porcentuales o no
		SELECT @xmlTemp = NodeVar
		FROM @TempXML
		WHERE NombreNodo = 'TiposDeDeduccion';
		
		INSERT INTO @TempTiposDeduccion (Id, Nombre,FlagObligatorio,FlagPorcentual,Valor)
		SELECT 
			T.value('@Id[1]', 'INT')
			, T.value('@Nombre[1]', 'VARCHAR(64)')
			, T.value('@Obligatorio[1]', 'VARCHAR(16)')
			, T.value('@Porcentual[1]', 'VARCHAR(16)')
			, T.value('@Valor[1]', 'DECIMAL(15,5)')
		FROM @xmlTemp.nodes('/TiposDeDeduccion/TipoDeDeduccion ') AS X(T);

		-- Insertar datos del XML en las tablas masivamente 
		BEGIN TRANSACTION
		    
			-- Documentos de identidad
			SET IDENTITY_INSERT dbo.TipoDocumentoIdentidad ON;

				SELECT @xmlTemp = NodeVar
				FROM @TempXML
				WHERE NombreNodo = 'TiposdeDocumentodeIdentidad';

				INSERT INTO dbo.TipoDocumentoIdentidad (Id, Nombre)
				SELECT 
					T.value('@Id[1]', 'INT')
					, T.value('@Nombre[1]', 'VARCHAR(64)')
				FROM @xmlTemp.nodes('/TiposdeDocumentodeIdentidad/TipoDocuIdentidad') AS X(T);

			SET IDENTITY_INSERT dbo.TipoDocumentoIdentidad OFF;

			-- Jornadas
			SET IDENTITY_INSERT dbo.TipoJornada ON;

				SELECT @xmlTemp = NodeVar
				FROM @TempXML
				WHERE NombreNodo = 'TiposDeJornada';
				
				INSERT INTO dbo.TipoJornada (Id, Nombre,HoraIni,HoraFin)
				SELECT 
					T.value('@Id[1]', 'INT')
					, T.value('@Nombre[1]', 'VARCHAR(64)')
					, T.value('@HoraInicio[1]', 'TIME')
					, T.value('@HoraFin[1]', 'TIME')
				FROM @xmlTemp.nodes('/TiposDeJornada/TipoDeJornada ') AS X(T);

			SET IDENTITY_INSERT dbo.TipoJornada OFF;

			-- Puestos lleva Identity por defecto no trae Id el XML
			SELECT @xmlTemp = NodeVar
			FROM @TempXML
			WHERE NombreNodo = 'Puestos';

			INSERT INTO dbo.Puesto (Nombre,SalarioXHora)
			SELECT 
				T.value('@Nombre[1]', 'VARCHAR(64)')
				, T.value('@SalarioXHora[1]', 'DECIMAL')
			FROM @xmlTemp.nodes('/Puestos/Puesto ') AS X(T);

			-- Departamentos
			SET IDENTITY_INSERT dbo.Departamento ON;

				SELECT @xmlTemp = NodeVar
				FROM @TempXML
				WHERE NombreNodo = 'Departamentos';

				INSERT INTO dbo.Departamento (Id, Nombre)
				SELECT 
					T.value('@Id[1]', 'INT')
					, T.value('@Nombre[1]', 'VARCHAR(64)')
				FROM @xmlTemp.nodes('/Departamentos/Departamento ') AS X(T);

			SET IDENTITY_INSERT dbo.Departamento OFF;

			-- Feriados
			SET IDENTITY_INSERT dbo.Feriado ON;

				SELECT @xmlTemp = NodeVar
				FROM @TempXML
				WHERE NombreNodo = 'Feriados';

				INSERT INTO dbo.Feriado (Id, Nombre, Fecha)
				SELECT 
					T.value('@Id[1]', 'INT')
					, T.value('@Nombre[1]', 'VARCHAR(64)')
					, T.value('@Fecha[1]', 'DATE')
				FROM @xmlTemp.nodes('/Feriados/Feriado ') AS X(T);

			SET IDENTITY_INSERT dbo.Feriado OFF;

			-- Tipos movimiento
			SET IDENTITY_INSERT dbo.TipoMovimiento ON;

				SELECT @xmlTemp = NodeVar
				FROM @TempXML
				WHERE NombreNodo = 'TiposDeMovimiento';
				
				INSERT INTO dbo.TipoMovimiento (Id, Nombre)
				SELECT 
					T.value('@Id[1]', 'INT')
					, T.value('@Nombre[1]', 'VARCHAR(64)')
				FROM @xmlTemp.nodes('/TiposDeMovimiento/TipoDeMovimiento ') AS X(T);

			SET IDENTITY_INSERT dbo.TipoMovimiento OFF;

			-- Tipos deducciones
			SET IDENTITY_INSERT dbo.TipoDeduccion ON;
			
				-- Deducciones SI obligatorias y NO porcentuales
				INSERT INTO dbo.TipoDeduccion(Id,Nombre,FlagObligatorio,FlagPorcentual)
				SELECT 
					TD.Id
					, TD.Nombre
					, 1
					, 0
				FROM @TempTiposDeduccion AS TD
				WHERE(
					FlagObligatorio = 'SI'
					AND FlagPorcentual = 'NO'
				);

				-- Deducciones NO obligatorias y NO porcentuales
				INSERT INTO dbo.TipoDeduccion(Id,Nombre,FlagObligatorio,FlagPorcentual)
				SELECT 
					TD.Id
					, TD.Nombre
					, 0
					, 0
				FROM @TempTiposDeduccion AS TD
				WHERE(
					FlagObligatorio = 'NO'
					AND FlagPorcentual = 'NO'
				);

				-- Deducciones SI obligatorias y SI porcentuales
				INSERT INTO dbo.TipoDeduccion(Id,Nombre,FlagObligatorio,FlagPorcentual)
				SELECT 
					TD.Id
					, TD.Nombre
					, 1
					, 1
				FROM @TempTiposDeduccion AS TD
				WHERE(
					FlagObligatorio = 'SI'
					AND FlagPorcentual = 'SI'
				);

				-- Deducciones NO obligatorias y SI porcentuales
				INSERT INTO dbo.TipoDeduccion(Id,Nombre,FlagObligatorio,FlagPorcentual)
				SELECT 
					TD.Id
					, TD.Nombre
					, 0
					, 1
				FROM @TempTiposDeduccion AS TD
				WHERE(
					FlagObligatorio = 'NO'
					AND FlagPorcentual = 'SI'
				);

				-- Insertar valor del porcentaje
				INSERT INTO dbo.TipoDeduccionPorcentual(IdTipoDeduccion,ValorPorcentaje)
				SELECT 
					TD.Id
					, TD.Valor
				FROM @TempTiposDeduccion AS TD
				WHERE(FlagPorcentual = 'SI');

			SET IDENTITY_INSERT dbo.TipoDeduccion OFF;
		
			-- Tipos errores se insertan con Identity pues tienen codigo 

			SELECT @xmlTemp = NodeVar
			FROM @TempXML
			WHERE NombreNodo = 'Errores';
	
			INSERT INTO dbo.Error (Codigo, Descripcion)
			SELECT 
				T.value('@Codigo[1]', 'INT')
				, T.value('@Descripcion[1]', 'VARCHAR(64)')
			FROM @xmlTemp.nodes('/Errores/Error') AS X(T);

			-- Insertando los 3 tipos de usuario manualmente poque no estan en el XML
			SET IDENTITY_INSERT dbo.TipoUsuario ON;

				INSERT INTO dbo.TipoUsuario (Id,Nombre)
				VALUES (1,'Administrador')

				INSERT INTO dbo.TipoUsuario (Id,Nombre)
				VALUES (2,'Empleado')

				-- Principalmente usado en insertar los eventos de la simulacion
				INSERT INTO dbo.TipoUsuario (Id,Nombre)
				VALUES (3,'Sistema')

			SET IDENTITY_INSERT dbo.TipoUsuario OFF;

			-- Usuarios
			SET IDENTITY_INSERT dbo.Usuario ON;

				SELECT @xmlTemp = NodeVar
				FROM @TempXML
				WHERE NombreNodo = 'Usuarios';

				
				INSERT INTO dbo.Usuario (Id, Nombre,Contraseña,IdTipoUsuario)
				SELECT 
					T.value('@Id[1]', 'INT')
					, T.value('@Username[1]', 'VARCHAR(64)')
					, T.value('@Password[1]', 'VARCHAR(64)')
					, T.value('@Tipo[1]', 'INT')
				FROM @xmlTemp.nodes('/Usuarios/Usuario ') AS X(T);

			SET IDENTITY_INSERT dbo.Usuario OFF;

			-- Eventos
			SET IDENTITY_INSERT dbo.TipoEvento ON;

				SELECT @xmlTemp = NodeVar
				FROM @TempXML
				WHERE NombreNodo = 'TiposdeEvento';

				INSERT INTO dbo.TipoEvento (Id, Nombre)
				SELECT 
					T.value('@Id[1]', 'INT')
					, T.value('@Nombre[1]', 'VARCHAR(64)')
				FROM @xmlTemp.nodes('/TiposdeEvento/TipoEvento') AS X(T);

			SET IDENTITY_INSERT dbo.TipoEvento OFF;

			-- Empleados se insertan con Identity por default

			SELECT @xmlTemp = NodeVar
			FROM @TempXML
			WHERE NombreNodo = 'Empleados';

			INSERT INTO dbo.Empleado (
				Nombre
				, ValorDNI
				, FechaNacimiento
				, Activo
				, IdDepartamento
				, IdTipoDocumentoIdentidad
				, IdUsuario
				, IdPuesto
			)
			SELECT 
				T.value('@Nombre[1]', 'VARCHAR(64)')
				, T.value('@ValorDocumento[1]', 'VARCHAR(64)')
				, T.value('@FechaNacimiento[1]', 'DATE')
				, T.value('@Activo[1]', 'BIT')
				, T.value('@IdDepartamento[1]', 'INT')
				, T.value('@IdTipoDocumento[1]', 'INT')
				, T.value('@IdUsuario[1]', 'INT')
				, P.Id
			FROM @xmlTemp.nodes('/Empleados/Empleado') AS X(T)
			INNER JOIN dbo.Puesto AS P ON (P.Nombre = T.value('@NombrePuesto[1]', 'VARCHAR(64)') );

		COMMIT TRANSACTION 
		
		SET @outResultCode=0;

		-- Recordsets para verificar insercion 
		-- SELECT * FROM dbo.TipoDocumentoIdentidad
		--- SELECT * FROM dbo.TipoJornada
		-- SELECT * FROM dbo.Puesto
		-- SELECT * FROM dbo.Departamento
		-- SELECT * FROM dbo.Feriado
		-- SELECT * FROM dbo.TipoMovimiento
		-- SELECT * FROM dbo.TipoDeduccion
		-- SELECT * FROM dbo.TipoDeduccionPorcentual
		-- SELECT * FROM dbo.Error
		-- SELECT * FROM dbo.TipoUsuario
		-- SELECT * FROM dbo.Usuario
		-- SELECT * FROM dbo.TipoEvento
		-- SELECT * FROM dbo.Empleado

	END TRY
	BEGIN CATCH

		IF @@TRANCOUNT > 0
			ROLLBACK;

		SET @outResultCode=50008;

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

	SET NOCOUNT OFF
END
