const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

// Enable CORS and JSON body parser
app.use(cors());
app.use(express.json());

// Serve static assets from '/static'
app.use('/static', express.static(path.join(__dirname, 'static')));

// Redirect root index requests to 'index.html'
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'index.html'));
});

// Register Backend API Routers
app.use('/api/auth', require('./routes/auth'));
app.use('/api/managers', require('./routes/managers'));
app.use('/api/tenants', require('./routes/tenants'));
app.use('/api/buildings', require('./routes/buildings'));
app.use('/api/apartments', require('./routes/apartments'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/events', require('./routes/events'));
app.use('/api/analytics', require('./routes/analytics'));

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ detail: err.message || "An internal server error occurred." });
});

// Start listening if run directly
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}

module.exports = app;
