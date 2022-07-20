export class Board {
  constructor({ width, height }) {
    this.width = width;
    this.height = height;
  }

  //TODO add functions as needed
}

/*
3,4 - 3,5
check vert wall (3,5)

3,4 - 4,4
check horiz wall (4,4)

 _ _ _ _ _ _
|_|_|_|_|_|_|
|_|_|_|_|_|_|
|_|_|_|_|_|_|
|_|_|_|_|_|_|
|_|_|_|_|_|_|
|_|_|_|_|_|_|
|_|_|_|_|_|_|
|_|_|_|_|_|_|


function:

getAllWalls()

wallToCoords() (2,2) - (2,3)

isMoveValid(loc1 loc2)
*/
