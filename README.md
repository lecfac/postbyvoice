# PostByVoice

AI-powered content repurposing platform for creating platform-specific content variants (LinkedIn, Twitter/X, Substack) and daily AI briefing with content suggestions.

## Features

- **Content Repurposing**: Input ideas or upload files, get platform-specific content variants
- **Platform Optimization**: Generates LinkedIn (professional), Twitter/X (snappy), and Substack (detailed) versions
- **Daily Briefing**: Add news items and get AI-powered content suggestions
- **Draft Management**: Create, edit, and organize content drafts
- **Minimalist UI**: Clean, Notion-inspired interface

## Tech Stack

- **Frontend**: React + Tailwind CSS + Vite
- **Backend**: Node.js + Express
- **Database**: SQLite
- **AI**: Claude Haiku (Anthropic API)

## Setup

### Prerequisites

- Node.js 16+ 
- Anthropic API key (get one at https://console.anthropic.com)

### Installation

1. **Clone and enter the directory**
   ```bash
   cd postbyvoice
   ```

2. **Set up environment variables**
   ```bash
   cp server/.env.example server/.env
   ```
   Then edit `server/.env` and add your API key:
   ```
   ANTHROPIC_API_KEY=your_key_here
   PORT=5000
   ```

3. **Install dependencies**
   ```bash
   npm install
   cd server && npm install && cd ..
   cd client && npm install && cd ..
   ```

4. **Start the app**
   ```bash
   npm run dev
   ```

   This starts:
   - Backend on `http://localhost:5000`
   - Frontend on `http://localhost:3000`

## Usage

### Create Content
1. Go to **Create** tab
2. Paste your idea or upload a file (txt, pdf, doc)
3. Optionally link to a news item
4. Click "Generate Content"
5. View platform-specific variants and copy as needed

### Manage Briefing
1. Go to **Briefing** tab
2. Click "+ Add News" 
3. Paste article title and content
4. AI generates 3 content angle suggestions
5. Use suggestions as inspiration for new posts

### View Drafts
- **Dashboard**: See recent drafts and news items
- **Draft Viewer**: Edit or delete individual drafts

## Project Structure

```
postbyvoice/
├── client/               # React frontend
│   ├── src/
│   │   ├── pages/       # Dashboard, ContentCreator, etc.
│   │   ├── components/  # Reusable UI components
│   │   └── api.js       # API client
│   └── tailwind.config.js
├── server/              # Node.js backend
│   ├── db.js           # SQLite initialization
│   └── server.js       # Express app & endpoints
└── package.json        # Root config
```

## API Endpoints

### Content
- `POST /api/generate` - Generate platform-specific drafts
- `GET /api/drafts` - List all drafts
- `GET /api/drafts/:id` - Get single draft
- `PATCH /api/drafts/:id` - Update draft
- `DELETE /api/drafts/:id` - Delete draft

### Files
- `POST /api/upload` - Upload and process file

### News
- `GET /api/news` - List news items
- `POST /api/news` - Add news item with suggestions
- `GET /api/news/:id` - Get news with suggestions
- `DELETE /api/news/:id` - Delete news item

## Future Enhancements

- Social media account integration for direct posting
- Email newsletter digest generation
- Scheduling capability
- Analytics on content performance
- Multi-user support with authentication
