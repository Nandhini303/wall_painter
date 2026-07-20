const fs = require('fs');
const path = require('path');

const tutDir = path.join(__dirname, '..', 'tutorials');
const files = fs.readdirSync(tutDir).filter(f => f.endsWith('.md') && f !== '01-fundamentals.md');

const accountBlock = `
---
### 📚 Official Documentation & Account Creation Links
Before proceeding, make sure you have your required free accounts set up and documentation ready:

**📚 Official Documentation Links:**
- **[MongoDB Docs](https://www.mongodb.com/docs/)** - The NoSQL database used to store our project data.
- **[Express.js Docs](https://expressjs.com/)** - The web framework for our Node.js backend.
- **[Angular Docs](https://angular.dev/)** - The frontend framework for our UI.
- **[Node.js Docs](https://nodejs.org/en/docs/)** - The JavaScript runtime for our backend.
- **[Socket.IO Docs](https://socket.io/docs/v4/)** - Real-time communication for live collaboration.

**🔑 Account Creation Steps:**
1. **MongoDB Atlas (Database)**
   - Go to [mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register) and sign up for a free account.
   - Create a new "Cluster" (the free \`M0\` tier is perfect).
   - Once created, click "Connect", choose "Drivers", and copy your Connection String (it looks like \`mongodb+srv://...\`). This will be your \`MONGODB_URI\`.
   - *Make sure you replace \`<password>\` in the URL with your actual database user password!*

2. **Cloudinary (Image Hosting)**
   - Go to [cloudinary.com/users/register/free](https://cloudinary.com/users/register/free) and sign up.
   - On your dashboard, you will see a section called "API Environment variable".
   - Copy the URL (it looks like \`cloudinary://API_KEY:API_SECRET@CLOUD_NAME\`). This will be your \`CLOUDINARY_URL\`.
---
`;

files.forEach(file => {
  const filePath = path.join(tutDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find the first line that starts with '##' and insert before it
  const lines = content.split('\n');
  const index = lines.findIndex(line => line.startsWith('## '));
  
  if (index !== -1) {
    lines.splice(index, 0, accountBlock);
    fs.writeFileSync(filePath, lines.join('\n'));
    console.log('Updated ' + file);
  } else {
    // If no ## found, just append to top after title
    fs.writeFileSync(filePath, lines[0] + '\n' + accountBlock + '\n' + lines.slice(1).join('\n'));
    console.log('Updated ' + file + ' (fallback top)');
  }
});
