import express from 'express';
import cors from 'cors';
import { getSalesData } from './dataService.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Sales data endpoint
app.get('/api/sales', async (req, res) => {
    try {
        const data = await getSalesData();
        res.json(data);
    } catch (err) {
        console.error("Error fetching sales data:", err);
        res.status(500).json({ error: "Failed to fetch data from data source." });
    }
});

app.listen(port, () => {
    console.log(`Backend API running at http://localhost:${port}`);
});
