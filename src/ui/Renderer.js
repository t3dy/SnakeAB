/**
 * Renderer — Canvas-based world rendering
 * Phase 1: Basic grid rendering
 */

import { TERRAIN_PROPS } from '../world/Terrain.js';

export class Renderer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');

    // Calculate cell size based on canvas size and world dimensions
    this.cellSize = 20; // 20x20 pixel cells
    this.offsetX = 5;
    this.offsetY = 5;
  }

  /**
   * Render game state
   */
  render(state) {
    const { world, snake } = state;

    // Clear canvas
    this.ctx.fillStyle = '#1a1a1a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw tiles
    for (const tile of world.tiles) {
      this.drawTile(tile);
    }

    // Draw snake
    const snakeX = this.offsetX + snake.x * this.cellSize;
    const snakeY = this.offsetY + snake.y * this.cellSize;

    this.ctx.fillStyle = '#4a9eff';
    this.ctx.fillRect(snakeX, snakeY, this.cellSize, this.cellSize);
    this.ctx.strokeStyle = '#fff';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(snakeX, snakeY, this.cellSize, this.cellSize);

    // Draw entities
    for (const tile of world.tiles) {
      for (const entity of tile.entities) {
        if (entity.type === 'snake') continue; // Already drawn
        this.drawEntity(tile, entity);
      }
    }

    // Draw grid
    this.drawGrid(world.width, world.height);
  }

  /**
   * Draw a single tile
   */
  drawTile(tile) {
    const { x, y, terrain } = tile;
    const props = TERRAIN_PROPS[terrain];

    if (!props) return;

    const canvasX = this.offsetX + x * this.cellSize;
    const canvasY = this.offsetY + y * this.cellSize;

    this.ctx.fillStyle = props.color;
    this.ctx.fillRect(canvasX, canvasY, this.cellSize, this.cellSize);

    // Draw emoji if it fits
    if (this.cellSize >= 15) {
      this.ctx.font = `${Math.floor(this.cellSize * 0.7)}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(
        props.emoji,
        canvasX + this.cellSize / 2,
        canvasY + this.cellSize / 2
      );
    }
  }

  /**
   * Draw an entity on a tile
   */
  drawEntity(tile, entity) {
    const { x, y } = tile;
    const canvasX = this.offsetX + x * this.cellSize;
    const canvasY = this.offsetY + y * this.cellSize;

    const colors = {
      food: '#ffff00',
      medicine: '#00ff00',
      treasure: '#ffff00',
      predator: '#ff6600',
      goal: '#00ff00',
      npc: '#ff00ff',
      trap: '#ff0000',
      hazard: '#ff0088',
    };

    const icons = {
      food: '🍎',
      medicine: '💊',
      treasure: '💰',
      predator: '🐺',
      goal: '🏁',
      npc: '🧙',
      trap: '⚠️',
      hazard: '🔥',
    };

    const color = colors[entity.type] || '#fff';
    const icon = icons[entity.type] || '?';

    // Draw entity marker
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(
      canvasX + this.cellSize / 2,
      canvasY + this.cellSize / 2,
      this.cellSize / 3,
      0,
      Math.PI * 2
    );
    this.ctx.fill();

    // Draw icon
    if (this.cellSize >= 12) {
      this.ctx.font = `${Math.floor(this.cellSize * 0.6)}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(icon, canvasX + this.cellSize / 2, canvasY + this.cellSize / 2);
    }
  }

  /**
   * Draw grid lines
   */
  drawGrid(width, height) {
    this.ctx.strokeStyle = '#333';
    this.ctx.lineWidth = 0.5;

    // Vertical lines
    for (let x = 0; x <= width; x++) {
      const canvasX = this.offsetX + x * this.cellSize;
      this.ctx.beginPath();
      this.ctx.moveTo(canvasX, this.offsetY);
      this.ctx.lineTo(canvasX, this.offsetY + height * this.cellSize);
      this.ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= height; y++) {
      const canvasY = this.offsetY + y * this.cellSize;
      this.ctx.beginPath();
      this.ctx.moveTo(this.offsetX, canvasY);
      this.ctx.lineTo(this.offsetX + width * this.cellSize, canvasY);
      this.ctx.stroke();
    }
  }
}
