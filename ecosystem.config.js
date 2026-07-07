module.exports = {
  apps: [
    {
      name: "paint-platform",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      instances: "max", // Runs in cluster mode using all CPU cores
      exec_mode: "cluster",
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
      }
    }
  ]
};
