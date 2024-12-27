const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

// Configurar middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // Sirve el HTML y los archivos estáticos

// Conectar a la base de datos
const db = new sqlite3.Database(':memory:'); // Para pruebas en memoria

// Crear tabla de usuarios
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT,
      apellido TEXT,
      correo TEXT,
      telefono TEXT,
      edad INTEGER,
      usuario TEXT UNIQUE,
      contrasena TEXT
    )
  `);
});

// Ruta para registrar un usuario
app.post('/registro', (req, res) => {
  const { nombre, apellido, correo, telefono, edad, usuario, contrasena } = req.body;
  console.log(req.body); // Log de los datos recibidos

  const stmt = db.prepare(`
    INSERT INTO usuarios (nombre, apellido, correo, telefono, edad, usuario, contrasena)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run([nombre, apellido, correo, telefono, edad, usuario, contrasena], function (err) {
    if (err) {
      console.error(err);  // Log del error
      return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
    }
    res.status(201).json({ message: 'Registro exitoso' });
  });
});

// Ruta para iniciar sesión
app.post('/inicio-sesion', (req, res) => {
  const { usuario, contrasena } = req.body;
  db.get(
    `SELECT * FROM usuarios WHERE usuario = ? AND contrasena = ?`,
    [usuario, contrasena],
    (err, row) => {
      if (err || !row) {
        return res.status(400).json({ error: 'Usuario o contraseña incorrectos' });
      }
      res.json({ message: `Bienvenido, ${row.nombre} ${row.apellido}` });
    }
  );
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});