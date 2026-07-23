# Darrius Parker Portfolio Base

A lightweight, responsive fashion portfolio built with plain HTML and CSS. It
is intentionally framework-free so it can be edited easily and deployed
directly to Cloudflare Pages.

## Edit the content

- Update email and social links in `index.html` and `eternal-bonds.html`.
- Replace the gray project blocks with images using:

```html
<img src="assets/your-image.jpg" alt="Clear description of the image" />
```

- Add image files to the `assets` folder.
- Duplicate `eternal-bonds.html` to create additional project pages.
- Change project titles, years, descriptions, and credits directly in the HTML.

## Deploy to Cloudflare Pages

1. Upload this folder to a GitHub repository.
2. In Cloudflare, choose **Workers & Pages**, then **Create application**.
3. Connect the repository.
4. Use no framework preset and leave the build command blank.
5. Set the output directory to `/`.
6. Deploy, then connect `a-purpose.xyz` under **Custom domains**.

You can also use Cloudflare Direct Upload by uploading the folder or its ZIP.
