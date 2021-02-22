module.exports = {
    apps : [{
      name: "luxuryrentalcars",
      script: "./server.js",
      env: {
        MONGO_URL: "mongodb://localhost:27017",
        NODE_ENV: "development",
      },
      env_production: {
        MONGO_URL: "mongodb://localhost:27017",
        NODE_ENV: "production",
      }
    }]
  }
  