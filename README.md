<a name="readme-top"></a>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <h3 align="center">Retro Snake</h3>

  <p align="center">
    A modern, sleek, and juicy take on the classic Nokia 3300 Snake game, built for both Web and Mobile.
    <br />
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#features">Features</a></li>
    <li><a href="#license">License</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->
## About The Project

![Retro Snake Gameplay Demo](file:///Users/anirudhkuthiala/.gemini/antigravity/brain/c80ed8c0-be18-4fd1-be57-fbb62cba87cb/snake_game_test_1772936179412.webp)

Retro Snake is an homage to the legendary mobile game we all know and love, but built with a modern web stack and "juicy" game feel. It features a glowing dark-mode aesthetic, progressive difficulty, and responsive controls designed to feel authentic whether you're using a mechanical keyboard or swiping on your smartphone.

### Built With

* [![React][React.js]][React-url]
* [![Vite][Vite.js]][Vite-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->
## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

You will need Node.js and npm installed on your machine.
* npm
  ```sh
  npm install npm@latest -g
  ```

### Installation

1. Clone the repo (or download the source code)
   ```sh
   git clone https://github.com/your_username/retro-snake.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
3. Run the development server
   ```sh
   npm run dev
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- FEATURES -->
## Features

*   **Responsive Controls:** W/A/S/D or Arrow Keys for desktop, and fluid Swipe Gestures / On-Screen D-Pad for mobile.
*   **Progressive Difficulty:** The snake's speed increases by ~15% for every 5 apples eaten.
*   **Combo Meter:** Eat apples rapidly to stack a score multiplier (up to 4x) for massive points.
*   **Shrink Food (Blue Pill):** A rare item that shrinks your tail by 3 segments without penalizing your score.
*   **Arcade High Scores:** A persistent, local top-5 leaderboard using an arcade-style 3-letter initial entry system.
*   **Juicy Feedback:** Screen shakes, haptic vibrations (on supported mobile devices), glowing neon visuals, and Retro Arcade audio generated via the Web Audio API.
*   **Unlockable Themes:** Unlock dynamic color palettes (Cyberpunk, Retro Nokia, Ghost) as you reach higher scores.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Vite.js]: https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white
[Vite-url]: https://vitejs.dev/
