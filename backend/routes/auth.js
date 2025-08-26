// routes/auth.js
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            error: {
                code: 'NO_TOKEN',
                message: 'Access token required'
            }
        });
    }

    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'INVALID_TOKEN',
                    message: 'Invalid or expired token'
                }
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json({
            success: false,
            error: {
                code: 'TOKEN_VERIFICATION_FAILED',
                message: 'Token verification failed'
            }
        });
    }
};

// Middleware to verify admin role
const requireAdmin = async (req, res, next) => {
    try {
        const { data: profile, error } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('user_id', req.user.id)
            .single();

        if (error || profile.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'ADMIN_REQUIRED',
                    message: 'Admin privileges required'
                }
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: {
                code: 'ROLE_CHECK_FAILED',
                message: 'Failed to verify admin privileges'
            }
        });
    }
};

// 1. USER LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'MISSING_CREDENTIALS',
                    message: 'Email and password are required'
                }
            });
        }

        // Sign in with Supabase
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (authError) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'INVALID_CREDENTIALS',
                    message: 'Invalid email or password'
                }
            });
        }

        // Get user profile data
        const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', authData.user.id)
            .single();

        if (profileError) {
            return res.status(500).json({
                success: false,
                error: {
                    code: 'PROFILE_FETCH_FAILED',
                    message: 'Failed to fetch user profile'
                }
            });
        }

        res.json({
            success: true,
            data: {
                access_token: authData.session.access_token,
                refresh_token: authData.session.refresh_token,
                expires_at: authData.session.expires_at,
                user: {
                    id: authData.user.id,
                    email: authData.user.email,
                    name: profile.name,
                    role: profile.role,
                    team: profile.team,
                    is_active: profile.is_active,
                    created_at: profile.created_at
                }
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'LOGIN_FAILED',
                message: 'Login failed due to server error'
            }
        });
    }
});

// 2. REFRESH TOKEN
router.post('/refresh', async (req, res) => {
    try {
        const { refresh_token } = req.body;

        if (!refresh_token) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'MISSING_REFRESH_TOKEN',
                    message: 'Refresh token is required'
                }
            });
        }

        const { data, error } = await supabase.auth.refreshSession({
            refresh_token
        });

        if (error) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'REFRESH_FAILED',
                    message: 'Failed to refresh token'
                }
            });
        }

        res.json({
            success: true,
            data: {
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token,
                expires_at: data.session.expires_at
            }
        });

    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'REFRESH_ERROR',
                message: 'Token refresh failed due to server error'
            }
        });
    }
});

// 3. LOGOUT
router.post('/logout', authenticateToken, async (req, res) => {
    try {
        const { error } = await supabase.auth.signOut();

        if (error) {
            return res.status(500).json({
                success: false,
                error: {
                    code: 'LOGOUT_FAILED',
                    message: 'Failed to logout'
                }
            });
        }

        res.json({
            success: true,
            message: 'Logged out successfully'
        });

    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'LOGOUT_ERROR',
                message: 'Logout failed due to server error'
            }
        });
    }
});

// 4. CREATE MEMBER (Admin only)
router.post('/admin/create-member', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { email, name, role = 'member', team, temporary_password } = req.body;

        if (!email || !name || !temporary_password) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'MISSING_REQUIRED_FIELDS',
                    message: 'Email, name, and temporary password are required'
                }
            });
        }

        // Validate role
        const validRoles = ['admin', 'member'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_ROLE',
                    message: 'Role must be either admin or member'
                }
            });
        }

        // Create user in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password: temporary_password,
            email_confirm: true,
            user_metadata: {
                name,
                created_by_admin: true
            }
        });

        if (authError) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'USER_CREATION_FAILED',
                    message: authError.message
                }
            });
        }

        // Create user profile
        const { data: profileData, error: profileError } = await supabase
            .from('user_profiles')
            .insert({
                user_id: authData.user.id,
                name,
                email,
                role,
                team: team || 'rocketry',
                is_active: true,
                must_change_password: true,
                created_by: req.user.id
            })
            .select()
            .single();

        if (profileError) {
            // Cleanup: delete the auth user if profile creation fails
            await supabase.auth.admin.deleteUser(authData.user.id);

            return res.status(500).json({
                success: false,
                error: {
                    code: 'PROFILE_CREATION_FAILED',
                    message: 'Failed to create user profile'
                }
            });
        }

        res.status(201).json({
            success: true,
            data: {
                user: {
                    id: authData.user.id,
                    email: authData.user.email,
                    name: profileData.name,
                    role: profileData.role,
                    team: profileData.team,
                    is_active: profileData.is_active,
                    must_change_password: profileData.must_change_password,
                    created_at: profileData.created_at
                },
                temporary_password: temporary_password
            }
        });

    } catch (error) {
        console.error('Create member error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'MEMBER_CREATION_ERROR',
                message: 'Member creation failed due to server error'
            }
        });
    }
});

// 5. GET ALL MEMBERS (Admin only)
router.get('/admin/members', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { data: members, error } = await supabase
            .from('user_profiles')
            .select(`
        user_id,
        name,
        email,
        role,
        team,
        is_active,
        must_change_password,
        last_login,
        created_at,
        updated_at
      `)
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(500).json({
                success: false,
                error: {
                    code: 'MEMBERS_FETCH_FAILED',
                    message: 'Failed to fetch members'
                }
            });
        }

        res.json({
            success: true,
            data: {
                members,
                total_count: members.length
            }
        });

    } catch (error) {
        console.error('Get members error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'MEMBERS_FETCH_ERROR',
                message: 'Failed to fetch members due to server error'
            }
        });
    }
});

// 6. UPDATE MEMBER STATUS (Admin only) - FIXED ROUTE
router.put('/admin/member-status/:userId', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { userId } = req.params;
        const { is_active } = req.body;

        if (typeof is_active !== 'boolean') {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_STATUS',
                    message: 'is_active must be a boolean value'
                }
            });
        }

        const { data: updatedProfile, error } = await supabase
            .from('user_profiles')
            .update({
                is_active,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', userId)
            .select()
            .single();

        if (error) {
            return res.status(500).json({
                success: false,
                error: {
                    code: 'STATUS_UPDATE_FAILED',
                    message: 'Failed to update member status'
                }
            });
        }

        res.json({
            success: true,
            data: {
                user: updatedProfile
            },
            message: `Member ${is_active ? 'activated' : 'deactivated'} successfully`
        });

    } catch (error) {
        console.error('Update member status error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'STATUS_UPDATE_ERROR',
                message: 'Status update failed due to server error'
            }
        });
    }
});

// 7. CHANGE PASSWORD
router.post('/change-password', authenticateToken, async (req, res) => {
    try {
        const { current_password, new_password } = req.body;

        if (!current_password || !new_password) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'MISSING_PASSWORDS',
                    message: 'Both current and new passwords are required'
                }
            });
        }

        // Update password in Supabase
        const { data, error } = await supabase.auth.updateUser({
            password: new_password
        });

        if (error) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'PASSWORD_UPDATE_FAILED',
                    message: error.message
                }
            });
        }

        // Update profile to mark password as changed
        await supabase
            .from('user_profiles')
            .update({
                must_change_password: false,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', req.user.id);

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'PASSWORD_CHANGE_ERROR',
                message: 'Password change failed due to server error'
            }
        });
    }
});

// 8. GET CURRENT USER PROFILE
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const { data: profile, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', req.user.id)
            .single();

        if (error) {
            return res.status(500).json({
                success: false,
                error: {
                    code: 'PROFILE_FETCH_FAILED',
                    message: 'Failed to fetch user profile'
                }
            });
        }

        res.json({
            success: true,
            data: {
                user: {
                    id: req.user.id,
                    email: req.user.email,
                    name: profile.name,
                    role: profile.role,
                    team: profile.team,
                    is_active: profile.is_active,
                    must_change_password: profile.must_change_password,
                    created_at: profile.created_at
                }
            }
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'PROFILE_FETCH_ERROR',
                message: 'Profile fetch failed due to server error'
            }
        });
    }
});

module.exports = router;