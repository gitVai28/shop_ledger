require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
require('./Models/db');
const cors = require('cors');
const AuthRouter = require('./Routes/AuthRouter');
const ProductRouter = require('./Routes/ProductRouter');
const CustomerRouter = require('./Routes/customerRoutes');



require('./Models/db');

const PORT = process.env.PORT || 8080;

app.get('/ping',(req,res)=> {
  res.send('pong');
});

app.use(bodyParser.json());
app.use(cors());
app.use('/auth',AuthRouter);
app.use('/products', ProductRouter);
app.use('/customers', CustomerRouter);


app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});

