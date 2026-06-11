const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const employeeRoutes = require('./routes/employeeRoutes');

const app = express();

app.use(express.json());

const swaggerDocument = YAML.load('./swagger.yaml');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api/employees', employeeRoutes);

app.get('/', (req, res) => {
    res.send('Employee Management System API is running. Go to <a href="/api-docs">/api-docs</a> to test your configurations.');
});

module.exports = app;