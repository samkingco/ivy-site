# MDX Setup Required

The lab pages are using `.mdx` files but Astro needs the MDX integration installed.

## Changes made:
1. Added `"@astrojs/mdx": "^4.1.1"` to package.json dependencies
2. Added `mdx()` integration to astro.config.mjs

## To complete:
Run `npm install` (or `pnpm install`) to install @astrojs/mdx

npm is broken in the sandbox environment, so this needs to be run on the host machine.

Once installed, the lab collection will work and `/lab/` will show the murmuration experiments.
