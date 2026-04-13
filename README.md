# PropSarathi - Real Estate Investment Platform

A comprehensive real estate investment platform connecting investors with properties in Dubai and Bangalore.

## Features

- **Website Forms** - Lead capture with validation and auto-capitalization
- **Partner Portal** - Partner registration, lead management, and analytics
- **Admin Portal** - Manage partners, RMs, leads, and platform settings
- **Direct Google Sheets Integration** - Simple webhook-based data sync to 3 separate sheets
- **Activity Logging** - Complete audit trail of all platform activities
- **Mock Data Mode** - Works without Google Sheets for development

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Data Storage**: Google Sheets (via Apps Script webhooks)
- **Authentication**: JWT (ready for implementation)
- **Validation**: Zod
- **Charts**: Recharts

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Google account (optional, for Google Sheets integration)

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd propsarathi
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000)

## Direct Google Sheets Integration

The platform uses a **simple webhook-based approach** - no API keys or complex setup required!

### Quick Setup (5 minutes)

1. Create 3 Google Sheets:
   - PropSarathi - Partners
   - PropSarathi - RMs  
   - PropSarathi - Website Forms

2. Add Apps Script to each sheet (copy/paste provided code)

3. Deploy each script as a Web App

4. Copy the webhook URLs

5. Paste URLs in Admin Portal → Settings tab

**That's it!** Forms will now submit directly to your Google Sheets.

📖 **Detailed Instructions**: See [GOOGLE_SHEETS_DIRECT_SETUP.md](./GOOGLE_SHEETS_DIRECT_SETUP.md)

**Note**: The platform works perfectly without Google Sheets using mock data mode for development and testing.

## Project Structure

\`\`\`
propsarathi/
├── app/
│   ├── page.tsx                 # Homepage
│   ├── about/                   # About page
│   ├── contact/                 # Contact page
│   ├── admin-portal/            # Admin dashboard
│   ├── partner-portal/          # Partner dashboard
│   └── api/                     # API routes
│       ├── forms/               # Form submission endpoints
│       ├── partner/             # Partner APIs
│       ├── admin/               # Admin APIs
│       └── leads/               # Lead management APIs
├── components/
│   ├── ui/                      # shadcn/ui components
│   ├── Header.tsx               # Site header
│   ├── Footer.tsx               # Site footer
│   ├── Hero.tsx                 # Hero section with form
│   ├── EnquiryForm.tsx          # Enquiry form component
│   └── FloatingActions.tsx      # Floating WhatsApp & forms
├── lib/
│   ├── directGoogleSheets.ts    # Direct Google Sheets webhook integration
│   ├── mockDataStore.ts         # Mock data for development
│   ├── activityLogger.ts        # Activity logging
│   ├── validation.ts            # Zod schemas
│   └── api.ts                   # API client helpers
└── types/
    └── index.ts                 # TypeScript type definitions
\`\`\`

## Key Features

### Auto-Capitalization
All forms automatically capitalize:
- First letter of First Name
- First letter of Last Name
- First letter of each sentence in messages

### Form Validation
- Email format validation
- Phone number validation with country codes
- Re-enter email/phone confirmation
- Budget range validation
- Required field enforcement

### WhatsApp Integration
- Pre-filled messages with user details (name, city, property type, budget)
- Direct link to property expert
- Floating WhatsApp button with official icon

### Admin Dashboard
- Partner management (approve/deactivate/delete)
- RM management
- Lead overview across all partners
- Performance analytics with charts
- Google Sheets webhook configuration

### Partner Portal
- Lead creation and management
- Analytics dashboard with charts
- CSV export functionality
- Team member management

## Brand Colors

- **Primary (Purple)**: #4A2B7C
- **Secondary (Orange)**: #FF6B1A

## Google Sheets Data Structure

### Website Forms Sheet
- formType, firstName, lastName, email, phone
- city, propertyType, budget, message, timestamp

### Partner Sheet
- partnerId, name, email, phone, status, registeredAt

### RM Sheet
- rmId, name, email, phone, status, registeredAt

### Admin Sheet (Activity Logs)
- action, userId, userType, details, timestamp

## Development

### Running Locally
\`\`\`bash
npm run dev
\`\`\`

### Building for Production
\`\`\`bash
npm run build
npm start
\`\`\`

### Type Checking
\`\`\`bash
npm run type-check
\`\`\`

## Deployment

Deploy to Vercel:

\`\`\`bash
vercel
\`\`\`

Or use the Vercel GitHub integration for automatic deployments.

### Post-Deployment Setup

1. Go to your deployed site's `/admin-portal`
2. Navigate to Settings tab
3. Configure Google Sheets webhook URLs
4. Test form submissions

## Architecture Highlights

### Website & Portals Separation
- Website (public pages) works independently
- Partner Portal is completely separate
- Admin Portal is completely separate
- No dependencies between them
- Each can be deployed separately if needed

### Data Flow
\`\`\`
Form Submission → API Route → Google Sheets Webhook → Google Sheet
                            ↓
                      Mock Data Store (fallback)
\`\`\`

### Security Features
- Form validation on client and server
- Phone number masking during input
- Email confirmation fields
- CSRF protection ready
- JWT authentication ready

## Future Enhancements

- [ ] Complete authentication system with JWT
- [ ] Two-factor authentication (2FA)
- [ ] Email notifications via Resend
- [ ] SMS notifications
- [ ] Advanced analytics with AI predictions
- [ ] Mobile app (React Native)
- [ ] CRM integrations (Salesforce, HubSpot)
- [ ] Payment gateway integration (Stripe)
- [ ] Real-time notifications with Pusher
- [ ] Advanced lead scoring algorithm

## Troubleshooting

### Forms not submitting?
- Check browser console for errors
- Verify Google Sheets webhook URLs in Admin Settings
- Test webhook URLs directly in browser

### Google Sheets not receiving data?
- Ensure Apps Script is deployed with "Anyone" access
- Check Apps Script execution logs
- Verify webhook URL includes `/exec` at the end

### Website not loading?
- Clear browser cache
- Check for console errors
- Verify all dependencies are installed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

Proprietary - All rights reserved

## Support

For support, email support@propsarathi.com or contact the development team.

---

Built with ❤️ by the PropSarathi Team
