# Prompt Gallery & AI Image Hub

An elegant, minimal, and fully-featured gallery for sharing AI-generated images and their corresponding text prompts, built using modern vanilla HTML, CSS, and JavaScript. 

This project requires **no Node.js, no build steps, and no installations**. It is ready to run out of the box!

## Features

- 📸 **Unsplash-style Layout**: A clean, fully responsive column-based masonry grid layout.
- 🎨 **Design System**: A dark-mode-first aesthetic with a smooth light-mode toggle using CSS custom variables.
- 📂 **Dynamic Data**: Loads prompts dynamically from `prompts.json`.
- 🔍 **Interactive Search**: Dynamic search bar to filter prompts in real time by title, description, categories, or tags.
- 🏷️ **Category & Tag Filters**: Quick-filter by tags or category pills with reactive badge counters.
- 💬 **Details Modal**: Multi-column responsive overlay details view displaying high-res images, full prompt, negative prompt, settings metadata (steps, sampler, seed, model, etc.), and related tags.
- 📋 **One-Click Actions**: One-click copying of prompts and direct links (`?prompt=id`) with copy validation toasts.
- 🔗 **Deep Linking**: Direct url linking opens a specific prompt modal immediately.

## Getting Started

### How to Run

Run a local web server (e.g., using `npx serve` or Live Server in VS Code) or host the files on any static web hosting provider (e.g., GitHub Pages, Vercel, Netlify). The browser will dynamically load the database from `prompts.json`.

---

## Modifying/Supplying Prompts

To add new images and prompts, update the database file [prompts.json](file:///e:/projetos%20antigravity/github/vinidelgado.github.io/prompts.json).

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

