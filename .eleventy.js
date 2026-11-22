const fs = require('fs');
const path = require('path');

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ 'assets': 'assets' });
  eleventyConfig.addPassthroughCopy({ 'crew': 'crew' });
  eleventyConfig.addPassthroughCopy({ 'vconcept': 'vconcept' });
  eleventyConfig.addPassthroughCopy('CNAME');
  eleventyConfig.addPassthroughCopy('.nojekyll');

  eleventyConfig.addFilter('absoluteUrl', (url, base) => {
    if (!url) return base;
    if (url.startsWith('http')) return url;
    return `${base.replace(/\/$/, '')}${url.startsWith('/') ? url : `/${url}`}`;
  });

  eleventyConfig.addFilter('json', (value) => JSON.stringify(value));

  eleventyConfig.addFilter('photosForCategory', (portfolio, category, limit = 6) => {
    if (!portfolio) return [];
    const featuredFirst = (items) =>
      [...items].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));

    const fromProjects = [];
    for (const project of portfolio.projects || []) {
      if (project.category !== category) continue;
      for (const photo of project.photos || []) {
        fromProjects.push({ ...photo, projectSlug: project.slug, projectTitle: project.title });
      }
    }

    const loose = (portfolio.loose || []).filter((p) => p.category === category);
    const combined = featuredFirst([...fromProjects, ...loose]);
    return typeof limit === 'number' ? combined.slice(0, limit) : combined;
  });

  eleventyConfig.addFilter('looseByCategory', (portfolio, category) => {
    const items = (portfolio.loose || []).filter((p) => p.category === category);
    return [...items].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
  });

  eleventyConfig.addFilter('slugifyCategory', (name) =>
    String(name || '')
      .toLowerCase()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  );

  eleventyConfig.addShortcode('year', () => String(new Date().getFullYear()));

  // Emit portfolio.json into the built site for client-side Projects page behavior
  eleventyConfig.on('eleventy.after', () => {
    const src = path.join(__dirname, 'src/data/portfolio.json');
    const destDir = path.join(__dirname, '_site/data');
    const dest = path.join(destDir, 'portfolio.json');
    fs.mkdirSync(destDir, { recursive: true });
    fs.copyFileSync(src, dest);
  });

  return {
    dir: {
      input: 'src',
      includes: '_includes',
      layouts: '_layouts',
      data: 'data',
      output: '_site',
    },
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk',
    templateFormats: ['njk', 'html', 'md'],
  };
};
