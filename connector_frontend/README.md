# Ocean Professional - JIRA/Confluence Connector Frontend

A modern, professional frontend application for connecting to JIRA and Confluence instances with secure OAuth 2.0 and API token authentication.

## 🚀 Features

### Authentication Methods
- **OAuth 2.0** - Secure authentication without password sharing (Recommended)
- **API Token** - Email + API token authentication
- **Basic Auth** - Username + password authentication

### Core Functionality
- ✅ Multi-service support (JIRA & Confluence)
- ✅ Dynamic authentication method switching
- ✅ Real-time connection status monitoring
- ✅ Project/Space browsing with search and filtering
- ✅ Responsive design with mobile support
- ✅ Professional Ocean Professional theme
- ✅ Enhanced loading states and error handling
- ✅ Accessibility-compliant interface

### UI/UX Features
- 🎨 Ocean Professional design theme
- 📱 Responsive mobile-first design
- 🔍 Advanced search and filtering
- 📊 Connection status dashboard
- 💫 Smooth animations and transitions
- 🌙 Professional corporate styling
- ♿ WCAG accessibility compliance

## 🛠 Tech Stack

- **Framework**: Next.js 15.2.3
- **UI**: React 19 with TypeScript
- **Styling**: Tailwind CSS 4
- **Authentication**: OAuth 2.0 & API Token
- **State Management**: React Hooks
- **HTTP Client**: Fetch API
- **Build Tool**: Next.js built-in

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=https://your-backend-url:3001

# Frontend URL for OAuth redirects
NEXT_PUBLIC_SITE_URL=https://your-frontend-url:3000
```

### OAuth Configuration

The application automatically handles OAuth flows:

1. **OAuth Initialization**: Generates secure state parameters
2. **Popup Window**: Opens OAuth provider in popup
3. **Callback Handling**: Processes OAuth responses
4. **Token Management**: Securely stores OAuth tokens via backend

## 🎯 Usage

### Getting Started

1. **Launch Application**
   - Navigate to the application URL
   - You'll see the Ocean Professional dashboard

2. **Select Connector**
   - Choose JIRA or Confluence from the sidebar
   - Each shows current connection status

3. **Authenticate**
   - **OAuth 2.0** (Recommended): Click "Connect with OAuth"
   - **API Token**: Enter email and API token
   - **Basic Auth**: Enter username and password

4. **Browse Projects/Spaces**
   - Once connected, view your projects/spaces
   - Use search and filters to find specific items
   - Click items to open in new tab

### Authentication Methods

#### OAuth 2.0 (Recommended)
- Most secure method
- No password sharing required
- Tokens managed by Atlassian
- Easy revocation from Atlassian account

#### API Token
- Secure programmatic access
- Requires Atlassian API token
- Get token from: [Atlassian Account Settings](https://id.atlassian.com/manage-profile/security/api-tokens)

#### Basic Authentication
- Username and password
- Less secure than other methods
- May not work with some Atlassian Cloud instances

### Connection Management

- **Test Connection**: Verify connectivity anytime
- **Switch Authentication**: Change between OAuth/API token
- **Disconnect**: Remove stored credentials
- **Status Monitoring**: Real-time connection status

## 🎨 Theme: Ocean Professional

The application uses the Ocean Professional theme with:

- **Primary Color**: Deep Blue (#1E3A8A)
- **Secondary Color**: Amber (#F59E0B)
- **Success Color**: Green (#059669)
- **Error Color**: Red (#DC2626)
- **Background**: Light Gray (#F3F4F6)
- **Surface**: White (#FFFFFF)
- **Text**: Dark Gray (#111827)

### Design Principles
- Clean, professional corporate aesthetic
- Structured layouts with subtle shadows
- Minimalist business-oriented styling
- Consistent spacing and typography
- Accessible color contrasts

## 🔒 Security Features

- **OAuth 2.0 Support**: Industry-standard secure authentication
- **State Parameter Validation**: CSRF protection for OAuth flows
- **Secure Token Storage**: Backend-managed token storage
- **HTTPS Enforcement**: All communications encrypted
- **Input Validation**: Client and server-side validation
- **Error Handling**: Secure error messages

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Tablet Support**: Adapted layouts for tablets
- **Desktop Enhanced**: Full features on desktop
- **Touch Friendly**: Large touch targets
- **Flexible Layouts**: Adapts to any screen size

## ♿ Accessibility

- **WCAG 2.1 Compliant**: Meets accessibility standards
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: Semantic HTML and ARIA labels
- **High Contrast**: Support for high contrast mode
- **Reduced Motion**: Respects motion preferences
- **Focus Management**: Clear focus indicators

## 🧪 API Integration

The frontend integrates with the backend API:

### Authentication Endpoints
- `POST /auth/credentials` - Store credentials
- `POST /auth/oauth/init` - Initialize OAuth flow
- `POST /auth/oauth/callback` - Handle OAuth callback
- `GET /auth/oauth/status` - Get OAuth status
- `DELETE /auth/credentials/{service}` - Delete credentials
- `DELETE /auth/oauth/{service}` - Revoke OAuth tokens

### Connection Endpoints
- `POST /connections/test` - Test connection
- `GET /connections/status` - Get all connection statuses

### Data Endpoints
- `GET /projects/jira` - Get JIRA projects
- `GET /projects/confluence` - Get Confluence spaces

## 🔄 State Management

The application uses React hooks for state management:

- **Connection State**: Multi-auth connection tracking
- **OAuth State**: OAuth flow management
- **Project State**: Project/space data caching
- **Loading State**: Fine-grained loading indicators
- **Error State**: Comprehensive error handling

## 🎯 Performance

- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Next.js Image component
- **Caching**: Intelligent API response caching
- **Lazy Loading**: Components loaded on demand
- **Bundle Analysis**: Optimized bundle size

## 🐛 Error Handling

- **Connection Errors**: Clear connection error messages
- **OAuth Errors**: Detailed OAuth error handling
- **Network Errors**: Retry mechanisms for network failures
- **Validation Errors**: Real-time form validation
- **Fallback UI**: Graceful degradation on errors

## 📊 Monitoring

- **Connection Status**: Real-time status monitoring
- **Health Checks**: Backend health monitoring
- **Error Tracking**: Comprehensive error logging
- **Performance Metrics**: Load time tracking

## 🔧 Development

### Project Structure
```
src/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx          # Home page
│   └── oauth/
│       └── callback/      # OAuth callback handling
├── components/            # React components
│   ├── ConnectionForm.tsx # Authentication form
│   ├── ConnectionStatus.tsx # Status display
│   ├── ProjectsList.tsx   # Projects/spaces list
│   └── Sidebar.tsx       # Navigation sidebar
├── services/             # API services
│   └── api.ts           # API client
└── types/               # TypeScript types
    └── api.ts          # API type definitions
```

### Component Architecture
- **Modular Design**: Reusable components
- **Type Safety**: Full TypeScript coverage
- **Props Interface**: Well-defined component APIs
- **Error Boundaries**: Component-level error handling

## 🚀 Deployment

The application is configured for:

- **Vercel**: Optimized for Vercel deployment
- **Docker**: Containerized deployment ready
- **Static Export**: Can be exported as static site
- **CDN Ready**: Optimized for CDN distribution

## 🤝 Contributing

1. Follow the existing code style
2. Add TypeScript types for new features
3. Include error handling for new functionality
4. Test OAuth flows thoroughly
5. Update documentation for changes

## 📝 License

MIT License - see LICENSE file for details.

## 🆘 Support

For support or questions:
- Check the API documentation
- Review connection troubleshooting guide
- Verify Atlassian instance accessibility
- Ensure firewall/network configuration

---

**Ocean Professional** - Professional JIRA & Confluence Integration
