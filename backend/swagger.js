const swaggerJSDoc = require("swagger-jsdoc");
const path = require("path");

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "SkinCancerApp API",
      version: "1.0.0",
      description: "Documentación de la API"
    },
    servers: [
      {
        url: "http://localhost:3000"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  // Reemplazamos barras invertidas por normales para que glob funcione en Windows
  apis: [path.join(__dirname, "./src/routes/*.js").replace(/\\/g, '/')]
};

module.exports = swaggerJSDoc(options);