# Quatréa — A year you can wear

A scrollytelling website for Quatréa, a perfume house with four seasonal fragrances: **Aubade** (spring), **Azur** (summer), **Velours** (autumn) and **Givre** (winter). The homepage is one continuous camera journey through a WebGL world. Around it sit a collection page, product pages, the Maison story, a fragrance-finder quiz, and a bag and checkout flow.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack), React 19, TypeScript
- [Three.js](https://threejs.org) through React Three Fiber and drei, for the persistent 3D world
- GSAP and ScrollTrigger for scroll timelines, and Lenis for smooth scrolling
- Tailwind CSS 4, plus hand-written CSS in `app/*.css`

## Getting started

Requires Node.js 20.9 or newer.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm start          # serve the production build
npm run lint
```

## Project structure

```
app/                 routes: /, /collection, /fragrance/[slug], /maison, /discover,
                     /care, /checkout, /checkout/confirmation, plus the internal /studio
components/
  world/             WebGL world: canvas, camera rig, stations, landscape, shaders
  home/              homepage scroll journey and epilogue
  shell/             nav, footer, bag, loader, page transitions, providers
  collection/ fragrance/ maison/ discover/ care/ checkout/
lib/
  fragrances.ts      product data (names, notes, prices, palettes)
  journey.ts         camera and environment keyframes along the scroll path
  world-store.ts     shared state between the DOM and the 3D scene
public/
  models/            photoscanned rocks and props (.glb)
  img/               bottle renders, note photography, effects textures
```

## Deploying to Vercel

1. Push this repository to GitHub.
2. In Vercel, choose **Add New → Project** and import the repository. It detects Next.js automatically, so leave the build settings at their defaults.
3. Optional: set `NEXT_PUBLIC_SITE_URL` (for example `https://quatrea.com`) once you have a custom domain. It's used for canonical URLs, Open Graph and the sitemap. Without it, the site uses Vercel's production domain.
4. Deploy.

### Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | No | Public origin for metadata, robots.txt and sitemap.xml |
| `ENABLE_STUDIO` | No | Set to `1` to serve the internal `/studio` product-photography route in production |

## Notes

- Checkout is a front-end flow only. No payment is taken, and card details never leave the browser.
- Note photography is CC-licensed via Openverse. Attributions are in `lib/credits.json` and shown on `/care`. The 3D models come from Poly Haven (CC0).
- The scroll journey respects `prefers-reduced-motion`.
