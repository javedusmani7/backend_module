import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { corsOptions } from './config/config.js';
import { connectDB } from './config/db.js';
import userRoutes from "./routes/user.js";
import moduleRoutes from "./routes/module.js";
import responseEncrypt from './middlewares/responseEncrypt.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
connectDB();
app.use(express.json());
app.use(cors(corsOptions));
// app.use(responseEncrypt);
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/modules", moduleRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});