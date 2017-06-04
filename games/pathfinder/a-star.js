// Aliases
var TextureCache = PIXI.utils.TextureCache,
   AutoDetectRenderer = PIXI.autoDetectRenderer,
   Resources = PIXI.loader.resources,
   Container = PIXI.Container,
   Sprite = PIXI.Sprite,
   Loader = PIXI.loader,
   Graphics = PIXI.Graphics;

var map = {
   width: 24,
   height: 24,
   tileWidth: 40,
   tileHeight: 40,
   grid: [],
   setPosition: function(object, x, y) {
      if (x < this.width && y < this.height) {
         object.position.set(x * this.tileWidth, y * this.tileHeight);
         object.pos.x = x;
         object.pos.y = y;
      }
   },
   add: function(object, x, y) {
      if (x < this.width && y < this.height) {
         object.position.set(x * this.tileWidth, y * this.tileHeight);
         object.pos = {
            x: x,
            y: y
         };
         stage.addChild(object);
      }
   },
   getPosition: function(object) {
      return { 
         x: Math.floor(object.x / tileWidth), 
         y: Math.floor(object.y / tileHeight) };
   }
};

var Tile = Object.freeze({
   EMPTY: 0,
   WALL: 1
});

function Node(x, y, background, tile) {
   this.x = x;
   this.y = y;
   this.background = background;
   this.tile = tile || Tile.EMPTY;
}

Node.prototype = {
   setBackgroundColor: function(color) {
      var bg = this.background;
      if (bg) {
         bg.clear();
         bg.lineStyle(2, 0x113344, 1);
         bg.beginFill(color);
         bg.drawRect(0, 0, map.tileWidth, map.tileHeight);
      }
   }
}

var renderer = AutoDetectRenderer(map.width * map.tileWidth, map.height * map.tileHeight);

document.body.appendChild(renderer.view);

var stage = new Container();

var state, cat, milk, path;

// temp vars meant to be reused
var scaleX, scaleY, i, j, tile, rectangle, node;

var pathFound = false;
var result;

PIXI.loader
   .add("cat.png")
   .add("milk.png")
   .load(setup);

function setup() {
   var grid = map.grid;
   for (i = 0; i < map.width; i++) {
      grid[i] = [];
      for (j = 0; j < map.height; j++) {
         rectangle = stage.addChild(new Graphics());
         rectangle.position.set(i * map.tileWidth, j * map.tileHeight);
         node = grid[i][j] = new Node(i, j, rectangle);

         grid[i][j].setBackgroundColor(0x4499dd);
      }
   }

   milk = new Sprite(
      Resources["milk.png"].texture
   );

   cat = new Sprite(
      Resources["cat.png"].texture
   );

   scaleX = map.tileWidth / cat.width;
   scaleY = map.tileHeight / cat.height;
   cat.scale.set(scaleX, scaleY);
   cat.moveDelay = 15;
   cat.currentDelay = cat.moveDelay;

   scaleX = map.tileWidth / milk.width;
   scaleY = map.tileHeight / milk.height;
   milk.scale.set(scaleX, scaleY);

   var startX = randomInt(0, map.width / 2 - 4);
   var startY = randomInt(0, map.height / 2 - 4);
   var endX = randomInt(startX + map.width / 2 + 2, map.width - 1);
   var endY = randomInt(startY + map.height / 2 + 2, map.height - 1);

   var flipY = Math.random() > 0.5;
   var flipX = Math.random() > 0.5;

   if (flipX) {
      startX = map.width - 1 - startX;
      endX = map.width -1 - endX;
   }

   if (flipY) {
      startY = map.height - 1 - startY;
      endY = map.height - 1 - endY;
   }

   map.add(milk, endX, endY);
   map.add(cat, startX, startY);

   for (i = 0; i < grid.length; i++) {
      for (j = 0; j < grid[i].length; j++) {
         if ((i != cat.pos.x || j != cat.pos.y) &&
              (i != milk.pos.x || j != milk.pos.y) &&
              (Math.random() > 0.8)) {
            node = grid[i][j];
            node.tile = Tile.WALL;
            node.setBackgroundColor(0x223355);
         }
      }
   }

   var astar = new Astar(map.grid);
   var start = map.grid[cat.pos.x][cat.pos.y];
   var end = map.grid[milk.pos.x][milk.pos.y];
   path = astar.search(start, end);

   if (path.length) {
      cat.currentTarget = path.shift();
   }

   state = play;

   gameLoop();
}

function gameLoop() {
   requestAnimationFrame(gameLoop);

   state();

   renderer.render(stage);
}

function play() {
   if (cat.currentTarget) {
      if (cat.currentTarget.x == cat.pos.x && cat.currentTarget.y == cat.pos.y && path.length) {
         cat.currentTarget = path.shift();
         cat.currentDelay = cat.moveDelay;
      }
      if (cat.currentDelay-- < 0) {
         map.setPosition(cat, cat.currentTarget.x, cat.currentTarget.y);
      }
   }
}

function end() {

}

function pause() {

}

function Astar(grid) {
   this.grid = grid;
   this.diagCost = 14;
   this.defaultCost = 10;
}

Astar.prototype = {
   reset: function() {
      var grid = this.grid;

      for (var i = 0; i < grid.length; i++) {
         for (var j = 0; j < grid[i].length; j++) {
            grid[i][j].f = 0;
            grid[i][j].g = 0;
            grid[i][j].h = 0;
            grid[i][j].visited = false;
            grid[i][j].cost = this.defaultCost;
            grid[i][j].parent = null;
         }
      }
   },

   search: function(startNode, endNode) {
      this.reset();


      var openNodes = new BinaryHeap(function(node) {
         return node.f;
      });
      
      openNodes.push(startNode);

      while (openNodes.size()) {
         var currentNode = openNodes.pop();
         currentNode.setBackgroundColor(0x66bbee);
         renderer.render(stage);

         if (currentNode == endNode) {
            var node = currentNode;
            var path = [];
            while(node.parent) {
               path.push(node);
               node = node.parent;
            }
            return path.reverse();
         }

         currentNode.closed = true;

         var neighbors = this.neighbors(currentNode);

         for (var i = 0; i < neighbors.length; i++) {
            var neighbor = neighbors[i];

            if (neighbor.closed || neighbor.tile == Tile.WALL) {
               continue;
            }

            var gScore = currentNode.g + neighbor.cost;
            var alreadyVisited = neighbor.visited;

            if (!alreadyVisited || gScore < neighbor.g) {
               neighbor.visited = true;
               neighbor.parent = currentNode;
               neighbor.h = this.distance(neighbor, endNode);
               neighbor.g = gScore;
               neighbor.f = neighbor.g + neighbor.h;

               if (!alreadyVisited) {
                  openNodes.push(neighbor);
               }
               else {
                  openNodes.rescoreElement(neighbor);
               }
            }
         }
      }

      return [];
   },

   distance: function(node1, node2) {
      var dx = Math.abs(node1.x - node2.x);
      var dy = Math.abs(node1.y - node2.y);

      if (dx > dy) {
         return this.diagCost * dy + this.defaultCost * (dx - dy);
      }
      else {
         return this.diagCost * dx + this.defaultCost * (dy - dx);
      }
   },

   neighbors: function(node) {
      var neighbors = [];
      var x = node.x;
      var y = node.y;
      var grid = this.grid;

      // West
        if(grid[x-1] && grid[x-1][y]) {
            neighbors.push(grid[x-1][y]);
        }

        // East
        if(grid[x+1] && grid[x+1][y]) {
            neighbors.push(grid[x+1][y]);
        }

        // South
        if(grid[x] && grid[x][y-1]) {
            neighbors.push(grid[x][y-1]);
        }

        // North
        if(grid[x] && grid[x][y+1]) {
            neighbors.push(grid[x][y+1]);
        }

         // Southwest
         if(grid[x-1] && grid[x-1][y-1]) {
            grid[x-1][y-1].cost = this.diagCost;
            neighbors.push(grid[x-1][y-1]);
         }

         // Southeast
         if(grid[x+1] && grid[x+1][y-1]) {
            grid[x+1][y-1].cost = this.diagCost;
            neighbors.push(grid[x+1][y-1]);
         }

         // Northwest
         if(grid[x-1] && grid[x-1][y+1]) {
            grid[x-1][y+1].cost = this.diagCost;
            neighbors.push(grid[x-1][y+1]);
         }

         // Northeast
         if(grid[x+1] && grid[x+1][y+1]) {
            grid[x+1][y+1].cost = this.diagCost;
            neighbors.push(grid[x+1][y+1]);
         }

         return neighbors;
   }
};


//http://eloquentjavascript.net/1st_edition/appendix2.html
function BinaryHeap(scoreFunction){
  this.content = [];
  this.scoreFunction = scoreFunction;
}

BinaryHeap.prototype = {
  push: function(element) {
    // Add the new element to the end of the array.
    this.content.push(element);
    // Allow it to bubble up.
    this.bubbleUp(this.content.length - 1);
  },

  pop: function() {
    // Store the first element so we can return it later.
    var result = this.content[0];
    // Get the element at the end of the array.
    var end = this.content.pop();
    // If there are any elements left, put the end element at the
    // start, and let it sink down.
    if (this.content.length > 0) {
      this.content[0] = end;
      this.sinkDown(0);
    }
    return result;
  },

  remove: function(node) {
    var length = this.content.length;
    // To remove a value, we must search through the array to find
    // it.
    for (var i = 0; i < length; i++) {
      if (this.content[i] != node) continue;
      // When it is found, the process seen in 'pop' is repeated
      // to fill up the hole.
      var end = this.content.pop();
      // If the element we popped was the one we needed to remove,
      // we're done.
      if (i == length - 1) break;
      // Otherwise, we replace the removed element with the popped
      // one, and allow it to float up or sink down as appropriate.
      this.content[i] = end;
      this.bubbleUp(i);
      this.sinkDown(i);
      break;
    }
  },

  size: function() {
    return this.content.length;
  },

  bubbleUp: function(n) {
    // Fetch the element that has to be moved.
    var element = this.content[n], score = this.scoreFunction(element);
    // When at 0, an element can not go up any further.
    while (n > 0) {
      // Compute the parent element's index, and fetch it.
      var parentN = Math.floor((n + 1) / 2) - 1,
      parent = this.content[parentN];
      // If the parent has a lesser score, things are in order and we
      // are done.
      if (score >= this.scoreFunction(parent))
        break;

      // Otherwise, swap the parent with the current element and
      // continue.
      this.content[parentN] = element;
      this.content[n] = parent;
      n = parentN;
    }
  },

  sinkDown: function(n) {
    // Look up the target element and its score.
    var length = this.content.length,
    element = this.content[n],
    elemScore = this.scoreFunction(element);

    while(true) {
      // Compute the indices of the child elements.
      var child2N = (n + 1) * 2, child1N = child2N - 1;
      // This is used to store the new position of the element,
      // if any.
      var swap = null;
      // If the first child exists (is inside the array)...
      if (child1N < length) {
        // Look it up and compute its score.
        var child1 = this.content[child1N],
        child1Score = this.scoreFunction(child1);
        // If the score is less than our element's, we need to swap.
        if (child1Score < elemScore)
          swap = child1N;
      }
      // Do the same checks for the other child.
      if (child2N < length) {
        var child2 = this.content[child2N],
        child2Score = this.scoreFunction(child2);
        if (child2Score < (swap == null ? elemScore : child1Score))
          swap = child2N;
      }

      // No need to swap further, we are done.
      if (swap == null) break;

      // Otherwise, swap and continue.
      this.content[n] = this.content[swap];
      this.content[swap] = element;
      n = swap;
    }
  },

  rescoreElement: function(node) {
     this.bubbleUp(this.content.indexOf(node));
  }
};

function randomInt(min, max) {
  return Math.floor(Math.floor(Math.random() * (max - min + 1)) + min);
}
