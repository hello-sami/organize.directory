# Mutual Aid Network Directory

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