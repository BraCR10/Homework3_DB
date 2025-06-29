USE [DB_Tarea3]
GO
/****** Object:  StoredProcedure [dbo].[sp_generar_tablas]    Script Date: 11/6/2025 11:32:37 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Brian Ramirez>
-- Create date: <2/6/2025>
-- Description:	<Crear tablas>
-- =============================================
ALTER   PROCEDURE [dbo].[sp_generar_tablas]
AS
BEGIN
	SET NOCOUNT ON;
	BEGIN TRY
		

		CREATE TABLE dbo.Puesto (
			Id INT PRIMARY KEY  IDENTITY(1,1)
			, Nombre VARCHAR(64) NOT NULL
			, SalarioXHora DECIMAL(15,5) NOT NULL
		);
		CREATE TABLE dbo.TipoUsuario(
			Id INT PRIMARY KEY IDENTITY(1,1)
			, Nombre VARCHAR(64) NOT NULL
		);
		CREATE TABLE dbo.Usuario (
			Id INT PRIMARY KEY  IDENTITY(1,1)
			, Nombre VARCHAR(64) NOT NULL
			, Contraseña VARCHAR(256) NOT NULL
			, IdTipoUsuario INT NOT NULL
			, FOREIGN KEY (IdTipoUsuario) REFERENCES TipoUsuario(ID)
		);
		CREATE TABLE dbo.TipoDocumentoIdentidad(
			Id INT PRIMARY KEY IDENTITY(1,1)
			, Nombre VARCHAR(64) NOT NULL
		);
		CREATE TABLE dbo.Departamento(
			Id INT PRIMARY KEY IDENTITY(1,1)
			, Nombre VARCHAR(64) NOT NULL
		);

		CREATE TABLE dbo.Empleado(
			Id INT PRIMARY KEY IDENTITY(1,1)
			, Nombre VARCHAR(64) NOT NULL
			, ValorDNI VARCHAR(64) NOT NULL
			, FechaNacimiento DATE NOT NULL
			, Activo BIT NOT NULL DEFAULT 1
			, IdDepartamento INT NOT NULL
			, IdTipoDocumentoIdentidad INT NOT NULL
			, IdUsuario INT NOT NULL
			, IdPuesto INT NOT NULL
			, FOREIGN KEY (IdPuesto) REFERENCES Puesto(Id)
			, FOREIGN KEY (IdUsuario) REFERENCES Usuario(Id)
			, FOREIGN KEY (IdTipoDocumentoIdentidad) REFERENCES TipoDocumentoIdentidad(Id)
			, FOREIGN KEY (IdDepartamento) REFERENCES Departamento(Id)
		);


		CREATE TABLE dbo.TipoEvento (
			Id INT PRIMARY KEY  IDENTITY(1,1)
			, Nombre VARCHAR(64) NOT NULL
		);

		CREATE TABLE dbo.EventLog (
			Id INT PRIMARY KEY  IDENTITY(1,1)
			, ArchivoJSON NVARCHAR(MAX) NOT NULL
			, IdTipoEvento INT NOT NULL
			, FOREIGN KEY (IdTipoEvento) REFERENCES TipoEvento(Id)
		);

		CREATE TABLE dbo.Feriado (
			Id INT PRIMARY KEY  IDENTITY(1,1)
			, Nombre VARCHAR(64) NOT NULL
			, Fecha DATE NOT NULL
		);

		
		CREATE TABLE dbo.Error (
			Id INT PRIMARY KEY  IDENTITY(1,1)
			, Codigo INT NOT NULL
			, Descripcion VARCHAR(512)
		);

		CREATE TABLE dbo.DBErrors (
			id INT IDENTITY(1,1) PRIMARY KEY
			, UserNombre VARCHAR(128)
			, Numero INT
			, Estado INT
			, Severidad INT
			, Linea INT
			, ProcedureError VARCHAR(128)
			, Mensaje VARCHAR(4000)
			, ErrorFecha DATETIME DEFAULT GETDATE()
		);

		CREATE TABLE dbo.TipoDeduccion  (
			Id INT PRIMARY KEY  IDENTITY(1,1)
			, Nombre VARCHAR(64) NOT NULL
			, FlagObligatorio BIT NOT NULL
			, FlagPorcentual BIT NOT NULL

		);

		CREATE TABLE dbo.TipoDeduccionPorcentual  (
			IdTipoDeduccion INT PRIMARY KEY
			, ValorPorcentaje DECIMAL(15,5) NOT NULL
			, FOREIGN KEY (IdTipoDeduccion) REFERENCES TipoDeduccion(Id)
		);

		CREATE TABLE dbo.EmpleadoXTipoDeduccion (
			Id INT PRIMARY KEY  IDENTITY(1,1)
			, IdEmpleado INT NOT NULL 
			, IdTipoDeduccion INT NOT NULL
			, FOREIGN KEY (IdEmpleado) REFERENCES Empleado(Id)
			, FOREIGN KEY (IdTipoDeduccion) REFERENCES TipoDeduccion(Id)
		);
		CREATE TABLE dbo.EmpleadoXTipoDeduccionNoObligatoria(
			IdEmpleadoXTipoDeduccion INT PRIMARY KEY  
			, FechaIni DATE NOT NULL
			, FOREIGN KEY (IdEmpleadoXTipoDeduccion) REFERENCES EmpleadoXTipoDeduccion(Id)
		);

		CREATE TABLE dbo.EmpleadoXTipoDeduccionNoObligatoriaNoPorcentual(
			IdEmpleadoXTipoDeduccionNoObligatoria INT PRIMARY KEY  
			, Valor DECIMAL(15,5) NOT NULL
			, FOREIGN KEY (IdEmpleadoXTipoDeduccionNoObligatoria) REFERENCES EmpleadoXTipoDeduccionNoObligatoria(IdEmpleadoXTipoDeduccion)
		);

		CREATE TABLE dbo.EmpleadoXTipoDeduccionHistorial(
			Id INT PRIMARY KEY  IDENTITY(1,1)
			, FechaIni DATE NOT NULL
			, FechaFin DATE NOT NULL
			, IdEmpleadoXTipoDeduccionNoObligatoria INT NOT NULL
			, FOREIGN KEY (IdEmpleadoXTipoDeduccionNoObligatoria) REFERENCES EmpleadoXTipoDeduccionNoObligatoria(IdEmpleadoXTipoDeduccion)
		);

		CREATE TABLE dbo.TipoJornada  (
			Id INT PRIMARY KEY  IDENTITY(1,1)
			, Nombre VARCHAR(64) NOT NULL
			, HoraFin TIME NOT NULL
			, HoraIni TIME NOT NULL

		);

		CREATE TABLE MesPlanilla(
			Id INT PRIMARY KEY  IDENTITY(1,1)
			, FechaFin DATE NOT NULL
			, FechaIni DATE NOT NULL
		);

	


		CREATE TABLE EmpleadoXMesPlanilla (
			Id INT PRIMARY KEY  IDENTITY(1,1) 
			, IdMesPlanilla INT NOT NULL 
			, IdEmpleado INT NOT NULL
			, FOREIGN KEY (IdMesPlanilla) REFERENCES MesPlanilla(Id)
			, FOREIGN KEY (IdEmpleado) REFERENCES Empleado(Id)
		);

			CREATE TABLE SemanaPlanilla(
			Id INT PRIMARY KEY  IDENTITY(1,1)
			, FechaFin DATE NOT NULL
			, FechaIni DATE NOT NULL
			, IdMesPlanilla INT NOT NULL
			, FOREIGN KEY (IdMesPlanilla) REFERENCES MesPlanilla(Id)
		);

		CREATE TABLE EmpleadoXMesPlanillaXTipoDeduccion(
			Id INT PRIMARY KEY  IDENTITY(1,1)
			, MontoTotal DECIMAL(15,5) NOT NULL
			, IdEmpleadoXMesPlanilla INT NOT NULL 
			, IdTipoDeduccion INT NOT NULL 
			, FOREIGN KEY (IdEmpleadoXMesPlanilla) REFERENCES EmpleadoXMesPlanilla(Id)
			, FOREIGN KEY (IdTipoDeduccion) REFERENCES TipoDeduccion(Id)
		);

		CREATE TABLE EmpleadoXSemanaPlanilla(
			Id INT PRIMARY KEY  IDENTITY(1,1)
			, IdSemanaPlanilla INT NOT NULL  
			, IdEmpleado INT NOT NULL 
			, SalarioBruto DECIMAL(15,5) NOT NULL
			, SumaDeducciones DECIMAL(15,5) NOT NULL
			, IdEmpleadoXMesPlanilla INT NOT NULL
			, FOREIGN KEY (IdSemanaPlanilla) REFERENCES SemanaPlanilla(Id)
			, FOREIGN KEY (IdEmpleado) REFERENCES Empleado(Id)
			, FOREIGN KEY (IdEmpleadoXMesPlanilla) REFERENCES EmpleadoXMesPlanilla(Id)
		);
				CREATE TABLE dbo.EmpleadoXTipoJornadaXSemana (
			Id INT PRIMARY KEY  IDENTITY(1,1)
			, IdTipoJornada INT NOT NULL 
			, IdSemanaPlantilla INT NOT NULL
			, IdEmpleado INT NOT NULL
			, FOREIGN KEY (IdEmpleado) REFERENCES Empleado(Id)
			, FOREIGN KEY (IdSemanaPlantilla) REFERENCES SemanaPlanilla(Id)
			, FOREIGN KEY (IdTipoJornada) REFERENCES TipoJornada(Id)
		);
		

		CREATE TABLE TipoMovimiento(
			Id INT PRIMARY KEY  IDENTITY(1,1)
			, Nombre VARCHAR(64) NOT NULL
		);

		CREATE TABLE MovimientoPlanilla(
			Id INT PRIMARY KEY  IDENTITY(1,1)
			, FechaIni DATE NOT NULL DEFAULT GETDATE()
			, Monto DECIMAL(15,5) NOT NULL
			, IdEmpleadoXSemanaPlanilla INT NOT NULL 
			, IdTipoMovimiento INT NOT NULL 
			, FOREIGN KEY (IdEmpleadoXSemanaPlanilla) REFERENCES EmpleadoXSemanaPlanilla(Id)
			, FOREIGN KEY (IdTipoMovimiento) REFERENCES TipoMovimiento(Id)

		);

	

	

		CREATE TABLE MovimientoDeduccion(
			IdMovimientoPlanilla INT PRIMARY KEY 
			, IdEmpleadoXTipoDeduccion INT  
			, FOREIGN KEY (IdMovimientoPlanilla) REFERENCES MovimientoPlanilla(Id)
			, FOREIGN KEY (IdEmpleadoXTipoDeduccion) REFERENCES EmpleadoXTipoDeduccion(Id)
		);

		CREATE TABLE MarcaAsistencia(
			Id INT PRIMARY KEY  IDENTITY(1,1)
			, HoraFin DATETIME NOT NULL
			, HoraIni DATETIME NOT NULL
			, IdEmpleadoXTipoJornadaXSemana INT NOT NULL
			, Fecha DATE NOT NULL DEFAULT CAST(GETDATE() AS DATE)
			, FOREIGN KEY (IdEmpleadoXTipoJornadaXSemana) REFERENCES EmpleadoXTipoJornadaXSemana(Id)
		);

			CREATE TABLE MovimientoAsistencia(
			IdMovimientoPlanilla INT PRIMARY KEY  
			, QHoras INT NOT NULL
			, IdMarcaAsistencia INT NOT NULL
			, FOREIGN KEY (IdMovimientoPlanilla) REFERENCES MovimientoPlanilla(Id)
			, FOREIGN KEY (IdMarcaAsistencia) REFERENCES MarcaAsistencia(Id)

		);
	END TRY
	BEGIN CATCH 
		PRINT('Ocurrio un error creando las tablas');
	END CATCH 
	SET NOCOUNT OFF;
END
