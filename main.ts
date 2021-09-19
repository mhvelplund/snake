// Draw the part of the map visible to the camera.
function getCameraView() {
    let index
    let screen: Image = images.createImage("")
    let rightmostX = camera[0] - 2
    let topmostY = camera[1] - 2
    for (let y = 0; y <= 4; y++) {
        for (let x = 0; x <= 4; x++) {
            index = getIndex(rightmostX + x, topmostY + y)
            screen.setPixel(x, y, map[index] != 0)
        }
    }
    // Go through the snake and draw the visible parts
    for (let value of snake) {
        let [x, y] = getCoord(value)
        let adjX = x - rightmostX
        let adjY = y - topmostY
        if (adjX >= 0 && adjX < 5 && adjY >= 0 && adjY < 5) {
            screen.setPixel(adjX, adjY, true)
        }
    }
    return screen
}

// Convert a coordinate into a  map index.
function getIndex(x: number, y: number) {
    return y * map_height + x
}

// Convert an map index to a coordinate.
function getCoord(index: number) {
    let y = Math.floor(index / map_width)
    let x = index % map_width
    return [x, y]
}

// Setup the game state.
function initGame(w: number, h: number) {
    map_width = w
    map_height = h
    let pc = Math.round(map_height * map_width / 10)
    pelletCount = pc
    // The center of the view on the map.
    snake = [getIndex(2, 2)]
    let n = 0
    for (let y = 0; y <= map_height - 1; y++) {
        for (let x = 0; x <= map_width - 1; x++) {
            if (x == 0 || x == map_width - 1) {
                n = 1
            } else if (y == 0 || y == map_height - 1) {
                n = 1
            } else {
                n = 0
            }
            map[getIndex(x, y)] = n
        }
    }
    // Place food pellets.
    while (pc > 0) {
        let x = Math.randomRange(1, map_width - 2)
        let y = Math.randomRange(1, map_height - 2)
        let index = getIndex(x, y)
        if (index == snake[0] || map[index] != 0) {
            continue;
        }
        map[index] = 2
        pc += -1
    }
}

// Sets the camera foxus to x, y of the player, but clamped to legal values.
function focusCamera(player: number) {
    let [x, y] = getCoord(player)
    // Clamp x
    x = Math.max(x, 2)
    x = Math.min(x, map_width - 3)
    // Clamp y
    y = Math.max(y, 2)
    y = Math.min(y, map_height - 3)
    camera = [x, y]
}

input.onButtonPressed(Button.A, function () {
    directionChange = -1 // Left
})

input.onButtonPressed(Button.B, function () {
    directionChange = 1 // Right
})

input.onButtonPressed(Button.AB, function () {
    reset = true
})

let pelletCount = 0
let snake: number[] = []
let camera: number[] = []
let map: number[] = []
let map_width = 0
let map_height = 0
let direction = 3 // 1 north, 2 east, 3 south, 4 west
let directionChange = 0 // 0 straight, 1 right, -1 left
let frameMS = 300
let score = 0
let reset = false


while (true) {
    initGame(10, 10)
    while (true) {
        let dead = false
        direction = (direction + directionChange) % 4
        directionChange = 0

        let [headX, headY] = getCoord(snake[0])

        switch (direction) {
            case 1: headY--; break;
            case 2: headX++; break;
            case 3: headY++; break;
            default: headX--;
        }

        let head = getIndex(headX, headY)
        if (map[head] == 2) {
            score++ // Eat pellet
            map[head] = 0
        } else if (map[head] == 1) {
            dead = true // Hit wall
        } else {
            snake.pop()
        }

        if (snake.length > 0) {
            for (let i = 1; i < snake.length; i++) {
                if (head == snake[i]) {
                    dead = true // Hit tail
                }
            }
        }

        if (dead) break;

        snake.unshift(head)

        focusCamera(snake[0])
        getCameraView().showImage(0)

        basic.pause(frameMS)
    }
    basic.clearScreen()
    basic.showNumber(score)
    while (!reset) {
        basic.pause(100)
    }
    reset = false
}