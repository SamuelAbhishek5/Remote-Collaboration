const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/remotecollaboration')
  .then(() => {
    console.log('✅ Connected to MongoDB successfully!');
  })
  .catch((err) => {
    console.error('❌ Failed to connect to MongoDB:', err);
  });

// User Schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['developer', 'designer', 'project-manager', 'tester'],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', userSchema);

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const user = new User({
            name,
            email,
            password: hashedPassword,
            role
        });

        // Save user to database
        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            'bda@1234', // Replace with a secure secret key
            { expiresIn: '24h' }
        );

        // Return user data and token
        res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            'bda@1234', // Replace with a secure secret key
            { expiresIn: '24h' }
        );

        // Return user data and token
        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const verified = jwt.verify(token, 'your-secret-key');
        req.user = verified;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token.' });
    }
};

// Protected routes middleware
app.use(['/api/projects', '/api/tasks', '/api/documents', '/api/team', '/api/users/me'], authenticateToken);

// Project Schema
const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['Not Started', 'In Progress', 'Completed'],
        default: 'Not Started'
    }
});

// Document Schema
const documentSchema = new mongoose.Schema({
    fileName: {
        type: String,
        required: true
    },
    fileType: {
        type: String,
        required: true
    },
    uploadDate: {
        type: Date,
        default: Date.now
    },
    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    }
});

// Task Schema
const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['Not Started', 'In Progress', 'Completed'],
        default: 'Not Started'
    },
    priority: {
        type: String,
        enum: ['High', 'Medium', 'Low'],
        default: 'Medium'
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    }
});

const Task = mongoose.model('Task', taskSchema);
const Document = mongoose.model('Document', documentSchema);
const Project = mongoose.model('Project', projectSchema);

// Project endpoints
app.post('/api/projects', authenticateToken, async (req, res) => {
    try {
        const { name, description, owner,startDate, endDate, status} = req.body;
        const project = new Project({
            name,
            description,
            owner,
            startDate,
            endDate,
            status
        });
        await project.save();
        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ message: 'Error creating project', error: error.message });
    }
});

// Task endpoints
app.post('/api/tasks', authenticateToken, async (req, res) => {
    try {
        const { title, description, assignedTo, dueDate, priority, projectId } = req.body;
        const task = new Task({
            title,
            description,
            assignedTo,
            dueDate,
            priority,
            projectId
        });
        await task.save();
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: 'Error creating task', error: error.message });
    }
});

// Document endpoints
app.post('/api/documents', authenticateToken, async (req, res) => {
    try {
        const { fileName, fileType, taskId } = req.body;
        const document = new Document({
            fileName,
            fileType,
            taskId
        });
        await document.save();
        res.status(201).json(document);
    } catch (error) {
        res.status(500).json({ message: 'Error uploading document', error: error.message });
    }
});

// GET endpoints for retrieving data
app.get('/api/projects', authenticateToken, async (req, res) => {
    try {
        const projects = await Project.find().populate('owner', 'name email');
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving projects', error: error.message });
    }
});

app.get('/api/tasks', authenticateToken, async (req, res) => {
    try {
        const tasks = await Task.find()
            .populate('assignedTo', 'name email')
            .populate('projectId', 'name');
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving tasks', error: error.message });
    }
});

app.get('/api/documents', authenticateToken, async (req, res) => {
    try {
        const documents = await Document.find().populate('taskId', 'title');
        res.json(documents);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving documents', error: error.message });
    }
});
app.get('/api/users/names', authenticateToken, async (req, res) => {
    try {
        // Find all users but exclude password field
        const users = await User
            .find({})
            .project({ name: 1 }) // Include only 'name' field
            .toArray();

        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
// Frontend code to fetch users:
/*
// Using fetch:
fetch('http://localhost:5000/api/users', {
    headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
    }
})
.then(response => response.json())
.then(users => console.log(users))
.catch(error => console.error('Error:', error));

// Using axios:
axios.get('http://localhost:5000/api/users', {
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
})
.then(response => console.log(response.data))
.catch(error => console.error('Error:', error));

// Using async/await:
async function getUsers() {
    try {
        const response = await fetch('http://localhost:5000/api/users', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const users = await response.json();
        return users;
    } catch (error) {
        console.error('Error:', error);
    }
}
*/
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


// Apply to specific routes
app.get('/api/users/me', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});