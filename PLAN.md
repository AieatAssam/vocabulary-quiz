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
   - Store in memory for quiz generation
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
- No persistent storage
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
- [x] Create configuration service
- [x] Build API settings component
- [x] Implement API key management
- [x] Add model selection interface
- [x] Create endpoint configuration

### 3. Image Processing Module
- [x] Create image upload component
- [ ] Implement camera capture functionality
- [ ] Add image preview component
- [ ] Implement basic image validation

### 4. Vocabulary Processing Module
- [ ] Create OpenAI service
- [ ] Implement vocabulary extraction
- [ ] Add vocabulary validation
- [ ] Add vocabulary visualisation
- [ ] Create vocabulary storage service
- [ ] Implement error handling

### 5. Quiz Configuration Module
- [ ] Create quiz settings component
- [ ] Implement quiz type selection
- [ ] Add question count configuration
- [ ] Create quiz generation service
- [ ] Implement semantic matching logic

### 6. Quiz Interface Module
- [ ] Create quiz display component
- [ ] Implement question navigation
- [ ] Add answer input components
- [ ] Create progress tracking
- [ ] Implement real-time validation

### 7. Results Module
- [ ] Create results display component
- [ ] Implement score calculation
- [ ] Add error reporting
- [ ] Create export functionality
- [ ] Implement new quiz generation

### 8. Shared Components
- [ ] Create header component
- [ ] Implement loading indicators
- [ ] Add error messages
- [ ] Create confirmation dialogs
- [ ] Implement responsive layout

### 9. Testing & Documentation
- [ ] Write unit tests
- [ ] Add integration tests
- [ ] Create user documentation
- [ ] Add inline code documentation
- [ ] Perform accessibility testing

### 10. Final Steps
- [ ] Optimize performance
- [ ] Add error boundaries
- [ ] Implement offline support
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