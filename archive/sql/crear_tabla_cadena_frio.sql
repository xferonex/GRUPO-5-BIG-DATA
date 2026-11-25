-- Seccion 2, apartado 4: tabla externa de Hive para cadena de frio.
-- La ruta S3 es la ubicacion hipotetica indicada en el enunciado.
-- Se supone que el CSV ya esta en esa carpeta; este CREATE no lo sube.
-- Formato: columnas separadas por comas; fechas YYYY-MM-DD HH:MM:SS.
-- La columna detalles conserva pares como bateria:100;senal:-70.

CREATE EXTERNAL TABLE IF NOT EXISTS cadena_frio (
    id_lectura     INT,
    id_sensor      VARCHAR(25),
    ubicacion      VARCHAR(25),
    fecha_hora     TIMESTAMP,
    temperatura    DECIMAL(5,1),
    humedad        DECIMAL(5,1),
    puerta_abierta BOOLEAN,
    alarma_activa  BOOLEAN,
    detalles       MAP<STRING,INT>
)
ROW FORMAT DELIMITED
    FIELDS TERMINATED BY ','
    COLLECTION ITEMS TERMINATED BY ';'
    MAP KEYS TERMINATED BY ':'
    NULL DEFINED AS ''
STORED AS TEXTFILE
LOCATION 's3://retoBigData2026/input/'
TBLPROPERTIES (
    'skip.header.line.count' = '1'
);
