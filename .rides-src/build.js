// Assembles the vehicle-hire and pickup/drop pages. Keeps each page's original
// <head> (SEO meta + schema) from git HEAD, swaps the page CSS, and wraps the
// hand-written body in the shared shell (header, icon sprite, footer, scripts).
// Usage: node .rides-src/build.js [slug ...]
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const sprite = fs.readFileSync(path.join(__dirname, "sprite.html"), "utf8").trim().replace(/\r?\n/g, "");
const only = process.argv.slice(2);

for (const f of fs.readdirSync(path.join(__dirname, "bodies"))) {
  const slug = f.replace(/\.html$/, "");
  if (only.length && !only.includes(slug)) continue;
  let body = fs.readFileSync(path.join(__dirname, "bodies", f), "utf8");
  const font = (body.match(/<!--font:(.*?)-->/) || [])[1];
  body = body.replace(/<!--font:.*?-->\s*/, "");

  const orig = execSync(`git show HEAD:${slug}.html`, { cwd: root, encoding: "utf8" });
  let head = orig.slice(0, orig.indexOf("</head>"));
  head = head.replace(/\s*<link rel="stylesheet" href="css\/(jeep-safari|coimbatore-to-kodaikanal|travels-in-kodaikanal|enquiry-form)\.css" \/>/g, "");
  if (font) head = head.replace("css2?family=Poppins", `css2?family=${font}&family=Poppins`);
  head = head.replace(
    '<link rel="stylesheet" href="css/styles.css" />',
    '<link rel="stylesheet" href="css/styles.css" />\n  <link rel="stylesheet" href="css/enquiry-form.css" />\n  <link rel="stylesheet" href="css/rides.css" />\n  <script>document.documentElement.className += " rd-js";</script>'
  );

  const openEnd = body.indexOf(">") + 1;
  const out =
    head.trimEnd() + "\n</head>\n" + body.slice(0, openEnd) + "\n" +
    '  <div class="rd-progress" aria-hidden="true"><span></span></div>\n' +
    '  <a class="skip-link" href="#main-content">Skip to main content</a>\n' +
    "  " + sprite + "\n" +
    '  <div id="site-header" data-include="partials/header.html"></div>\n  ' +
    body.slice(openEnd).trim() + "\n" +
    '  <button type="button" class="rd-top" aria-label="Back to top">&#8593;</button>\n' +
    '  <div id="site-footer" data-include="partials/footer.html"></div>\n' +
    '  <script src="js/include.js"></script>\n' +
    '  <script src="js/main.js"></script>\n' +
    '  <script src="js/enquiry-form.js"></script>\n' +
    '  <script src="js/rides.js"></script>\n' +
    "</body>\n</html>\n";
  fs.writeFileSync(path.join(root, slug + ".html"), out);
  console.log("built", slug);
}
