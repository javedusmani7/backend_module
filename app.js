import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { corsOptions } from './config/config.js';
import { connectDB } from './config/db.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
connectDB();

app.use(cors(corsOptions));

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});