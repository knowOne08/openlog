// Get current user's profile
export async function getProfile(req, res) {
    const userId = req.user.userId;
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [profiles] = await connection.execute('SELECT * FROM user_profiles WHERE user_id = ?', [userId]);
        if (profiles.length === 0) {
            return res.status(404).json({ success: false, error: 'User profile not found' });
        }
        const profile = profiles[0];
        res.json({
            success: true,
            data: {
                user: {
                    id: profile.user_id,
                    email: profile.email,
                    name: profile.name,
                    role: profile.role,
                    team: profile.team,
                    is_active: profile.is_active,
                    must_change_password: profile.must_change_password,
                    created_at: profile.created_at
                }
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server error' });
    } finally {
        if (connection) await connection.end();
    }
}

// Authentication controller for MySQL-based OpenLog backend

import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { sendUserWelcomeEmail } from '../utils/mailer.js';

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'openlog',
};

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const JWT_EXPIRES_IN = '8h';

// Login
export async function login(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Email and password are required' });
    }
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [users] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ success: false, error: 'Invalid email or password' });
        }
        const user = users[0];
        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) {
            return res.status(401).json({ success: false, error: 'Invalid email or password' });
        }
        // Get user profile
        const [profiles] = await connection.execute('SELECT * FROM user_profiles WHERE user_id = ?', [user.id]);
        const profile = profiles[0];
        // JWT
        const token = jwt.sign({ userId: user.id, role: profile.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        res.json({
            success: true,
            data: {
                access_token: token,
                refresh_token: 'dummy-refresh-token',
                expires_at: null,
                user: {
                    id: user.id,
                    email: user.email,
                    name: profile.name,
                    role: profile.role,
                    team: profile.team,
                    is_active: profile.is_active,
                    must_change_password: profile.must_change_password,
                    created_at: profile.created_at
                }
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server error' });
    } finally {
        if (connection) await connection.end();
    }
}

// Change password
export async function changePassword(req, res) {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, error: 'Current and new password required' });
    }
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [users] = await connection.execute('SELECT * FROM users WHERE id = ?', [userId]);
        if (users.length === 0) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        const user = users[0];
        const valid = await bcrypt.compare(currentPassword, user.password_hash);
        if (!valid) {
            return res.status(401).json({ success: false, error: 'Current password is incorrect' });
        }
        const hash = await bcrypt.hash(newPassword, 10);
        await connection.execute('UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?', [hash, userId]);
        await connection.execute('UPDATE user_profiles SET must_change_password = false WHERE user_id = ?', [userId]);
        res.json({ success: true, message: 'Password changed successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server error' });
    } finally {
        if (connection) await connection.end();
    }
}

// Admin creates a new user
export async function createUser(req, res) {
    const { email, name, role = 'member', team = 'rocketry' } = req.body;
    if (!email || !name) {
        return res.status(400).json({ success: false, error: 'Email and name are required' });
    }
    if (!['admin', 'member'].includes(role)) {
        return res.status(400).json({ success: false, error: 'Invalid role' });
    }
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        // Check if user exists
        const [existing] = await connection.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, error: 'User already exists' });
        }
        const userId = uuidv4();
        // Set a random temp password and require change
        const tempPassword = uuidv4().slice(0, 12);
        const hash = await bcrypt.hash(tempPassword, 10);
        const now = new Date();
        await connection.execute('INSERT INTO users (id, email, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?)', [userId, email, hash, now, now]);
        await connection.execute('INSERT INTO user_profiles (id, user_id, name, email, role, team, is_active, must_change_password, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [uuidv4(), userId, name, email, role, team, true, true, req.user.userId, now, now]);

        // Send welcome email with credentials
        const loginUrl = process.env.LOGIN_URL || 'http://localhost:3000/auth/signin';
        try {
            await sendUserWelcomeEmail({
                to: email,
                name,
                tempPassword,
                loginUrl
            });
        } catch (mailErr) {
            // Log but do not fail user creation
            console.error('Failed to send welcome email:', mailErr);
        }

        res.status(201).json({ success: true, message: 'User created', tempPassword });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server error' });
    } finally {
        if (connection) await connection.end();
    }
}

// Middleware: authenticate JWT
export function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, error: 'Access token required' });
    }
    try {
        const user = jwt.verify(token, JWT_SECRET);
        req.user = user;
        next();
    } catch (err) {
        return res.status(403).json({ success: false, error: 'Invalid or expired token' });
    }
}

// Middleware: require admin role
export function requireAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Admin privileges required' });
    }
    next();
}
