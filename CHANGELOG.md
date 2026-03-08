# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2024-03-07

### Added
- Vitest regression testing suite for core game logic (`checkCollision`, `generateFood`).
- Combo Timer mechanics: Multiplier increases (up to 4x) when eating apples rapidly.
- Shrink Food mechanics: 10% chance to spawn a blue pill that safely shrinks the snake by 3 segments when length > 8.

### Fixed
- Fixed a bug on mobile devices where food could spawn off-screen by replacing hardcoded pixel sizes with dynamic CSS `calc` variables.
- Fixed an overlapping UI layout issue in the Game Over modal on smaller screens. 

## [1.0.0] - 2024-03-07

### Added
- Initial Release of Retro Snake.
- Core gameplay loop: movement, eating apples, growing, collision detection.
- Progressive difficulty (speed increases as snake grows).
- Desktop controls (Arrow keys, WASD) and Mobile controls (On-screen D-pad, swipe gestures).
- Local high-score persistence with Arcade-style 3-letter initials.
- Web Audio API retro sound effects.
- Unlockable aesthetic themes based on score milestones.
