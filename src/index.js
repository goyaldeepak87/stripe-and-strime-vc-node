// Load environment variables
require('dotenv').config();
const express = require('express');
const app = require('./app'); 

// Define the port to listen on
const PORT = process.env.PORT || 4000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});