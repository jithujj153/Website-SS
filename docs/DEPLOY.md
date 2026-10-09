# Deployment guide (Vercel)

1. **Push the repo** to GitHub/GitLab/Bitbucket.
2. **Import** it at vercel.com/new. Framework preset: *Next.js* (auto-detected). No build overrides needed.
3. **Environment variables** (Project > Settings > Environment Variables, for Production and Preview):
   - `NEXT_PUBLIC_SITE_URL` = your final URL, e.g. `https://www.system-smiths.com`
   - `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL`
   - Optional: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` (Vercel Marketplace > Upstash Redis creates these), `NEXT_PUBLIC_GA_ID`
4. **Email (Resend):** add and verify your sending domain (DNS records for SPF/DKIM), create an API key, and use an address on that domain as `CONTACT_FROM_EMAIL`. Replies go to the visitor via `reply_to`.
5. **Domain:** Project > Settings > Domains > add `system-smiths.com` and `www`. Set the redirect you prefer and update `NEXT_PUBLIC_SITE_URL` to match.
6. **Deploy**, then test the contact form end to end (check spam folder on the first send).
7. **Search:** submit `https://<your-domain>/sitemap.xml` in Google Search Console.

## Post-deploy checks

- Open `/?debug=1` and scroll slowly, then try `/?p=0.3`, `/?p=0.55`, `/?p=0.75`, `/?p=0.95`.
- Test on a real phone: scroll feel, tap on a building shows the card, "Request demo" lands on `/contact` with the product selected.
- Toggle OS "reduce motion": the static story must appear.
- Run Lighthouse (mobile + desktop) in an incognito window. Targets: Performance 85+, Accessibility 95+, SEO 95+.
- Confirm the cookie notice appears, and that GA only loads after "Accept" (when `NEXT_PUBLIC_GA_ID` is set).
- Share a URL in a chat app to check the Open Graph card.

## Checklist: optional details to add later

Edit `src/config/site.ts`; each appears automatically on Contact, in the footer and in the schema.org markup once filled.

- [ ] Phone number (`contact.phone`)
- [ ] WhatsApp number, digits only with country code (`contact.whatsapp`)
- [ ] City (`contact.city`) and/or full address (`contact.address`; the address also enables the map)
- [ ] Working hours (`contact.hours`)
- [ ] Social links (`contact.social.linkedin / x / instagram / github / youtube`)
- [ ] Real product screenshots: replace the illustrative mockups in `src/components/products/ProductMockup.tsx`
- [ ] A custom Open Graph image if you want something other than the generated card (`src/app/opengraph-image.tsx`)
- [ ] More blog posts (drop `.mdx` files into `content/blog/`)
- [ ] Privacy policy page (the cookie notice should link to one once you have it)

## Notes and assumptions

- Only the three verified facts appear as numbers (40+ projects, 20+ clients, MVP in as little as 2 days, with "Timelines vary with scope.").
- Blog posts are signed "The System-Smiths team" and contain no client stories or invented statistics.
- The site URL defaults to `https://www.system-smiths.com`; change it with the env var.
- Contact delivery uses the Resend HTTP API directly (no extra dependency). Swap `src/app/api/contact/route.ts` for Nodemailer if you prefer SMTP.
