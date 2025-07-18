# Personal Life Management Platform

A complete AI-powered life management platform with 6 core segments: Physical, Mental, Health, Routine, Work, and Analytics. Built as a Progressive Web App (PWA) for mobile installation.

## Features

### 🏃 Physical Activity
- Workout tracking with duration and calories
- Movement logging
- Body measurements
- Exercise history and analytics

### 🧠 Mental Activity
- Reading progress tracking
- Learning sessions
- Creative projects
- Meditation and mindfulness

### 🩺 Health Management
- Vital signs monitoring
- Symptom tracking with severity levels
- Medication logging
- Health appointments

### 📋 Daily Routine
- Morning and evening checklists
- Habit tracking with streaks
- Task management
- Routine optimization

### 💼 Work & Productivity
- Task management with priorities
- Project tracking
- Meeting logs
- Focus sessions
- Goal setting

### 📊 Life Analytics
- Cross-segment insights
- Activity trends
- Personal analytics
- Progress visualization

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **PWA**: Service Worker, Manifest, Offline capabilities
- **UI Components**: Custom components with Radix UI primitives
- **Icons**: Lucide React

## Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd personal-life-platform
npm install
```

### 2. Set up Supabase

1. Go to [Supabase](https://supabase.com) and create a new project
2. Copy your project URL and anon key
3. Update `.env.local` with your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Database Setup

1. In your Supabase dashboard, go to the SQL Editor
2. Run the SQL from `supabase-setup.sql` to create tables and policies

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### 5. PWA Installation

The app is configured as a PWA. When accessed on mobile:
1. Open the app in your browser
2. Look for "Add to Home Screen" prompt
3. Install the app for offline access

## Mobile Installation

### iOS (Safari)
1. Open the app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"
4. Tap "Add"

### Android (Chrome)
1. Open the app in Chrome
2. Tap the menu (three dots)
3. Select "Add to Home Screen"
4. Tap "Add"

## Usage

1. **Sign Up**: Create an account or sign in
2. **Add Data**: Start logging activities in any segment
3. **View Analytics**: Check your progress in the Analytics tab
4. **Build Habits**: Use the Routine section for daily habits
5. **Track Health**: Monitor vitals and symptoms in Health
6. **Analyze Patterns**: Review insights and trends

## Development

### Project Structure

```
src/
├── app/                 # Next.js app router
├── components/         # React components
│   ├── ui/            # Reusable UI components
│   └── segments/      # Life segment components
├── lib/               # Utilities and configurations
└── types/             # TypeScript type definitions
```

### Key Components

- **Dashboard**: Main navigation and layout
- **Segments**: Individual life management modules
- **Auth**: Authentication components
- **Analytics**: Data visualization and insights

### Database Schema

- **activities**: All user activities across segments
- **user_profiles**: User preferences and settings
- **Row Level Security**: Ensures data privacy

## Features Roadmap

### Phase 1 (Current)
- [x] All 6 core segments
- [x] PWA capabilities
- [x] Basic analytics
- [x] Offline functionality

### Phase 2 (Future)
- [ ] AI-powered insights
- [ ] Custom tool builder
- [ ] Advanced analytics
- [ ] Social features
- [ ] Data export/import

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues or questions, please open an issue in the GitHub repository.