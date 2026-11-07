# Geographies of Textiles & Natural Dyes

A blog for natural dyes and textiles, combining scientific essays and aesthetics with beautiful images from natural dyeing processes, plants, and geographies.

**Writer:** A PhD scientific researcher and creative artist who makes complex dye chemistry accessible and elegant.

**Vibe:** Inspired, poetic, visually mesmerized.

**Visual home:** Field notebooks, natural maps, dried plants, earth swatches.

## Tech Stack

- **Framework:** [Astro](https://astro.build) (v7) — static site generator with content collections
- **Styling:** [Tailwind CSS](https://tailwindcss.com) — responsive, light/dark mode
- **Fonts:** Cormorant Garamond (headings), Lora (body), Courier Prime (technical accents)
- **Auth:** [Clerk](https://clerk.com) — Email + Google OAuth for /admin
- **Editor:** [Tiptap](https://tiptap.dev) — rich text editor for blog posts
- **Page Builder:** [easyblocks.io](https://app.easyblocks.io) — drag-drop visual editing
- **Storage:** GitHub repository (Markdown posts + images in Git)
- **Hosting:** [Vercel](https://vercel.com) (free tier)

## Project Structure

```
src/
├── content/
│   ├── posts/              # Markdown blog posts (draft: true = hidden from production)
│   └── assets/             # Uploaded images
├── content.config.ts       # Astro content collection config
├── components/
│   ├── Navbar.tsx          # Site navigation with theme toggle
│   ├── ThemeToggle.tsx     # Light/dark mode switch
│   └── admin/
│       ├── ClerkProvider.tsx       # Clerk auth wrapper
│       ├── NewPostClient.tsx       # Create/publish posts with Tiptap
│       ├── TiptapEditor.tsx        # Tiptap rich text editor
│       ├── SettingsClient.tsx      # GitHub config (token, owner, repo, paths)
│       ├── AdminGalleryClient.tsx  # Image gallery (upload/view/delete)
│       ├── EasyblocksEditor.tsx    # Drag-drop page builder
│       └── EasyblocksClient.tsx    # Easyblocks config wrapper
├── layouts/
│   ├── BaseLayout.astro    # Public site layout
│   ├── BlogPostLayout.astro # Individual post layout
│   └── AdminLayout.astro   # Admin dashboard layout
├── lib/
│   └── github.ts           # GitHub API client (browser-based)
└── pages/
    ├── index.astro         # Home page
    ├── gallery.astro       # Public image gallery
    ├── posts/[slug].astro  # Blog post detail
    └── admin/
        ├── index.astro     # Dashboard (list all posts)
        ├── new.astro       # New post editor
        ├── gallery.astro   # Admin image gallery
        ├── settings.astro  # GitHub configuration
        ├── easyblocks.astro # Page builder
        └── preview/[slug].astro # Draft preview
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env` and fill in your Clerk keys:

```bash
cp .env.example .env
```

Get your Clerk keys from [dashboard.clerk.com](https://dashboard.clerk.com).

### 3. Run the dev server

```bash
npm run dev
```

Visit `http://localhost:4323` for the public site and `http://localhost:4323/admin` for the admin area.

### 4. Configure GitHub

In the admin area, go to **Settings** and enter:
- **Personal Access Token** — from GitHub Settings → Developer settings → Personal access tokens (needs `repo` scope)
- **Repository Owner** — your GitHub username
- **Repository Name** — e.g. `madlens-blog`
- **Branch** — `main`
- **Posts Path** — `src/content/posts`
- **Images Path** — `src/content/assets`

### 5. Configure Clerk Auth

In your Clerk dashboard:
1. Enable **Email** and **Google** authentication
2. Add your domain to the allowed origins
3. Copy the publishable key and secret key to `.env`

## How It Works

### Authentication
The writer navigates to `/admin`. If not logged in, they see "Sign in with Email/Google" via Clerk. The entire admin app runs in the browser — no server needed.

### Creating & Saving a Draft
1. Go to `/admin/new`
2. Enter title, description, tags, and write the body in the Tiptap editor
3. Select a cover image from the gallery or upload a new one
4. Click **Save Draft** — creates/updates `src/content/posts/my-post.md` with `draft: true` in GitHub

### Publishing
1. Open the post from the dashboard
2. Click **Publish** — updates frontmatter to `draft: false` and adds `publishedAt`
3. Vercel detects the Git commit and rebuilds the site in 30–60 seconds

### Image Gallery
- Public gallery at `/gallery` shows all saved images
- Admin gallery at `/admin/gallery` for upload/delete
- Both Tiptap editor and easyblocks link to the gallery for image selection

### Draft Previews
Drafts (`draft: true`) are hidden from production but can be previewed at `/admin/preview/[slug]`.

### Styling Editor
The admin **Settings** page lets you edit typography (body, headings), font sizes, and background colors. These map to CSS custom properties used throughout the site.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repo to [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings:
   - `PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
4. Deploy — Vercel auto-detects Astro and builds on every push

### Build Commands

```bash
npm run build    # Production build
npm run dev      # Dev server
npm run preview  # Preview production build locally
```

## Brand Style

- **Headings:** Cormorant Garamond (serif, elegant)
- **Body:** Lora (serif, readable)
- **Technical:** Courier Prime (monospace, data/accents)
- **Colors:** Natural earth tones — light mode (#faf7f2 background, #2d241e text) and dark mode (#1a1612 background, #f5efe6 text)
- **Accent:** Warm brown (#8b6b4f)

## License

MIT
