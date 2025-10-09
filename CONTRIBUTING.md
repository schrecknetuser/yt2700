# Contributing to YT2700

Thank you for your interest in contributing to YT2700! This document provides guidelines for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the issue, not the person
- Help others learn and grow

## Getting Started

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/yt2700.git
   cd yt2700
   ```

2. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow the existing code style
   - Add comments where necessary
   - Update documentation

4. **Test your changes**
   - Build the project in Xcode
   - Test on simulator
   - Test on device if possible
   - Ensure no regressions

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "Brief description of changes"
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**
   - Describe your changes
   - Reference any related issues
   - Include screenshots for UI changes

## Development Guidelines

### Code Style

**Swift Style Guide**
- Use Swift naming conventions (camelCase for variables, PascalCase for types)
- Prefer `let` over `var` when possible
- Use meaningful variable names
- Keep functions focused and small
- Maximum line length: 120 characters

**Example:**
```swift
// Good
func fetchTracks(sortedBy sortOrder: SortOrder) -> [Track] {
    let request: NSFetchRequest<TrackEntity> = TrackEntity.fetchRequest()
    request.sortDescriptors = [sortOrder.sortDescriptor]
    return try? context.fetch(request).map { $0.toTrack() } ?? []
}

// Avoid
func getTracks(s: Int) -> [Track] {
    let r: NSFetchRequest<TrackEntity> = TrackEntity.fetchRequest()
    r.sortDescriptors = [s == 0 ? NSSortDescriptor(key: "name", ascending: true) : NSSortDescriptor(key: "date", ascending: false)]
    return try? context.fetch(r).map { $0.toTrack() } ?? []
}
```

### SwiftUI Guidelines

- Use `@State` for view-local state
- Use `@StateObject` for object ownership
- Use `@ObservedObject` for object observation
- Use `@EnvironmentObject` for shared state
- Extract complex views into separate components

**Example:**
```swift
// Good - Extracted component
struct TrackListView: View {
    let tracks: [Track]
    
    var body: some View {
        List(tracks) { track in
            TrackRow(track: track)
        }
    }
}

// Avoid - Everything in one view
struct LibraryView: View {
    var body: some View {
        // 500 lines of code...
    }
}
```

### Architecture

Follow the existing architecture:
- **Models**: Data structures and Core Data entities
- **Views**: SwiftUI view components
- **Services**: Business logic and API integrations
- **CarPlay**: CarPlay-specific code

### File Organization

```
YT2700/
├── Models/
│   └── YourModel.swift
├── Views/
│   └── YourView.swift
├── Services/
│   └── YourService.swift
└── CarPlay/
    └── YourCarPlayComponent.swift
```

## What to Contribute

### High Priority
- YouTube API integration (see TODO.md)
- Download manager implementation
- Audio extraction implementation
- Error handling improvements

### Medium Priority
- UI/UX improvements
- Performance optimizations
- Additional features from requirements
- Bug fixes

### Low Priority
- Code refactoring
- Documentation improvements
- Example code
- Test coverage

## Pull Request Guidelines

### PR Title Format
```
[Type] Brief description

Types:
- Feature: New functionality
- Fix: Bug fix
- Refactor: Code refactoring
- Docs: Documentation changes
- Test: Test additions/changes
- Perf: Performance improvements
```

**Examples:**
- `[Feature] Add YouTube playlist import`
- `[Fix] Resolve CarPlay connection issue`
- `[Refactor] Improve AudioPlayerService architecture`

### PR Description Template
```markdown
## Description
Brief description of what this PR does

## Changes
- Change 1
- Change 2
- Change 3

## Testing
- [ ] Tested on simulator
- [ ] Tested on device
- [ ] Tested CarPlay functionality
- [ ] No regressions found

## Screenshots (if applicable)
[Add screenshots here]

## Related Issues
Closes #123
```

## Commit Message Guidelines

Use clear, descriptive commit messages:

```bash
# Good
git commit -m "Add shuffle functionality to playlist view"
git commit -m "Fix crash when deleting last track in queue"
git commit -m "Improve search performance with indexed queries"

# Avoid
git commit -m "fix"
git commit -m "changes"
git commit -m "update"
```

## Testing Requirements

### Before Submitting PR
- [ ] Code compiles without warnings
- [ ] All existing features still work
- [ ] New feature works as expected
- [ ] UI is responsive and looks good
- [ ] No memory leaks
- [ ] CarPlay functionality tested (if applicable)

### Test Checklist
- [ ] Test on iPhone simulator
- [ ] Test on iPad simulator
- [ ] Test on physical device (if possible)
- [ ] Test in light mode
- [ ] Test in dark mode
- [ ] Test with VoiceOver (accessibility)
- [ ] Test with different screen sizes

## Documentation Requirements

When adding new features:
1. Update README.md if needed
2. Update ARCHITECTURE.md for architectural changes
3. Update QUICKSTART.md for user-facing features
4. Add code comments for complex logic
5. Include docstrings for public APIs

**Example:**
```swift
/// Downloads a track from YouTube and saves it to local storage
/// - Parameters:
///   - track: The track to download
///   - quality: Desired audio quality (default: .high)
/// - Returns: URL of the downloaded file, or nil if download failed
/// - Throws: DownloadError if the download fails
func downloadTrack(_ track: Track, quality: AudioQuality = .high) async throws -> URL? {
    // Implementation
}
```

## Issue Reporting

### Bug Reports
Include:
- iOS version
- Device model
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots/logs if applicable

**Template:**
```markdown
**Environment:**
- iOS Version: 16.0
- Device: iPhone 14 Pro
- App Version: 1.0

**Steps to Reproduce:**
1. Open Library view
2. Select multiple tracks
3. Tap "Delete from Library"

**Expected:**
Tracks should be deleted

**Actual:**
App crashes

**Logs:**
[Paste crash log here]
```

### Feature Requests
Include:
- Use case description
- Proposed solution
- Alternative solutions considered
- Impact on existing features

## Code Review Process

### What We Look For
- Code quality and readability
- Adherence to Swift best practices
- Proper error handling
- Performance implications
- Security considerations
- Accessibility support
- Test coverage

### Review Timeline
- Small PRs: 1-2 days
- Medium PRs: 3-5 days
- Large PRs: 1-2 weeks

## Questions?

- Create an issue for general questions
- Use discussions for design decisions
- Tag maintainers for urgent issues

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

## Recognition

Contributors will be acknowledged in:
- CONTRIBUTORS.md file
- Release notes
- Project documentation

Thank you for contributing to YT2700! 🎵
