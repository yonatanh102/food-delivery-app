const express = require('express');
const recommendationRoutes = require('./routes/recommendations');
const interactionRoutes = require('./routes/interactions');

const app = express();

app.use(express.json());
app.use(express.static('public'));
app.use('/recommendations', recommendationRoutes);
app.use('/interactions', interactionRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});