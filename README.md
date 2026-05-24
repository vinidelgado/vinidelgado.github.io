# Prompt Gallery & AI Image Hub

An elegant, minimal, and fully-featured gallery for sharing AI-generated images and their corresponding text prompts, built using modern vanilla HTML, CSS, and JavaScript. 

This project requires **no Node.js, no build steps, and no installations**. It is ready to run out of the box!

## Features

- 📸 **Unsplash-style Layout**: A clean, fully responsive column-based masonry grid layout.
- 🎨 **Design System**: A dark-mode-first aesthetic with a smooth light-mode toggle using CSS custom variables.
- 📂 **Dual Data Feeding**: Load prompts dynamically from `prompts.json` (on servers) or load them safely via `prompts.js` (when opening files locally).
- 🔍 **Interactive Search**: Dynamic search bar to filter prompts in real time by title, description, categories, or tags.
- 🏷️ **Category & Tag Filters**: Quick-filter by tags or category pills with reactive badge counters.
- 💬 **Details Modal**: Multi-column responsive overlay details view displaying high-res images, full prompt, negative prompt, settings metadata (steps, sampler, seed, model, etc.), and related tags.
- 📋 **One-Click Actions**: One-click copying of prompts and direct links (`?prompt=id`) with copy validation toasts.
- 🔗 **Deep Linking**: Direct url linking opens a specific prompt modal immediately.

## Getting Started

### How to Run

1. **Local Double-Click**: Simply double-click on `index.html` to open the gallery directly in your web browser. 
   *(Note: This uses the `file://` protocol. Browser security blocks dynamic fetching of local JSON files, so the page will automatically fall back to loading data from `prompts.js` without any issues).*

2. **Web Server Hosting**: Upload the files to any web hosting provider (e.g. Vercel, Netlify, GitHub Pages, Hostinger, or Apache). The browser will fetch data dynamically from `prompts.json`.

---

## Modifying/Supplying Prompts

To add new images and prompts, you should update the database files:
1. **For Servers**: Edit [prompts.json](file:///e:/projetos%20antigravity/pessoal/prompt-images/prompts.json)
2. **For Local Double-Click**: Edit [prompts.js](file:///e:/projetos%20antigravity/pessoal/prompt-images/prompts.js) (Make sure to keep the `window.promptsData = ` prefix in the JS file).

### Database Entry Schema

```json
{
  "id": "neon-cyberpunk-cat",
  "title": "Neon Cyberpunk Cat",
  "prompt": "A majestic cat sitting on a neon-lit ledge overlooking a futuristic cyberpunk city, rain pouring, highly detailed, octane render, 8k resolution, vaporwave aesthetic",
  "negative_prompt": "blurry, low quality, distorted, extra limbs, human",
  "image": "images/cyberpunk-cat.png",
  "category": "Cyberpunk",
  "tags": ["cat", "cyberpunk", "neon", "futuristic"],
  "settings": {
    "model": "Gemini 3.5 Flash",
    "cfg_scale": "3.5",
    "steps": "20",
    "seed": "4289104712",
    "aspect_ratio": "16:9"
  }
}
```

*Place your image files in the `images/` directory, or use external HTTP/HTTPS image URLs.*

