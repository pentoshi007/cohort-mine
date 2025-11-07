const express = require('express');
const users = require('./users');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/', (req, res) => {

    if (!users[0]) {
        return res.status(404).json({ error: 'User not found' });
    }
    const johnKidney = users[0].kidney;
    const numberOfKidneys = johnKidney.length;
    const healthyKidneys = johnKidney.filter(kidney => kidney.healthy).length;
    const unhealthyKidneys = johnKidney.filter(kidney => !kidney.healthy).length;
    res.json({
        name: users[0].name,
        id: users[0].id,
        numberOfKidneys,
        healthyKidneys,
        unhealthyKidneys,
    });
});
app.post('/', (req, res) => {
    if (!users[0]) {
        return res.status(404).json({ error: 'User not found' });
    }
    const isHealthy = req.body.isHealthy;
    if (typeof isHealthy !== 'boolean') {
        return res.status(400).json({ error: 'isHealthy must be a boolean' });
    }
    users[0].kidney.push({
        healthy: isHealthy
    });
    res.json({
        message: 'Kidney added successfully',
        numberOfKidneys: users[0].kidney.length,
        healthyKidneys: users[0].kidney.filter(kidney => kidney.healthy).length,
        unhealthyKidneys: users[0].kidney.filter(kidney => !kidney.healthy).length,
    });
});

app.put('/', (req, res) => {
    if (!users[0]) {
        return res.status(404).json({ error: 'User not found' });
    }
    const unhealthyKidneys = users[0].kidney.filter(kidney => !kidney.healthy);
    if (unhealthyKidneys.length === 0) {
        return res.status(400).json({ error: 'No unhealthy kidneys to update' });
    }
    // Update all unhealthy kidneys to healthy
    users[0].kidney.forEach(kidney => {
        kidney.healthy = true;
    });
    res.json({
        message: 'All kidneys updated to healthy',
        numberOfKidneys: users[0].kidney.length,
        healthyKidneys: users[0].kidney.filter(kidney => kidney.healthy).length,
        unhealthyKidneys: users[0].kidney.filter(kidney => !kidney.healthy).length,
    });
});

app.delete('/', (req, res) => {
    if (!users[0]) {
        return res.status(404).json({ error: 'User not found' });
    }
    const unhealthyKidneys = users[0].kidney.filter(kidney => !kidney.healthy);
    if (unhealthyKidneys.length === 0) {
        return res.status(411).json({ error: 'No unhealthy kidneys to remove' });
    }
    // Remove all unhealthy kidneys
    users[0].kidney = users[0].kidney.filter(kidney => kidney.healthy);
    res.json({
        message: 'All unhealthy kidneys removed successfully',
        numberOfKidneys: users[0].kidney.length,
        healthyKidneys: users[0].kidney.filter(kidney => kidney.healthy).length,
        unhealthyKidneys: users[0].kidney.filter(kidney => !kidney.healthy).length,
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});