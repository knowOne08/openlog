# OpenLog Frontend - Authentication System

This is a modern Next.js frontend application with a comprehensive authentication system built using HeadlessUI components and Tailwind CSS.

## Features

- **Modern Authentication UI**: Clean, responsive design
- **Social Login Support**: Google and Microsoft OAuth integration (ready for implementation)
- **Form Components**: Reusable, accessible form components built with HeadlessUI
- **Authentication Hooks**: React hooks for managing auth state and protected routes
- **Backend Integration**: Full integration with the Node.js/Express backend API
- **Responsive Design**: Mobile-first design that works on all devices

## Authentication Routes

- `/auth/signup` - User registration page
- `/auth/signin` - User login page  
- `/auth/forgot-password` - Password reset page
- `/dashboard` - Protected dashboard (requires authentication)

## Backend API Integration

The frontend integrates with the following backend endpoints:

- `POST /api/v1/auth/login` - User authentication
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/profile` - Get user profile
- `POST /api/v1/auth/change-password` - Change user password
- `POST /api/v1/auth/refresh` - Refresh access token

## Components

### Form Components (`/components/auth/FormComponents.tsx`)

- `InputField` - Styled input field with proper accessibility
- `PasswordField` - Password input with show/hide toggle
- `Button` - Versatile button component with multiple variants
- `SocialButton` - Social login buttons (Google, Microsoft)
- `Separator` - Visual separator between form sections
- `ComplianceInfo` - GDPR and ISO compliance information

### Authentication Layout (`/components/auth/AuthLayout.tsx`)

Reusable layout component for all authentication pages with:
- Left panel for forms
- Right panel for marketing content
- Consistent branding and navigation

## Hooks

### `useAuth()` Hook

Manages authentication state throughout the application:

```typescript
const { user, isAuthenticated, isLoading, error, login, logout } = useAuth();
```

### `useRequireAuth()` Hook

Protects routes by requiring authentication:

```typescript
const { isAuthenticated, isLoading } = useRequireAuth('/auth/signin');
```

### `useRedirectIfAuthenticated()` Hook

Redirects authenticated users away from auth pages:

```typescript
const { isAuthenticated, isLoading } = useRedirectIfAuthenticated('/dashboard');
```

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Backend Requirements**
   Ensure the backend server is running on port 5000 with the authentication routes configured.

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── auth/
│   │   │   ├── signup/page.tsx
│   │   │   ├── signin/page.tsx
│   │   │   └── forgot-password/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── page.tsx
│   │   └── layout.tsx
│   ├── components/
│   │   └── auth/
│   │       ├── AuthLayout.tsx
│   │       └── FormComponents.tsx
│   ├── hooks/
│   │   └── useAuth.ts
│   └── lib/
│       └── auth.ts
├── package.json
└── README.md
```

## Styling

The application uses Tailwind CSS v4 with a custom color scheme:
- Primary: Teal (`teal-600`, `teal-700`, `teal-800`)
- Background: Gray scale (`gray-50`, `gray-100`, `gray-200`)
- Text: Various gray shades for hierarchy

## Authentication Flow

1. **Sign Up**: Users can create accounts with email/password or social login
2. **Sign In**: Existing users authenticate with credentials
3. **Token Management**: JWT tokens are stored in localStorage and automatically refreshed
4. **Protected Routes**: Dashboard and other private pages require valid authentication
5. **Logout**: Clears tokens and redirects to sign-in page

## Security Features

- JWT token-based authentication
- Automatic token refresh
- Protected route middleware
- Secure password handling
- GDPR compliance information
- ISO-27001 certification display

## Future Enhancements

- [ ] Google OAuth integration
- [ ] Microsoft OAuth integration
- [ ] Two-factor authentication
- [ ] Email verification
- [ ] Password strength indicators
- [ ] Session management
- [ ] Role-based access control

## Contributing

1. Follow the existing code style and patterns
2. Use TypeScript for all new code
3. Ensure components are accessible
4. Test on multiple screen sizes
5. Update documentation for new features

## License

This project is part of the OpenLog application suite.
