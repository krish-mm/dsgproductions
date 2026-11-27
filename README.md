# DSG Productions

The website for DSG Productions, an event production company based in Birmingham, AL, serving events across the United States. Live at [dsgproductions.com](https://dsgproductions.com).

The site covers LED dance floors, LED video walls, sound systems, moving-head lights and uplighting, effects, and related production for weddings, corporate events, parties, galas, and concerts.

## Stack

Static HTML, CSS, and JavaScript. No build step or framework.

- Type: [Cormorant Garamond](https://fonts.google.com/specimen/Cormorant+Garamond) and [Montserrat](https://fonts.google.com/specimen/Montserrat) from Google Fonts
- Black and gold palette, defined as CSS custom properties in `css/style.css`. The near-black background tokens still use `--navy-*` names from an earlier palette.
- Quote form on the contact page posts to [FormSubmit](https://formsubmit.co) at `info@dsgproductions.com`
- Photos, posters, and MP4 clips live in `media/`

## Structure

```
.
├── CNAME
├── index.html          # Home
├── production.html     # Production and equipment
├── gallery.html        # Work: gallery, lightbox, and Films
├── contact.html        # Request a quote
├── privacy.html        # Privacy policy for the quote form
├── robots.txt
├── sitemap.xml
├── favicon.svg
├── apple-touch-icon.png
├── css/
│   └── style.css
├── js/
│   └── script.js
└── media/              # Images, posters, and videos
```

## Run locally

Serve the repository root:

```bash
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

## Deploy

GitHub Pages serves the site from the `main` branch at the repository root. The custom domain is `dsgproductions.com` (see `CNAME`). HTTPS is enforced.

A push to `main` publishes the site. `robots.txt` and `sitemap.xml` point at the live domain.

## Where to edit

- Page copy and layout: the HTML file for that page
- Colors, typography, and spacing: `css/style.css` (the `:root` block at the top)
- Navigation, footer year, scroll reveals, muted looping videos (paused when `prefers-reduced-motion` is set), the gallery lightbox, and the quote form: `js/script.js`
- Home hero video and poster: the `<video>` in `index.html`. An HTML comment in that file has swap instructions. Place new files in `media/`.
- Work gallery and Films: `gallery.html` and `media/`
- Contact details, quote form fields, and the FormSubmit endpoint: `contact.html`. If the email or phone changes, also update the JSON-LD block in `index.html`, the footer on every page, and `privacy.html`.
- Domain: `CNAME`
- Search-engine URLs: `sitemap.xml` and `robots.txt`
