import { describe, it, expect } from 'vitest';
import { generateFood, checkCollision, BOARD_SIZE } from './App';

describe('Snake Game Logic', () => {
    describe('checkCollision', () => {
        const defaultSnake = [
            { x: 10, y: 10 },
            { x: 10, y: 11 },
            { x: 10, y: 12 },
        ];

        it('should return false for safe moves', () => {
            expect(checkCollision({ x: 10, y: 9 }, defaultSnake)).toBe(false);
            expect(checkCollision({ x: 9, y: 10 }, defaultSnake)).toBe(false);
            expect(checkCollision({ x: 11, y: 10 }, defaultSnake)).toBe(false);
        });

        it('should return true when hitting the wall', () => {
            expect(checkCollision({ x: -1, y: 10 }, defaultSnake)).toBe(true);
            expect(checkCollision({ x: BOARD_SIZE, y: 10 }, defaultSnake)).toBe(true);
            expect(checkCollision({ x: 10, y: -1 }, defaultSnake)).toBe(true);
            expect(checkCollision({ x: 10, y: BOARD_SIZE }, defaultSnake)).toBe(true);
        });

        it('should return true when colliding with itself', () => {
            // Intentionally pass head coords that match a body segment
            expect(checkCollision({ x: 10, y: 11 }, defaultSnake)).toBe(true);
            expect(checkCollision({ x: 10, y: 12 }, defaultSnake)).toBe(true);
        });
    });

    describe('generateFood', () => {
        const snake = [
            { x: 0, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: 2 },
        ];

        it('should generate food within the board limits', () => {
            for (let i = 0; i < 100; i++) {
                const food = generateFood(snake);
                expect(food.x).toBeGreaterThanOrEqual(0);
                expect(food.x).toBeLessThan(BOARD_SIZE);
                expect(food.y).toBeGreaterThanOrEqual(0);
                expect(food.y).toBeLessThan(BOARD_SIZE);
            }
        });

        it('should not generate food on the snake', () => {
            // Create a snake that takes up the entire board except one spot (19, 19)
            const massiveSnake = [];
            for (let y = 0; y < BOARD_SIZE; y++) {
                for (let x = 0; x < BOARD_SIZE; x++) {
                    if (x === 19 && y === 19) continue;
                    massiveSnake.push({ x, y });
                }
            }

            const food = generateFood(massiveSnake);
            expect(food.x).toBe(19);
            expect(food.y).toBe(19);
        });
    });
});
