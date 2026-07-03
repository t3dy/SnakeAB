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

    // Draw grid under entities
    this.drawGrid(world.width, world.height);

    // Draw entities
    for (const tile of world.tiles) {
      for (const entity of tile.entities) {
        if (entity.type === 'snake') continue; // Drawn last, on top
        this.drawEntity(tile, entity);
      }
    }

    // Draw snake on top of everything
    this.drawSnake(snake);
  }

  /**
   * Draw the snake with a rounded body and directional eyes
   */
  drawSnake(snake) {
    const x = this.offsetX + snake.x * this.cellSize;
    const y = this.offsetY + snake.y * this.cellSize;
    const s = this.cellSize;

    // Body
    this.ctx.fillStyle = '#3ddc84';
    this.ctx.strokeStyle = '#1a7a44';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    if (this.ctx.roundRect) {
      this.ctx.roundRect(x + 1.5, y + 1.5, s - 3, s - 3, s / 4);
    } else {
      this.ctx.rect(x + 1.5, y + 1.5, s - 3, s - 3);
    }
    this.ctx.fill();
    this.ctx.stroke();

    // Eyes positioned by facing direction
    const eyeOffsets = {
      right: [{ x: 0.65, y: 0.3 }, { x: 0.65, y: 0.7 }],
      left: [{ x: 0.35, y: 0.3 }, { x: 0.35, y: 0.7 }],
      up: [{ x: 0.3, y: 0.35 }, { x: 0.7, y: 0.35 }],
      down: [{ x: 0.3, y: 0.65 }, { x: 0.7, y: 0.65 }],
    };
    const eyes = eyeOffsets[snake.facing] || eyeOffsets.right;
    const eyeR = Math.max(1.5, s * 0.09);

    for (const eye of eyes) {
      this.ctx.fillStyle = '#0a0a0a';
      this.ctx.beginPath();
      this.ctx.arc(x + s * eye.x, y + s * eye.y, eyeR, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Low-health flash: red tint overlay
    if (snake.maxHealth && snake.health / snake.maxHealth <= 0.3) {
      this.ctx.fillStyle = 'rgba(255, 40, 40, 0.35)';
      this.ctx.beginPath();
      if (this.ctx.roundRect) {
        this.ctx.roundRect(x + 1.5, y + 1.5, s - 3, s - 3, s / 4);
      } else {
        this.ctx.rect(x + 1.5, y + 1.5, s - 3, s - 3);
      }
      this.ctx.fill();
    }
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

    // Goal gets a pulsing glow ring
    if (entity.type === 'goal') {
      const pulse = 0.75 + 0.25 * Math.sin(Date.now() / 300);
      this.ctx.strokeStyle = `rgba(0, 255, 100, ${pulse})`;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(
        canvasX + this.cellSize / 2,
        canvasY + this.cellSize / 2,
        this.cellSize / 2.2,
        0,
        Math.PI * 2
      );
      this.ctx.stroke();
    }

    // Draw entity marker
    this.ctx.fillStyle = color;
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.arc(
      canvasX + this.cellSize / 2,
      canvasY + this.cellSize / 2,
      this.cellSize / 3,
      0,
      Math.PI * 2
    );
    this.ctx.fill();
    this.ctx.stroke();

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
