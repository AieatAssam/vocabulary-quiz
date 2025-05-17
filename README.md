# Vocabulary Quiz

An Angular application that allows you to create and take quizzes based on vocabulary lists extracted from images using AI.

**Live Demo**: [https://aieatassam.github.io/vocabulary-quiz/](https://aieatassam.github.io/vocabulary-quiz/)

## Privacy

This application prioritizes your privacy:
- No user data is captured or sent to any server
- All settings are stored in your browser's session and local storage only
- API keys for OpenAI are stored in session storage and never transmitted elsewhere
- All image processing is done client-side
- Vocabulary data is only stored in your browser's local storage

## Features

### Image Processing
- Upload vocabulary lists as images
- Take photos directly using your device camera
- Supports common image formats (JPG, PNG)

### AI Vocabulary Extraction
- Extract words and definitions from images using OpenAI API
- Support for different languages
- Validation and visualization of extracted vocabulary

### Quiz Generation
- Create quizzes with different types:
  - Word quizzes (provide the word matching a definition)
  - Definition quizzes (provide the definition matching a word)
  - Mixed quizzes (combination of both)
- Configurable number of questions
- Random question order option
- Multiple correct definitions support

### Interactive Quiz Experience
- Real-time feedback on answers
- Progress tracking
- Keyboard navigation support
- Display of all possible correct answers for definition questions

### Results and Reports
- Score calculation and performance metrics
- PDF export with certificate and detailed results
- Option to retry with new quiz settings

## Performance Optimizations

The application uses various performance optimizations to ensure a smooth user experience:

- **Lazy Loading**: Quiz interface and PDF generation components are loaded only when needed
- **Dynamic Imports**: Heavy libraries like jsPDF are loaded on-demand
- **Bundle Size Management**: Careful budget configuration to keep initial load times fast
- **Loading Indicators**: Visual feedback during potentially long operations
- **Local Processing**: All data processing happens client-side to avoid network latency

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Angular CLI (v17 or higher)

### Installation
1. Clone the repository
   ```
   git clone https://github.com/aieatassam/vocabulary-quiz.git
   cd vocabulary-quiz/vocab-quiz
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Start the development server
   ```
   ng serve
   ```

4. Open your browser to `http://localhost:4200`

### Building for Production
```
ng build --configuration production
```

## Technologies Used

- **Frontend**: Angular 17+, TypeScript, SCSS
- **UI Components**: Angular Material
- **PDF Generation**: jsPDF, html2canvas
- **AI Integration**: OpenAI API
- **Image Handling**: Browser APIs, Canvas
- **Storage**: LocalStorage, SessionStorage

## License

This project is licensed under the terms included in the [LICENSE](LICENSE) file. 