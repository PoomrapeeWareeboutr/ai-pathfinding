// map 1
let map_data = `
01234567890
1dggggdttt1
2mgwwwgddr2
3dgggtddgg3
4drgmmrtgd4
5ddtmmmerm5
6dtmmtggdd6
71234567890
`

// map 2
// let map_data = `
// 01234567890
// 1ggmdtdgdd1
// 2ddtggtdwd2
// 3dggtdmddr3
// 4wgdmdrdtr4
// 5dtrgmgdmg5
// 6dttggrett6
// 71234567890
// `

// map 3
// let map_data = `
// 01234567890
// 1gdmmtrddm1
// 2mggmddgdg2
// 3mddgrwgdr3
// 4wgdmdrdme4
// 5dmtrggddm5
// 6dtwrddgmd6
// 71234567890
// `

// map 4
// let map_data = `
// 01234567890
// 1gtmdmdgdd1
// 2ddmtmtdgd2
// 3dgwtmmgre3
// 4wgdmdtdtg4
// 5dtrgrgdmg5
// 6drtggmdmt6
// 71234567890
// `

// map 5
// let map_data = `
// 01234567890
// 1gdmmmgddm1
// 2mggddgddg2
// 3mdwgwwgdr3
// 4wgwmdmmgm4
// 5dmggrgdrm5
// 6ttdrddged6
// 71234567890
// `
let mz = 10;
let cz = 50;

function rotate_and_draw_image(img, img_x, img_y, img_width, img_height, img_angle) {
  imageMode(CENTER);
  translate(img_x + img_width / 2, img_y + img_width / 2);
  rotate(-PI / 180 * img_angle);
  image(img, 0, 0, img_width, img_height);
  rotate(PI / 180 * img_angle);
  translate(-(img_x + img_width / 2), -(img_y + img_width / 2));
  imageMode(CORNER);
}

class WorldMap {

  constructor(map_data) {
    this.map_data = map_data;
    this.data = [];
    this.assets = {};
    this.rows = 0;
    this.cols = 0;
    this.goal = { x: -1, y: -1 };
    this.walkable = ['d', 'm', 'g', 'e'];
    this.costs = {
      e: 1, d: 1, g: 2, m: 4,
      r: 10000, t: 10000, w: 10000, b: 10000
    };
    this.setupMap();
    this.loadAssets();
  }

  setupMap() {
    let lines = this.map_data.split('\n');
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim()
      if (line.length > 0) {
        this.data.push(line.split(''));
      }
    }
    this.rows = this.data.length;
    this.cols = this.data[0].length;
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        if (this.data[i][j] == 'e') {
          this.goal = { x: j, y: i };
        }
      }
    }
  }

  loadAssets() {
    this.assets['d'] = loadImage('assets/dirt.png');
    this.assets['e'] = loadImage('assets/end.png');
    this.assets['g'] = loadImage('assets/grass.png');
    this.assets['m'] = loadImage('assets/mud.png');
    this.assets['r'] = loadImage('assets/rock.png');
    this.assets['t'] = loadImage('assets/tree.png');
    this.assets['w'] = loadImage('assets/water.png');
    this.assets['b'] = loadImage('assets/brick.png');
  }

  render() {
    textAlign(CENTER, CENTER);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < map.cols; j++) {
        let xpos = j * cz + mz;
        let ypos = i * cz + mz;
        fill(240);
        stroke(0);
        rect(xpos, ypos, cz, cz);
        fill(0);
        noStroke();
        //
        let a = 0;
        if (this.data[i][j] in this.assets) {
          if (this.data[i][j] == 'e') {
            rotate_and_draw_image(this.assets['b'], xpos, ypos, cz, cz, a);
          } else {
            rotate_and_draw_image(this.assets['d'], xpos, ypos, cz, cz, a);
          }
          rotate_and_draw_image(this.assets[this.data[i][j]], xpos, ypos, cz, cz, a);
        } else {
          rotate_and_draw_image(this.assets['b'], xpos, ypos, cz, cz, a);
          text(this.data[i][j], xpos, ypos, cz, cz);
        }
      }
    }
  }

  check_wall(x, y) {
    return !(this.walkable.includes(this.data[y][x]));
  }
}

class AgentState {
  constructor(x, y, o, assets) {
    this.x = x;
    this.y = y;
    this.o = o;
    this.angles = { n: 180, e: 90, s: 0, w: 270 };
    if (!assets) {
      this.assets = {};
      this.loadAssets();
    } else {
      this.assets = assets;
    }

  }

  loadAssets() {
    this.assets['a'] = loadImage('assets/agent.png')
  }

  // START FORMULATION 2: ACTION SPACE
  actions() {
    return ['f', 'l', 'r'];
  }
  // END FORMULATION 2: ACTION SPACE

  // START FORMULATION 5: COST FUNCTION
  cost() {
    let tile = map.data[this.y][this.x];
    return map.costs[tile];
  }
  // END FORMULATION 5: COST FUNCTION

  // START FORMULATION 3: TRANSITION FUNCTION
  transition(action) {
    let x = this.x;
    let y = this.y;
    let o = this.o;
    if (action == 'f') {
      if (o == 'n') y--;
      else if (o == 's') y++;
      else if (o == 'w') x--;
      else if (o == 'e') x++;
    } else if (action == 'l') {
      if (o == 'n') o = 'w';
      else if (o == 's') o = 'e';
      else if (o == 'w') o = 's';
      else if (o == 'e') o = 'n';
    } else if (action == 'r') {
      if (o == 'n') o = 'e';
      else if (o == 's') o = 'w';
      else if (o == 'w') o = 'n';
      else if (o == 'e') o = 's';
    }

    if (!map.check_wall(x, y)) {
      return new AgentState(x, y, o, this.assets);
    } else {
      return new AgentState(this.x, this.y, o, this.assets);
    }
  }
  // END FORMULATION 3: TRANSITION FUNCITON

  // START HEURISTIC FUNCTION 1
  manhattan(x0, y0, x1, y1) {
    return Math.abs(x0 - x1) + Math.abs(y0 - y1);
  }
  // END HEURISTIC FUNCTION 1

  // START HEURISTIC FUNCTION 2
  euclidean(x0, y0, x1, y1) {
    return Math.sqrt(Math.pow(x0 - x1, 2) + Math.pow(y0 - y1, 2));
  }
  // END HEURISTIC FUNCTION 2
  
  heuristic() {
    if (heuristicMethod == 'EUC') return this.euclidean(this.x, this.y, map.goal.x, map.goal.y);
    // default input use Manhattan method
    return this.manhattan(this.x, this.y, map.goal.x, map.goal.y);
  }

  render() {
    let xpos = this.x * cz + mz;
    let ypos = this.y * cz + mz;
    rotate_and_draw_image(
      this.assets['a'],
      xpos + cz / 5,
      ypos + cz / 4,
      cz / 1.5,
      cz / 2,
      this.angles[this.o]);
  }
}

function resetToHistoryIndex(index) {
  state = history[index].state;
  history = history.slice(0, index + 1);
  redraw();
}

function renderHistory() {
  let his = '<h3> History: </h3>';
  his += '<ol>';
  let totalE = 0;
  for (let i = 0; i < history.length; i++) {
    if (history[i].action) {
      his += '<li>' + history[i].action + ' -> ';
    } else {
      his += '<li> S -> ';
    }
    his += history[i].state.x + ',' + history[i].state.y + ',' + history[i].state.o + ' | ';
    his += 'energy: ' + history[i].state.cost();
    totalE += history[i].state.cost();
    if (map.data[history[i].state.y][history[i].state.x] == 'e') {
      his += ' |🏁';
    }
    his += '<span>⎌</span>'
    his + '</li>';
  }
  his += '</ol>';
  his += '<h3>Steps: ' + history.length + ' | Total Energy: ' + totalE + ' </h3>';
  divHistory.html(his);
  let all_li = selectAll('div.history ol li');
  for (let i = 0; i < all_li.length; i++) {
    all_li[i].mouseClicked(resetToHistoryIndex.bind(this, i));
  }
}


class SearchNode {
  constructor(state, parent, action) {
    this.state = state;
    this.parent = parent;
    this.action = action;
    this.x = this.state.x;
    this.y = this.state.y;
    this.o = this.state.o;
    // this.good = true
    if (parent) {
      this.g = parent.g + state.cost();
    } else {
      this.g = state.cost();
    }
    this.h = state.heuristic();
    this.f = this.g + this.h;
  }

  value() {
    return this.f;
  }

  get_path() {
    let path = [];
    let node = this;
    while (node.parent) {
      path.push(node.action);
      node = node.parent;
    }
    return path.reverse();
  }

  get_path_nodes() {
    let path = [];
    let node = this;
    while (node.parent) {
      path.push(node);
      node = node.parent;
    }
    path.push(node);
    return path.reverse();
  }
}

class Explorer {
  constructor(start) {
    this.start = start;
    this.root = { node: this.start, children: [] };
    this.data = [];
    // this.expand(this.root.node, this.root.children);
  }

  expand(node, children) {
    let actions = node.state.actions();
    children.splice(0, children.length)
    for (let i = 0; i < actions.length; i++) {
      let child = node.state.transition(actions[i]);
      if (child.x == node.x && child.y == node.y && child.o == node.o) {
        continue;
      }
      let childNode = new SearchNode(child, node, actions[i]);
      children.push({ node: childNode, children: [] });
    }
  }

  explorer(key) {
    let d = this.data[key];
    this.expand(d.node, d.children);
    history.splice(0, history.length);
    let nodes =  d.node.get_path_nodes();
    for(let i = 0; i < nodes.length; i++) {
      history.push(nodes[i]);
    }
    state = history[history.length - 1].state
    redraw();
    // this.renderSearchTree();
  }

  renderSearchTree() {
    let st = '<h3> Exploration Mode:</h3>';
    this.data.splice(0, this.data.length);
    st += '<div class="search-box"><ul>';
    st += this.renderNode(explorer.root.node, explorer.root.children);
    st += '</ul>';
    let explored_count = 0;
    let frontier_count = 0;
    for (let i = 0; i < explorer.data.length; i++) {
      if (explorer.data[i].children.length == 0) {
        frontier_count += 1;
      } else {
        explored_count += 1;
      }
    }

    st += '</div>';
    st += '<h3>Explored: ' + explored_count + ' | Frontier: ' + frontier_count + '</h3>';
    divSearchTree.html(st);

    let all_li = selectAll('div.search-item');
    for (let i = 0; i < all_li.length; i++) {
      let key = all_li[i].attribute('data');

      all_li[i].mouseClicked(this.explorer.bind(this, key));
    }
  }


  renderNode(node, children) {
    let st = '<li><div class="search-item" data="'+this.data.length+'">';
    if (node.action) {
      st += node.action + ' -> ';
    } else {
      st += 'S -> ';
    }
    st += node.x + ',' + node.y + ',' + node.o;
    fill(0, 0, 0);
    if (children.length == 0){
      st += ' <em>(g: ' + node.g + ')</em> ';
      st += ' <em>(g: ' + node.g + ', h: ' + node.h + ', f: ' + node.f + ')</em> ';
      fill(0, 255, 0);
    }
    st += '</div><ul>';
    
    let xpos = node.x * cz + mz;
    let ypos = node.y * cz + mz;
    circle(xpos + cz / 2, ypos + cz / 2, 10);
    this.data.push({node: node, children: children});
    for (let i = 0; i < children.length; i++) {
      st += this.renderNode(children[i].node, children[i].children);
    }
    st += '</ul></li>';
    return st;
  }
}

class Pathfinding {
  constructor(strategy) {
    this.strategy = strategy;
    this.pq = new PriorityQueue();
    this.closed = [];
    this.path = [];
  }
  
  getPriority(node) {
    let priority;
    if (this.strategy == 'UCS') priority = node.g;
    else if (this.strategy == 'GS') priority = node.h;
    else if (this.strategy == 'A*') priority = node.f;
    return priority;
  }

  isVisited(node) {
    for (let i = 0; i < this.closed.length; i++) {
      if (node.x == this.closed[i].x && node.y == this.closed[i].y && node.o == this.closed[i].o) {
        return true;
      }
    }
    return false;
  }

  // rewrite the function above, check whether each child node is visited yet before adding it to the child's list
  expand(node, children) {
    let actions = node.state.actions();
    children.splice(0, children.length)
    for (let i = 0; i < actions.length; i++) {
      let child = node.state.transition(actions[i]);
      if (child.x == node.x && child.y == node.y && child.o == node.o) {
        continue;
      }
      // check whether each child is visited yet if not, allow a child node to be added to a child's list
      if (!pathfinder.isVisited(child)) {
        let childNode = new SearchNode(child, node, actions[i]);
        children.push({ node: childNode, children: [] });
        pathfinder.closed.push({x: child.x, y: child.y, o: child.o});
      }
    }
  }

  // rewrite the function above, change function parameter from int to SearchNode
  explorer(current) {
    this.expand(current.node, current.children);
    history.splice(0, history.length);
    let nodes =  current.node.get_path_nodes();
    for(let i = 0; i < nodes.length; i++) {
      history.push(nodes[i]);
    }
    state = history[history.length - 1].state;
    redraw();
  }

  // START SEARCH ALGORITHM
  async searching() {
    if (this.strategy == '-') return;

    // reset everything to be the initial state
    resetToHistoryIndex(0);
    explorer.data.splice(0, explorer.data.length);
    this.pq = new PriorityQueue();
    this.closed.splice(0, this.closed.length);
    
    let root = explorer.root;
    this.pq.enqueue({node: root.node, children: root.children}, this.getPriority(root.node));
    this.closed.push({x: root.node.x, y: root.node.y, o: root.node.o});
    while (!this.pq.isEmpty()) {
      // START FORMULATION 4: GOAL TEST FUNCTION
      if (state.x == map.goal.x && state.y == map.goal.y) {
        // console.log(`GOAL! (${state.x}, ${state.y})`);
        break;
      }
      // END FORMULATION 4: GOAL TEST FUNCTION

      let current = this.pq.dequeue();
      this.path = current.node.get_path_nodes();
      this.explorer(current);

      for (let i = 0; i < current.children.length; i++) {
        let child = current.children[i];
        this.pq.enqueue({node: child.node, children: child.children}, this.getPriority(child.node));
      }
      explorer.renderSearchTree();
      await sleep(delayTime);
    }
    this.renderPath();
  }
  // END SEARCH ALGORITHM

  async renderPath() {
    let xpos, ypos;
    // mark a red point at the agent initial state
    // assume that the agent's initial state is only x = 1 and y = 1
    xpos = cz + mz;
    ypos = cz + mz;
    circle(xpos + cz / 2, ypos + cz / 2, 10);
    fill(255, 0, 0);
    // mark red points along the path
    for (let i = 0; i < this.path.length; i++) {
      xpos = this.path[i].x * cz + mz;
      ypos = this.path[i].y * cz + mz;
      circle(xpos + cz / 2, ypos + cz / 2, 10);
      fill(255, 0, 0);
      await sleep(delayTime);
    }
    //
    // let st = '';
    // let steps = this.path[this.path.length - 1].get_path();
    // for (let i = 0; i < steps.length; i++) {
    //   st += steps[i] + ' ';
    // }
    // console.log(st);
  }
}

const delayTime = 100; // millisecond unit
let map;
let state;
let history = [];
let explorer;
let pathfinder = new Pathfinding('-');
let heuristicMethod = 'EUC'; 

let divHistory;
let divSearchTree;
let selStrategy;
let selMethod;
let btnSearch;
function preload() {
  map = new WorldMap(map_data);
  // START FORMULATION 1: INITIAL STATE
  state = new AgentState(1, 1, 's');
  let start = new SearchNode(state, null, null)
  // END FORMULATION 1: INITIAL STATE
  history.push(start);
  explorer = new Explorer(start);
}

function setup() {
  createCanvas(cz * map.cols + mz * 2, cz * map.rows + mz * 2);
  divHistory = createDiv();
  divHistory.addClass('history');
  divHistory.position(cz * map.cols + mz * 2, 0);
  divSearchTree = createDiv();
  divSearchTree.addClass('search-tree');
  divSearchTree.position(0, cz * map.rows + mz * 2 + 40)

  selStrategy = createSelect();
  selStrategy.option('-');
  selStrategy.option('UCS');
  selStrategy.option('GS');
  selStrategy.option('A*');
  selStrategy.changed(() => {
    let strategy = selStrategy.value();
    pathfinder = new Pathfinding(strategy);
  });
  selStrategy.position(5, cz * map.rows + mz * 2 + 20);
  
  selMethod = createSelect();
  selMethod.option('EUC');
  selMethod.option('MAN');
  selMethod.changed(() => {
    heuristicMethod = selMethod.value();
  });
  selMethod.position(70, cz * map.rows + mz * 2 + 20);

  btnSearch = createButton('Search');
  btnSearch.position(145, cz * map.rows + mz * 2 + 18.5);
  btnSearch.mousePressed(() => { pathfinder.searching() });
  redraw();
  noLoop();
}

function draw() {
  background(220);
  map.render();
  state.render();
  renderHistory();
  explorer.renderSearchTree();
}

function sleep(millis) { 
  return new Promise(resolve => setTimeout(resolve, millis));
}

// function keyReleased() {
//   keyCode = RIGHT_ARROW;
//   let action = 0;
//   if (keyCode === UP_ARROW) {
//     action = 'u';
//   } else if (keyCode === DOWN_ARROW) {
//     action = 'd';
//   } else if (keyCode === LEFT_ARROW) {
//     action = 'l';
//   } else if (keyCode === RIGHT_ARROW) {
//     action = 'r';
//   }
//   if (state.actions().includes(action)) {
//     state = state.transition(action);
//     history.push(new SearchNode(state, history[history.length - 1], action));
//     redraw();
//   }
// }
