# NextMind AI - Complete AI Content Platform

A comprehensive AI-powered content generation platform with secure admin panel for managing AI chatbots, content, and analytics.

## Features

### Public Platform
- AI content generation (blogs, product descriptions, ad copy, social media)
- Email verification system
- User authentication and management
- Responsive design with Tailwind CSS

### Admin Panel
- **Secure Authentication**: JWT-based auth with 2FA support
- **AI Bot Management**: CRUD operations for chatbot configuration
- **Content Management**: WYSIWYG editor for landing page content
- **Media Library**: File upload and management system
- **Analytics Dashboard**: Real-time metrics and reporting
- **User Management**: Admin access control and permissions
- **Audit Logs**: Complete activity tracking
- **System Settings**: Global configuration management

## Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- React Router for navigation
- Lucide React for icons

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT authentication
- Multer for file uploads
- Sharp for image processing
- Speakeasy for 2FA

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see .env.example)
4. Start the development server: `npm run dev`
5. Start the backend server: `npm run server:dev`

## Admin Panel Access

Access the admin panel at `/admin/login` with proper credentials.

### Default Admin Setup
Create your first admin user through the database or use the setup script.

## Security Features

- Role-based access control
- Two-factor authentication
- Rate limiting
- Input validation and sanitization
- Audit logging
- Session management
- CORS protection

## API Endpoints

### Public API
- `/api/auth/*` - User authentication
- `/api/content/*` - Content generation
- `/api/email-verification/*` - Email verification

### Admin API
- `/api/admin/auth/*` - Admin authentication
- `/api/admin/bots/*` - AI bot management
- `/api/admin/content/*` - Content management
- `/api/admin/media/*` - Media management
- `/api/admin/analytics/*` - Analytics and reporting
- `/api/admin/users/*` - User management
- `/api/admin/settings/*` - System settings
- `/api/admin/audit/*` - Audit logs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
