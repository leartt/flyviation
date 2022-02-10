const express = require('express');

require('dotenv').config();

// initialize express
const app = express();

app.get('/', (req, res) => {
    res.json({ msg: "Hello from Express" });
})

const PORT = process.env.PORT || 5500;

app.listen(PORT, () => console.log(`Server is running on PORT: ${PORT}`));