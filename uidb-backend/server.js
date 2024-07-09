require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const tableRoutes = require('./routes/tableRoutes');
const authRoutes = require('./routes/authRoutes')
const bodyParser = require('body-parser');
const auth = require('./middleware/auth');
const app = express();
const port = process.env.PORT || 5000;
const cookieParser = require('cookie-parser')

// Connect to MongoDB
connectDB();
app.use(bodyParser.json());

// app.use(
  //     cors({
    //         origin: ['http://localhost:5173'],
    //         methods: ['GET', 'POST', 'PUT', 'DELETE'],
    //         allowedHeaders: ['Content-Type', 'Authentication', 'Authorization'],
    //         credentials: 'true'
    //     })
    // )
    
app.use(express.json());
app.use(cookieParser())
// app.use(cors());
const corsOptions = {
  origin: 'https://uidb.vercel.app',
  credentials: true 
};

app.use(cors(corsOptions));

// Routes
app.use('/api', auth, tableRoutes);
app.use('/auth', authRoutes)


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

