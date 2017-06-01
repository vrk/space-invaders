class Rectangle {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  detectCollision(other) {
    const myLeftX = this.x;
    const myRightX = this.x + this.width;
    const myTopY = this.y;
    const myBottomY = this.y + this.height;

    const otherLeftX = other.x;
    const otherRightX = other.x + other.width;
    const otherTopY = other.y;
    const otherBottomY = other.y + other.height;

    // Miss left: |-----|  *****
    // If my box starts after their box ends:
    if (myLeftX > otherRightX) {
      return false;
    }

    // Miss right: *****  |----|
    // If their box starts after my box ends:
    if (otherLeftX > myRightX) {
      return false;
    }

    // If my box starts below their box:
    if (myTopY > otherBottomY) {
      return false;
    }

    // If their box starts below my box:
    if (otherTopY > myBottomY) {
      return false;
    }

    // Otherwise, there must be a collision
    return true;
  }
}
