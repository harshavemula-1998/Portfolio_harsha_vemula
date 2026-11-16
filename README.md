# harshavemula.com — v2

Static portfolio site. No build step: plain HTML, CSS and vanilla JS.

```
index.html              page content
assets/css/site.css     styles (light + dark themes via CSS tokens)
assets/js/site.js       theme, nav, pipeline animation, counters, lightbox, ⌘K palette
assets/js/chat.js       "Ask about me" widget → API Gateway → Lambda → Bedrock
assets/img/             images (pre-resized for the web)
resume/…pdf             same path as v1, so existing links keep working
AGU_Poster_R2OHC.pdf    same path as v1
```

## Run locally

```sh
python3 -m http.server 4321 --bind 127.0.0.1
# open http://127.0.0.1:4321
```

The chat widget calls the production API (`API_URL` in `assets/js/chat.js`), which allows any origin,
so it works from localhost too.

## Edit content

All copy lives in `index.html`. Each section is marked with a `<!-- ===== NAME ===== -->` comment.
Palette commands are in the `COMMANDS` array in `assets/js/site.js`.

## Deploy

Pushing to `main` deploys automatically: `.github/workflows/deploy.yml` syncs the repo to the
private S3 bucket behind CloudFront (`aws s3 sync --delete`, with no-cache headers on HTML/CSS/JS).
Files removed from the repo are removed from the bucket too.

The workflow authenticates with the `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` repository secrets.
Images are cached for a year, so give a changed image a new filename instead of overwriting it.
