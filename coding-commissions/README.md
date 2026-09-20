# Ibrahim Mohammed Ahmed | Coding & Technology

A static coding-commission and developer portfolio website with an Instant Estimate Quiz.

It's plain HTML, CSS, and JavaScript. There is no build step, no Node.js, no npm, no framework, no backend, and no database.

```
coding-commissions/
├── index.html      ← the homepage (must stay in the repository root)
├── quiz.html       ← the Instant Estimate Quiz page
├── style.css       ← all styles (shared)
├── script.js       ← shared: navigation, animations, tech search
├── quiz.js         ← quiz logic, estimate, Web3Forms submission (your key goes here)
├── assets/
│   └── favicon.svg
└── README.md
```

---

## GitHub Pages Setup

1. **Extract the ZIP.**
2. **Create or open a GitHub repository** (for example `coding-commissions`, or `yourusername.github.io` for a root URL).
3. **Upload the website files.** Open the `coding-commissions` folder and drag its *contents* (`index.html`, `quiz.html`, `style.css`, `script.js`, `quiz.js`, `assets`, `README.md`) into the repository using **Add file → Upload files**. `index.html` must end up in the root of the repository, not inside a subfolder.
4. **Commit the files** with the green **Commit changes** button.
5. Go to **Settings → Pages**.
6. Under **Build and deployment**, set **Source** to **Deploy from a branch**, then select your branch (usually `main`) and the **/ (root)** folder.
7. Click **Save**.
8. Wait a minute or two, then open the GitHub Pages URL shown at the top of the Pages settings (for example `https://yourusername.github.io/coding-commissions/`).

All file paths are relative, so the site works whether it's served from a username root or a project subfolder.

---

## How quiz submissions work

The Instant Estimate Quiz lives on its own page, **`quiz.html`**. Every "Get an Instant Estimate" button on the homepage opens it. (The pricing-card buttons also pre-select that card's budget.)

- The quiz calculates a **preliminary** price range in the browser with JavaScript. It's shown as a range, never a final quote.
- Answers are saved on the visitor's device (browser storage) as they go, so a refresh doesn't lose them. They're cleared after a successful submission or when the visitor resets the quiz.
- When the client clicks **Send My Request**, the full request is sent to **Web3Forms** (https://web3forms.com), a free form-to-email service that works on static sites.
- The success screen only appears when Web3Forms confirms success. If it fails, the client sees a retry message plus your commission Discord (**@Ishowspeedismymom**) and email as fallback contacts. Their answers stay saved.
- Double submissions are blocked: the button locks while sending, and an identical request sent within 30 minutes isn't sent twice.

### Fields included in every email

Name, Email, Discord ("Not provided" if blank), Project Type, Custom Project Type, Project Size, Feature Count, Main Features, Existing Code, Timeline, Budget, Project Description, Estimated Price Range, and Submitted At (readable date/time plus an ISO timestamp).

Email subject: **New Coding Commission — Instant Estimate**. Reply-to is set to the client's email.

---

## ⚠️ Required: add your Web3Forms access key

Until you do this, the quiz will not send anything. It will show the error screen with a setup note instead.

1. Go to **https://web3forms.com** and create a free access key using **ibrahim.asim.contact@gmail.com**. Web3Forms sends every submission to the email address the key was created with.
2. Open **`quiz.js`**. At the very top is a boxed section labeled **WEB3FORMS ACCESS KEY — PASTE YOUR KEY HERE**.
3. Replace the placeholder on this line (line 18), keeping the quotes:
   ```js
   const WEB3FORMS_ACCESS_KEY = "PASTE_YOUR_WEB3FORMS_ACCESS_KEY_HERE";
   ```
4. Commit the change, then send yourself a test request through the live quiz.

On GitHub you can edit it right in the browser: open `quiz.js` → pencil icon → paste → **Commit changes**.

The access key is designed to be public in website code, so it's fine for it to be visible on GitHub.

---

## Notes

- **No backend is required.** The site is fully static and runs on GitHub Pages as-is.
- Fonts load from Google Fonts. If they're ever unavailable, the site falls back to system fonts automatically.
- Animations respect the visitor's **reduce motion** setting.
- Only the commission Discord (**@Ishowspeedismymom**) appears on the site.
