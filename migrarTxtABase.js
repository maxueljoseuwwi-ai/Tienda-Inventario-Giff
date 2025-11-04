import fs from "fs";
import pkg from "pg";
const { Pool } = pkg;

// Render guarda la variable en process.env.DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrar() {
  try {
    // Crear la tabla si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tarjetas (
        id SERIAL PRIMARY KEY,
        codigo TEXT UNIQUE,
        valor TEXT,
        estado TEXT
      )
    `);

    // Leer el archivo del repositorio
    const data = fs.readFileSync("inventario_tarjetas.txt", "utf8");

    // Separar por líneas
    const lineas = data.split("\n").filter(l => l.trim() !== "");

    for (const linea of lineas) {
      // Divide cada línea por coma o punto y coma, según cómo esté tu txt
      const [codigo, valor, estado] = linea.split(",").map(x => x.trim());

      // Evita duplicados con ON CONFLICT
      await pool.query(
        `INSERT INTO tarjetas (codigo, valor, estado)
         VALUES ($1, $2, $3)
         ON CONFLICT (codigo) DO NOTHING`,
        [codigo, valor, estado]
      );
    }

    console.log("✅ Migración completa: datos del .txt guardados en la base de datos.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error migrando datos:", err);
    process.exit(1);
  }
}

migrar();
