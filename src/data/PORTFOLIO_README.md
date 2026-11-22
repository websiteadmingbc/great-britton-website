# portfolio.json edit guide

Edit `portfolio.json` to change the gallery without touching templates.

1. **categories** — ordered filter labels. Renaming, reordering, adding, or removing a category updates Projects page filters and which photos service pages pull (by matching the category string).
2. **featured** — optional boolean on any loose photo or project photo. Featured items sort first within their category on Projects and are preferred on service pages.
3. **projects[].hero** — filename of the card image for that project. Change the string to swap the card image (file must exist under `assets/portfolio/`).

Part 1: all current photos are in `loose`; `projects` stays empty until the photo log (Part 2).
