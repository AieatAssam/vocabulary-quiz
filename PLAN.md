# Vocabulary Quiz Application Plan

## Functional Specification

### Core Features
1. **Image Processing**
   - Upload image of vocabulary sheet
   - Take picture using device camera
   - Support for common image formats (JPG, PNG)

2. **OpenAI Integration**
   - Configuration for API key
   - Optional custom API endpoint (for OpenRouter)
   - Model selection (default: GPT-4o-mini)
   - Error handling for API failures

3. **Vocabulary Processing**
   - Extract words and definitions from image
   - Validate two-column format
   - Store in localStorage for quiz generation
   - Support for multiple languages

4. **Quiz Generation**
   - Configurable quiz types:
     - Word-only quiz
     - Definition-only quiz
     - Mixed quiz
   - Semantic matching for definitions
   - Spelling validation
   - Random question order
   - Configurable number of questions

5. **Quiz Interface**
   - Interactive quiz display
   - Input validation
   - Real-time feedback
   - Progress tracking
   - Timer (optional)

6. **Results & Reporting**
   - Score calculation
   - Error reporting
   - Export functionality (PDF/CSV)
   - Option to generate new quiz
   - Review of incorrect answers

### Technical Requirements
- Angular 17+ frontend
- Responsive design
- No backend required
- Local storage for vocabulary persistence
- Client-side image processing
- Secure API key handling

## Component Checklist

### 1. Project Setup
- [x] Initialize Angular project
- [x] Set up routing
- [x] Configure environment files
- [x] Set up basic styling (Angular Material or similar)
- [x] Create basic layout components

### 2. Configuration Module
- [x] Create configuration service (persist API configuration in session storage)
- [x] Build API settings component
- [x] Implement API key management
- [x] Add model selection interface
- [x] Create endpoint configuration

### 3. Image Processing Module
- [x] Create image upload component (with integrated preview)
- [x] Implement camera capture functionality (with integrated preview)
- [x] Implement basic image validation (file type validation sufficient)

### 4. Vocabulary Processing Module
- [x] Create OpenAI service
- [x] Implement vocabulary extraction
- [x] Add vocabulary validation
- [x] Add vocabulary visualisation
- [x] Create vocabulary storage service
- [x] Implement error handling
- [x] Store vocabulary in localStorage for persistence

### 5. Quiz Configuration Module
- [x] Create quiz settings component
- [x] Add question count configuration
- [x] Create quiz generation service
- [x] Implement randomization and quiz type options
- [x] Implement multiple definition support
- [ ] Implement semantic matching logic

### 6. Quiz Interface Module
- [x] Create quiz display component
- [x] Implement question navigation
- [x] Add answer input components
- [x] Create progress tracking
- [x] Implement real-time validation
- [x] Add keyboard navigation (Enter key support)

### 7. Results Module
- [x] Create results display component
- [x] Implement score calculation
- [x] Add basic error reporting
- [x] Create export functionality (PDF certificate and detailed results)
- [x] Implement new quiz generation

### 8. Shared Components
- [x] Create header component
- [~] Implement loading indicators (present in some components)
- [~] Add error messages (present in some components)
- [ ] Create confirmation dialogs
- [x] Implement responsive layout

### 9. Testing & Documentation
- [~] Write unit tests (default Angular test present)
- [ ] Add integration tests
- [ ] Create user documentation
- [~] Add inline code documentation (present in some components)
- [ ] Perform accessibility testing

### 10. Final Steps
- [ ] Optimize performance
- [x] Add type safety and error boundaries
- [x] Implement offline support (via localStorage)
- [ ] Add analytics (optional)
- [ ] Create deployment configuration

## Development Guidelines

### Code Organization
- Follow Angular best practices
- Use lazy loading for modules
- Implement proper error handling
- Follow TypeScript best practices
- Use proper typing for all components

### Security Considerations
- Never store API keys in local storage
- Implement proper CORS handling
- Validate all user inputs
- Sanitize image data
- Handle API errors gracefully

### Performance Considerations
- Optimize image processing
- Implement proper caching
- Use proper Angular change detection
- Optimize bundle size
- Implement proper loading states

### User Experience
- Provide clear error messages
- Implement proper loading states
- Add helpful tooltips
- Ensure responsive design
- Implement proper keyboard navigation

## Completed Tasks

- [x] Initialize Angular project
- [x] Set up routing
- [x] Configure environment files
- [x] Set up basic styling (Angular Material or similar)
- [x] Create basic layout components
- [x] Create configuration service (persist API configuration in session storage)
- [x] Build API settings component
- [x] Implement API key management
- [x] Add model selection interface
- [x] Create endpoint configuration
- [x] Create image upload component (with integrated preview)
- [x] Implement camera capture functionality (with integrated preview)
- [x] Implement basic image validation (file type validation sufficient)
- [x] Create OpenAI service
- [x] Implement vocabulary extraction
- [x] Add vocabulary validation
- [x] Add vocabulary visualisation
- [x] Create vocabulary storage service
- [x] Implement error handling
- [x] Store vocabulary in localStorage for persistence
- [x] Create quiz settings component
- [x] Add question count configuration
- [x] Create quiz generation service
- [x] Implement randomization and quiz type options
- [x] Create quiz interface component
- [x] Implement question navigation with keyboard support
- [x] Add answer input components with validation
- [x] Create progress tracking
- [x] Implement real-time feedback with all possible answers
- [x] Create results display component
- [x] Implement score calculation
- [x] Add new quiz generation functionality
- [x] Support multiple valid definitions for questions
- [x] Implement PDF export with certificate and detailed results
- [x] Optimize bundle size through lazy loading and dynamic imports

## In Progress Tasks

- [ ] Implement semantic matching logic for answers
- [ ] Create confirmation dialogs
- [ ] Add comprehensive documentation

## Implementation Plan

### Enhanced Quiz Experience

- Add semantic matching for definitions to allow for minor spelling/wording differences
- Implement a confirmation dialog when quitting a quiz
- Add export functionality for quiz results as PDF or CSV
- Create incorrect answer review functionality
- Enhance keyboard navigation with additional shortcuts

### Relevant Files

- src/app/vocabulary-visualisation.component.ts - Displays and validates vocabulary visually
- src/app/vocabulary-storage.service.ts - Stores and validates vocabulary data in localStorage
- src/app/quiz-settings.component.ts - Configures quiz settings (type, count, randomization)
- src/app/quiz.service.ts - Generates and manages quizzes from vocabulary data
- src/app/quiz-interface.component.ts - Handles the quiz interface, navigation, and feedback 