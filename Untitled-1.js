
//The Game

//Canvas and Frame Count
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const framesPerSecond = 6;
let frameCount = 0;

// Define the world size
const world = {
    width: 4000,
    height: 2000
};

let isAttackKeyPressed = false;
let character = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 15,
    height: 25,
    rotation: 0,
    health: 100,
    attack: 1,
    speed: 2,
    attackCooldown: 0,
    attackAnimationTime: 0,
    attackCooldownTime: 60,
    attackRange: 100,
    xp:0,
};
const stationaryDarkSpots = [];
let orbs = [];
const blotches = [];
let blotchDensity= 100;
let blotchSize=50;
// Update function to redraw the canvas
function update() {
    --character.attackCooldownTime
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    // Move the character
    moveCharacter();
    handlePlayerAttack();
    moveEnemies();
    handleEnemyBehavior();
    handleOrbCollection();
    document.getElementById('health-bar').style.width = `${character.health / 400 * 100}%`;
    document.getElementById('attack-bar').style.width = `${character.attack / 20 * 100}%`;
    document.getElementById('speed-bar').style.width = `${character.speed / 8 * 100}%`;
    // Define a function to calculate the distance between two points
    function calculateDistance(point1, point2) {
        const dx = point1.x - point2.x;
        const dy = point1.y - point2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    if (character.health <= 0) {
        // Reset the game or perform any other necessary actions
        resetGame();
    }
    enemies = enemies.filter(enemy => enemy.health > 0);
    // Call the spawnNewEnemy function every 7 seconds
    if (frameCount % (2 * framesPerSecond) === 0) {
        spawnNewEnemy();
    }
    
    // Adjust the canvas to focus on the character
    const cameraX = Math.max(0, Math.min(character.x - canvas.width / 2, world.width - canvas.width));
    const cameraY = Math.max(0, Math.min(character.y - canvas.height / 2, world.height - canvas.height));


    // Draw the background
    ctx.fillStyle = '#005000';
    ctx.fillRect(0, 0, world.width, world.height);
    drawBackground();
    // Draw stationary dark spots
    drawStationaryDarkSpots(cameraX, cameraY);

    // Draw lines at the borders of the world
    ctx.strokeStyle = '#000'; // Black color for the lines
    ctx.lineWidth = 30;

    // Top border
    ctx.beginPath();
    ctx.moveTo(0 - cameraX, 0 - cameraY);
    ctx.lineTo(world.width - cameraX, 0 - cameraY);
    ctx.stroke();

    // Right border
    ctx.beginPath();
    ctx.moveTo(world.width - cameraX, 0 - cameraY);
    ctx.lineTo(world.width - cameraX, world.height - cameraY);
    ctx.stroke();

    // Bottom border
    ctx.beginPath();
    ctx.moveTo(world.width - cameraX, world.height - cameraY);
    ctx.lineTo(0 - cameraX, world.height - cameraY);
    ctx.stroke();

    // Left border
    ctx.beginPath();
    ctx.moveTo(0 - cameraX, world.height - cameraY);
    ctx.lineTo(0 - cameraX, 0 - cameraY);
    ctx.stroke();

    // Draw the character centered on the canvas
    ctx.fillStyle = '#9fe0ff'; // Blue color
    ctx.fillRect(character.x - character.width / 2 - cameraX, character.y - character.height / 2 - cameraY, character.width, character.height);
    //Draw Orbs
    for (const orb of orbs) {
        ctx.beginPath();
        ctx.arc(orb.x - cameraX, orb.y - cameraY, orb.radius, 0, 2 * Math.PI);
        ctx.fillStyle = orb.color;
        ctx.fill();
        ctx.closePath();
    }
    
    // Draw enemies
    for (const enemy of enemies) {
        if (enemy.type === 'stationary') {
            // Draw stationary enemy
            ctx.fillStyle = 'purple';
            ctx.fillRect(enemy.x - cameraX, enemy.y - cameraY, 20, 20); // Adjust size as needed
        } else if (enemy.type === 'moving') {
            // Draw moving enemy
            ctx.fillStyle = 'pink';
            enemy.health = 50;
            ctx.fillRect(enemy.x - cameraX, enemy.y - cameraY, 20, 20); // Adjust size as needed
        }
    }
   
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        const distanceToEnemy = calculateDistance(character, enemy);
        const xpGained = Math.floor(Math.random() * 3) + 1;
        if (distanceToEnemy <= character.attackRange && isAttackKeyPressed<=true) {
            // Deal damage to the enemy
                enemy.health -= character.attack * 7; 
        }
            // Check if the enemy is dead
        if (enemy.health <= 0) {
                // Remove the dead enemy from the array
                enemies.splice(i, 1);
                // Spawn a random colored orb drop
                spawnRandomOrbDrop(enemy.x, enemy.y);
                character.xp += xpGained;
        }
   
        
            // Apply cooldown to the player's attack
            character.attackCooldown = character.attackCooldownTime;
        }
        isAttackKeyPressed = false;
    }
// Populate the array with fixed positions for stationary dark spots
for (let i = 0; i < 10; i++) {
    const spotX = Math.random() * world.width;
    const spotY = Math.random() * world.height;
    const spotSize = Math.random() * 20 + 40; // Random size between 10 and 30

    stationaryDarkSpots.push({ x: spotX, y: spotY, size: spotSize+10 });
}
    function calculateDistance(point1, point2) {
        const dx = point1.x - point2.x;
        const dy = point1.y - point2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

// Populate the array with fixed positions for stationary dark spots
for (let i = 0; i < 300; i++) {
    const spotX = Math.random() * world.width;
    const spotY = Math.random() * world.height;
    const spotSize = Math.random() * 20 + 10; // Random size between 10 and 30

    stationaryDarkSpots.push({ x: spotX, y: spotY, size: spotSize });
}


// Populate the blotches array with fixed positions and colors
for (let x = 0; x < world.width; x += blotchSize) {
    for (let y = 0; y < world.height; y += blotchSize) {
        if (Math.random() < blotchDensity) {
            // Randomly choose between dark green and light green
            const color = Math.random() < 0.5 ? '#006400' : '#008000';
            blotches.push({ x, y, color });
        }
    }
}
//Random orbs
function spawnRandomOrbDrop(x, y) {
    const orbColors = ['#FF0000', '#00FF00', '#0000FF']; // Red, Green, Blue
    const randomColor = orbColors[Math.floor(Math.random() * orbColors.length)];

    orbs.push({ x, y, color: randomColor, radius: 5 })
}
function handleOrbCollection() {
    for (let i = orbs.length - 1; i >= 0; i--) {
        const orb = orbs[i];
        const distanceToOrb = calculateDistance(character, orb);

        if (distanceToOrb <= 10) {
            // Increase the corresponding stat based on orb color
            switch (orb.color) {
                case '#FF0000': // Red
                    character.attack += 1;
                    break;
                case '#00FF00': // Green
                    character.speed += 1;
                    break;
                case '#0000FF': // Blue
                    character.health += 10;
                    break;
                // Add more cases for additional colors/stats
            }

            // Remove the collected orb from the array
            orbs.splice(i, 1);
        }
    }
}
// Function to draw the blotches from the precalculated array, adjusting for camera position
function drawStationaryBlotches(cameraX, cameraY) {
    for (const blotch of blotches) {
        ctx.fillStyle = blotch.color;
        ctx.fillRect(blotch.x - cameraX, blotch.y - cameraY, blotchSize, blotchSize);
    }
}

// Call this function in your update loop or wherever you draw the background
function drawBackground() {
    // Adjust the camera position based on character movement
    const cameraX = Math.max(0, Math.min(character.x - canvas.width / 2, world.width - canvas.width));
    const cameraY = Math.max(0, Math.min(character.y - canvas.height / 2, world.height - canvas.height));

    // Draw the stationary blotches with adjusted positions
    drawStationaryBlotches(cameraX, cameraY);
    // Add other background drawing logic here
}
// Function to draw stationary dark spots
function drawStationaryDarkSpots(cameraX, cameraY) {
    ctx.fillStyle = '#333'; // Dark color for the spots

    // Draw each stationary dark spot
    for (const spot of stationaryDarkSpots) {
        ctx.fillRect(spot.x - cameraX, spot.y - cameraY, spot.size, spot.size);
    }
}

    window.addEventListener('keydown', handleKeyPress);

    window.addEventListener('keydown', function (event) {
        handleKeyPress(event);
        if (event.key === ' ') {
            isAttackKeyPressed = true;
        }
    });
    
    window.addEventListener('keyup', function (event) {
        if (event.key === ' ') {
            isAttackKeyPressed = false;
        }
    });



// Function to move the character
function moveCharacter() {
    // Initialize new position variables
    let newCharacterX = character.x;
    let newCharacterY = character.y;

    // Check for keyboard input
    handleKeyPress(); // Pass the event parameter

    // Check if the new position is within the world boundaries
    if (
        newCharacterX - character.width / 2 >= 0 &&
        newCharacterX + character.width / 2 <= world.width &&
        newCharacterY - character.height / 2 >= 0 &&
        newCharacterY + character.height / 2 <= world.height
    ) {
        // Check for collision with rocks
        if (!checkCollisionWithRocks(newCharacterX, newCharacterY)) {
            character.x = newCharacterX;
            character.y = newCharacterY;
        }
    }
}

// Function to check collision with rocks
function checkCollisionWithRocks(x, y) {
    for (const spot of stationaryDarkSpots) {
        if (
            x - character.width / 2 < spot.x + spot.size &&
            x + character.width / 2 > spot.x &&
            y - character.height / 2 < spot.y + spot.size &&
            y + character.height / 2 > spot.y
        ) {
            // Collision detected
            return true;
        }
    }
    // No collision detected
    return false;
}


function handleKeyPress() {
    // Add a default event if it's not provided
    const event = window.event || {};

    switch (event.key) {
        case 'ArrowUp':
            character.y -= character.speed;
            break;
        case 'ArrowDown':
            character.y += character.speed;
            break;
        case 'ArrowLeft':
            character.x -= character.speed;
            break;
        case 'ArrowRight':
            character.x += character.speed;
            break;
    }

    // Check if the new position is within the world boundaries
    if (
        character.x - character.width / 2 >= 0 &&
        character.x + character.width / 2 <= world.width &&
        character.y - character.height / 2 >= 0 &&
        character.y + character.height / 2 <= world.height
    ) {
        // Check for collision with rocks
        if (!checkCollisionWithRocks(character.x, character.y)) {
            // character.x and character.y are updated directly
        }
    }
}

let enemies = []; // Array to store enemy objects
const awarenessDistance = 300; // Awareness distance for moving enemies in pixels

// Function to save the game state to local storage
function saveGame() {
    localStorage.setItem('character', JSON.stringify(character));
    alert('Game saved!');
}

// Function to load the game state from local storage
function loadGame() {
    const savedCharacter = localStorage.getItem('character');
    if (savedCharacter) {
        Object.assign(character, JSON.parse(savedCharacter));
        updatePlayerStats();
        alert('Game loaded!');
    } else {
        alert('No saved game found.');
    }
}

function resetGame() {
    // Reset player stats
    character.health = 100;
    character.attack = 1;
    character.speed = 1;

    // Clear enemies array
    enemies = [];

    // Optionally, you can respawn special enemies or spawn random enemies here
    spawnSpecialEnemies();
    // Or spawnRandomEnemies(numberOfEnemies);

    // Save the game state
    saveGame();
}


// Example: Upgrade the player's attack skill
function upgradeAttackSkill() {
    character.attack += 1;
    updatePlayerStats();
    saveGame();
}

// Example: Upgrade the player's speed skill
function upgradeSpeedSkill() {
    character.speed += 1;
    updatePlayerStats();
    saveGame();
}

// Example: Upgrade the player's health skill
function upgradeHealthSkill() {
    character.health += 20;
    updatePlayerStats();
    saveGame();
}

// Function to handle player attacks
function handlePlayerAttack() {
    if (isAttackKeyPressed && character.attackCooldown <= 0) {
        
        showDamageIndicator(character.x, character.y, 'blue', 100);
        // Reset cooldown to attackAnimationTime + attackCooldownTime
        character.attackCooldown = character.attackAnimationTime + character.attackCooldownTime;
        
    // Reset the flag to false at the end of the function
    character.attackCooldown = character.attackCooldownTime;
    isAttackKeyPressed = false;
    }
}

function handleKeyPress() {
    // Add a default event if it's not provided
    const event = window.event || {};

    switch (event.key) {
        case 'ArrowUp':
            character.y -= character.speed;
            break;
        case 'ArrowDown':
            character.y += character.speed;
            break;
        case 'ArrowLeft':
            character.x -= character.speed;
            break;
        case 'ArrowRight':
            character.x += character.speed;
            break;
        case ' ': // Space bar for attack
            isAttackKeyPressed = true;
            break;
    }
    if (event.key === ' ') {
        handlePlayerAttack();
    }

}
// Function to draw damage indicator on the canvas
function showDamageIndicator(x, y, color, radius) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.3;
    ctx.fill();
    ctx.globalAlpha = 1; // Reset global alpha
}

// Function to handle enemy movement
function moveEnemies() {
    for (const enemy of enemies) {
        if (enemy.type === 'moving') {
            if (Math.random() < 0.02) {
                // Randomly change the direction of the enemy
                enemy.rotation = Math.random() * Math.PI * 2;
            }

            // Move the enemy based on player speed * 0.75
            enemy.x += Math.cos(enemy.rotation) * character.speed * 0.2;
            enemy.y += Math.sin(enemy.rotation) * character.speed * 0.2;
        }
    }
}

// Function to handle enemy behavior
function handleEnemyBehavior() {
    for (const enemy of enemies) {
        if (enemy.type === 'stationary') {
            // Check if the player is within 100 pixels of the stationary enemy
            const distanceToPlayer = calculateDistance(character, enemy);
            if (distanceToPlayer <= 100) {
                // Deal damage to the player
                character.health -= 1;

                // Show damage indicator on the player
                showDamageIndicator(character.x, character.y, 'purple',30);
            }
        } else if (enemy.type === 'moving') {
            // Check if the player is within the awareness distance
            const distanceToPlayer = calculateDistance(character, enemy);
            if (distanceToPlayer <= awarenessDistance) {
                // Move towards the player
                const angleToPlayer = Math.atan2(character.y - enemy.y, character.x - enemy.x);
                if(distanceToPlayer <=30){
                    character.health-=1;
                    showDamageIndicator(character.x, character.y, 'purple',30);
                }
                enemy.rotation = angleToPlayer;
            }
        }
    }
}
// Function to spawn special enemies (purple stationary and green moving) at the start
function spawnSpecialEnemies() {
    // Purple stationary enemy
    const purpleEnemy = { x: 200, y: 200, type: 'stationary', health: 50 };
    enemies.push(purpleEnemy);

    // Green moving enemy
    const greenEnemy = { x: 500, y: 500, type: 'moving', health: 50, rotation: 0 };
    enemies.push(greenEnemy);
}
spawnSpecialEnemies();


// Function to spawn random enemies at the start
function spawnRandomEnemies(numEnemies) {
    for (let i = 0; i < numEnemies; i++) {
        // Generate a random position for the enemy
        const enemyX = Math.random() * world.width;
        const enemyY = Math.random() * world.height;

        // Choose a random enemy type (stationary or moving)
        const enemyType = Math.random() < 0.5 ? 'stationary' : 'moving';

        // Add the enemy to the enemies array
        enemies.push({ x: enemyX, y: enemyY, type: enemyType, health: 50 });
    }
}

// Function to spawn new enemies periodically
function spawnNewEnemy() {
    // Generate a random position for the new enemy within the specified range
    const spawnRange = 1000;
    const minDistance = 100;
    const angle = Math.random() * 2 * Math.PI;
    const distance = minDistance + Math.random() * (spawnRange - minDistance);
    const enemyX = character.x + Math.cos(angle) * distance;
    const enemyY = character.y + Math.sin(angle) * distance;

    // Choose a random enemy type (stationary or moving)
    const enemyType = Math.random() < 0.5 ? 'stationary' : 'moving';

    // Add the new enemy to the enemies array
    enemies.push({ x: enemyX, y: enemyY, type: enemyType, health: 50 });
}

// Game loop using setInterval
function gameLoop() {
    update();
    frameCount++;
}

// Start the game loop

setInterval(gameLoop, 1000 / framesPerSecond);