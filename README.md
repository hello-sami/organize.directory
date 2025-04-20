# The Organize Directory

A comprehensive web directory for finding and connecting with mutual aid networks and grassroots initiatives across different cities and focus areas.

## About

This project serves as a centralized resource for discovering mutual aid networks, community support initiatives, and grassroots organizations. It enables users to find local support networks by city or browse initiatives by specific issues and causes.

## Features

- **City-based Navigation**: Browse mutual aid networks by city and state
- **Issue-based Categories**: Find initiatives focused on specific causes
- **Responsive Design**: Mobile-friendly interface with dark/light mode support
- **Community-Driven**: Open directory that welcomes submissions from the community

## Project Structure

```
organize.directory/
├── cities/          # City-specific pages and data
├── states/          # State-level pages and data
├── issues/          # Issue-specific category pages
├── components/      # Reusable UI components
├── styles/          # CSS stylesheets
├── templates/       # HTML templates
├── js/             # JavaScript modules
└── functions/      # Server functions
```

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES Modules)
- **Backend**: Express.js (Node.js web framework)
- **Build Tools**: Custom build scripts
- **Dependencies**:
     - cheerio: HTML parsing
     - express: Web framework
     - markdown-it: Markdown processing
     - front-matter: Content metadata parsing

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/yourusername/organize.directory.git
cd organize.directory
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

4. Build the site:

```bash
npm run build
```

## Contributing

This is an open directory that welcomes contributions from the community. If you know of a mutual aid network or initiative that should be listed:

1. Contact us to have it added
2. Provide the following information:
     - Organization name
     - Location (City/State)
     - Website or social media links
     - Brief description of their work
     - Primary focus areas/issues

## Development

- `build.js`: Generates static pages from templates
- `server.js`: Development server configuration
- `theme.js`: Handles dark/light mode functionality
- `styles/`: Contains modular CSS files for styling
- `components/`: Reusable UI components like sidebar and navigation

## License

This project is open source and available under the MIT License.

## Contact

To add a mutual aid initiative or report issues, please contact:

- Email: contact@organize.directory

## Acknowledgments

Thanks to all the mutual aid networks and grassroots organizations working to support their communities through direct action and solidarity.

# Contact Form Setup Instructions

## Setting Up Web3Forms

To get your contact form working:

1. **Sign up for Web3Forms**:

     - Go to [Web3Forms.com](https://web3forms.com/)
     - Sign up for a free account using your email
     - After signing up, you'll be taken to your dashboard where you can create a form

2. **Get your Access Key**:

     - On your dashboard, click "Create Form"
     - Enter "Organize Directory Contact Form" as the form name
     - Enter "organizedirectory@proton.me" as the email where you want to receive submissions
     - Click "Create Form"
     - You'll receive an Access Key (it will look something like `12a34b56-7c89-0d1e-2f3g-456h7i8j9k0l`)

3. **Update your submit.js file**:
     - Open `functions/api/submit.js`
     - Replace `YOUR_WEB3FORMS_ACCESS_KEY` with the access key you received
     - Save the file and redeploy your site

## Features of Your Contact Form

- **Anonymous Submissions**: The form allows users to leave the email field blank for anonymous submissions
- **Custom Subject Line**: The form converts the selected subject into a readable format
- **Direct Email Forwarding**: Form submissions are sent directly to your Proton Mail address
- **No Monthly Limits**: Free tier includes 1000 submissions per month

## Troubleshooting

If you experience any issues:

1. Check the browser console for error messages
2. Verify your access key is correctly entered
3. Make sure your Cloudflare Functions are properly deployed
4. Contact Web3Forms support if issues persist

## Title Search Feature

The website includes a lightweight search functionality that indexes and searches only page titles (states, cities, regions, etc.), making it much more performant than searching the entire website content.

### How it Works

1. The search bar is added to the homepage and allows users to search for states, cities, and other location titles.
2. The search is performed client-side against a pre-generated JSON index of page titles.
3. Only title information is indexed, not the entire page content, which keeps the search very fast.

### Generating the Title Index

To update the title index (needed whenever new pages are added):

```bash
npm run generate-title-index
```

This will:

1. Scan all HTML files in the `states/`, `cities/`, and `topics/` directories
2. Extract the title from each file
3. Create a new `js/title-index.json` file with all titles and their URLs

### Implementation Details

- `js/generate-titles-index.js` - Node.js script to generate the title index
- `js/title-search.js` - Client-side script for search functionality
- `js/title-index.json` - The generated index of titles

The search is fully client-side and works without any server-side processing, making it very efficient.

### Fallback Mechanism

If the title index JSON file is not available, the search will fall back to a limited static set of states and cities. To ensure the best search experience, always run the index generator after adding new pages.
