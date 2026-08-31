# MPS Private Vault

Build a Private Personal Credential & Links Vault called "MPS"



Create a private, minimal, dark-themed personal vault web application called:



MPS

Moslim Private Store



This is a highly private personal dashboard for storing my own Gmail accounts, passwords, and selected social/platform links.



The application must prioritize security, privacy, simplicity, and clean UX over visual complexity.



---



1. CORE SECURITY REQUIREMENT



This is NOT a normal public website.



It is a private vault.



The application must have a secure authentication layer before any vault content is displayed.



Master Unlock Screen



When the website opens, DO NOT show:



- Gmail accounts

- Passwords

- Saved links

- Dashboard

- Vault data

- Any private information



Instead, show a dedicated full-screen lock interface.



The interface should contain:



- MPS logo/text

- "Private Vault" or "MPS Private Vault"

- A secure PIN/password input

- Unlock button

- Very subtle security animation

- Minimal error message when authentication fails



The current master PIN I want to use initially is:



"552007"



IMPORTANT:



Do NOT hard-code this PIN into visible frontend JavaScript.



Do NOT expose it in HTML.



Do NOT store it as plain text.



Use a proper authentication/security mechanism and store only a secure hash or use a secure authentication provider.



I must be able to change the master password/PIN later from the security settings.



After successful authentication, open the private dashboard.



---



2. SECURITY ARCHITECTURE



Use a real backend/database solution.



Prefer:



- Supabase Authentication

- Supabase Database

- Row Level Security

- Secure server-side operations

- Encrypted sensitive credential fields



Do NOT rely only on:



- localStorage

- sessionStorage

- plain JSON

- frontend variables

- hardcoded passwords

- hardcoded credentials



The application should behave like a small personal password vault.



All sensitive credentials must be protected from being publicly accessible.



Only the authenticated owner should be able to access the vault.



Enable appropriate Row Level Security policies so unauthorized users cannot read, create, update, or delete vault records.



---



3. PRIVATE DASHBOARD



After unlocking, show a clean dashboard.



The dashboard should be extremely simple.



No unnecessary cards.



No excessive gradients.



No huge illustrations.



No AI-looking design.



No excessive glassmorphism.



No flashy animations.



The design should feel like a real private utility application created by a professional developer.



Dashboard structure:



Header



Left:



MPS



Small subtitle:



Moslim Private Store



Right:



- Lock Vault

- Settings



The "Lock Vault" button immediately returns to the authentication screen and hides all private information.



---



4. GMAIL / PASSWORD VAULT



Create a section called:



Accounts



This section stores email accounts and their passwords.



Each account should appear as a clean compact row/card.



Example:



Email:

"example@gmail.com"



Password:

"••••••••••"



Actions:



- Copy Email

- Show/Hide Password

- Copy Password

- Edit

- Delete



Passwords must NEVER be displayed automatically.



They should always be masked initially.



When clicking the eye icon:



Show the password temporarily.



Add an optional auto-hide timer after a short period.



---



5. ADD NEW ACCOUNT



Create an elegant "Add Account" button.



When clicked, open a modal/form containing:



Email



Input:

"Enter Gmail address"



Password



Input:

"Enter password"



Password input must include:



- Show/Hide button

- Password strength indicator

- Proper secure input handling



Buttons:



- Save Account

- Cancel



When I click Save:



- Validate the email

- Validate that required fields are present

- Encrypt/protect the password

- Save it securely in the database

- Close the modal

- Immediately show the new account in the Accounts section



The account must still exist after:



- refreshing the page

- closing the browser

- reopening the website

- logging out and logging in again



Do NOT use temporary frontend-only state as the permanent storage.



---



6. COPY FUNCTIONALITY



For every account provide:



Copy Email



Clicking it copies only the email address.



Show a tiny confirmation:



Email copied



Copy Password



Clicking it copies only the password.



Show:



Password copied



The password should NOT be displayed just because it was copied.



Use the Clipboard API.



After copying a password, automatically clear sensitive clipboard content when reasonably possible and safe to do so.



Never log passwords to:



- console

- analytics

- error tracking

- database logs

- browser console

- network logs



---



7. SOCIAL / PLATFORM LINKS VAULT



Create another section called:



My Links



I want to store my personal links.



The ONLY allowed categories are:



1. LinkedIn

2. Facebook

3. TikTok

4. Telegram

5. GitHub

6. Git

7. WhatsApp



Do not add random categories.



When I click:



Add Link



Open a modal with:



Platform



Dropdown:



- LinkedIn

- Facebook

- TikTok

- Telegram

- GitHub

- Git

- WhatsApp



URL



Input:



"Paste your link here"



Save Link



When saved:



- Validate URL

- Save it permanently

- Close modal

- Immediately display it

- Keep it after refresh

- Keep it after reopening the website



Each saved link should have:



- Platform name

- Small platform icon

- URL

- Open button

- Copy button

- Edit button

- Delete button



---



8. LINK MANAGEMENT



I must be able to:



- Add a new link

- Edit a link

- Delete a link

- Copy a link

- Open a link



Before deleting a link, show a confirmation dialog.



Example:



"Are you sure you want to delete this link?"



Buttons:



- Delete

- Cancel



---



9. ACCOUNT MANAGEMENT



I must be able to:



- Add Gmail account

- Edit Gmail account

- Change password

- Copy email

- Copy password

- Show/hide password

- Delete account



Before deleting an account, show a confirmation dialog.



Do NOT accidentally delete records.



---



10. SEARCH



Add a very simple search field.



Search should work across:



- Gmail addresses

- Saved platform names



Example:



If I type:



"moslim"



show matching Gmail accounts.



If I type:



"GitHub"



show my GitHub link.



Search must not reveal anything while the vault is locked.



---



11. DASHBOARD LAYOUT



Use a simple structure:



TOP:



MPS

Moslim Private Store



Then:



[ Accounts ]



Number of saved accounts.



Then:



[ My Links ]



Number of saved links.



Then the actual lists.



Keep everything compact.



I do NOT want a complicated admin dashboard.



This is a personal vault, not a business SaaS dashboard.



---



12. DESIGN SYSTEM



The visual identity is extremely important.



The website should NOT look AI-generated.



Avoid:



- Purple/blue AI gradients

- Excessive neon

- Excessive glassmorphism

- Huge glowing effects

- 3D cards

- Excessive rounded corners

- Overly colorful interfaces

- Generic AI dashboard templates



Use a sophisticated dark palette.



Suggested colors:



Background:

"#0B0D0F"



Secondary background:

"#111418"



Cards:

"#15191E"



Borders:

"#252B32"



Primary text:

"#E6E8EB"



Secondary text:

"#8B929A"



Accent:

"#7F8C8D"



Success:

"#6F9B78"



Danger:

"#A66B6B"



The colors should be subtle and muted.



No bright neon colors.



No excessive contrast.



The overall feeling should be:



Private

Calm

Premium

Minimal

Professional

Secure



---



13. TYPOGRAPHY



Use a clean modern font.



Prefer:



Inter



or another highly readable professional sans-serif font.



Typography should be:



- clean

- compact

- modern

- readable



Do not use decorative fonts.



---



14. ANIMATIONS



Use very subtle animations only.



Examples:



- Fade-in

- Small hover transition

- Smooth modal opening

- Button feedback

- Unlock transition



Do NOT use:



- floating objects

- particle backgrounds

- excessive motion

- flashy transitions



The website should feel calm.



---



15. RESPONSIVE DESIGN



The application must work perfectly on:



- Android phones

- iPhones

- Tablets

- Laptops

- Desktop computers



Mobile-first design is important.



On mobile:



Cards should fit the screen.



Buttons should be easy to tap.



Copy buttons should remain accessible.



The vault should never require horizontal scrolling.



---



16. SECURITY SETTINGS



Create a Settings page.



Include:



Security



- Change Master Password

- Lock Vault

- Session timeout



Vault



- Number of accounts

- Number of saved links



Danger Zone



- Delete all vault data



The "Delete all vault data" action must require strong confirmation.



---



17. AUTO LOCK



Implement automatic vault locking after inactivity.



Example:



If there is no interaction for a configurable period:



Automatically lock the vault.



Return to the MPS unlock screen.



Never leave private information visible indefinitely on an unattended device.



---



18. SESSION SECURITY



Use secure authentication/session handling.



Do not keep the vault permanently unlocked.



When the user logs out:



- Clear private data from frontend state

- Lock the vault

- Return to authentication screen



Do not expose credentials in URLs.



Do not expose credentials in page source.



Do not expose credentials in frontend configuration.



Do not put sensitive credentials into environment variables that are publicly exposed to the browser.



---



19. DATABASE STRUCTURE



Create a secure database structure similar to:



users



- id

- created_at



accounts



- id

- user_id

- email

- encrypted_password

- created_at

- updated_at



links



- id

- user_id

- platform

- url

- created_at

- updated_at



Every record must belong to the authenticated user.



Enable strict Row Level Security.



A user must only be able to access their own records.



---



20. IMPORTANT SECURITY RULE



Do not use the actual credentials I previously provided inside the source code.



Do not hardcode them.



Do not put them into demo data.



Do not put them into GitHub.



Do not put them into public environment variables.



Instead, build the application so I can enter them manually through the secure dashboard after deployment.



If you need seed/demo data during development, use fake credentials such as:



"demo@example.com"



"DemoPassword123!"



Never use real credentials.



---



21. EMPTY STATES



If there are no accounts:



Show:



No accounts yet



Small text:



Add your first private account.



Button:



Add Account



If there are no links:



Show:



No links yet



Small text:



Add your personal platform links.



Button:



Add Link



Keep these states minimal.



---



22. ERROR HANDLING



Create clean error messages.



Examples:



Invalid email:



Please enter a valid email address.



Missing password:



Password is required.



Invalid URL:



Please enter a valid URL.



Wrong master password:



Incorrect password.



Database error:



Something went wrong. Please try again.



Never expose technical backend errors to the user.



---



23. ACCESSIBILITY



Make the interface accessible.



Use:



- proper labels

- keyboard navigation

- accessible buttons

- readable contrast

- focus states

- ARIA labels where needed



The eye icon must have an accessible label.



Copy buttons must have accessible labels.



---



24. LOGGING & PRIVACY



This is extremely important.



NEVER log:



- Gmail passwords

- Master password

- Authentication tokens

- Private URLs if avoidable

- Sensitive vault data



Do not send vault credentials to analytics services.



Do not add unnecessary third-party tracking.



Keep the application private.



---



25. PWA / APP-LIKE EXPERIENCE



Make the application feel like a private personal app.



If possible, configure it as a PWA.



Use:



App Name:

MPS



Short Name:

MPS



Description:

Moslim Private Store — Private Personal Vault



Use a simple dark icon.



The app should feel native when installed on Android.



---



26. BRANDING



The application name everywhere should be:



MPS



Subtitle:



Moslim Private Store



Do not use:



- Password Manager

- AI Vault

- AI Password Manager

- SaaS

- Enterprise

- Admin Portal



The identity should remain personal and private.



---



27. FINAL UX



The entire experience should be:



Open website

↓

MPS private lock screen

↓

Authenticate

↓

Private dashboard

↓

Accounts + My Links

↓

Copy / View / Edit / Add

↓

Lock Vault



That's it.



Do not overcomplicate the application.



---



28. DEVELOPMENT REQUIREMENTS



Before considering the project complete:



1. Make sure authentication actually works.

2. Make sure unauthorized users cannot access vault data.

3. Make sure database Row Level Security is enabled.

4. Make sure account passwords are protected.

5. Make sure passwords are never hardcoded.

6. Make sure passwords are never printed to console.

7. Make sure data persists after refresh.

8. Make sure data persists after closing and reopening the browser.

9. Make sure Add Account works.

10. Make sure Edit Account works.

11. Make sure Delete Account works.

12. Make sure Add Link works.

13. Make sure Edit Link works.

14. Make sure Delete Link works.

15. Make sure Copy Email works.

16. Make sure Copy Password works.

17. Make sure Copy Link works.

18. Make sure the vault locks correctly.

19. Make sure session timeout works.

20. Make sure the mobile interface works perfectly.



Do not just create a visual prototype.



Build the actual working application with real persistent storage and secure authentication.



---



29. IMPORTANT FINAL INSTRUCTION



Do not start by adding my real accounts.



First build the complete secure MPS application.



Then provide a clear setup flow so I can connect the database/authentication and manually enter my private credentials through the application.



The final product should look like a small premium private vault made specifically for one person, not like an AI-generated template.



Keep it:



Dark

Quiet

Minimal

Professional

Private

Fast

Secure



Name:



MPS



Subtitle:



Moslim Private Store

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://mps-lockbox.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/5600bcd3-5020-440c-8f15-a65c6dbb22ec).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
