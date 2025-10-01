# Contributing to YT2700

Thank you for your interest in contributing to YT2700! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive feedback
- Respect differing viewpoints and experiences

## Getting Started

1. **Fork the repository**
   - Click the "Fork" button on GitHub
   - Clone your fork locally

2. **Set up development environment**
   ```bash
   git clone https://github.com/YOUR_USERNAME/yt2700.git
   cd yt2700
   npm install --legacy-peer-deps
   ```

3. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

## Development Workflow

### Running the App

```bash
# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on web
npm run web
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Type checking
npx tsc --noEmit
```

### Code Style

- We use TypeScript for type safety
- Follow existing code style and conventions
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### Commit Messages

Follow conventional commits format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(library): add ability to sort tracks by date
fix(playback): resolve issue with shuffle mode
docs(readme): update installation instructions
```

## What to Contribute

### Priority Areas

1. **YouTube Integration**
   - Implement real YouTube Data API integration
   - Add OAuth authentication
   - Improve search functionality

2. **Audio Playback**
   - Implement actual audio playback using Expo AV
   - Add background playback support
   - Implement lock screen controls

3. **Download Functionality**
   - Implement real download functionality
   - Add progress tracking UI
   - Handle download errors gracefully

4. **CarPlay & Android Auto**
   - Implement CarPlay integration
   - Implement Android Auto integration
   - Add vehicle-specific UI templates

5. **Testing**
   - Add more unit tests
   - Add integration tests
   - Add E2E tests

6. **Documentation**
   - Improve API documentation
   - Add more code examples
   - Create video tutorials

### Bug Reports

When reporting bugs, include:

- **Description**: Clear description of the issue
- **Steps to reproduce**: Detailed steps
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Environment**: 
  - OS and version
  - App version
  - Device model (if on physical device)
- **Screenshots**: If applicable
- **Logs**: Relevant console logs or error messages

### Feature Requests

When requesting features, include:

- **Use case**: Why is this feature needed?
- **Description**: Detailed description of the feature
- **Alternatives**: Any alternative solutions considered
- **Examples**: Similar features in other apps
- **Mockups**: UI mockups if applicable

## Pull Request Process

1. **Update your branch**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Test your changes**
   ```bash
   npm test
   npx tsc --noEmit
   ```

3. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

4. **Create Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your branch
   - Fill in the PR template

5. **PR Description should include**
   - What changes were made
   - Why these changes were made
   - How to test the changes
   - Screenshots/videos if UI changes
   - Related issues (use `Fixes #123` or `Relates to #123`)

6. **Code Review**
   - Address review comments
   - Update your PR as needed
   - Be patient and respectful

## Project Structure

```
yt2700/
├── src/
│   ├── components/      # Reusable UI components
│   ├── screens/         # Screen components
│   ├── navigation/      # Navigation configuration
│   ├── contexts/        # React Context providers
│   ├── services/        # Business logic and API services
│   ├── models/          # TypeScript interfaces
│   ├── config/          # App configuration
│   ├── utils/           # Utility functions
│   ├── hooks/           # Custom React hooks
│   └── __tests__/       # Test files
├── assets/              # Images, fonts, etc.
├── App.tsx             # Root component
└── package.json        # Dependencies
```

## Coding Guidelines

### TypeScript

- Use strict TypeScript mode
- Define proper types and interfaces
- Avoid `any` type when possible
- Use generics appropriately

### React/React Native

- Use functional components with hooks
- Use memo/useMemo/useCallback for optimization
- Keep components focused and small
- Use proper prop types

### State Management

- Use Context API for global state
- Keep local state when possible
- Use proper state initialization
- Handle loading and error states

### Error Handling

- Use try-catch for async operations
- Provide meaningful error messages
- Log errors appropriately
- Handle edge cases

### Performance

- Optimize list rendering with keys
- Use FlatList for large lists
- Implement lazy loading when needed
- Optimize image loading

## Testing Guidelines

### Unit Tests

- Test individual functions and components
- Mock external dependencies
- Cover edge cases
- Aim for good coverage

### Integration Tests

- Test component interactions
- Test navigation flows
- Test state management

### Example Test

```typescript
import { StorageService } from '../../services/StorageService';
import { Track } from '../../models/Track';

describe('StorageService', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('should save and retrieve tracks', async () => {
    const track: Track = {
      id: 'test-id',
      title: 'Test Track',
      // ... other properties
    };

    await StorageService.addTrack(track);
    const tracks = await StorageService.getTracks();

    expect(tracks).toHaveLength(1);
    expect(tracks[0].id).toBe('test-id');
  });
});
```

## Documentation

- Update README.md when needed
- Document new APIs and functions
- Add JSDoc comments for public APIs
- Update CHANGELOG.md

## Legal

### License

By contributing, you agree that your contributions will be licensed under the MIT License.

### Copyright

- You retain copyright of your contributions
- You grant the project a license to use your contributions
- Ensure you have rights to contribute the code

## Questions?

- Open an issue for questions
- Check existing issues first
- Be specific and provide context

## Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes
- Project documentation

Thank you for contributing to YT2700! 🎵
