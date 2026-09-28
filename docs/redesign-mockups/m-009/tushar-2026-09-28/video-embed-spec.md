# YouTube / Vimeo video embed architecture (Tushar, 2026-09-28, verbatim)

The Pitch Video and Demo Video assets will NOT be hosted directly inside the portfolio repository.

I will upload the final Pitch Videos and Demo Videos to YouTube, and the portfolio will play them through embedded YouTube players.

Design the media architecture accordingly.

## 1. YOUTUBE PRIVACY-ENHANCED EMBEDS

For YouTube, always use the privacy-enhanced embed domain:

https://www.youtube-nocookie.com/embed/VIDEO_ID

Do NOT use:

https://www.youtube.com/embed/...

unless there is a technical reason that makes the privacy-enhanced version impossible.

Example:

```tsx
<iframe
  src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&playsinline=1`}
  title="TeachSpark pitch video"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowFullScreen
/>
```

## 2. STORE VIDEO IDS, NOT FULL EMBED HTML

Do not hardcode complete iframe markup for every product.

Extend the product data model.

Example:

```ts
{
  id: "teachspark",

  pitchVideo: {
    provider: "youtube",
    videoId: "XXXXXXXXXXX",
    title: "TeachSpark Pitch Video"
  },

  demoVideo: {
    provider: "youtube",
    videoId: "YYYYYYYYYYY",
    title: "TeachSpark Product Demo"
  }
}
```

Then render the appropriate player through one reusable component.

Example:

```tsx
<ProductMediaPlayer
  media={activeMedia}
/>
```

## 3. SUPPORT YOUTUBE AND VIMEO CLEANLY

Create a provider abstraction.

Supported providers:

- youtube
- vimeo

Example:

```ts
type VideoMedia = {
  provider: "youtube" | "vimeo";
  videoId: string;
  title: string;
  poster?: string;
};
```

Do not spread YouTube/Vimeo-specific iframe logic throughout the application.

Use one reusable player component.

## 4. YOUTUBE PLAYER PARAMETERS

For YouTube privacy-enhanced embeds use:

- rel=0
- playsinline=1

Do NOT assume that `rel=0` completely removes related videos.

It only reduces/limits YouTube's related-video behavior.

Do not attempt unsupported hacks to hide or obscure standard YouTube player functionality.

## 5. NO AUTOPLAY WITH SOUND

When the user selects a product, load the Pitch Video poster/player.

Do NOT autoplay with audio.

When switching Pitch → Demo or Demo → Pitch, stop/unmount the previous player.

The new video should start from the beginning.

Only one player may exist/play at a time.

## 6. MEDIA SWITCHING MUST REMAIN IN-PAGE

- Pitch Video: play in the LEFT media frame.
- Demo Video: play in the SAME LEFT media frame.

Do NOT open either video in a new browser tab.

- Product Link: new tab.
- GitHub: new tab.
- PRD: new tab.

## 7. VIDEO END BEHAVIOR

Do not build custom overlays intended to cover or remove YouTube's native end-screen recommendations.

YouTube does not guarantee a completely empty end screen.

With YouTube, use privacy-enhanced embedding + rel=0, and accept native YouTube end-screen behavior.

Architect the player so that switching to Vimeo later is trivial.

If Vimeo is used for a product, preserve the provider-specific clean end-screen configuration where supported.

## 8. OPTIONAL PORTFOLIO END CARD

Do NOT interfere with YouTube's player UI.

However, outside the iframe, the portfolio may show a small persistent contextual area such as:

```
Watching:
TeachSpark — Pitch Video

[ Watch Demo ]
[ Open Product ]
[ Read PRD ]
```

This remains part of the portfolio UI and does not cover the YouTube player.

## 9. CONTENT SECURITY POLICY

Inspect the existing Content Security Policy before changing anything.

Allow only the domains actually required for embedded players.

Do NOT broadly loosen the CSP.

Specifically, frame-src should allow:

- 'self'
- https://www.youtube-nocookie.com
- and, only if Vimeo support is retained: https://player.vimeo.com

Conceptually:

```
frame-src 'self'
  https://www.youtube-nocookie.com
  https://player.vimeo.com;
```

Do NOT use:

```
frame-src *;
```

Do NOT weaken unrelated CSP directives.

## 10. YOUTUBE THUMBNAILS / POSTERS

Prefer custom portfolio poster artwork for each product.

Do NOT rely entirely on YouTube's default thumbnail.

The poster should visually match the 90s-game / scrapbook product identity.

Before playback, show the custom poster.

When the user presses Play, replace it with the YouTube privacy-enhanced embed.

This is preferred because:

- page looks consistent
- YouTube UI does not dominate immediately
- unnecessary iframe loading is avoided
- initial performance improves

## 11. CLICK-TO-LOAD PLAYER

Prefer a lightweight click-to-load architecture.

Initial state: custom poster + play button.

After click: mount YouTube iframe.

Do NOT mount all product video iframes during page load.

This is especially important because the carousel contains many products.

## 12. LAZY LOADING

Use `loading="lazy"` where appropriate.

Only mount the active product's active video.

Do NOT mount 11 pitch iframes + 11 demo iframes at the same time.

## 13. PRODUCT CHANGE CLEANUP

When activeProduct changes:

1. unmount the existing video player
2. reset mediaMode to "pitch"
3. display the new pitch poster
4. reset playback state
5. do not preserve playback position from previous product

## 14. PITCH / DEMO ACTIVE STATE

Visually indicate which video is currently selected.

Example:

```
Pitch Video
● ACTIVE
```

or use the selected torn-paper treatment.

Do not add excessive UI.

## 15. ACCESSIBILITY

Every player must have a descriptive title.

Examples:

- "TeachSpark pitch video"
- "TeachSpark product demonstration"

The poster play button should have:

```
aria-label="Play TeachSpark pitch video"
```

Video switching controls must be keyboard accessible.

## 16. EXTERNAL VIDEO LINKS

Do not expose raw YouTube URLs in the primary interface.

The portfolio should feel like the host experience.

If a fallback is needed because embedding fails, show:

Watch on YouTube ↗

as a secondary fallback link.

## 17. ERROR / BLOCKED EMBED STATE

If the iframe cannot load, retain the custom poster and show:

```
Video unavailable here.

[ Watch on YouTube ↗ ]
```

Do not leave a large blank or black region.

## 18. SECURITY REQUIREMENT

Do NOT make broad security-policy changes simply to make the embed work.

Before modifying CSP:

1. inspect current security headers
2. identify the exact blocked source
3. add the minimum required domain
4. preserve every unrelated directive
5. document the change

If Vimeo is not actually being used, do not keep Vimeo permissions unnecessarily.

## 19. FUTURE PROVIDER SWITCHING

Keep provider-specific logic isolated.

I may later decide YouTube → Vimeo, because Vimeo provides stronger control over player presentation and video-end behavior.

Changing provider should ideally require changing product configuration rather than rewriting the Portfolio UI.

## 20. AFTER IMPLEMENTATION

Test:

- YouTube privacy-enhanced player works
- no youtube.com embed is accidentally used
- pitch loads correctly
- demo loads correctly
- switching videos stops previous playback
- changing products resets to pitch
- only one iframe is mounted
- posters display before playback
- embeds work under CSP
- CSP has not been broadly weakened
- YouTube fullscreen works
- keyboard controls work
- mobile playback works
- blocked-player fallback works

Finally report:

1. Video component created
2. Providers supported
3. YouTube embed URL format
4. CSP modifications made
5. Whether Vimeo permission remains necessary
6. Lazy-loading strategy
7. Player cleanup behavior
8. Any limitations of YouTube end-screen behavior
