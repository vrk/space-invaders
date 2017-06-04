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

    const otherLeftX = other.x;
    const otherRightX = other.x + other.width;

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
    if (this.isBelow(other)) {
      return false;
    }

    // If their box starts below my box:
    if (this.isAbove(other)) {
      return false;
    }

    // Otherwise, there must be a collision
    return true;
  }

  intersectsX(other) {
    const myLeftX = this.x;
    const myRightX = this.x + this.width;

    const otherLeftX = other.x;
    const otherRightX = other.x + other.width;

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
    return true;
  }

  isAbove(other) {
    const myBottomY = this.y + this.height;
    const otherTopY = other.y;
    return otherTopY > myBottomY;
  }

  isBelow(other) {
    const myTopY = this.y;
    const otherBottomY = other.y + other.height;
    return myTopY > otherBottomY;
  }
}
