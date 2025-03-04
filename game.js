class Game {
    constructor() {
        // Initialize Supabase client
        this.supabaseUrl = 'https://cljvwqycnnjoijayziaw.supabase.co'; // Replace with your Supabase URL
        this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsanZ3cXljbm5qb2lqYXl6aWF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwNDM3OTksImV4cCI6MjA1NjYxOTc5OX0._r9R_ojCPSOqys2hAkAe4gL0Du6NPM_sy3owkMrvRuk'; // Replace with your Supabase anon key
        this.supabase = supabase.createClient(this.supabaseUrl, this.supabaseKey);
        this.leaderboard = []; // To store top scores
        
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.moodBar = document.getElementById('mood-bar');
        this.moodIndicator = document.getElementById('mood-indicator');
        this.moodValue = document.getElementById('mood-value');
        this.levelElement = document.getElementById('level');
        this.peopleLeftElement = document.getElementById('people-left');
        this.scoreElement = document.getElementById('score');
        this.tokensElement = document.getElementById('tokens');
        this.csatValueElement = document.getElementById('csat-value');
        
        this.isRunning = false;
        this.level = 1;
        this.score = 0;
        this.tokens = 0;
        this.tokenCooldown = false; // Initialize token cooldown
        this.mood = 4;
        this.startingMood = 4; // Track the starting mood value for each level
        this.lastTime = 0;
        this.showSplashScreen = true; // Whether to show the splash screen
        this.showLevelSplash = false; // Whether to show level splash screen
        this.showGameOverScreen = false; // Whether to show game over screen
        this.levelSplashTimer = 0; // Timer for level splash screen
        this.collectedScores = []; // Array to track scores collected by Chappy
        this.csatScore = 0; // Average CSAT score of collected feedback
        this.moodAdjustment = 0; // Track mood adjustment between levels
        this.moodMessage = ""; // Message to display with mood adjustment
        
        this.rj = {
            x: 400,
            y: 300,
            width: 30,
            height: 30,
            speed: 200,
            isMovingUp: false,
            isMovingDown: false,
            isMovingLeft: false,
            isMovingRight: false,
            interacting: false,
            targetPerson: null,
            interactionRange: 50, // Range for interacting with people
            speedBoost: false, // Whether speed boost is active
            speedBoostDuration: 0, // Duration of speed boost
            messageTimer: 0, // Timer for displaying the message
            messageVisible: false, // Whether the message is visible
            messageText: null // Custom message text
        };
        
        this.chappy = {
            x: 400,
            y: 200,
            width: 30,
            height: 30,
            speed: 100,
            targetPerson: null,
            isTargetingRJ: false,
            targetRJTimer: 5 + Math.random() * 5, // 5-10 seconds until first targeting of RJ
            collecting: false,
            collectingPerson: null,
            collectingTime: 0,
            frozen: false,
            frozenTime: 0,
            happy: false,
            happyTime: 0,
            messageVisible: false,
            messageTimer: 0,
            messageText: null,
            lastCollisionTime: 0, // Track last collision time to prevent rapid mood loss
        };
        
        this.skip = {
            x: 400,
            y: 550,
            width: 40,
            height: 40,
            messageTimer: 0, // Timer for displaying the message
            messageVisible: false, // Whether the message is visible
            messageText: null // Custom message text
        };
        
        // Dean - new NPC character
        this.dean = {
            x: -50, // Start off-screen
            y: 200,
            width: 40,
            height: 40,
            speed: 150,
            active: false, // Whether Dean is currently on screen
            direction: 1, // 1 for left-to-right, -1 for right-to-left
            zigZagTimer: 0, // Timer for changing vertical direction
            verticalDirection: 1, // 1 for down, -1 for up
            messageTimer: 0, // Timer for displaying the message
            messageVisible: false, // Whether the message is visible
            messageText: null, // Custom message text
            sayingsCount: 0, // Count of sayings before leaving
            spawnTimer: 0, // Timer for random spawning
            isBirthdayDean: false // Flag to indicate if this is Birthday Dean
        };
        
        // NPC Management System
        this.npcs = [];
        this.activeNPC = null;
        this.collectedNPC = null; // Store the last collected NPC
        this.npcSpawnTimer = 5 + Math.random() * 5; // Reduced timer: 5-10 seconds instead of 15-30
        this.npcTypes = {
            'sj': {
                name: 'SJ',
                color: '#8e44ad', // Purple color for SJ
                message: "Products Enhancements!",
                effect: 'positive_feedback_buff',
                effectDuration: 15 // 15 seconds of buff
            },
            'ali': {
                name: 'Ali',
                color: '#2ecc71', // Green color for Ali
                message: "*Ping* *Ping*\nAll Systems good\n*Ping* *Ping*\ngotta go\n*Ping* *Ping*",
                effect: 'chappy_slowdown',
                effectDuration: 10 // 10 seconds of slowdown
            },
            'ted': {
                name: 'Ted',
                color: '#e74c3c', // Red color for Ted
                message: "Have you tried turning it off and on again!",
                effect: 'feedback_score_boost',
                effectDuration: 0 // Instant effect
            },
            'gabor': {
                name: 'Gabor',
                color: '#3498db', // Blue color for Gabor
                message: "New Computers for everyone!",
                effect: 'make_people_happy',
                effectDuration: 10 // 10 seconds of happiness
            },
            'kc': {
                name: 'KC',
                color: '#f39c12', // Orange color for KC
                message: "Happy Birthday Dean!",
                effect: 'spawn_birthday_dean',
                effectDuration: 0 // Instant effect
            },
            'cole': {
                name: 'Cole',
                color: '#16a085', // Teal color for Cole
                message: "Let's get this place organized!",
                effect: 'organize_respondents',
                effectDuration: 0 // Instant effect
            }
            // More NPCs can be added here in the future
        };
        
        this.people = [];
        this.envelopes = [];
        this.rewards = [];
        this.powerups = [];
        
        this.peopleCount = 10; // Number of people per level
        this.peopleLeft = this.peopleCount;
        
        this.bindEvents();
        this.resize();
        this.renderSplashScreen(); // Render the splash screen immediately
        
        // Positive feedback buff status
        this.positiveFeedbackBuff = false;
        this.positiveFeedbackBuffTime = 0;
        
        // New Ali effect properties
        this.chappySlowdown = false;
        this.chappySlowdownTime = 0;
        this.chappyOriginalSpeed = 0;
        
        // New Ted effect property
        this.feedbackScoreBoost = false;
        
        // New Gabor effect properties
        this.peopleHappy = false;
        this.peopleHappyTime = 0;
        
        // New Cole effect properties
        this.coleActive = false;
        this.colePhase = 'freeze'; // freeze, collect, organize, unfreeze
        this.coleTimer = 0;
        this.collectingRespondents = [];
        this.coleX = 0;
        this.coleY = 0;
        this.coleWidth = 40;
        this.coleHeight = 40;
        this.coleSpeed = 400; // Fast speed for quick collection
        this.coleTargetRespondent = null;
        this.coleMessage = "";
        this.coleMessageVisible = false;
        this.coleMessageTimer = 0;
        this.freezeEffectVisible = false;
        this.freezeEffectTimer = 0;
    }
    
    bindEvents() {
        window.addEventListener('resize', () => this.resize());
        
        // Keyboard controls
        window.addEventListener('keydown', (e) => {
            // If splash screen is showing, any key will dismiss it and start the game
            if (this.showSplashScreen) {
                this.showSplashScreen = false;
                this.start(); // Start the game when a key is pressed
                return;
            }
            
            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') this.rj.isMovingUp = true;
            if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') this.rj.isMovingDown = true;
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.rj.isMovingLeft = true;
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.rj.isMovingRight = true;
            
            // Use token ability
            if (e.key === ' ' && this.tokens > 0) {
                this.useToken();
            }
        });
        
        window.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') this.rj.isMovingUp = false;
            if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') this.rj.isMovingDown = false;
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.rj.isMovingLeft = false;
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.rj.isMovingRight = false;
        });
        
        // Mouse interaction - simplified to just toggle interaction mode
        this.canvas.addEventListener('mousedown', (e) => {
            // If splash screen is showing, clicking will dismiss it and start the game
            if (this.showSplashScreen) {
                this.showSplashScreen = false;
                this.start(); // Start the game when clicked
                return;
            }
            
            if (!this.isRunning) return;
            this.rj.interacting = true;
        });
        
        this.canvas.addEventListener('mouseup', () => {
            this.rj.interacting = false;
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            this.rj.interacting = false;
        });
    }
    
    resize() {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
    }
    
    start() {
        if (this.isRunning) return;
        
        // If splash screen is still showing, dismiss it first
        if (this.showSplashScreen) {
            this.showSplashScreen = false;
        }
        
        // Make sure game over screen is hidden
        this.showGameOverScreen = false;
        
        // Reset game state
        this.reset();
        
        // Set running flag
        this.isRunning = true;
        
        // Start the game loop
        this.lastTime = performance.now();
        requestAnimationFrame((time) => this.gameLoop(time));
        
        // Ensure an NPC appears early in the first level
        setTimeout(() => {
            if (this.isRunning && !this.activeNPC && this.level === 1) {
                this.spawnRandomNPC();
            }
        }, 10000); // Wait 10 seconds after game start
    }
    
    reset() {
        this.level = 1;
        this.score = 0;
        this.tokens = 0;
        this.tokenCooldown = false; // Initialize token cooldown
        this.mood = 4;
        this.startingMood = 4; // Track the starting mood value for each level
        this.peopleCount = 10;
        this.peopleLeft = this.peopleCount;
        this.showLevelSplash = false;
        this.showGameOverScreen = false;
        this.levelSplashTimer = 0;
        this.collectedScores = []; // Reset collected scores
        this.csatScore = 0; // Reset CSAT score
        this.moodAdjustment = 0; // Initialize mood adjustment
        this.moodMessage = ""; // Initialize mood message
        
        // Clear game over related properties
        this.gameOverMessage = null;
        this.canRestart = false;
        if (this.restartCooldownTimer) {
            clearTimeout(this.restartCooldownTimer);
            this.restartCooldownTimer = null;
        }
        
        this.rj.x = this.canvas.width / 2;
        this.rj.y = this.canvas.height / 2;
        this.rj.interacting = false;
        this.rj.targetPerson = null;
        this.rj.speedBoost = false;
        this.rj.speedBoostDuration = 0;
        
        this.chappy.x = this.canvas.width / 4;
        this.chappy.y = this.canvas.height / 4;
        this.chappy.frozen = false;
        this.chappy.frozenTime = 0;
        this.chappy.targetPerson = null;
        this.chappy.collecting = false;
        this.chappy.collectingTime = 0;
        this.chappy.collectingPerson = null;
        this.chappy.happy = false;
        this.chappy.happyTime = 0;
        this.chappy.isTargetingRJ = false;
        this.chappy.targetRJTimer = 5 + Math.random() * 5; // Initialize timer to start random chasing behavior
        
        this.skip.x = this.canvas.width / 2;
        this.skip.y = this.canvas.height - 50; // Move Skip up a bit from the bottom
        
        this.dean.x = -50; // Reset Dean's position
        this.dean.active = false; // Reset Dean's activity
        this.dean.zigZagTimer = 0; // Reset Dean's zigzag timer
        this.dean.verticalDirection = 1; // Reset Dean's vertical direction
        this.dean.messageTimer = 0; // Reset Dean's message timer
        this.dean.messageVisible = false; // Reset Dean's message visibility
        this.dean.messageText = null; // Reset Dean's message text
        this.dean.sayingsCount = 0; // Reset Dean's sayings count
        this.dean.spawnTimer = 0; // Reset Dean's spawn timer
        
        this.people = [];
        this.envelopes = [];
        this.rewards = [];
        this.powerups = [];
        
        this.updateUI();
        this.spawnEnvelopes();
        
        // Reset NPC system
        this.npcs = [];
        this.activeNPC = null;
        this.npcSpawnTimer = 5 + Math.random() * 5; // Reduced timer: 5-10 seconds instead of 15-30
        this.positiveFeedbackBuff = false;
        this.positiveFeedbackBuffTime = 0;
    }
    
    gameLoop(currentTime) {
        // If splash screen is showing, don't update game state
        if (this.showSplashScreen) {
            this.renderSplashScreen();
            requestAnimationFrame((time) => this.gameLoop(time));
            return;
        }
        
        // If game over screen is showing, render it and don't update game state
        if (this.showGameOverScreen) {
            console.log("Rendering game over screen in game loop");
            this.renderGameOverScreen();
            requestAnimationFrame((time) => this.gameLoop(time));
            return;
        }
        
        // Don't proceed with game updates if the game is not running
        if (!this.isRunning) {
            // But still request the next frame to keep the loop going
            // This ensures we can show the game over screen
            requestAnimationFrame((time) => this.gameLoop(time));
            return;
        }
        
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        // Don't update game state if level splash is showing
        if (this.showLevelSplash) {
            this.levelSplashTimer -= deltaTime;
            if (this.levelSplashTimer <= 0) {
                this.showLevelSplash = false;
            }
            this.render(); // Still render to show splash screen
        } else {
            this.update(deltaTime);
            this.render();
        }
        
        // Check if game should end due to low Mood
        if (this.checkGameOver()) {
            // Game over has been triggered, but we'll let the next frame handle rendering the game over screen
            requestAnimationFrame((time) => this.gameLoop(time));
            return;
        }
        
        // Check if level is complete (all people have been helped)
        if (this.peopleLeft === 0 && this.people.length === 0) {
            this.nextLevel();
        }
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update(deltaTime) {
        // Don't update if game is not running
        if (!this.isRunning) return;
        
        // Update mood effect timer
        if (this.moodEffectTimer > 0) {
            this.moodEffectTimer -= deltaTime;
        }
        
        // Update RJ's token effect visibility
        if (this.tokenEffectVisible) {
            this.tokenEffectTimer -= deltaTime;
            if (this.tokenEffectTimer <= 0) {
                this.tokenEffectVisible = false;
            }
        }
        
        // Update RJ's message timer
        if (this.rj.messageVisible) {
            this.rj.messageTimer -= deltaTime;
            if (this.rj.messageTimer <= 0) {
                this.rj.messageVisible = false;
                this.rj.messageText = null; // Reset custom message text
            }
        }
        
        // Update Dean's message timer
        if (this.dean.messageVisible) {
            this.dean.messageTimer -= deltaTime;
            if (this.dean.messageTimer <= 0) {
                this.dean.messageVisible = false;
                this.dean.messageText = null; // Reset custom message text
            }
        }
        
        // Update collected NPC message timer
        if (this.collectedNPC && this.collectedNPC.messageVisible) {
            this.collectedNPC.messageTimer -= deltaTime;
            if (this.collectedNPC.messageTimer <= 0) {
                this.collectedNPC.messageVisible = false;
                this.collectedNPC = null; // Remove the collected NPC
            }
        }
        
        // Update RJ's speed boost
        if (this.rj.speedBoost) {
            this.rj.speedBoostDuration -= deltaTime;
            if (this.rj.speedBoostDuration <= 0) {
                this.rj.speedBoost = false;
                this.rj.speed = 200; // Reset to normal speed
            }
        }
        
        // Update Cole effect if active
        if (this.coleActive) {
            this.updateColeEffect(deltaTime);
            
            // Update particles even during Cole effect
            if (this.updateParticles) {
                this.updateParticles(deltaTime);
            }
            
            // Update Mood
            this.updateMood(deltaTime);
            
            // Update timers and effects that should continue during Cole's effect
            this.updateTimersAndEffects(deltaTime);
        } else {
            // Update all game entities when Cole is not active
            this.updateRJ(deltaTime);
            this.updateChappy(deltaTime);
            this.updateDean(deltaTime);
            this.updatePeople(deltaTime);
            this.updateEnvelopes(deltaTime);
            this.updateRewards(deltaTime);
            this.updateNPCs(deltaTime);
            this.updatePowerups(deltaTime);
            
            // Update particles if the method exists
            if (this.updateParticles) {
                this.updateParticles(deltaTime);
            }
            
            // Check collisions
            this.checkCollisions();
            
            // Update Mood
            this.updateMood(deltaTime);
            
            // Update timers and effects
            this.updateTimersAndEffects(deltaTime);
            
            // Spawn rewards occasionally
            if (Math.random() < 0.001) { // Reduced spawn rate
                this.spawnReward();
            }
            
            // Spawn power-ups occasionally
            if (Math.random() < 0.0005) { // Even rarer than rewards
                this.spawnPowerup();
            }
        }
    }
    
    updateRJ(deltaTime) {
        // Move RJ based on key inputs - apply speed boost if active
        const currentSpeed = this.rj.speedBoost ? this.rj.speed * 1.5 : this.rj.speed;
        
        if (this.rj.isMovingUp) this.rj.y -= currentSpeed * deltaTime;
        if (this.rj.isMovingDown) this.rj.y += currentSpeed * deltaTime;
        if (this.rj.isMovingLeft) this.rj.x -= currentSpeed * deltaTime;
        if (this.rj.isMovingRight) this.rj.x += currentSpeed * deltaTime;
        
        // Keep RJ within canvas bounds
        this.rj.x = Math.max(this.rj.width / 2, Math.min(this.canvas.width - this.rj.width / 2, this.rj.x));
        this.rj.y = Math.max(this.rj.height / 2, Math.min(this.canvas.height - this.rj.height / 2, this.rj.y));
        
        // Handle interaction with people - now with improved range
        if (this.rj.interacting) {
            // Check all people within interaction range
            for (const person of this.people) {
                const dx = person.x - this.rj.x;
                const dy = person.y - this.rj.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // If within interaction range
                if (distance <= this.rj.interactionRange) {
                    // Increase CSAT score gradually - INCREASED RATE BY 3X
                    if (person.score < 7) {
                        person.satisfaction += deltaTime * 2.1; // Increased from 0.7 to 2.1
                        if (person.satisfaction >= 1) {
                            person.score = Math.min(7, person.score + 1);
                            person.satisfaction = 0;
                        }
                        
                        // Draw interaction aura
                        this.ctx.beginPath();
                        this.ctx.arc(this.rj.x, this.rj.y, this.rj.interactionRange, 0, Math.PI * 2);
                        this.ctx.fillStyle = 'rgba(46, 204, 113, 0.2)';
                        this.ctx.fill();
                    }
                }
            }
        }
    }
    
    updateChappy(deltaTime) {
        if (this.chappy.frozen) {
            this.chappy.frozenTime -= deltaTime;
            if (this.chappy.frozenTime <= 0) {
                this.chappy.frozen = false;
                this.chappy.isTargetingRJ = false; // Reset targeting when unfrozen
            }
            return;
        }
        
        if (this.chappy.happy) {
            this.chappy.happyTime -= deltaTime;
            if (this.chappy.happyTime <= 0) {
                this.chappy.happy = false;
            }
            // Still allow movement when happy
        }
        
        // If Chappy is collecting feedback, continue the process
        if (this.chappy.collecting) {
            this.chappy.collectingTime -= deltaTime;
            if (this.chappy.collectingTime <= 0) {
                // Finished collecting
                this.chappy.collecting = false;
                
                // Collect the feedback
                if (this.chappy.collectingPerson && this.people.includes(this.chappy.collectingPerson)) {
                    this.score += this.chappy.collectingPerson.score;
                    
                    // Add the collected score to our tracking array
                    this.collectedScores.push(this.chappy.collectingPerson.score);
                    
                    // Calculate new average CSAT score
                    const sum = this.collectedScores.reduce((total, score) => total + score, 0);
                    this.csatScore = this.collectedScores.length > 0 ? sum / this.collectedScores.length : 0;
                    
                    // Apply mood adjustment based on the score
                    const collectedScore = this.chappy.collectingPerson.score;
                    
                    // Apply specific mood changes for each score value
                    let moodChange = 0;
                    switch(collectedScore) {
                        case 1:
                            moodChange = -1.0;
                            break;
                        case 2:
                            moodChange = -0.75;
                            break;
                        case 3:
                            moodChange = -0.50;
                            break;
                        case 4:
                            moodChange = -0.25;
                            break;
                        case 5:
                            moodChange = 0;
                            break;
                        case 6:
                            moodChange = 0.1;
                            break;
                        case 7:
                            moodChange = 0.25;
                            break;
                    }
                    
                    // Apply the mood change (ensuring it stays between 1-10)
                    this.mood = Math.max(1, Math.min(10, this.mood + moodChange));
                    
                    // Only show messages randomly (approximately 20% of the time)
                    if (Math.random() < 0.2) {
                        this.chappy.messageVisible = true;
                        this.chappy.messageTimer = 2; // Show for 2 seconds
                        
                        // Different messages based on score ranges
                        if (collectedScore <= 3) {
                            // Bad scores - blame various characters
                            const badMessages = [
                                "RJ! Did you mess with my feedback again?",
                                "Skip is definitely behind these terrible scores!",
                                "Dean must have sabotaged my feedback!",
                                "I bet SJ tampered with this survey!",
                                "This has Ali's fingerprints all over it!",
                                "Ted broke my feedback system again!",
                                "Gabor's new computers are ruining everything!",
                                "KC did this! I'm sure of it!",
                                "This abysmal score screams Cole's interference!"
                            ];
                            this.chappy.messageText = badMessages[Math.floor(Math.random() * badMessages.length)];
                        } else if (collectedScore <= 5) {
                            // Average scores - call out various characters for mediocrity
                            const averageMessages = [
                                "This is so... average. Just like RJ.",
                                "Mediocre feedback, must be Skip's doing.",
                                "Dean's work is always this uninspiring.",
                                "SJ calls this product enhancement? Please!",
                                "Ali's system checks are as mid as this score.",
                                "Ted's IT support is about this effective.",
                                "Gabor's budget allocation matches this score.",
                                "KC organized this feedback like a mediocre party.",
                                "Cole's organization skills are as average as this."
                            ];
                            this.chappy.messageText = averageMessages[Math.floor(Math.random() * averageMessages.length)];
                        } else if (collectedScore <= 7) {
                            // Good scores - praise Chappy
                            const goodMessages = [
                                "Now THIS is what my amazing self deserves!",
                                "Great scores for a great Chappy!",
                                "Excellent! Finally some recognition of my genius!",
                                "This is what happens when I handle things!"
                            ];
                            this.chappy.messageText = goodMessages[Math.floor(Math.random() * goodMessages.length)];
                        }
                    }
                    
                    // Decrement peopleLeft counter
                    this.peopleLeft = Math.max(0, this.peopleLeft - 1);
                    
                    // Remove the person
                    const index = this.people.indexOf(this.chappy.collectingPerson);
                    if (index !== -1) {
                        this.people.splice(index, 1);
                    }
                    
                    // Update UI
                    this.updateUI();
                }
                
                // Clear the target
                this.chappy.collectingPerson = null;
                this.chappy.targetPerson = null;
            }
            return; // Don't move while collecting
        }
        
        // Update RJ targeting timer
        if (this.chappy.targetRJTimer > 0) {
            this.chappy.targetRJTimer -= deltaTime;
            if (this.chappy.targetRJTimer <= 0) {
                // Randomly decide whether to target RJ directly
                // Higher chance in higher levels
                const targetRJChance = 0.1 + (this.level * 0.03); // 10% base chance + 3% per level
                if (Math.random() < targetRJChance) {
                    this.chappy.isTargetingRJ = true;
                    this.chappy.targetPerson = null; // Clear any person target
                    this.chappy.targetRJTimer = 5 + Math.random() * 3; // Target RJ for 5-8 seconds
                    
                    // Show a threatening message
                    this.chappy.messageVisible = true;
                    this.chappy.messageTimer = 2;
                    
                    // Random chase messages
                    const chaseMessages = [
                        "I'm coming for you, RJ!",
                        "RJ, we need to talk!",
                        "RJ, have you been changing scores?!",
                        "RJ! Those surveys look suspicious!",
                        "RJ! The data doesn't add up!",
                        "RJ! You can't hide those metrics!"
                    ];
                    
                    // Select a random message
                    const randomIndex = Math.floor(Math.random() * chaseMessages.length);
                    this.chappy.messageText = chaseMessages[randomIndex];
                } else {
                    this.chappy.isTargetingRJ = false;
                    this.chappy.targetRJTimer = 8 + Math.random() * 5; // Wait 8-13 seconds before next decision
                }
            }
        } else if (!this.chappy.targetRJTimer) {
            // Initialize timer on first update
            this.chappy.targetRJTimer = 8 + Math.random() * 5;
        }
        
        // If targeting RJ directly
        if (this.chappy.isTargetingRJ) {
            // Move toward RJ
            const dx = this.rj.x - this.chappy.x;
            const dy = this.rj.y - this.chappy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 5) {
                // Move slightly faster when chasing RJ directly
                const chaseSpeed = this.chappy.speed * 1.1;
                this.chappy.x += (dx / distance) * chaseSpeed * deltaTime;
                this.chappy.y += (dy / distance) * chaseSpeed * deltaTime;
            } else {
                // If reached RJ, stop targeting and go back to normal behavior
                this.chappy.isTargetingRJ = false;
                this.chappy.targetRJTimer = 5 + Math.random() * 3;
            }
        }
        // Normal targeting behavior when not targeting RJ
        else if (!this.chappy.targetPerson && this.people.length > 0 && !this.chappy.isTargetingRJ) {
            // Filter for people who have stopped moving (not entering)
            const stoppedPeople = this.people.filter(person => !person.entering);
            
            // Only target people if there are any who have stopped
            if (stoppedPeople.length > 0) {
                // Sort people by CSAT score (prioritize lower scores)
                const sortedPeople = [...stoppedPeople].sort((a, b) => a.score - b.score);
                
                // Occasionally pick a random person instead of the lowest score
                if (Math.random() < 0.3) {
                    this.chappy.targetPerson = stoppedPeople[Math.floor(Math.random() * stoppedPeople.length)];
                } else {
                    this.chappy.targetPerson = sortedPeople[0];
                }
            }
        }
        
        if (this.chappy.targetPerson && !this.chappy.isTargetingRJ) {
            // Move toward target person
            const dx = this.chappy.targetPerson.x - this.chappy.x;
            const dy = this.chappy.targetPerson.y - this.chappy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 5) {  // If not very close to target
                this.chappy.x += (dx / distance) * this.chappy.speed * deltaTime;
                this.chappy.y += (dy / distance) * this.chappy.speed * deltaTime;
            } else {
                // Start collecting feedback
                this.chappy.collecting = true;
                this.chappy.collectingTime = 1.5; // Takes 1.5 seconds to collect feedback (50% faster)
                this.chappy.collectingPerson = this.chappy.targetPerson;
            }
        } else if (!this.chappy.isTargetingRJ) {
            // Random movement if no target and not targeting RJ
            const angle = Math.random() * Math.PI * 2;
            this.chappy.x += Math.cos(angle) * this.chappy.speed * deltaTime;
            this.chappy.y += Math.sin(angle) * this.chappy.speed * deltaTime;
        }
        
        // Keep Chappy within canvas bounds
        this.chappy.x = Math.max(this.chappy.width / 2, Math.min(this.canvas.width - this.chappy.width / 2, this.chappy.x));
        this.chappy.y = Math.max(this.chappy.height / 2, Math.min(this.canvas.height - this.chappy.height / 2, this.chappy.y));
    }
    
    updateDean(deltaTime) {
        // If Dean is not active, check if he should spawn
        if (!this.dean.active) {
            this.dean.spawnTimer -= deltaTime;
            
            // Randomly spawn Dean (less frequently in lower levels)
            if (this.dean.spawnTimer <= 0) {
                // Base delay is longer in early levels, shorter in later levels
                const baseDelay = Math.max(5, 30 - (this.level * 2));
                
                // Reset spawn timer
                this.dean.spawnTimer = baseDelay + Math.random() * 10;
                
                // Randomly decide which side Dean will enter from
                const startFromLeft = Math.random() < 0.5;
                if (startFromLeft) {
                    this.dean.x = -50;
                    this.dean.direction = 1; // Left to right
                } else {
                    this.dean.x = this.canvas.width + 50;
                    this.dean.direction = -1; // Right to left
                }
                
                // Set random Y position
                this.dean.y = 100 + Math.random() * (this.canvas.height - 200);
                
                // Activate Dean
                this.dean.active = true;
                this.dean.sayingsCount = 0;
                this.dean.zigZagTimer = 0;
                this.dean.verticalDirection = Math.random() < 0.5 ? 1 : -1;
                this.dean.isBirthdayDean = false; // Regular Dean by default
            }
            
            return; // Skip the rest if Dean is not active
        }
        
        // Update Dean's zigzag movement
        this.dean.zigZagTimer -= deltaTime;
        if (this.dean.zigZagTimer <= 0) {
            // Set a new timer for the next direction change
            this.dean.zigZagTimer = 0.5 + Math.random();
            this.dean.verticalDirection *= -1; // Reverse vertical direction
        }
        
        // Move Dean horizontally
        this.dean.x += this.dean.direction * this.dean.speed * deltaTime;
        
        // Move Dean vertically in zigzag pattern - more pronounced if Birthday Dean
        const verticalSpeed = this.dean.isBirthdayDean ? this.dean.speed * 1.2 : this.dean.speed * 0.7;
        this.dean.y += this.dean.verticalDirection * verticalSpeed * deltaTime;
        
        // Keep Dean within vertical bounds
        if (this.dean.y < 50) {
            this.dean.y = 50;
            this.dean.verticalDirection = 1; // Change direction if hitting top
        } else if (this.dean.y > this.canvas.height - 50) {
            this.dean.y = this.canvas.height - 50;
            this.dean.verticalDirection = -1; // Change direction if hitting bottom
        }
        
        // Randomly say something if Dean hasn't said enough yet
        if (this.dean.sayingsCount < 2 && !this.dean.messageVisible && Math.random() < 0.01) {
            // Dean's random sayings
            const sayings = this.dean.isBirthdayDean 
                ? ["Thanks for the birthday wishes!", "Birthday feedback is the best!", "I'm dropping party people!"]
                : ["PBR", "Push the Button, say your prayers", "95% is done enough!", "What is done exaclty?", "I am eye Candy!", "Chaos Dean here!", "It makes sense in my mind!"];
            
            const randomIndex = Math.floor(Math.random() * sayings.length);
            this.dean.messageText = sayings[randomIndex];
            this.dean.messageVisible = true;
            this.dean.messageTimer = 2; // Show for 2 seconds
            this.dean.sayingsCount++;
            
            // Create a person with a random score when Dean says something
            this.createDeanPerson();
        }
        
        // Check if Dean has left the screen
        if ((this.dean.direction > 0 && this.dean.x > this.canvas.width + 50) ||
            (this.dean.direction < 0 && this.dean.x < -50)) {
            this.dean.active = false;
            
            // Reset Birthday Dean flag when leaving
            if (this.dean.isBirthdayDean) {
                this.dean.isBirthdayDean = false;
            }
        }
    }
    
    createDeanPerson() {
        // Create a person at Dean's current position, but ensure it's within playable bounds
        let score;
        
        // Birthday Dean drops people with better scores
        if (this.dean.isBirthdayDean) {
            score = 3 + Math.floor(Math.random() * 5); // Score from 3-7 for Birthday Dean
        } else {
            score = Math.floor(Math.random() * 8); // Score from 0-7 for regular Dean
        }
        
        // Ensure the person is within the playable area
        const margin = 50; // Margin from the edges
        const x = Math.max(margin, Math.min(this.canvas.width - margin, this.dean.x));
        const y = Math.max(margin, Math.min(this.canvas.height - margin, this.dean.y));
        
        const person = {
            x: x,
            y: y,
            targetY: y, // Stay at the same Y position
            width: 25,
            height: 25,
            score: score,
            satisfaction: 0,
            speed: 0, // Person doesn't move
            interacted: false,
            fromDean: true, // Mark as created by Dean
            fromBirthdayDean: this.dean.isBirthdayDean, // Mark if from Birthday Dean
            highlightTime: this.dean.isBirthdayDean ? 1 : 0 // Birthday Dean people are highlighted
        };
        
        this.people.push(person);
    }
    
    updatePeople(deltaTime) {
        // Move any entering people
        for (const person of this.people) {
            if (person.entering) {
                person.y += person.speed * deltaTime;
                if (person.y >= person.targetY) {
                    person.y = person.targetY;
                    person.entering = false;
                }
            }
        }
    }
    
    updateEnvelopes(deltaTime) {
        for (let i = this.envelopes.length - 1; i >= 0; i--) {
            const envelope = this.envelopes[i];
            envelope.y -= envelope.speed * deltaTime;
            
            // Add slight horizontal movement toward target X
            if (envelope.targetX) {
                const dx = envelope.targetX - envelope.x;
                // Move 10% of the distance to target per second
                envelope.x += dx * 2 * deltaTime;
                
                // Update rotation based on movement
                if (dx !== 0) {
                    envelope.rotation = Math.max(-0.2, Math.min(0.2, dx * 0.001));
                }
            }
            
            // Remove if it goes off screen
            if (envelope.y < -envelope.height) {
                this.envelopes.splice(i, 1);
                this.spawnPerson();
            }
        }
    }
    
    updateRewards(deltaTime) {
        for (let i = this.rewards.length - 1; i >= 0; i--) {
            const reward = this.rewards[i];
            reward.timeLeft -= deltaTime;
            
            // Move the reward downward
            reward.y += reward.speed * deltaTime;
            
            // Add some horizontal bouncing movement
            reward.x += reward.bounceX * 30 * deltaTime;
            
            // Bounce off the edges
            if (reward.x < reward.width/2 || reward.x > this.canvas.width - reward.width/2) {
                reward.bounceX *= -1;
            }
            
            // Remove if time expires or if it goes off the bottom of the screen
            if (reward.timeLeft <= 0 || reward.y > this.canvas.height + reward.height) {
                this.rewards.splice(i, 1);
            }
        }
    }
    
    checkCollisions() {
        // Check if Chappy reached target person and is collecting
        if (this.chappy.targetPerson && !this.chappy.collecting) {
            if (this.checkCollision(this.chappy, this.chappy.targetPerson)) {
                // Start collecting feedback
                this.chappy.collecting = true;
                this.chappy.collectingTime = 1.5; // Takes 1.5 seconds to collect feedback (50% faster)
                this.chappy.collectingPerson = this.chappy.targetPerson;
            }
        }
        
        // Check if RJ is touching Chappy
        if (this.checkCollision(this.rj, this.chappy) && !this.chappy.frozen) {
            const currentTime = Date.now();
            // Only apply collision effect once per second
            if (currentTime - this.chappy.lastCollisionTime > 1000) {
                // Decrease mood by 1 full point
                this.mood = Math.max(1, this.mood - 1);
                
                // Show Chappy's message
                this.chappy.messageVisible = true;
                this.chappy.messageTimer = 2; // Show for 2 seconds
                
                // Change Chappy's direction
                const angle = Math.random() * Math.PI * 2;
                this.chappy.targetPerson = null; // Clear current target
                this.chappy.collecting = false; // Stop collecting if was doing so
                
                // Push RJ away from Chappy
                const dx = this.rj.x - this.chappy.x;
                const dy = this.rj.y - this.chappy.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 0) {
                    // Normalize and apply push force
                    const pushForce = 50;
                    this.rj.x += (dx / distance) * pushForce * 0.1;
                    this.rj.y += (dy / distance) * pushForce * 0.1;
                    
                    // Keep RJ within canvas bounds
                    this.rj.x = Math.max(this.rj.width / 2, Math.min(this.canvas.width - this.rj.width / 2, this.rj.x));
                    this.rj.y = Math.max(this.rj.height / 2, Math.min(this.canvas.height - this.rj.height / 2, this.rj.y));
                    
                    // Push Chappy away in the opposite direction
                    this.chappy.x -= (dx / distance) * pushForce * 0.1;
                    this.chappy.y -= (dy / distance) * pushForce * 0.1;
                    
                    // Keep Chappy within canvas bounds
                    this.chappy.x = Math.max(this.chappy.width / 2, Math.min(this.canvas.width - this.chappy.width / 2, this.chappy.x));
                    this.chappy.y = Math.max(this.chappy.height / 2, Math.min(this.canvas.height - this.chappy.height / 2, this.chappy.y));
                }
                
                // Update last collision time
                this.chappy.lastCollisionTime = currentTime;
                
                // Update UI
                this.updateUI();
                
                // Check if mood is now at 1
                if (this.mood <= 1) {
                    // We'll let the gameLoop handle the game over
                    // This ensures we render one last frame showing mood at 1
                }
            }
        }
        // NEW FEATURE: Check if Chappy is near RJ while RJ is interacting
        else if (this.rj.interacting && !this.chappy.frozen) {
            const dx = this.rj.x - this.chappy.x;
            const dy = this.rj.y - this.chappy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // If Chappy is within 100 pixels of RJ while RJ is interacting
            if (distance <= 100) {
                // Decrease mood twice as fast (0.2 per second)
                this.mood = Math.max(1, this.mood - 0.2 * (1/60)); // Doubled from 0.1 to 0.2
                
                // Show "What are you doing?" message from Chappy
                if (!this.chappy.messageVisible) {
                    this.chappy.messageVisible = true;
                    this.chappy.messageTimer = 2; // Show for 2 seconds
                    
                    // Random messages about stopping score changes
                    const chappyMessages = [
                        "Stop changing those scores!",
                        "Leave those feedback scores alone!",
                        "Don't touch my feedback data!",
                        "Those scores are fine as they are!",
                        "Step away from the feedback!",
                        "My scores! My precious scores!"
                    ];
                    this.chappy.messageText = chappyMessages[Math.floor(Math.random() * chappyMessages.length)];
                }
                
                // Update UI
                this.updateUI();
                
                // Check if mood reached 1 from this interaction
                if (this.mood <= 1) {
                    // We'll let the gameLoop handle the game over
                    // This ensures we render one last frame showing mood at 1
                }
            }
        }
        
        // Check RJ collision with rewards
        for (let i = this.rewards.length - 1; i >= 0; i--) {
            const reward = this.rewards[i];
            if (this.checkCollision(this.rj, reward)) {
                if (reward.type === 'freeze') {
                    // Freeze reward - freeze Chappy
                    this.chappy.frozen = true;
                    this.chappy.frozenTime = 5; // Freeze for 5 seconds
                    
                    // Show message from Chappy
                    this.chappy.messageVisible = true;
                    this.chappy.messageTimer = 2;
                    this.chappy.messageText = "Oh No - another P1!";
                } else if (reward.type === 'Mood') {
                    // mood reward - increase Chappy's mood
                    this.mood = Math.min(8, this.mood + 1);
                    
                    // Make Chappy happy briefly
                    this.chappy.happy = true;
                    this.chappy.happyTime = 3; // Happy for 3 seconds
                    
                    // Set Chappy's message text for the happy state
                    this.chappy.messageText = "Nice Recognition RJ! Good job!";
                } else if (reward.type === 'token') {
                    // Token reward - add to token count (capped at 5)
                    if (this.tokens < 5) {
                        this.tokens++;
                        
                        // Show message from RJ
                        this.rj.messageVisible = true;
                        this.rj.messageTimer = 2;
                        this.rj.messageText = "Got a token!";
                    } else {
                        // Show message that tokens are maxed
                        this.rj.messageVisible = true;
                        this.rj.messageTimer = 2;
                        this.rj.messageText = "Tokens maxed out!";
                    }
                } else if (reward.type === 'speed') {
                    // Speed boost reward
                    this.rj.speedBoost = true;
                    this.rj.speedBoostDuration = 5; // 5 seconds of speed boost
                    
                    // Show message from RJ
                    this.rj.messageVisible = true;
                    this.rj.messageTimer = 2;
                    this.rj.messageText = "Speed boost!";
                }
                
                // Remove the reward
                this.rewards.splice(i, 1);
                
                // Update UI
                this.updateUI();
            }
        }
    }
    
    updateMood(deltaTime) {
        // Calculate average CSAT score of current people (for mood calculation only)
        let totalScore = 0;
        for (const person of this.people) {
            totalScore += person.score;
        }
        const avgCurrentScore = this.people.length > 0 ? totalScore / this.people.length : 0;
        
        // Update mood based on average CSAT of current people
        if (avgCurrentScore < 3 && this.people.length > 0) {
            this.mood -= 0.01 * deltaTime;
        } else if (avgCurrentScore > 6 && this.people.length > 0) {
            this.mood += 0.01 * deltaTime;
        }
        
        // Check if game should end due to low Mood
        if (this.checkGameOver()) {
            return;
        }
        
        // Normal case: clamp mood value and update UI
        this.mood = Math.min(7, this.mood);
        this.updateUI();
    }
    
    spawnEnvelopes() {
        // Skip sends out envelopes in bursts - with reduced initial delay
        const initialDelay = 1000; // Reduced from 8000 to 1000 ms (1 second)
        
        const interval = setInterval(() => {
            if (!this.isRunning || this.peopleLeft <= 0) {
                clearInterval(interval);
                return;
            }
            
            // Show the message
            this.skip.messageVisible = true;
            this.skip.messageTimer = 2; // Show for 2 seconds
            this.skip.messageText = "RJ, Survey's Out!"; // Set default message
            
            // Determine number of surveys to send based on level
            const minSurveys = 1;
            const maxSurveys = Math.min(3 + Math.floor(this.level / 2), 10); // Increases with level, max 10
            const surveysToSend = minSurveys + Math.floor(Math.random() * (maxSurveys - minSurveys + 1));
            
            // Send surveys in a burst
            for (let i = 0; i < surveysToSend; i++) {
                // Only send if we have people left
                if (this.peopleLeft <= 0) break;
                
                setTimeout(() => {
                    if (!this.isRunning || this.peopleLeft <= 0) return;
                    
                    const envelope = {
                        x: this.skip.x,
                        y: this.skip.y,
                        width: 30, // Increased from 20 to 30
                        height: 20, // Increased from 15 to 20
                        speed: 200, // Doubled from 100 to 200
                        targetX: 50 + Math.random() * (this.canvas.width - 100),
                        rotation: Math.random() * 0.2 - 0.1 // Small random rotation for visual interest
                    };
                    
                    this.envelopes.push(envelope);
                    this.peopleLeft--;
                    this.updateUI();
                }, i * 200); // Send each envelope with a small delay
            }
            
        }, 8000 / Math.sqrt(this.level)); // Interval for subsequent bursts
        
        // Send the first batch almost immediately
        setTimeout(() => {
            if (!this.isRunning) return;
            
            // Show the message
            this.skip.messageVisible = true;
            this.skip.messageTimer = 2; // Show for 2 seconds
            this.skip.messageText = "RJ, Survey's Out!"; // Set default message
            
            // Send initial surveys
            const initialSurveys = Math.min(3 + Math.floor(this.level / 2), 8);
            
            for (let i = 0; i < initialSurveys; i++) {
                if (this.peopleLeft <= 0) break;
                
                setTimeout(() => {
                    if (!this.isRunning || this.peopleLeft <= 0) return;
                    
                    const envelope = {
                        x: this.skip.x,
                        y: this.skip.y,
                        width: 30,
                        height: 20,
                        speed: 200,
                        targetX: 50 + Math.random() * (this.canvas.width - 100),
                        rotation: Math.random() * 0.2 - 0.1
                    };
                    
                    this.envelopes.push(envelope);
                    this.peopleLeft--;
                    this.updateUI();
                }, i * 200);
            }
        }, initialDelay);
    }
    
    spawnPerson() {
        // Create a weighted distribution favoring lower scores
        let score;
        const rand = Math.random();
        
        // Apply positive feedback buff if active
        if (this.positiveFeedbackBuff) {
            // When buff is active, shift probabilities toward higher scores
            if (rand < 0.2) {
                // 20% chance for score 3-4
                score = 3 + Math.floor(Math.random() * 2);
            } else if (rand < 0.5) {
                // 30% chance for score 5
                score = 5;
            } else {
                // 50% chance for score 6-7
                score = 6 + Math.floor(Math.random() * 2);
            }
        } else {
            // Normal distribution (no buff)
            if (rand < 0.25) {
                // 25% chance for score 1-2
                score = 1 + Math.floor(Math.random() * 2);
            } else if (rand < 0.65) {
                // 40% chance for score 3-4
                score = 3 + Math.floor(Math.random() * 2);
            } else if (rand < 0.90) {
                // 25% chance for score 5
                score = 5;
            } else {
                // Only 10% chance for score 6-7
                score = 6 + Math.floor(Math.random() * 2);
            }
        }
        
        const person = {
            x: 50 + Math.random() * (this.canvas.width - 100),
            y: 0,
            targetY: 50 + Math.random() * (this.canvas.height - 250), // Don't go too low
            width: 25,
            height: 25,
            score: score,
            satisfaction: 0, // Progress toward next CSAT level
            speed: 80,
            entering: true
        };
        
        this.people.push(person);
    }
    
    spawnReward() {
        // Determine reward type with weighted probabilities
        let rewardType;
        const rand = Math.random();
        
        if (rand < 0.1) {
            // 10% chance for token (reduced from 20%)
            rewardType = 'token';
        } else if (rand < 0.4) {
            // 30% chance for mood boost (reduced from 40%)
            rewardType = 'Mood';
        } else if (rand < 0.7) {
            // 30% chance for freeze
            rewardType = 'freeze';
        } else {
            // 30% chance for speed boost (new)
            rewardType = 'speed';
        }
        
        const reward = {
            x: 50 + Math.random() * (this.canvas.width - 100),
            y: -20, // Start above the screen
            width: 30, // Increased from 20 to 30
            height: 30, // Increased from 20 to 30
            type: rewardType,
            timeLeft: 8, // 8 seconds before disappearing
            speed: 80 + Math.random() * 60, // Random speed between 80-140 pixels per second
            bounceX: Math.random() > 0.5 ? 1 : -1, // Random horizontal direction
            bounceY: 1, // Start moving downward
            rotation: Math.random() * 0.2 - 0.1 // Small random rotation for visual interest
        };
        
        this.rewards.push(reward);
    }
    
    useToken() {
        // Check if tokens are available and not on cooldown
        if (this.tokens <= 0 || this.tokenCooldown) return;
        
        // Decrement the token count
        this.tokens--;
        
        // Check proximity to Chappy before calling token ability
        const dx = this.rj.x - this.chappy.x;
        const dy = this.rj.y - this.chappy.y;
        const distanceToChappy = Math.sqrt(dx * dx + dy * dy);
        
        // If RJ is close to Chappy, reduce mood by 1
        if (distanceToChappy < 200) {
            this.mood = Math.max(1, this.mood - 1);
            
            // Show Chappy complaining
            this.chappy.messageVisible = true;
            this.chappy.messageTimer = 3; // Show for 3 seconds
            this.chappy.messageText = "Stop distracting me!";
        }
        
        // Set token cooldown
        this.tokenCooldown = true;
        
        // RJ shouts for help
        this.rj.messageVisible = true;
        this.rj.messageTimer = 3; // Show for 3 seconds
        this.rj.messageText = "Skip, I need some help!";
        
        // After a short delay, Skip responds
        setTimeout(() => {
            if (!this.isRunning) return;
            
            this.skip.messageVisible = true;
            this.skip.messageTimer = 3; // Show for 3 seconds
            this.skip.messageText = "Hey Chappy, we have a problem!";
            
            // After another short delay, make Chappy go to Skip
            setTimeout(() => {
                if (!this.isRunning) return;
                
                // Save Chappy's current state
                const savedTargetPerson = this.chappy.targetPerson;
                const wasCollecting = this.chappy.collecting;
                const savedCollectingPerson = this.chappy.collectingPerson;
                
                // Clear Chappy's current task
                this.chappy.targetPerson = null;
                this.chappy.collecting = false;
                this.chappy.collectingPerson = null;
                
                // Make Chappy go to Skip
                this.chappy.messageVisible = true;
                this.chappy.messageTimer = 3; // Show for 3 seconds
                this.chappy.messageText = "Coming to help!";
                
                // Create a temporary target for Chappy to move to Skip
                const tempTarget = {
                    x: this.skip.x,
                    y: this.skip.y - 50, // Position Chappy slightly above Skip
                    width: 1,
                    height: 1
                };
                
                // Set Skip as Chappy's target
                this.chappy.targetPerson = tempTarget;
                
                // After Chappy reaches Skip and talks, resume normal behavior
                setTimeout(() => {
                    if (!this.isRunning) return;
                    
                    // Show Chappy talking to Skip
                    this.chappy.messageVisible = true;
                    this.chappy.messageTimer = 3; // Show for 3 seconds
                    this.chappy.messageText = "I'll get back to work!";
                    
                    // Reset Skip's message text to null so it goes back to default
                    this.skip.messageText = null;
                    
                    // After the conversation, restore Chappy's previous state
                    setTimeout(() => {
                        if (!this.isRunning) return;
                        
                        // Reset Chappy's message text to null
                        this.chappy.messageText = null;
                        
                        // Restore Chappy's previous target and state
                        this.chappy.targetPerson = savedTargetPerson;
                        
                        // Only restore collecting state if the person still exists
                        if (wasCollecting && savedCollectingPerson && this.people.includes(savedCollectingPerson)) {
                            this.chappy.collecting = wasCollecting;
                            this.chappy.collectingPerson = savedCollectingPerson;
                            this.chappy.collectingTime = 1.5; // Reset collection time
                        }
                        
                        // Reset Chappy's targeting timer to ensure random targeting works after token use
                        this.chappy.isTargetingRJ = false;
                        this.chappy.targetRJTimer = 5 + Math.random() * 5;
                        
                        // Reset token cooldown after 5 seconds
                        setTimeout(() => {
                            if (!this.isRunning) return;
                            this.tokenCooldown = false;
                        }, 5000); // 5-second cooldown
                    }, 3000); // Wait 3 seconds after conversation
                }, 3000); // Wait 3 seconds to simulate conversation
            }, 1500); // Wait 1.5 seconds after Skip's message
        }, 1500); // Wait 1.5 seconds after RJ's message
        
        // Update UI to reflect token usage
        this.updateUI();
    }
    
    // New method to show a visual effect when a token is used
    showTokenEffect() {
        // Create a token effect object
        const effect = {
            x: this.rj.x,
            y: this.rj.y,
            radius: 50,
            alpha: 1,
            duration: 1, // 1 second duration
            timeLeft: 1
        };
        
        // Store the effect if we had an effects array
        // this.effects.push(effect);
        
        // For now, just show a temporary message
        this.rj.messageVisible = true;
        this.rj.messageTimer = 2; // Show for 2 seconds
        this.rj.messageText = "Token used!";
    }
    
    checkCollision(obj1, obj2) {
        return (
            obj1.x + obj1.width / 2 > obj2.x - obj2.width / 2 &&
            obj1.x - obj1.width / 2 < obj2.x + obj2.width / 2 &&
            obj1.y + obj1.height / 2 > obj2.y - obj2.height / 2 &&
            obj1.y - obj1.height / 2 < obj2.y + obj2.height / 2
        );
    }
    
    updateUI() {
        this.scoreElement.textContent = this.score;
        this.tokensElement.textContent = this.tokens;
        this.levelElement.textContent = this.level;
        this.peopleLeftElement.textContent = this.peopleLeft;
        
        // The mood bar itself doesn't need height adjustment
        // Only the indicator position changes based on mood level
        
        // Update mood value text
        this.moodValue.textContent = `${Math.max(0, Math.floor(this.mood * 10) / 10)}`;
        
        // Calculate the position percentage based on mood value (mood range is 1-7)
        // This maps mood 1 to 0%, mood 4 to 50%, and mood 7 to 100%
        const moodPercentage = ((this.mood - 1) / 6) * 100;
        
        // Update the position of the mood indicator
        this.moodIndicator.style.left = `${moodPercentage}%`;
        
        // Update CSAT score with proper formatting
        const formattedCSAT = this.csatScore.toFixed(1);
        this.csatValueElement.textContent = formattedCSAT;
        
        // Update buff indicator
        const buffIndicator = document.getElementById('buff-indicator');
        if (buffIndicator) {
            // Hide by default
            buffIndicator.style.display = 'none';
            
            // Check for active buffs/debuffs
            if (this.positiveFeedbackBuff) {
                buffIndicator.style.display = 'block';
                buffIndicator.style.backgroundColor = this.npcTypes['sj'].color;
                buffIndicator.textContent = `Positive Feedback Buff: ${Math.ceil(this.positiveFeedbackBuffTime)}s`;
            } else if (this.chappySlowdown) {
                buffIndicator.style.display = 'block';
                buffIndicator.style.backgroundColor = this.npcTypes['ali'].color;
                buffIndicator.textContent = `Chappy Slowdown: ${Math.ceil(this.chappySlowdownTime)}s`;
            } else if (this.feedbackScoreBoost) {
                buffIndicator.style.display = 'block';
                buffIndicator.style.backgroundColor = this.npcTypes['ted'].color;
                buffIndicator.textContent = `Feedback Scores Boosted!`;
                
                // Reset the boost flag after a brief period
                setTimeout(() => {
                    this.feedbackScoreBoost = false;
                    if (buffIndicator) {
                        buffIndicator.style.display = 'none';
                    }
                }, 3000);
            } else if (this.peopleHappy) {
                buffIndicator.style.display = 'block';
                buffIndicator.style.backgroundColor = this.npcTypes['gabor'].color;
                buffIndicator.textContent = `Happy People: ${Math.ceil(this.peopleHappyTime)}s`;
            }
        }
        
        // Update debug info for development
        const debugDiv = document.getElementById('debug-info');
        if (debugDiv) {
            let debugText = `RPS: ${this.renders} | UPS: ${this.updates}`;
            debugDiv.textContent = debugText;
        }
    }
    
    gameOver(customMessage) {
        console.log("Game Over triggered! Mood:", this.mood);
        this.isRunning = false;
        this.showGameOverScreen = true;
        
        // Set custom game over message if provided
        if (customMessage) {
            this.gameOverMessage = customMessage;
        } else {
            // Use a random funny default message instead of the boring one
            const defaultMessages = [
                "Chappy's mood meter is maxed out... with glee at your demise!",
                "Game over! Chappy is throwing a 'Your Career is Over' party!",
                "Mood flatlined! Chappy's writing your obituary!",
                "Your mood has left the chat... and Chappy is the admin now!",
                "Bye Bye RJ! The Chappy isn't Happy!",
                "Chappy wins, mood plummets, job prospects too!",
                "The mood-o-meter hit rock bottom! Chappy's dancing on it!",
                "Chappy 1, Your Mood 0. Game, set, unemployment!",
                "Your feedback game is weak, but Chappy's schadenfreude is strong!",
                "Mood critical failure! Have you tried turning RJ off and on again?",
                "Chappy's mood improvement plan: Your termination letter!",
                "Your mood just got Chappy-slapped into oblivion!"
            ];
            this.gameOverMessage = defaultMessages[Math.floor(Math.random() * defaultMessages.length)];
        }
        
        // Clear any existing restart cooldown
        if (this.restartCooldownTimer) {
            clearTimeout(this.restartCooldownTimer);
        }
        
        // Set a flag to prevent immediate restart
        this.canRestart = false;
        
        // Fetch leaderboard data from Supabase
        this.fetchLeaderboard().then(() => {
            // Once we have leaderboard data, render the game over screen
            this.renderGameOverScreen();
            
            // Show name prompt after a short delay to allow the game over screen to render
            setTimeout(() => {
                // Only prompt for name if the score is high enough to be on the leaderboard
                // or if the leaderboard doesn't have 5 entries yet
                if (this.leaderboard.length < 5 || this.score > this.leaderboard[this.leaderboard.length - 1]?.score) {
                    this.promptNameAndSaveScore();
                }
            }, 500);
        }).catch(err => {
            console.error("Error fetching leaderboard:", err);
            // Still render the game over screen even if leaderboard fetch fails
            this.renderGameOverScreen();
        });
        
        // Add a cooldown period before allowing restart (3 seconds)
        this.restartCooldownTimer = setTimeout(() => {
            this.canRestart = true;
            
            // Update the prompt text to indicate restart is available
            requestAnimationFrame(() => this.renderGameOverScreen());
            
            console.log("Restart cooldown complete, can restart now");
        }, 3000);
        
        // Add event listeners to handle restart
        const handleRestart = (e) => {
            // Ignore restart attempts during cooldown
            if (!this.canRestart) {
                console.log("Restart attempted during cooldown, ignoring");
                return;
            }
            
            console.log("Restart triggered");
            
            // Clear the game over message so a new one will be selected next time
            this.gameOverMessage = null;
            
            this.showGameOverScreen = false;
            this.showSplashScreen = true;
            this.renderSplashScreen();
            
            // Remove event listeners after use
            window.removeEventListener('keydown', handleRestart);
            this.canvas.removeEventListener('mousedown', handleRestart);
        };
        
        window.addEventListener('keydown', handleRestart);
        this.canvas.addEventListener('mousedown', handleRestart);
        
        // Ensure one more frame is rendered to show the game over screen
        requestAnimationFrame(() => this.renderGameOverScreen());
    }
    
    renderGameOverScreen() {
        console.log("renderGameOverScreen called, showGameOverScreen:", this.showGameOverScreen);
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Semi-transparent background - darker than splash screen
        this.ctx.fillStyle = 'rgba(41, 58, 105, 0.95)'; // Darker blue
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        
        // ===== GAME OVER TITLE =====
        this.ctx.fillStyle = '#e74c3c'; // Red color for game over
        this.ctx.font = 'bold 52px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('GAME OVER', canvasWidth / 2, canvasHeight * 0.12);
        
        // ===== SNARKY MESSAGE =====
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 28px Arial';
        
        // Store the snarky message in a property if not already set
        if (!this.gameOverMessage) {
            const snarkyMessages = [
                "Bye Bye RJ! The Chappy isn't Happy!",
                "Chappy wins, mood plummets, job prospects too!",
                "The mood-o-meter hit rock bottom! Chappy's dancing on it!",
                "Chappy 1, Your Mood 0. Game, set, unemployment!",
                "Your feedback game is weak, but Chappy's schadenfreude is strong!",
                "Mood critical failure! Have you tried turning RJ off and on again?",
                "Chappy's mood improvement plan: Your termination letter!",
                "Your mood just got Chappy-slapped into oblivion!"
            ];
            this.gameOverMessage = snarkyMessages[Math.floor(Math.random() * snarkyMessages.length)];
        }
        
        // Display the stored message
        this.ctx.fillText(this.gameOverMessage, canvasWidth / 2, canvasHeight * 0.2);
        
        // Create a two-column layout
        const leftColumnWidth = canvasWidth * 0.45;
        const rightColumnWidth = canvasWidth * 0.45;
        const leftColumnX = canvasWidth * 0.1;
        const rightColumnX = canvasWidth * 0.55;
        const columnY = canvasHeight * 0.28;
        
        // ===== RESULTS BOX (LEFT COLUMN) =====
        const boxWidth = leftColumnWidth;
        const boxHeight = 180;
        const boxX = leftColumnX;
        const boxY = columnY;
        
        // Draw results box
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
        
        this.ctx.strokeStyle = '#3498db';
        this.ctx.lineWidth = 4;
        this.ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
        
        // Results title
        this.ctx.fillStyle = '#2980b9';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Your Results', boxX + boxWidth/2, boxY + 30);
        
        // Results content
        this.ctx.fillStyle = '#333';
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'left';
        
        // Level reached
        this.ctx.fillText('Level Reached:', boxX + 30, boxY + 70);
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(this.level.toString(), boxX + boxWidth - 30, boxY + 70);
        
        // Final score
        this.ctx.textAlign = 'left';
        this.ctx.font = '20px Arial';
        this.ctx.fillText('Final Score:', boxX + 30, boxY + 110);
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(this.score.toString(), boxX + boxWidth - 30, boxY + 110);
        
        // CSAT Average
        this.ctx.textAlign = 'left';
        this.ctx.font = '20px Arial';
        this.ctx.fillText('CSAT Average:', boxX + 30, boxY + 150);
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(this.csatScore.toFixed(1), boxX + boxWidth - 30, boxY + 150);
        
        // Draw RJ with sad face in the bottom of the left column
        this.drawGameOverRJ(boxX + boxWidth/2, boxY + boxHeight + 100);
        
        // ===== LEADERBOARD (RIGHT COLUMN) =====
        const lbWidth = rightColumnWidth;
        const lbHeight = 300; // Increased height for leaderboard
        const lbX = rightColumnX;
        const lbY = columnY;
        
        // Draw leaderboard box
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.fillRect(lbX, lbY, lbWidth, lbHeight);
        
        this.ctx.strokeStyle = '#3498db';
        this.ctx.lineWidth = 4;
        this.ctx.strokeRect(lbX, lbY, lbWidth, lbHeight);
        
        // Leaderboard title
        this.ctx.fillStyle = '#2980b9';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Leaderboard', lbX + lbWidth/2, lbY + 30);
        
        // Draw leaderboard entries or "No Scores Yet" message
        this.ctx.fillStyle = '#333';
        this.ctx.font = '18px Arial';
        
        if (this.leaderboard.length === 0) {
            // No scores yet
            this.ctx.fillText('No scores yet. Be the first!', lbX + lbWidth/2, lbY + 90);
        } else {
            // Draw column headers
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'left';
            this.ctx.fillText('Rank', lbX + 30, lbY + 70);
            this.ctx.fillText('Player', lbX + 80, lbY + 70);
            this.ctx.fillText('Score', lbX + lbWidth - 140, lbY + 70);
            this.ctx.fillText('Level', lbX + lbWidth - 80, lbY + 70);
            
            // Draw horizontal line under headers
            this.ctx.strokeStyle = '#ddd';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(lbX + 20, lbY + 80);
            this.ctx.lineTo(lbX + lbWidth - 20, lbY + 80);
            this.ctx.stroke();
            
            // Draw each entry
            this.ctx.font = '16px Arial';
            this.leaderboard.forEach((entry, index) => {
                const y = lbY + 110 + (index * 35);
                
                // Highlight the player's score if it matches
                if (entry.score === this.score && entry.level === this.level) {
                    // Draw highlight background
                    this.ctx.fillStyle = 'rgba(46, 204, 113, 0.2)'; // Light green background
                    this.ctx.fillRect(lbX + 20, y - 20, lbWidth - 40, 30);
                    this.ctx.fillStyle = '#27ae60'; // Darker green text
                } else {
                    this.ctx.fillStyle = '#333';
                }
                
                // Draw rank
                this.ctx.textAlign = 'center';
                this.ctx.fillText(`${index + 1}`, lbX + 30, y);
                
                // Draw player name (left-aligned)
                this.ctx.textAlign = 'left';
                const playerName = entry.player_name || 'Player';
                // Truncate name if too long
                const displayName = playerName.length > 12 ? playerName.substring(0, 10) + '...' : playerName;
                this.ctx.fillText(displayName, lbX + 60, y);
                
                // Draw score (right-aligned)
                this.ctx.textAlign = 'right';
                this.ctx.fillText(entry.score.toString(), lbX + lbWidth - 100, y);
                
                // Draw level (right-aligned)
                this.ctx.fillText(entry.level.toString(), lbX + lbWidth - 40, y);
            });
        }
        
        // Draw mini Chappy laughing in the right column (below leaderboard)
        this.drawMiniChappy(lbX + lbWidth - 50, lbY + lbHeight + 30);
        
        // ===== RESTART PROMPT =====
        if (this.canRestart) {
            // Show restart prompt if cooldown is complete
            this.ctx.fillStyle = '#2ecc71'; // Green for restart
            this.ctx.font = 'bold 24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Click or press any key to play again', canvasWidth / 2, canvasHeight * 0.9);
        } else {
            // Show cooldown message
            this.ctx.fillStyle = '#e74c3c'; // Red for cooldown
            this.ctx.font = 'bold 24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Game over! Please wait...', canvasWidth / 2, canvasHeight * 0.9);
        }
        
        this.ctx.textBaseline = 'alphabetic'; // Reset to default
    }
    
    // Helper method to draw sad RJ on game over screen
    drawGameOverRJ(x, y) {
        const radius = 40;
        
        // RJ's face - gray for no Mood
        this.ctx.fillStyle = '#95a5a6';
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw eyes
        this.ctx.fillStyle = '#fff';
        
        // Left eye
        this.ctx.beginPath();
        this.ctx.arc(x - radius/3, y - radius/5, radius/4, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Right eye
        this.ctx.beginPath();
        this.ctx.arc(x + radius/3, y - radius/5, radius/4, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw X pupils (dizzy eyes)
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        
        // Left X
        this.ctx.beginPath();
        this.ctx.moveTo(x - radius/3 - radius/6, y - radius/5 - radius/6);
        this.ctx.lineTo(x - radius/3 + radius/6, y - radius/5 + radius/6);
        this.ctx.moveTo(x - radius/3 + radius/6, y - radius/5 - radius/6);
        this.ctx.lineTo(x - radius/3 - radius/6, y - radius/5 + radius/6);
        this.ctx.stroke();
        
        // Right X
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius/3 - radius/6, y - radius/5 - radius/6);
        this.ctx.lineTo(x + radius/3 + radius/6, y - radius/5 + radius/6);
        this.ctx.moveTo(x + radius/3 + radius/6, y - radius/5 - radius/6);
        this.ctx.lineTo(x + radius/3 - radius/6, y - radius/5 + radius/6);
        this.ctx.stroke();
        
        // Draw sad mouth
        this.ctx.beginPath();
        this.ctx.arc(x, y + radius/2, radius/3, Math.PI * 0.2, Math.PI * 0.8, true);
        this.ctx.stroke();
        
        // Draw sweat drop
        this.ctx.fillStyle = '#3498db';
        this.ctx.beginPath();
        this.ctx.arc(x + radius/2, y, radius/6, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw a small Chappy laughing in the background
        this.drawMiniChappy(x + radius * 1.5, y - radius);
    }
    
    // Helper method to draw mini Chappy laughing
    drawMiniChappy(x, y) {
        const radius = 20;
        
        // Chappy's face
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw eyes
        this.ctx.fillStyle = '#fff';
        
        // Left eye
        this.ctx.beginPath();
        this.ctx.arc(x - radius/3, y - radius/5, radius/4, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Right eye
        this.ctx.beginPath();
        this.ctx.arc(x + radius/3, y - radius/5, radius/4, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw pupils
        this.ctx.fillStyle = '#000';
        
        // Left pupil
        this.ctx.beginPath();
        this.ctx.arc(x - radius/3, y - radius/5, radius/8, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Right pupil
        this.ctx.beginPath();
        this.ctx.arc(x + radius/3, y - radius/5, radius/8, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw laughing mouth
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(x, y + radius/5, radius/3, 0, Math.PI);
        this.ctx.stroke();
        
        // Draw "Ha!" text
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Ha!', x + radius, y - radius/2);
    }
    
    nextLevel() {
        this.level++;
        
        // Determine mood adjustment based on CSAT only
        let moodAdjustment = 0;
        let moodMessage = "";
        
        // Rules for mood adjustment based on CSAT
        if (this.csatScore < 5) {
            moodAdjustment = -1;
            moodMessage = "Low scores? Management isn't happy...";
        } else if (this.csatScore > 6) {
            // If starting mood is below 4, bring it back to 4, otherwise increase by 1
            if (this.startingMood < 4) {
                moodAdjustment = 4 - this.startingMood; // Brings it back to 4
                moodMessage = "Great work! Your mood is restored!";
            } else {
                moodAdjustment = 1;
                moodMessage = "Great work! Management is impressed!";
            }
        }
        
        // Calculate new starting mood value for next level
        const newStartingMood = this.startingMood + moodAdjustment;
        
        // Check if game should end due to low mood
        if (newStartingMood <= 1) {
            // Set mood to 1 and trigger game over
            this.startingMood = 1;
            this.mood = 1;
            this.updateUI();
            this.gameOver("Your mood is too low to continue!");
            return;
        }
        
        // Apply the mood adjustment to both starting and current mood
        this.startingMood = newStartingMood;
        this.mood = newStartingMood;
        
        // Store the adjustment for display in the splash screen
        this.moodAdjustment = moodAdjustment;
        this.moodMessage = moodMessage;
        
        this.peopleCount = 10 + (this.level - 1) * 2; // Increase people count with each level
        this.peopleLeft = this.peopleCount;
        
        // Clear the board of all existing people
        this.people = [];
        
        // Reset collected scores for the new level
        this.collectedScores = [];
        this.csatScore = 0;
        
        // Increase Chappy's speed slightly with each level
        this.chappy.speed = 160 * (1 + (this.level - 1) * 0.1);
        
        // Show level splash screen
        this.showLevelSplash = true;
        this.levelSplashTimer = 3; // Show for 3 seconds
        
        this.updateUI();
        this.spawnEnvelopes(); // Will now spawn faster based on level
        
        // Spawn a new NPC soon after the level starts (after 3-5 seconds)
        setTimeout(() => {
            if (this.isRunning && !this.activeNPC) {
                this.npcSpawnTimer = 3 + Math.random() * 2;
            }
        }, 3000); // Wait for level splash to finish
    }
    
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background (light gray)
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw Skip as a cute square emoji
        this.drawSkipEmoji();
        
        // Draw envelopes as actual envelope icons
        for (const envelope of this.envelopes) {
            this.drawEnvelope(envelope);
        }
        
        // Draw people with CSAT scores as emojis
        for (const person of this.people) {
            // Draw person as emoji
            this.drawPersonEmoji(person);
            
            // Draw satisfaction progress if RJ is interacting with this person
            if (this.rj.interacting) {
                const dx = person.x - this.rj.x;
                const dy = person.y - this.rj.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance <= this.rj.interactionRange && person.score < 7) {
                    this.ctx.fillStyle = '#2ecc71';
                    this.ctx.fillRect(person.x - 15, person.y - 20, 30 * person.satisfaction, 5);
                    this.ctx.strokeStyle = '#000';
                    this.ctx.strokeRect(person.x - 15, person.y - 20, 30, 5);
                }
            }
        }
        
        // Draw rewards
        for (const reward of this.rewards) {
            // Save context for rotation
            this.ctx.save();
            this.ctx.translate(reward.x, reward.y);
            if (reward.rotation) {
                this.ctx.rotate(reward.rotation);
            }
            
            if (reward.type === 'freeze') {
                // Freeze reward - blue snowflake
                const radius = reward.width / 2;
                
                // Create radial gradient for a glowing effect
                const gradient = this.ctx.createRadialGradient(0, 0, radius * 0.5, 0, 0, radius);
                gradient.addColorStop(0, '#3498db'); // Blue center
                gradient.addColorStop(0.7, '#2980b9'); // Darker blue
                gradient.addColorStop(1, 'rgba(41, 128, 185, 0.5)'); // Transparent edge for glow effect
                
                // Draw circular background with gradient
                this.ctx.beginPath();
                this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
                this.ctx.fillStyle = gradient;
                this.ctx.fill();
                
                // Add a subtle white ring
                this.ctx.beginPath();
                this.ctx.arc(0, 0, radius * 0.85, 0, Math.PI * 2);
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
                
                // Draw custom snowflake
                this.ctx.fillStyle = '#fff';
                this.ctx.beginPath();
                
                // Draw snowflake arms
                for (let i = 0; i < 6; i++) {
                    const angle = (Math.PI / 3) * i;
                    this.ctx.moveTo(0, 0);
                    this.ctx.lineTo(Math.cos(angle) * radius * 0.7, Math.sin(angle) * radius * 0.7);
                }
                
                this.ctx.strokeStyle = '#fff';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
                
                // Draw small circle in center
                this.ctx.beginPath();
                this.ctx.arc(0, 0, radius * 0.15, 0, Math.PI * 2);
                this.ctx.fillStyle = '#fff';
                this.ctx.fill();
                
            } else if (reward.type === 'Mood') {
                // mood reward - green heart
                const radius = reward.width / 2;
                
                // Create radial gradient for a glowing effect
                const gradient = this.ctx.createRadialGradient(0, 0, radius * 0.5, 0, 0, radius);
                gradient.addColorStop(0, '#2ecc71'); // Green center
                gradient.addColorStop(0.7, '#27ae60'); // Darker green
                gradient.addColorStop(1, 'rgba(39, 174, 96, 0.5)'); // Transparent edge for glow effect
                
                // Draw circular background with gradient
                this.ctx.beginPath();
                this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
                this.ctx.fillStyle = gradient;
                this.ctx.fill();
                
                // Add a subtle white ring
                this.ctx.beginPath();
                this.ctx.arc(0, 0, radius * 0.85, 0, Math.PI * 2);
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
                
                // Draw heart shape
                const heartSize = radius * 0.6;
                this.ctx.fillStyle = '#fff';
                this.ctx.beginPath();
                this.ctx.moveTo(0, heartSize * 0.3);
                this.ctx.bezierCurveTo(
                    heartSize * 0.4, -heartSize * 0.4, 
                    heartSize, -heartSize * 0.2, 
                    0, heartSize
                );
                this.ctx.bezierCurveTo(
                    -heartSize, -heartSize * 0.2, 
                    -heartSize * 0.4, -heartSize * 0.4, 
                    0, heartSize * 0.3
                );
                this.ctx.fill();
                
            } else if (reward.type === 'token') {
                // Token reward - gold coin with star
                const radius = reward.width / 2;
                
                // Create radial gradient for a glowing effect
                const gradient = this.ctx.createRadialGradient(0, 0, radius * 0.5, 0, 0, radius);
                gradient.addColorStop(0, '#f39c12'); // Bright gold center
                gradient.addColorStop(0.7, '#f1c40f'); // Yellow gold
                gradient.addColorStop(1, 'rgba(241, 196, 15, 0.5)'); // Transparent edge for glow effect
                
                // Draw circular background with gradient
                this.ctx.beginPath();
                this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
                this.ctx.fillStyle = gradient;
                this.ctx.fill();
                
                // Add a subtle white ring
                this.ctx.beginPath();
                this.ctx.arc(0, 0, radius * 0.85, 0, Math.PI * 2);
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
                
                // Draw gold coin edge details
                this.ctx.beginPath();
                this.ctx.arc(0, 0, radius * 0.7, 0, Math.PI * 2);
                this.ctx.strokeStyle = '#e67e22';
                this.ctx.lineWidth = 1;
                this.ctx.stroke();
                
                // Draw star shape
                this.ctx.fillStyle = '#fff';
                this.ctx.beginPath();
                
                // Draw 5-point star
                const starPoints = 5;
                const outerRadius = radius * 0.5;
                const innerRadius = radius * 0.25;
                
                for (let i = 0; i < starPoints * 2; i++) {
                    const r = i % 2 === 0 ? outerRadius : innerRadius;
                    const angle = (Math.PI / starPoints) * i;
                    const x = Math.cos(angle) * r;
                    const y = Math.sin(angle) * r;
                    
                    if (i === 0) {
                        this.ctx.moveTo(x, y);
                    } else {
                        this.ctx.lineTo(x, y);
                    }
                }
                
                this.ctx.closePath();
                this.ctx.fill();
            }
            
            // Restore context
            this.ctx.restore();
            this.ctx.textBaseline = 'alphabetic'; // Reset to default
        }
        
        // Draw power-ups
        for (const powerup of this.powerups) {
            this.drawPowerup(powerup);
        }
        
        // Draw active NPC if present
        if (this.activeNPC) {
            this.drawNPC(this.activeNPC);
            
            // Add a visual indicator above NPC
            this.ctx.fillStyle = 'gold';
            this.ctx.beginPath();
            this.ctx.moveTo(this.activeNPC.x + this.activeNPC.width / 2, this.activeNPC.y - 20);
            this.ctx.lineTo(this.activeNPC.x + this.activeNPC.width / 2 - 10, this.activeNPC.y - 10);
            this.ctx.lineTo(this.activeNPC.x + this.activeNPC.width / 2 + 10, this.activeNPC.y - 10);
            this.ctx.closePath();
            this.ctx.fill();
        }
        
        // Draw collected NPC message if one exists
        if (this.collectedNPC && this.collectedNPC.messageVisible) {
            const x = this.collectedNPC.x + this.collectedNPC.width / 2;
            const y = this.collectedNPC.y;
            
            // Calculate bubble size based on message length
            const textWidth = Math.max(150, this.collectedNPC.message.length * 8); // Approximate width based on text length
            const bubbleWidth = textWidth + 20;
            const bubbleHeight = 40;
            
            // Draw speech bubble
            this.ctx.fillStyle = '#fff';
            this.ctx.beginPath();
            
            // Draw rounded rectangle for the speech bubble
            this.drawRoundedRect(
                x - bubbleWidth / 2,
                y - 70,
                bubbleWidth,
                bubbleHeight,
                10
            );
            
            // Draw the pointer to the NPC
            this.ctx.beginPath();
            this.ctx.moveTo(x - 5, y - 30);
            this.ctx.lineTo(x, y - 10);
            this.ctx.lineTo(x + 5, y - 30);
            this.ctx.closePath();
            this.ctx.fill();
            
            this.ctx.strokeStyle = this.collectedNPC.color;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // Draw message text
            this.ctx.fillStyle = this.collectedNPC.color;
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(this.collectedNPC.message, x, y - 45);
        }
        
        // Draw RJ as emoji
        this.drawRJEmoji();
        
        // Draw Chappy as emoji
        this.drawChappyEmoji();
        
        // Draw Dean if active
        if (this.dean.active) {
            this.drawDeanEmoji();
        }
        
        // Draw interaction aura when RJ is interacting
        if (this.rj.interacting) {
            this.ctx.beginPath();
            this.ctx.arc(this.rj.x, this.rj.y, this.rj.interactionRange, 0, Math.PI * 2);
            this.ctx.strokeStyle = 'rgba(46, 204, 113, 0.8)';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }
        
        // Draw level splash screen if needed
        if (this.showLevelSplash) {
            this.drawLevelSplash();
        }
        
        // Render particles if they exist - in a safer way
        if (this.particles && this.particles.length > 0) {
            // Create a batch rendering approach for better performance
            this.ctx.save();
            
            // Only process a limited number of particles per frame if there are too many
            const maxParticlesPerFrame = 50;
            const particlesToProcess = Math.min(this.particles.length, maxParticlesPerFrame);
            
            for (let i = 0; i < particlesToProcess; i++) {
                const p = this.particles[i];
                
                // Update particle position
                p.x += p.vx * 0.016; 
                p.y += p.vy * 0.016;
                p.lifetime -= 0.016;
                
                // Draw particle
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                this.ctx.fillStyle = p.color;
                this.ctx.globalAlpha = p.lifetime;
                this.ctx.fill();
            }
            
            this.ctx.globalAlpha = 1;
            this.ctx.restore();
            
            // Remove expired particles
            this.particles = this.particles.filter(p => p.lifetime > 0);
        }
        
        // Draw Cole when active
        if (this.coleActive) {
            this.drawColeEmoji();
        }
    }
    
    // Helper method to draw Skip as a cute square emoji
    drawSkipEmoji() {
        const x = this.skip.x;
        const y = this.skip.y;
        const width = this.skip.width;
        const height = this.skip.height;
        
        // Draw Skip's square face
        this.ctx.fillStyle = '#3498db'; // Blue color
        this.ctx.fillRect(x - width/2, y - height/2, width, height);
        
        // Draw a border
        this.ctx.strokeStyle = '#2980b9';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x - width/2, y - height/2, width, height);
        
        // Draw eyes
        this.ctx.fillStyle = '#fff';
        
        // Left eye
        this.ctx.beginPath();
        this.ctx.arc(x - width/5, y - height/8, width/8, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Right eye
        this.ctx.beginPath();
        this.ctx.arc(x + width/5, y - height/8, width/8, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw pupils
        this.ctx.fillStyle = '#000';
        
        // Left pupil
        this.ctx.beginPath();
        this.ctx.arc(x - width/5, y - height/8, width/16, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Right pupil
        this.ctx.beginPath();
        this.ctx.arc(x + width/5, y - height/8, width/16, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw happy mouth
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(x, y + height/8, width/4, 0, Math.PI);
        this.ctx.stroke();
        
        // Draw "Skip" text with better visibility - MATCHING RJ AND CHAPPY STYLE
        // Add a dark background for the name
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(x - 20, y + height/2 + 5, 40, 18);
        
        // Draw the name text
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'alphabetic'; // Reset to default
        this.ctx.fillText('Skip', x, y + height/2 + 18);
        
        // Draw "RJ, Survey's Out!" message if visible
        if (this.skip.messageVisible) {
            // Draw speech bubble
            this.ctx.fillStyle = '#fff';
            this.ctx.beginPath();
            this.ctx.moveTo(x, y - height/2 - 5);
            this.ctx.lineTo(x - 10, y - height/2 - 20);
            this.ctx.lineTo(x - 100, y - height/2 - 20);
            this.ctx.lineTo(x - 100, y - height/2 - 60);
            this.ctx.lineTo(x + 100, y - height/2 - 60);
            this.ctx.lineTo(x + 100, y - height/2 - 20);
            this.ctx.lineTo(x + 10, y - height/2 - 20);
            this.ctx.closePath();
            this.ctx.fill();
            
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
            
            // Draw message text
            this.ctx.fillStyle = '#e74c3c'; // Red text for urgency
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            
            // Use custom message if set, otherwise default
            const messageText = this.skip.messageText || "RJ, Survey's Out!";
            this.ctx.fillText(messageText, x, y - height/2 - 35);
        }
    }
    
    // Helper method to draw RJ as an emoji with expressions based on Mood
    drawRJEmoji() {
        const x = this.rj.x;
        const y = this.rj.y;
        const radius = this.rj.width / 2;
        
        // RJ's face color based on Mood
        let faceColor;
        if (this.mood <= 2) {
            faceColor = '#e74c3c'; // Red for low Mood
        } else if (this.mood <= 4) {
            faceColor = '#f39c12'; // Orange for medium Mood
        } else {
            faceColor = '#2ecc71'; // Green for high Mood
        }
        
        // Draw face
        this.ctx.fillStyle = faceColor;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw eyes
        this.ctx.fillStyle = '#fff';
        
        // Left eye
        this.ctx.beginPath();
        this.ctx.arc(x - radius/3, y - radius/5, radius/4, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Right eye
        this.ctx.beginPath();
        this.ctx.arc(x + radius/3, y - radius/5, radius/4, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw pupils
        this.ctx.fillStyle = '#000';
        
        // Left pupil
        this.ctx.beginPath();
        this.ctx.arc(x - radius/3, y - radius/5, radius/8, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Right pupil
        this.ctx.beginPath();
        this.ctx.arc(x + radius/3, y - radius/5, radius/8, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw mouth based on Mood
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        
        if (this.mood <= 2) {
            // Sad mouth for low Mood
            this.ctx.arc(x, y + radius/2, radius/3, Math.PI * 0.2, Math.PI * 0.8, true);
        } else if (this.mood <= 4) {
            // Neutral mouth for medium Mood
            this.ctx.moveTo(x - radius/3, y + radius/3);
            this.ctx.lineTo(x + radius/3, y + radius/3);
        } else {
            // Happy mouth for high Mood
            this.ctx.arc(x, y + radius/5, radius/3, 0, Math.PI);
        }
        
        this.ctx.stroke();
        
        // Draw "RJ" text with better visibility
        // Add a dark background for the name
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(x - 15, y + radius + 5, 30, 18);
        
        // Draw the name text
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('RJ', x, y + radius + 18);
        
        // Draw RJ's message if visible
        if (this.rj.messageVisible) {
            // Draw speech bubble
            this.ctx.fillStyle = '#fff';
            this.ctx.beginPath();
            this.ctx.moveTo(x, y - radius - 5);
            this.ctx.lineTo(x - 10, y - radius - 20);
            this.ctx.lineTo(x - 100, y - radius - 20);
            this.ctx.lineTo(x - 100, y - radius - 60);
            this.ctx.lineTo(x + 100, y - radius - 60);
            this.ctx.lineTo(x + 100, y - radius - 20);
            this.ctx.lineTo(x + 10, y - radius - 20);
            this.ctx.closePath();
            this.ctx.fill();
            
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
            
            // Draw message text
            this.ctx.fillStyle = '#f1c40f'; // Yellow text for token messages
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            
            // Use custom message if set, otherwise default
            const messageText = this.rj.messageText || "Token used!";
            this.ctx.fillText(messageText, x, y - radius - 35);
        }
        
        // Draw speed boost effect if active
        if (this.rj.speedBoost) {
            // Draw speed lines around RJ
            this.ctx.strokeStyle = '#f1c40f'; // Yellow
            this.ctx.lineWidth = 2;
            
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const startX = x + Math.cos(angle) * (radius + 2);
                const startY = y + Math.sin(angle) * (radius + 2);
                const endX = x + Math.cos(angle) * (radius + 10);
                const endY = y + Math.sin(angle) * (radius + 10);
                
                this.ctx.beginPath();
                this.ctx.moveTo(startX, startY);
                this.ctx.lineTo(endX, endY);
                this.ctx.stroke();
            }
        }
    }
    
    // Helper method to draw Chappy as an emoji
    drawChappyEmoji() {
        const x = this.chappy.x;
        const y = this.chappy.y;
        const radius = this.chappy.width / 2;
        
        // Chappy's face color
        let faceColor;
        if (this.chappy.frozen) {
            faceColor = this.chappy.happy ? '#f39c12' : '#95a5a6'; // Orange when happy, gray when just frozen
        } else {
            faceColor = '#e74c3c'; // Red normally
        }
        
        // Draw face
        this.ctx.fillStyle = faceColor;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw eyes
        this.ctx.fillStyle = '#fff';
        
        
        // Left eye
        this.ctx.beginPath();
        this.ctx.arc(x - radius/3, y - radius/5, radius/4, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Right eye
        this.ctx.beginPath();
        this.ctx.arc(x + radius/3, y - radius/5, radius/4, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw pupils - expression depends on state
        this.ctx.fillStyle = '#000';
        
        if (this.chappy.frozen && !this.chappy.happy) {
            // X eyes when frozen (and not happy)
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 2;
            
            // Left X
            this.ctx.beginPath();
            this.ctx.moveTo(x - radius/3 - radius/6, y - radius/5 - radius/6);
            this.ctx.lineTo(x - radius/3 + radius/6, y - radius/5 + radius/6);
            this.ctx.moveTo(x - radius/3 + radius/6, y - radius/5 - radius/6);
            this.ctx.lineTo(x - radius/3 - radius/6, y - radius/5 + radius/6);
            this.ctx.stroke();
            
            // Right X
            this.ctx.beginPath();
            this.ctx.moveTo(x + radius/3 - radius/6, y - radius/5 - radius/6);
            this.ctx.lineTo(x + radius/3 + radius/6, y - radius/5 + radius/6);
            this.ctx.moveTo(x + radius/3 + radius/6, y - radius/5 - radius/6);
            this.ctx.lineTo(x + radius/3 - radius/6, y - radius/5 + radius/6);
            this.ctx.stroke();
        } else if (this.chappy.happy) {
            // Happy eyes when happy
            // Left pupil
            this.ctx.beginPath();
            this.ctx.arc(x - radius/3, y - radius/5, radius/8, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Right pupil
            this.ctx.beginPath();
            this.ctx.arc(x + radius/3, y - radius/5, radius/8, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Happy eyebrows
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 2;
            
            // Left eyebrow
            this.ctx.beginPath();
            this.ctx.moveTo(x - radius/3 - radius/4, y - radius/5 - radius/8);
            this.ctx.lineTo(x - radius/3 + radius/4, y - radius/5 - radius/4);
            this.ctx.stroke();
            
            // Right eyebrow
            this.ctx.beginPath();
            this.ctx.moveTo(x + radius/3 - radius/4, y - radius/5 - radius/4);
            this.ctx.lineTo(x + radius/3 + radius/4, y - radius/5 - radius/8);
            this.ctx.stroke();
        } else {
            // Angry eyes
            // Left pupil
            this.ctx.beginPath();
            this.ctx.arc(x - radius/3, y - radius/5, radius/8, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Right pupil
            this.ctx.beginPath();
            this.ctx.arc(x + radius/3, y - radius/5, radius/8, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Angry eyebrows
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 2;
            
            // Left eyebrow
            this.ctx.beginPath();
            this.ctx.moveTo(x - radius/3 - radius/4, y - radius/5 - radius/4);
            this.ctx.lineTo(x - radius/3 + radius/4, y - radius/5 - radius/8);
            this.ctx.stroke();
            
            // Right eyebrow
            this.ctx.beginPath();
            this.ctx.moveTo(x + radius/3 - radius/4, y - radius/5 - radius/8);
            this.ctx.lineTo(x + radius/3 + radius/4, y - radius/5 - radius/4);
            this.ctx.stroke();
        }
        
        // Draw mouth
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        
        if (this.chappy.frozen && !this.chappy.happy) {
            // Straight line mouth when frozen (and not happy)
            this.ctx.moveTo(x - radius/3, y + radius/3);
            this.ctx.lineTo(x + radius/3, y + radius/3);
        } else if (this.chappy.happy) {
            // Happy smile when happy
            this.ctx.arc(x, y + radius/5, radius/3, 0, Math.PI);
        } else if (this.chappy.collecting) {
            // Focused mouth when collecting
            this.ctx.moveTo(x - radius/3, y + radius/3);
            this.ctx.lineTo(x + radius/3, y + radius/3);
        } else {
            // Evil smile
            this.ctx.arc(x, y + radius/5, radius/3, 0, Math.PI);
            
            // Fangs
            this.ctx.fillStyle = '#fff';
            
            // Left fang
            this.ctx.beginPath();
            this.ctx.moveTo(x - radius/4, y + radius/5);
            this.ctx.lineTo(x - radius/4 - radius/8, y + radius/5 + radius/4);
            this.ctx.lineTo(x - radius/4 + radius/8, y + radius/5 + radius/4);
            this.ctx.fill();
            
            // Right fang
            this.ctx.beginPath();
            this.ctx.moveTo(x + radius/4, y + radius/5);
            this.ctx.lineTo(x + radius/4 - radius/8, y + radius/5 + radius/4);
            this.ctx.lineTo(x + radius/4 + radius/8, y + radius/5 + radius/4);
            this.ctx.fill();
        }
        
        this.ctx.stroke();
        
        // Draw "Chappy" text with better visibility
        // Add a dark background for the name
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(x - 30, y + radius + 5, 60, 18);
        
        // Draw the name text
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Chappy', x, y + radius + 18);
        
        // If Chappy is collecting, show a progress indicator
        if (this.chappy.collecting) {
            // Draw collection progress bar
            const progressWidth = 30;
            const progress = this.chappy.collectingTime / 3; // 3 seconds is full time
            
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(x - progressWidth/2, y - radius - 15, progressWidth, 5);
            
            this.ctx.fillStyle = '#2ecc71';
            this.ctx.fillRect(x - progressWidth/2, y - radius - 15, progressWidth * (1 - progress), 5);
        }
        
        // If Chappy is happy, show "Thanks RJ!" text
        if (this.chappy.happy) {
            // Text now shown in speech bubble, so removing this direct text
            // this.ctx.fillStyle = '#000';
            // this.ctx.font = '14px Arial';
            // this.ctx.textAlign = 'center';
            // this.ctx.fillText('Thanks RJ!', x, y - radius - 5);
        } else if (this.chappy.frozen && !this.chappy.happy) {
            // Text now shown in speech bubble, so removing this direct text
            // this.ctx.fillStyle = '#000';
            // this.ctx.font = '14px Arial';
            // this.ctx.textAlign = 'center';
            // this.ctx.fillText('Great Job RJ!', x, y - radius - 5);
        }
        
        // If Chappy is happy, show message in text bubble
        if (this.chappy.happy) {
            // Calculate bubble size based on message length
            const messageText = this.chappy.messageText || "Nice Recognition RJ! Good job!";
            const textWidth = Math.max(150, messageText.length * 8); // Approximate width based on text length
            const bubbleWidth = textWidth + 20;
            const bubbleHeight = 40;
            
            // Draw speech bubble
            this.ctx.fillStyle = '#fff';
            this.ctx.beginPath();
            
            // Draw rounded rectangle for the speech bubble
            this.drawRoundedRect(
                x - bubbleWidth / 2,
                y - radius - 70,
                bubbleWidth,
                bubbleHeight,
                10
            );
            
            // Draw the pointer to Chappy
            this.ctx.beginPath();
            this.ctx.moveTo(x - 5, y - radius - 30);
            this.ctx.lineTo(x, y - radius - 10);
            this.ctx.lineTo(x + 5, y - radius - 30);
            this.ctx.closePath();
            this.ctx.fill();
            
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
            
            // Draw message text
            this.ctx.fillStyle = '#2ecc71'; // Green text for happiness
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(messageText, x, y - radius - 45);
        } else if (this.chappy.frozen && !this.chappy.happy) {
            // If Chappy is just frozen (not happy), show custom message in bubble
            // Calculate bubble size based on message length
            const messageText = this.chappy.messageText || "Oh No - another P1!";
            const textWidth = Math.max(150, messageText.length * 8); // Approximate width based on text length
            const bubbleWidth = textWidth + 20;
            const bubbleHeight = 40;
            
            // Draw speech bubble
            this.ctx.fillStyle = '#fff';
            this.ctx.beginPath();
            
            // Draw rounded rectangle for the speech bubble
            this.drawRoundedRect(
                x - bubbleWidth / 2,
                y - radius - 70,
                bubbleWidth,
                bubbleHeight,
                10
            );
            
            // Draw the pointer to Chappy
            this.ctx.beginPath();
            this.ctx.moveTo(x - 5, y - radius - 30);
            this.ctx.lineTo(x, y - radius - 10);
            this.ctx.lineTo(x + 5, y - radius - 30);
            this.ctx.closePath();
            this.ctx.fill();
            
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
            
            // Draw message text
            this.ctx.fillStyle = '#95a5a6'; // Gray text for frozen
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(messageText, x, y - radius - 45);
        }
        
        // Draw Chappy's message if visible
        if (this.chappy.messageVisible && !this.chappy.frozen && !this.chappy.happy) {
            // Calculate bubble size based on message length
            const messageText = this.chappy.messageText || "Out of my way RJ!";
            const textWidth = Math.max(150, messageText.length * 8); // Approximate width based on text length
            const bubbleWidth = textWidth + 20;
            const bubbleHeight = 40;
            
            // Draw speech bubble
            this.ctx.fillStyle = '#fff';
            this.ctx.beginPath();
            
            // Draw rounded rectangle for the speech bubble
            this.drawRoundedRect(
                x - bubbleWidth / 2,
                y - radius - 70,
                bubbleWidth,
                bubbleHeight,
                10
            );
            
            // Draw the pointer to Chappy
            this.ctx.beginPath();
            this.ctx.moveTo(x - 5, y - radius - 30);
            this.ctx.lineTo(x, y - radius - 10);
            this.ctx.lineTo(x + 5, y - radius - 30);
            this.ctx.closePath();
            this.ctx.fill();
            
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
            
            // Draw message text
            this.ctx.fillStyle = '#e74c3c'; // Red text for anger
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(messageText, x, y - radius - 45);
        }
    }
    
    // Helper method to draw people as emojis based on their CSAT score
    drawPersonEmoji(person) {
        const x = person.x;
        const y = person.y;
        const radius = 15;
        
        // Determine face color based on CSAT score
        let faceColor = '#e74c3c'; // Red for low scores
        if (person.score > 3 && person.score <= 5) {
            faceColor = '#f1c40f'; // Yellow for neutral
        } else if (person.score > 5) {
            faceColor = '#2ecc71'; // Green for high scores
        }
        
        // Add glow effect if person is happy
        if (person.happy) {
            this.ctx.save();
            this.ctx.shadowColor = '#FFFF00';
            this.ctx.shadowBlur = 10;
            this.ctx.shadowOffsetX = 0;
            this.ctx.shadowOffsetY = 0;
        }
        
        // Draw body (rounded rectangle)
        this.ctx.fillStyle = '#3498db'; // Blue body
        this.ctx.beginPath();
        this.ctx.moveTo(x - radius, y);
        this.ctx.lineTo(x - radius, y + radius*1.5);
        this.ctx.quadraticCurveTo(x - radius, y + radius*2, x, y + radius*2);
        this.ctx.quadraticCurveTo(x + radius, y + radius*2, x + radius, y + radius*1.5);
        this.ctx.lineTo(x + radius, y);
        this.ctx.fill();
        
        // Draw head (circle)
        this.ctx.fillStyle = faceColor;
        this.ctx.beginPath();
        this.ctx.arc(x, y - radius/2, radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Add hair for some people
        if (person.id % 3 === 0) {
            this.ctx.fillStyle = '#000';
            this.ctx.beginPath();
            this.ctx.moveTo(x - radius, y - radius);
            this.ctx.lineTo(x + radius, y - radius);
            this.ctx.lineTo(x, y - radius*1.5);
            this.ctx.fill();
        }
        
        // Draw eyes
        this.ctx.fillStyle = '#fff';
        
        // Left eye
        this.ctx.beginPath();
        if (this.ctx.ellipse) {
            this.ctx.ellipse(x - radius/3, y - radius/2, radius/4, person.happy ? radius/4 : radius/6, 0, 0, Math.PI * 2);
        } else {
            this.ctx.arc(x - radius/3, y - radius/2, radius/5, 0, Math.PI * 2);
        }
        this.ctx.fill();
        
        // Right eye
        this.ctx.beginPath();
        if (this.ctx.ellipse) {
            this.ctx.ellipse(x + radius/3, y - radius/2, radius/4, person.happy ? radius/4 : radius/6, 0, 0, Math.PI * 2);
        } else {
            this.ctx.arc(x + radius/3, y - radius/2, radius/5, 0, Math.PI * 2);
        }
        this.ctx.fill();
        
        // Draw pupils
        this.ctx.fillStyle = '#000';
        
        // Left pupil
        this.ctx.beginPath();
        this.ctx.arc(x - radius/3, y - radius/2, radius/8, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Right pupil
        this.ctx.beginPath();
        this.ctx.arc(x + radius/3, y - radius/2, radius/8, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw mouth based on CSAT score or happiness
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        
        if (person.happy) {
            // Extra happy mouth when person is happy
            this.ctx.beginPath();
            this.ctx.arc(x, y - radius/2 + radius/3, radius/1.5, 0, Math.PI);
            this.ctx.stroke();
            
            // Extra happy eyebrows
            this.ctx.beginPath();
            this.ctx.moveTo(x - radius/2, y - radius/2 - radius/4);
            this.ctx.lineTo(x - radius/5, y - radius/2 - radius/2);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(x + radius/5, y - radius/2 - radius/2);
            this.ctx.lineTo(x + radius/2, y - radius/2 - radius/4);
            this.ctx.stroke();
            
            // Draw celebration emoji next to the person
            if (person.celebrationEmoji) {
                this.ctx.font = '16px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(person.celebrationEmoji, x + radius*2, y - radius);
            }
            
            // Draw sparkles around the person
            const sparklePositions = [
                { x: x - radius*1.5, y: y - radius*1.5 },
                { x: x + radius*1.5, y: y - radius*1.5 },
                { x: x - radius*1.5, y: y + radius*1.5 },
                { x: x + radius*1.5, y: y + radius*1.5 }
            ];
            
            this.ctx.fillStyle = '#FFD700'; // Gold color for sparkles
            for (const pos of sparklePositions) {
                this.ctx.beginPath();
                this.ctx.arc(pos.x, pos.y, radius/4, 0, Math.PI * 2);
                this.ctx.fill();
            }
        } else if (person.score <= 3) {
            // Sad mouth for low CSAT
            this.ctx.beginPath();
            this.ctx.arc(x, y - radius/2 + radius/2, radius/2, Math.PI * 0.2, Math.PI * 0.8, true);
            this.ctx.stroke();
            
            // Add furrowed eyebrows
            this.ctx.beginPath();
            this.ctx.moveTo(x - radius/2, y - radius/2 - radius/4);
            this.ctx.lineTo(x - radius/5, y - radius/2 - radius/8);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(x + radius/2, y - radius/2 - radius/4);
            this.ctx.lineTo(x + radius/5, y - radius/2 - radius/8);
            this.ctx.stroke();
        } else if (person.score <= 5) {
            // Neutral mouth for medium CSAT
            this.ctx.beginPath();
            this.ctx.moveTo(x - radius/2, y - radius/2 + radius/2);
            this.ctx.lineTo(x + radius/2, y - radius/2 + radius/2);
            this.ctx.stroke();
            
            // Neutral eyebrows
            this.ctx.beginPath();
            this.ctx.moveTo(x - radius/2, y - radius/2 - radius/4);
            this.ctx.lineTo(x - radius/5, y - radius/2 - radius/4);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(x + radius/5, y - radius/2 - radius/4);
            this.ctx.lineTo(x + radius/2, y - radius/2 - radius/4);
            this.ctx.stroke();
        } else {
            // Happy mouth for high CSAT
            this.ctx.beginPath();
            this.ctx.arc(x, y - radius/2 + radius/3, radius/2, 0, Math.PI);
            this.ctx.stroke();
            
            // Happy eyebrows
            this.ctx.beginPath();
            this.ctx.moveTo(x - radius/2, y - radius/2 - radius/5);
            this.ctx.lineTo(x - radius/5, y - radius/2 - radius/3);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(x + radius/5, y - radius/2 - radius/3);
            this.ctx.lineTo(x + radius/2, y - radius/2 - radius/5);
            this.ctx.stroke();
        }
        
        // Draw arms
        this.ctx.strokeStyle = '#3498db';
        this.ctx.lineWidth = radius/2;
        
        // Left arm
        this.ctx.beginPath();
        this.ctx.moveTo(x - radius, y);
        this.ctx.lineTo(x - radius*1.5, y + radius/2);
        this.ctx.stroke();
        
        // Right arm
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + radius*1.5, y + radius/2);
        this.ctx.stroke();
        
        // Draw CSAT score above head with background
        // Background for score
        this.ctx.fillStyle = faceColor;
        this.ctx.beginPath();
        this.ctx.arc(x, y - radius*2, radius/2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Score text
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(person.score, x, y - radius*2);
        this.ctx.textBaseline = 'alphabetic'; // Reset to default
        
        // Restore context if we had a glow effect
        if (person.happy) {
            this.ctx.restore();
        }
    }
    
    // New method to update power-ups
    updatePowerups(deltaTime) {
        for (let i = this.powerups.length - 1; i >= 0; i--) {
            const powerup = this.powerups[i];
            powerup.timeLeft -= deltaTime;
            
            // Add some pulsing effect
            powerup.scale = 1 + 0.2 * Math.sin(Date.now() / 200);
            
            // Remove if time expires
            if (powerup.timeLeft <= 0) {
                this.powerups.splice(i, 1);
                continue;
            }
            
            // Check collision with RJ
            if (this.checkCollision(this.rj, powerup)) {
                // Apply power-up effect
                if (powerup.type === 'speed') {
                    this.rj.speedBoost = true;
                    this.rj.speedBoostDuration = 5; // 5 seconds of speed boost
                }
                
                // Remove the power-up
                this.powerups.splice(i, 1);
            }
        }
    }
    
    // New method to spawn power-ups
    spawnPowerup() {
        const powerup = {
            x: 50 + Math.random() * (this.canvas.width - 100),
            y: -20, // Start above the screen
            width: 30, // Increased from 20 to 30
            height: 30, // Increased from 20 to 30
            type: 'speed', // Currently only speed boost
            timeLeft: 8, // 8 seconds before disappearing
            speed: 80 + Math.random() * 60, // Random speed between 80-140 pixels per second
            scale: 1, // For pulsing animation
            scaleDirection: 0.01, // Scale change per frame
            rotation: Math.random() * 0.2 - 0.1 // Small random rotation
        };
        
        this.powerups.push(powerup);
    }
    
    // Completely restructured splash screen method
    renderSplashScreen() {
        if (!this.showSplashScreen) {
            return; // Don't render if not showing
        }
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Semi-transparent background
        this.ctx.fillStyle = 'rgba(74, 105, 189, 0.9)'; // Match header color
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Calculate canvas dimensions for better positioning
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        
        // ===== TITLE SECTION =====
        // Game title
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('FEEDBACK KING', canvasWidth / 2, canvasHeight * 0.12);
        
        // Game description
        this.ctx.font = 'bold 24px Arial';
        this.ctx.fillText('Help customers before Chappy gets to them!', canvasWidth / 2, canvasHeight * 0.18);
        
        // ===== INSTRUCTIONS SECTION =====
        // Instructions box - increased height to reduce crowding
        const boxWidth = Math.min(600, canvasWidth * 0.8);
        const boxHeight = 280; // Increased from 250 to 280 to fit all instructions
        const boxX = (canvasWidth - boxWidth) / 2;
        const boxY = canvasHeight * 0.25;
        
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
        
        this.ctx.strokeStyle = '#3498db';
        this.ctx.lineWidth = 4;
        this.ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
        
        // Instructions title
        this.ctx.fillStyle = '#2980b9';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.fillText('How to Play', canvasWidth / 2, boxY + 30);
        
        // Instructions content - reduced line spacing
        this.ctx.fillStyle = '#333';
        this.ctx.font = '16px Arial';
        
        const instructions = [
            "• Move RJ with WASD or Arrow Keys",
            "• Click and hold near customers to improve their CSAT scores",
            "• Avoid Chappy who wants to collect feedback before you improve it",
            "• Collect Blue snowflake rewards to freeze Chappy temporarily",
            "• Collect Green heart rewards to increase your Mood",
            "• Collect Yellow star tokens to use special ability (press SPACE)",
            "• Maintain your mood by keeping CSAT scores high",
            "• Watch out for special characters like Dean, Ali, and Ted who appear randomly",
            "• Complete each level by helping all customers"
        ];
        
        for (let i = 0; i < instructions.length; i++) {
            this.ctx.fillText(instructions[i], canvasWidth / 2, boxY + 70 + i * 20); // Reduced spacing from 22 to 20
        }
        
        // ===== CHARACTERS SECTION =====
        // Character section title - adjusted position to account for taller box
        const characterSectionY = boxY + boxHeight + 30; // Reduced from 40 to 30
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.fillText('Meet the Characters', canvasWidth / 2, characterSectionY);
        
        // Draw characters with their roles
        const characterY = characterSectionY + 60;
        this.drawCharacterPreview(canvasWidth * 0.25, characterY, 'RJ', '#2ecc71', 'The Hero');
        this.drawCharacterPreview(canvasWidth * 0.5, characterY, 'Chappy', '#e74c3c', 'The Villain');
        this.drawCharacterPreview(canvasWidth * 0.75, characterY, 'Skip', '#3498db', 'The Automator');
        
        // ===== START PROMPT =====
        // Start prompt
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.fillText('Click or press any key to begin', canvasWidth / 2, canvasHeight * 0.95);
        
        this.ctx.textBaseline = 'alphabetic'; // Reset to default
    }
    
    // Helper method to draw character previews on splash screen
    drawCharacterPreview(x, y, name, color, role) {
        const radius = 30;
        
        // Draw face
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw eyes
        this.ctx.fillStyle = '#fff';
        
        // Left eye
        this.ctx.beginPath();
        this.ctx.arc(x - radius/3, y - radius/5, radius/4, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Right eye
        this.ctx.beginPath();
        this.ctx.arc(x + radius/3, y - radius/5, radius/4, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw pupils
        this.ctx.fillStyle = '#000';
        
        // Left pupil
        this.ctx.beginPath();
        this.ctx.arc(x - radius/3, y - radius/5, radius/8, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Right pupil
        this.ctx.beginPath();
        this.ctx.arc(x + radius/3, y - radius/5, radius/8, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw mouth
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        
        if (name === 'Chappy') {
            // Evil smile for Chappy
            this.ctx.arc(x, y + radius/5, radius/3, 0, Math.PI);
        } else {
            // Happy mouth for others
            this.ctx.arc(x, y + radius/5, radius/3, 0, Math.PI);
        }
        
        this.ctx.stroke();
        
        // Draw name - removed background box, just white text
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(name, x, y + radius + 20);
        
        // Draw role subtitle
        this.ctx.font = '14px Arial';
        this.ctx.fillText(role, x, y + radius + 40);
    }
    
    // New method to draw level splash screen
    drawLevelSplash() {
        // Semi-transparent overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Level text
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(`LEVEL ${this.level}`, this.canvas.width / 2, this.canvas.height / 2 - 60);
        
        // Campaign text
        this.ctx.font = 'bold 32px Arial';
        this.ctx.fillText('New Campaign Starting', this.canvas.width / 2, this.canvas.height / 2);
        
        // mood adjustment message
        if (this.moodAdjustment !== 0 && this.moodMessage) {
            this.ctx.font = 'bold 24px Arial';
            
            // Set color based on adjustment (green for increase, red for decrease)
            if (this.moodAdjustment > 0) {
                this.ctx.fillStyle = '#2ecc71'; // Green
                this.ctx.fillText(`Mood +${this.moodAdjustment}`, this.canvas.width / 2, this.canvas.height / 2 + 40);
            } else if (this.moodAdjustment < 0) {
                this.ctx.fillStyle = '#e74c3c'; // Red
                this.ctx.fillText(`Mood ${this.moodAdjustment}`, this.canvas.width / 2, this.canvas.height / 2 + 40);
            }
            
            // Reset color for the message
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'italic 20px Arial';
            this.ctx.fillText(this.moodMessage, this.canvas.width / 2, this.canvas.height / 2 + 70);
        }
        
        // People count
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`${this.peopleCount} Customers to Help`, this.canvas.width / 2, this.canvas.height / 2 + 110);
        
        // Current mood display
        this.ctx.fillText(`Starting Mood: ${this.mood}`, this.canvas.width / 2, this.canvas.height / 2 + 140);
        
        // Timer bar
        const barWidth = 300;
        const barHeight = 10;
        const barX = (this.canvas.width - barWidth) / 2;
        const barY = this.canvas.height / 2 + 180;
        
        // Background
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Progress
        const progress = this.levelSplashTimer / 3; // 3 seconds is full time
        this.ctx.fillStyle = '#3498db';
        this.ctx.fillRect(barX, barY, barWidth * progress, barHeight);
        
        this.ctx.textBaseline = 'alphabetic'; // Reset to default
    }
    
    // New helper method to draw envelopes
    drawEnvelope(envelope) {
        const x = envelope.x;
        const y = envelope.y;
        const width = envelope.width;
        const height = envelope.height;
        
        // Save the current context state
        this.ctx.save();
        
        // Translate to the envelope's position and apply rotation
        this.ctx.translate(x, y);
        if (envelope.rotation) {
            this.ctx.rotate(envelope.rotation);
        }
        
        // Draw envelope body
        this.ctx.fillStyle = '#f1c40f'; // Yellow color
        this.ctx.fillRect(-width/2, -height/2, width, height);
        
        // Draw envelope border
        this.ctx.strokeStyle = '#d35400'; // Orange border
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(-width/2, -height/2, width, height);
        
        // Draw envelope flap
        this.ctx.beginPath();
        this.ctx.moveTo(-width/2, -height/2);
        this.ctx.lineTo(0, 0);
        this.ctx.lineTo(width/2, -height/2);
        this.ctx.strokeStyle = '#d35400';
        this.ctx.stroke();
        
        // Draw a small "CSAT" text on the envelope
        this.ctx.fillStyle = '#d35400';
        this.ctx.font = '8px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('CSAT', 0, 0);
        
        // Restore the context state
        this.ctx.restore();
    }
    
    // Add a new method to check if game over should be triggered
    checkGameOver() {
        // Use Math.floor to handle floating point precision issues
        // This ensures that even 1.0000000000001 will be treated as 1
        if (Math.floor(this.mood * 100) / 100 <= 1 && this.isRunning) {
            console.log("checkGameOver: mood is at or below 1, triggering game over");
            // Set mood to exactly 1 for display purposes
            this.mood = 1;
            
            // Update UI to show final mood value
            this.updateUI();
            
            // Trigger game over
            this.gameOver();
            return true;
        }
        return false;
    }
    
    // Helper method to draw Dean as a unique emoji character
    drawDeanEmoji() {
        const x = this.dean.x;
        const y = this.dean.y;
        const width = this.dean.width;
        const height = this.dean.height;
        
        // Draw Dean's face (purple circle)
        this.ctx.fillStyle = '#9b59b6'; // Purple color
        this.ctx.beginPath();
        this.ctx.arc(x, y, width/2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw a border
        this.ctx.strokeStyle = '#8e44ad';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(x, y, width/2, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // Draw Birthday Hat if it's Birthday Dean
        if (this.dean.isBirthdayDean) {
            // Draw the cone of the party hat
            this.ctx.fillStyle = '#e74c3c'; // Red party hat
            this.ctx.beginPath();
            this.ctx.moveTo(x, y - height/2 - 5); // Point at the top of the hat
            this.ctx.lineTo(x - width/3, y - height/2 + 5); // Left point at the bottom of the hat
            this.ctx.lineTo(x + width/3, y - height/2 + 5); // Right point at the bottom of the hat
            this.ctx.closePath();
            this.ctx.fill();
            
            // Draw the brim of the party hat
            this.ctx.fillStyle = '#f1c40f'; // Yellow brim
            this.ctx.beginPath();
            this.ctx.ellipse(x, y - height/2 + 5, width/3, width/10, 0, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw a pom-pom on top of the hat
            this.ctx.fillStyle = '#3498db'; // Blue pom-pom
            this.ctx.beginPath();
            this.ctx.arc(x, y - height/2 - 5, width/10, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw confetti dots on the hat
            this.ctx.fillStyle = '#2ecc71'; // Green dot
            this.ctx.beginPath();
            this.ctx.arc(x - width/6, y - height/2 - 2, width/20, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.fillStyle = '#f39c12'; // Orange dot
            this.ctx.beginPath();
            this.ctx.arc(x + width/6, y - height/2 - 2, width/20, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Draw Dean's eyes (white with black pupils)
        const eyeSize = width * 0.15;
        const eyeOffsetX = width * 0.2;
        const eyeOffsetY = height * 0.1;
        
        // Left eye
        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.arc(x - eyeOffsetX, y - eyeOffsetY, eyeSize, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Right eye
        this.ctx.beginPath();
        this.ctx.arc(x + eyeOffsetX, y - eyeOffsetY, eyeSize, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Left pupil
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(x - eyeOffsetX, y - eyeOffsetY, eyeSize * 0.5, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Right pupil
        this.ctx.beginPath();
        this.ctx.arc(x + eyeOffsetX, y - eyeOffsetY, eyeSize * 0.5, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw Dean's smile
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(x, y + height * 0.1, width * 0.25, 0, Math.PI);
        this.ctx.stroke();
        
        // Draw Dean's name with dark background for better visibility
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(x - 20, y - height/2 - 20, 40, 18);
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Dean', x, y - height/2 - 8);
        
        // Draw Dean's message if visible
        if (this.dean.messageVisible) {
            // Calculate bubble size based on message length
            const textWidth = Math.max(150, this.dean.messageText.length * 8); // Approximate width based on text length
            const bubbleWidth = textWidth + 20;
            const bubbleHeight = 40;
            
            // Draw speech bubble
            this.ctx.fillStyle = '#fff';
            this.ctx.beginPath();
            
            // Draw rounded rectangle for the speech bubble
            this.drawRoundedRect(
                x - bubbleWidth / 2,
                y - height/2 - 70,
                bubbleWidth,
                bubbleHeight,
                10
            );
            
            // Draw the pointer to Dean
            this.ctx.beginPath();
            this.ctx.moveTo(x - 5, y - height/2 - 30);
            this.ctx.lineTo(x, y - height/2 - 10);
            this.ctx.lineTo(x + 5, y - height/2 - 30);
            this.ctx.closePath();
            this.ctx.fill();
            
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
            
            // Draw message text
            this.ctx.fillStyle = '#e74c3c'; // Red text for urgency
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(this.dean.messageText, x, y - height/2 - 45);
        }
    }
    
    // Add this new method for NPC management
    updateNPCs(deltaTime) {
        // If no active NPC, update spawn timer
        if (!this.activeNPC) {
            this.npcSpawnTimer -= deltaTime;
            if (this.npcSpawnTimer <= 0) {
                // Increased chance to spawn an NPC (80% chance instead of 50%)
                if (Math.random() < 0.8) {
                    this.spawnRandomNPC();
                }
                // Reset timer for next check (between 5-15 seconds instead of 15-30)
                this.npcSpawnTimer = 5 + Math.random() * 10;
            }
            return;
        }
        
        // Update the message timer for the active NPC
        if (this.activeNPC.messageVisible) {
            this.activeNPC.messageTimer -= deltaTime;
            if (this.activeNPC.messageTimer <= 0) {
                this.activeNPC.messageVisible = false;
            }
        }
        
        // Check for collision with RJ
        if (this.checkCollision(this.rj, this.activeNPC)) {
            this.collectNPC(this.activeNPC);
            return;
        }
        
        // Make NPC move around a bit
        this.activeNPC.moveTimer -= deltaTime;
        if (this.activeNPC.moveTimer <= 0) {
            // Change direction occasionally with limited velocity
            const maxVelocity = 60;
            this.activeNPC.velX = (Math.random() - 0.5) * maxVelocity;
            this.activeNPC.velY = (Math.random() - 0.5) * maxVelocity;
            this.activeNPC.moveTimer = 1 + Math.random() * 2; // 1-3 seconds until next direction change
        }
        
        // Move the NPC with position clamping
        this.activeNPC.x += this.activeNPC.velX * deltaTime;
        this.activeNPC.y += this.activeNPC.velY * deltaTime;
        
        // Keep NPC on screen
        const minX = 0;
        const maxX = this.canvas.width - this.activeNPC.width;
        const minY = 0;
        const maxY = this.canvas.height - this.activeNPC.height;
        
        this.activeNPC.x = Math.max(minX, Math.min(maxX, this.activeNPC.x));
        this.activeNPC.y = Math.max(minY, Math.min(maxY, this.activeNPC.y));
        
        // NPC disappears after a while if not collected
        this.activeNPC.lifeTime -= deltaTime;
        if (this.activeNPC.lifeTime <= 0) {
            this.activeNPC = null;
        }
    }
    
    // Method to spawn Birthday Dean
    spawnBirthdayDean() {
        // Make sure regular Dean is not active
        this.dean.active = false;
        
        // Set up Birthday Dean
        const startFromLeft = Math.random() < 0.5;
        
        this.dean.x = startFromLeft ? -50 : this.canvas.width + 50;
        this.dean.y = 100 + Math.random() * (this.canvas.height - 200);
        this.dean.direction = startFromLeft ? 1 : -1; // Direction based on starting position
        this.dean.active = true;
        this.dean.isBirthdayDean = true;
        this.dean.sayingsCount = 0;
        this.dean.zigZagTimer = 0;
        this.dean.verticalDirection = Math.random() < 0.5 ? 1 : -1;
        this.dean.messageText = "It's my birthday! 🎉";
        this.dean.messageVisible = true;
        this.dean.messageTimer = 3; // Show for 3 seconds
    }
    
    spawnRandomNPC() {
        // Distribute the chances among different NPCs
        const rand = Math.random();
        let npcType;
        
        if (rand < 0.3) { // 30% chance to spawn Gabor
            npcType = 'gabor';
        } else if (rand < 0.4) { // 10% chance to spawn KC (special, less frequent)
            npcType = 'kc';
        } else if (rand < 0.5) { // 10% chance to spawn Cole (special, less frequent)
            npcType = 'cole';
        } else {
            // For the remaining 50%, randomly choose between other NPCs
            const otherNpcTypes = ['sj', 'ali', 'ted'];
            const randomIndex = Math.floor(Math.random() * otherNpcTypes.length);
            npcType = otherNpcTypes[randomIndex];
        }
        
        this.spawnNPC(npcType);
    }
    
    spawnNPC(type) {
        if (this.activeNPC) return; // Only one NPC allowed at a time
        
        const npcType = this.npcTypes[type];
        if (!npcType) return; // Invalid NPC type
        
        // Create the NPC
        const npc = {
            type: type,
            name: npcType.name,
            color: npcType.color,
            message: npcType.message,
            effect: npcType.effect,
            effectDuration: npcType.effectDuration,
            x: 50 + Math.random() * (this.canvas.width - 100),
            y: 50 + Math.random() * (this.canvas.height - 100),
            width: 40,
            height: 40,
            velX: (Math.random() - 0.5) * 100, // Random initial velocity
            velY: (Math.random() - 0.5) * 100,
            moveTimer: 2,
            lifeTime: 45, // Increased from 30 to 45 seconds
            messageTimer: 0,
            messageVisible: false
        };
        
        this.activeNPC = npc;
        
        // Add a debug notification to help track when SJ appears
        console.log(`${npc.name} has appeared on the screen!`);
    }
    
    collectNPC(npc) {
        // Store a copy of the NPC for message display
        this.collectedNPC = {
            x: npc.x,
            y: npc.y,
            width: npc.width,
            height: npc.height,
            color: npc.color,
            name: npc.name,
            message: npc.message,
            messageTimer: 3,
            messageVisible: true
        };
        
        // Add a safer particle system
        if (!this.particles) this.particles = [];
        // Limit particles to prevent performance issues
        const numParticles = Math.min(10, Math.max(5, Math.floor(window.innerWidth / 200)));
        
        for (let i = 0; i < numParticles; i++) {
            this.particles.push({
                x: npc.x + npc.width / 2,
                y: npc.y + npc.height / 2,
                vx: (Math.random() - 0.5) * 100,
                vy: (Math.random() - 0.5) * 100,
                radius: 2 + Math.random() * 2,
                color: npc.color,
                lifetime: 0.5 + Math.random() * 0.5
            });
        }
        
        // Get the buff indicator for visual feedback
        const buffIndicator = document.getElementById('buff-indicator');
        
        // Apply effect based on NPC type
        switch (npc.effect) {
            case 'positive_feedback_buff':
                this.positiveFeedbackBuff = true;
                this.positiveFeedbackBuffTime = npc.effectDuration;
                
                // Flash the buff indicator
                if (buffIndicator) {
                    buffIndicator.style.display = 'block';
                    buffIndicator.classList.add('flash-active');
                    setTimeout(() => {
                        if (buffIndicator) {
                            buffIndicator.classList.remove('flash-active');
                        }
                    }, 1000);
                }
                break;
                
            case 'chappy_slowdown':
                // Store original Chappy speed
                if (!this.chappySlowdown) {
                    this.chappyOriginalSpeed = this.chappy.speed;
                }
                
                // Apply slowdown effect
                this.chappySlowdown = true;
                this.chappySlowdownTime = npc.effectDuration;
                this.chappy.speed = this.chappyOriginalSpeed * 0.5; // Reduce speed by 50%
                
                // Flash the buff indicator
                if (buffIndicator) {
                    buffIndicator.style.display = 'block';
                    buffIndicator.style.backgroundColor = npc.color;
                    buffIndicator.classList.add('flash-active');
                    setTimeout(() => {
                        if (buffIndicator) {
                            buffIndicator.classList.remove('flash-active');
                        }
                    }, 1000);
                }
                break;
                
            case 'feedback_score_boost':
                this.feedbackScoreBoost = true;
                
                // Apply instant boost to all people on screen
                this.people.forEach(person => {
                    if (!person.collected) {
                        // Increase feedback score by 1, ensuring it doesn't exceed 5
                        person.feedbackScore = Math.min(5, person.feedbackScore + 1);
                    }
                });
                
                // Flash all people on screen
                this.people.forEach(person => {
                    if (!person.collected) {
                        person.highlightTime = 1; // Highlight for 1 second
                    }
                });
                
                // Flash the buff indicator
                if (buffIndicator) {
                    buffIndicator.style.display = 'block';
                    buffIndicator.style.backgroundColor = npc.color;
                    buffIndicator.classList.add('flash-active');
                    setTimeout(() => {
                        if (buffIndicator) {
                            buffIndicator.classList.remove('flash-active');
                        }
                    }, 1000);
                }
                break;
                
            case 'make_people_happy':
                this.peopleHappy = true;
                this.peopleHappyTime = npc.effectDuration;
                
                // Make all people on screen visibly happy
                this.people.forEach(person => {
                    if (!person.collected) {
                        // Add a happiness property to each person
                        person.happy = true;
                        person.happyEmoji = "🎉"; // Celebration emoji
                        person.highlightTime = 1; // Initial highlight
                    }
                });
                
                // Flash the buff indicator
                if (buffIndicator) {
                    buffIndicator.style.display = 'block';
                    buffIndicator.style.backgroundColor = npc.color;
                    buffIndicator.classList.add('flash-active');
                    setTimeout(() => {
                        if (buffIndicator) {
                            buffIndicator.classList.remove('flash-active');
                        }
                    }, 1000);
                }
                break;
                
            case 'spawn_birthday_dean':
                // Spawn a special Birthday Dean that crosses the screen
                this.spawnBirthdayDean();
                
                // Flash the buff indicator
                if (buffIndicator) {
                    buffIndicator.style.display = 'block';
                    buffIndicator.style.backgroundColor = npc.color;
                    buffIndicator.classList.add('flash-active');
                    setTimeout(() => {
                        if (buffIndicator) {
                            buffIndicator.classList.remove('flash-active');
                        }
                    }, 1000);
                }
                break;
            
            case 'organize_respondents':
                // Start Cole's special functionality
                this.startColeEffect();
                
                // Flash the buff indicator
                if (buffIndicator) {
                    buffIndicator.style.display = 'block';
                    buffIndicator.style.backgroundColor = npc.color;
                    buffIndicator.classList.add('flash-active');
                    setTimeout(() => {
                        if (buffIndicator) {
                            buffIndicator.classList.remove('flash-active');
                        }
                    }, 1000);
                }
                break;
        }
        
        // Remove the NPC
        this.activeNPC = null;
        
        // Update score
        this.score += 100;
        this.updateUI();
    }
    
    startColeEffect() {
        // Initialize Cole effect
        this.coleActive = true;
        this.colePhase = 'freeze';
        this.coleTimer = 0;
        
        // Store Cole's position (initially at RJ's position)
        this.coleX = this.rj.x;
        this.coleY = this.rj.y;
        
        // Create a list of uncollected respondents to gather
        this.collectingRespondents = [];
        this.people.forEach(person => {
            if (!person.collected) {
                this.collectingRespondents.push(person);
            }
        });
        
        // Play a fun shout message
        this.coleMessage = "Time to bring order to chaos!";
        this.coleMessageVisible = true;
        this.coleMessageTimer = 3; // Show message for 3 seconds
        
        // Display a freeze effect
        this.freezeEffectVisible = true;
        this.freezeEffectTimer = 1; // 1 second freeze effect
        
        // Set Cole's speed (faster than normal characters)
        this.coleSpeed = 600; // Increased speed for quicker collection
    }
    
    updateColeEffect(deltaTime) {
        if (!this.coleActive) return;
        
        // Update Cole's timer
        this.coleTimer += deltaTime;
        
        // Update Cole's message timer if visible
        if (this.coleMessageVisible) {
            this.coleMessageTimer -= deltaTime;
            if (this.coleMessageTimer <= 0) {
                this.coleMessageVisible = false;
            }
        }
        
        // Update freeze effect if visible
        if (this.freezeEffectVisible) {
            this.freezeEffectTimer -= deltaTime;
            if (this.freezeEffectTimer <= 0) {
                this.freezeEffectVisible = false;
            }
        }
        
        switch (this.colePhase) {
            case 'freeze':
                // Freeze everything for a moment
                if (this.coleTimer >= 1) {
                    this.colePhase = 'collect';
                    this.coleTimer = 0;
                    
                    // Start with the first respondent if there are any
                    if (this.collectingRespondents.length > 0) {
                        this.coleTargetRespondent = this.collectingRespondents[0];
                    } else {
                        // If no respondents to collect, skip to unfreeze
                        this.colePhase = 'unfreeze';
                    }
                }
                break;
                
            case 'collect':
                if (this.coleTargetRespondent) {
                    // Move toward target respondent with a zig-zag pattern for more dynamic movement
                    const dx = this.coleTargetRespondent.x - this.coleX;
                    const dy = this.coleTargetRespondent.y - this.coleY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance > 5) {
                        // Add a slight zig-zag pattern
                        const zigzagAmount = Math.sin(this.coleTimer * 10) * 5;
                        
                        // Move Cole toward the target
                        const normalizedDx = dx / distance;
                        const normalizedDy = dy / distance;
                        
                        this.coleX += (normalizedDx * this.coleSpeed + normalizedDy * zigzagAmount) * deltaTime;
                        this.coleY += (normalizedDy * this.coleSpeed - normalizedDx * zigzagAmount) * deltaTime;
                    } else {
                        // Collect the respondent
                        this.coleTargetRespondent.collected = true;
                        this.coleTargetRespondent.collectTimer = 0.5; // Add a brief collection animation time
                        
                        // Add a collection effect
                        if (!this.particles) this.particles = [];
                        for (let i = 0; i < 8; i++) {
                            this.particles.push({
                                x: this.coleTargetRespondent.x,
                                y: this.coleTargetRespondent.y,
                                vx: (Math.random() - 0.5) * 120,
                                vy: (Math.random() - 0.5) * 120,
                                radius: 3 + Math.random() * 3,
                                color: this.npcTypes['cole'].color,
                                lifetime: 0.8 + Math.random() * 0.4
                            });
                        }
                        
                        // Remove from array
                        const index = this.collectingRespondents.indexOf(this.coleTargetRespondent);
                        if (index > -1) {
                            this.collectingRespondents.splice(index, 1);
                        }
                        
                        // Move to next respondent or organize phase
                        if (this.collectingRespondents.length > 0) {
                            this.coleTargetRespondent = this.collectingRespondents[0];
                        } else {
                            this.colePhase = 'organize';
                            this.coleTimer = 0;
                            this.organizeRespondents();
                        }
                    }
                }
                break;
                
            case 'organize':
                // Wait for a moment to show the organization
                if (this.coleTimer >= 2) {
                    this.colePhase = 'unfreeze';
                    this.coleTimer = 0;
                    
                    // Add a message
                    this.coleMessage = "All organized! Back to work!";
                    this.coleMessageVisible = true;
                    this.coleMessageTimer = 2;
                }
                break;
                
            case 'unfreeze':
                // Unfreeze everything and end Cole effect
                if (this.coleTimer >= 1) {
                    this.coleActive = false;
                    
                    // Add points for organization
                    this.score += this.collectingRespondents.length * 50; // 50 points per person organized
                }
                break;
        }
    }
    
    organizeRespondents() {
        // Collect all respondents
        const allRespondents = [];
        this.people.forEach(person => {
            // Only organize collected respondents
            if (person.collected) {
                allRespondents.push(person);
            }
        });
        
        // Sort respondents by feedback score (highest to lowest)
        allRespondents.sort((a, b) => b.feedbackScore - a.feedbackScore);
        
        // Organize in rows
        const spacing = 70; // Increased spacing for better visibility
        const rowLength = Math.min(Math.floor(this.canvas.width / spacing), 8); // Max 8 per row
        const startX = (this.canvas.width - (Math.min(rowLength, allRespondents.length) * spacing)) / 2 + 35;
        const startY = 120; // Start a bit lower to give more space
        
        allRespondents.forEach((person, index) => {
            const row = Math.floor(index / rowLength);
            const col = index % rowLength;
            
            // Add a slight staggered effect to make it look more natural
            const offsetX = (row % 2) * (spacing / 2); // Offset every other row
            
            // Set new position
            person.x = startX + offsetX + col * spacing;
            person.y = startY + row * spacing;
            
            // Add a longer highlight effect
            person.highlightTime = 2;
            
            // Add sparkle particles
            if (!this.particles) this.particles = [];
            for (let i = 0; i < 5; i++) {
                this.particles.push({
                    x: person.x,
                    y: person.y,
                    vx: (Math.random() - 0.5) * 50,
                    vy: (Math.random() - 0.5) * 50,
                    radius: 2 + Math.random() * 2,
                    color: this.npcTypes['cole'].color,
                    lifetime: 1 + Math.random() * 0.5
                });
            }
        });
    }
    
    // Add this new method for drawing NPCs
    drawNPC(npc) {
        // Base Skip-like character but with different color
        this.ctx.save();
        
        // Add a glowing effect
        const glowRadius = npc.width * 0.6;
        const gradient = this.ctx.createRadialGradient(
            npc.x + npc.width / 2, npc.y + npc.height / 2, glowRadius * 0.4,
            npc.x + npc.width / 2, npc.y + npc.height / 2, glowRadius
        );
        gradient.addColorStop(0, 'rgba(142, 68, 173, 0.6)');
        gradient.addColorStop(1, 'rgba(142, 68, 173, 0)');
        
        this.ctx.beginPath();
        this.ctx.arc(npc.x + npc.width / 2, npc.y + npc.height / 2, glowRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        
        // Pulse animation effect
        const time = performance.now() / 1000;
        const scale = 1 + 0.1 * Math.sin(time * 3); // Pulsing effect
        
        this.ctx.translate(npc.x + npc.width / 2, npc.y + npc.height / 2);
        this.ctx.scale(scale, scale);
        this.ctx.translate(-(npc.x + npc.width / 2), -(npc.y + npc.height / 2));
        
        // Draw body (color from NPC type)
        this.ctx.fillStyle = npc.color;
        this.ctx.beginPath();
        this.ctx.arc(npc.x + npc.width / 2, npc.y + npc.height / 2, npc.width / 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw eyes (white)
        this.ctx.fillStyle = 'white';
        
        // Left eye
        this.ctx.beginPath();
        this.ctx.arc(npc.x + npc.width / 3, npc.y + npc.height / 3, npc.width / 8, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Right eye
        this.ctx.beginPath();
        this.ctx.arc(npc.x + (npc.width * 2) / 3, npc.y + npc.height / 3, npc.width / 8, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw pupils (black)
        this.ctx.fillStyle = 'black';
        
        // Left pupil
        this.ctx.beginPath();
        this.ctx.arc(npc.x + npc.width / 3, npc.y + npc.height / 3, npc.width / 16, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Right pupil
        this.ctx.beginPath();
        this.ctx.arc(npc.x + (npc.width * 2) / 3, npc.y + npc.height / 3, npc.width / 16, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw smile
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(npc.x + npc.width / 2, npc.y + npc.height / 2, npc.width / 3, 0.2 * Math.PI, 0.8 * Math.PI);
        this.ctx.stroke();
        
        // Draw a crown on top to make it more distinctive
        this.ctx.fillStyle = 'gold';
        this.ctx.beginPath();
        this.ctx.moveTo(npc.x + npc.width / 2 - 15, npc.y - 5);
        this.ctx.lineTo(npc.x + npc.width / 2 - 10, npc.y - 15);
        this.ctx.lineTo(npc.x + npc.width / 2, npc.y - 5);
        this.ctx.lineTo(npc.x + npc.width / 2 + 10, npc.y - 15);
        this.ctx.lineTo(npc.x + npc.width / 2 + 15, npc.y - 5);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Draw name above
        this.ctx.fillStyle = 'black';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(npc.name, npc.x + npc.width / 2, npc.y - 20);
        
        // Draw speech bubble with message if visible
        if (npc.messageVisible && npc.message) {
            const x = npc.x + npc.width / 2;
            const y = npc.y;
            
            // Draw speech bubble
            this.ctx.fillStyle = '#fff';
            this.ctx.beginPath();
            this.ctx.moveTo(x, y - 5);
            this.ctx.lineTo(x - 10, y - 20);
            this.ctx.lineTo(x - 100, y - 20);
            this.ctx.lineTo(x - 100, y - 60);
            this.ctx.lineTo(x + 100, y - 60);
            this.ctx.lineTo(x + 100, y - 20);
            this.ctx.lineTo(x + 10, y - 20);
            this.ctx.closePath();
            this.ctx.fill();
            
            this.ctx.strokeStyle = npc.color || '#000';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // Draw message text
            this.ctx.fillStyle = npc.color || '#000';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(npc.message, x, y - 40);
        }
        
        this.ctx.restore();
    }
    
    // Draw a powerup
    drawPowerup(powerup) {
        if (powerup.type === 'speed') {
            // Draw speed boost power-up
            const scaledWidth = powerup.width * powerup.scale;
            const radius = scaledWidth / 2;
            
            // Save context for scaling effects
            this.ctx.save();
            this.ctx.translate(powerup.x, powerup.y);
            
            // Create radial gradient for a glowing effect
            const gradient = this.ctx.createRadialGradient(0, 0, radius * 0.5, 0, 0, radius);
            gradient.addColorStop(0, '#f39c12'); // Bright orange center
            gradient.addColorStop(0.7, '#e67e22'); // Darker orange
            gradient.addColorStop(1, 'rgba(230, 126, 34, 0.5)'); // Transparent edge for glow effect
            
            // Draw circular background with gradient
            this.ctx.beginPath();
            this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
            
            // Add a subtle white ring
            this.ctx.beginPath();
            this.ctx.arc(0, 0, radius * 0.85, 0, Math.PI * 2);
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // Draw lightning bolt
            this.ctx.fillStyle = '#fff';
            this.ctx.beginPath();
            
            // Custom lightning bolt shape
            const boltSize = radius * 0.6;
            this.ctx.moveTo(-boltSize * 0.3, -boltSize);
            this.ctx.lineTo(boltSize * 0.3, -boltSize * 0.2);
            this.ctx.lineTo(0, boltSize * 0.2);
            this.ctx.lineTo(boltSize * 0.3, boltSize);
            this.ctx.lineTo(-boltSize * 0.3, 0);
            this.ctx.lineTo(0, -boltSize * 0.4);
            this.ctx.closePath();
            this.ctx.fill();
            
            // Restore context
            this.ctx.restore();
        }
    }
    
    drawColeEmoji() {
        const x = this.coleX;
        const y = this.coleY;
        
        this.ctx.save();
        this.ctx.translate(x, y);
        
        // Draw freeze effect if visible
        if (this.freezeEffectVisible) {
            // Draw a pulse circle for the freeze effect
            const pulseSize = 50 + Math.sin(this.coleTimer * 10) * 20;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, pulseSize, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(22, 160, 133, 0.2)'; // Transparent teal
            this.ctx.fill();
            
            // Draw snowflake-like lines
            this.ctx.strokeStyle = 'rgba(22, 160, 133, 0.6)';
            this.ctx.lineWidth = 2;
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                this.ctx.beginPath();
                this.ctx.moveTo(0, 0);
                this.ctx.lineTo(Math.cos(angle) * pulseSize, Math.sin(angle) * pulseSize);
                this.ctx.stroke();
            }
        }
        
        // Draw Cole (female PM emoji)
        this.ctx.font = '30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('👩‍💼', 0, 0);
        
        // Draw message if visible
        if (this.coleMessageVisible && this.coleMessage) {
            // Draw message bubble
            const textWidth = this.coleMessage.length * 7; // Approximate width
            const bubbleWidth = textWidth + 20;
            const bubbleHeight = 30;
            
            // Draw the bubble
            this.ctx.fillStyle = 'white';
            this.ctx.strokeStyle = this.npcTypes['cole'].color;
            this.ctx.lineWidth = 2;
            
            // Draw rounded rectangle for the speech bubble
            this.drawRoundedRect(
                -bubbleWidth / 2,
                -60,
                bubbleWidth,
                bubbleHeight,
                10
            );
            
            // Draw the pointer to Cole
            this.ctx.beginPath();
            this.ctx.moveTo(-5, -30);
            this.ctx.lineTo(0, -10);
            this.ctx.lineTo(5, -30);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
            
            // Draw the message text
            this.ctx.font = '14px Arial';
            this.ctx.fillStyle = 'black';
            this.ctx.fillText(this.coleMessage, 0, -45);
        } else if (this.colePhase === 'collect' || this.colePhase === 'organize') {
            // Draw action message
            this.ctx.font = '14px Arial';
            this.ctx.fillStyle = 'black';
            
            let actionText = (this.colePhase === 'collect') ? 'Collecting!' : 'Organizing!';
            this.ctx.fillText(actionText, 0, -25);
        }
        
        this.ctx.restore();
    }
    
    // Helper method to draw rounded rectangles for speech bubbles
    drawRoundedRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
    }
    
    // Helper method to update timers and effects that should continue regardless of Cole's effect
    updateTimersAndEffects(deltaTime) {
        // Update positive feedback buff if active
        if (this.positiveFeedbackBuff) {
            this.positiveFeedbackBuffTime -= deltaTime;
            if (this.positiveFeedbackBuffTime <= 0) {
                this.positiveFeedbackBuff = false;
            }
        }
        
        // Update Chappy slowdown effect if active
        if (this.chappySlowdown) {
            this.chappySlowdownTime -= deltaTime;
            if (this.chappySlowdownTime <= 0) {
                this.chappySlowdown = false;
                // Restore original speed
                this.chappy.speed = this.chappyOriginalSpeed;
            }
            
            // Update buff indicator if visible
            const buffIndicator = document.getElementById('buff-indicator');
            if (buffIndicator && this.chappySlowdown) {
                buffIndicator.textContent = `Chappy Slowdown: ${Math.ceil(this.chappySlowdownTime)}s`;
            }
        }
        
        // Update people happiness effect if active
        if (this.peopleHappy) {
            this.peopleHappyTime -= deltaTime;
            
            // Keep people happy while the effect is active
            this.people.forEach(person => {
                if (!person.collected && person.happy) {
                    // Periodically create a small animation/highlight effect
                    if (Math.random() < 0.02) {
                        person.highlightTime = 0.5; // Half-second highlight
                    }
                }
            });
            
            if (this.peopleHappyTime <= 0) {
                this.peopleHappy = false;
                // Remove happiness from all people
                this.people.forEach(person => {
                    person.happy = false;
                    person.happyEmoji = null;
                });
            }
            
            // Update buff indicator if visible
            const buffIndicator = document.getElementById('buff-indicator');
            if (buffIndicator && this.peopleHappy) {
                buffIndicator.textContent = `Happy People: ${Math.ceil(this.peopleHappyTime)}s`;
                buffIndicator.style.backgroundColor = this.npcTypes['gabor'].color;
            }
        }
        
        // Update Skip's message timer
        if (this.skip && this.skip.messageVisible) {
            this.skip.messageTimer -= deltaTime;
            if (this.skip.messageTimer <= 0) {
                this.skip.messageVisible = false;
            }
        }
        
        // Update Chappy's message timer
        if (this.chappy.messageVisible) {
            this.chappy.messageTimer -= deltaTime;
            if (this.chappy.messageTimer <= 0) {
                this.chappy.messageVisible = false;
                this.chappy.messageText = null; // Reset custom message text
            }
        }
    }
    
    // Helper method to draw attack animation
    drawAttackAnimation() {
        // ... existing code ...
    }
    
    // === Supabase Leaderboard Methods ===
    
    // Fetch top 5 scores from Supabase
    async fetchLeaderboard() {
        try {
            const { data, error } = await this.supabase
                .from('leaderboard')
                .select('*')
                .order('score', { ascending: false })
                .limit(5);
                
            if (error) {
                console.error('Error fetching leaderboard:', error);
                return false;
            }
            
            this.leaderboard = data || [];
            return true;
        } catch (err) {
            console.error('Failed to fetch leaderboard:', err);
            return false;
        }
    }
    
    // Save score to Supabase leaderboard
    async saveScore(playerName) {
        try {
            // Default to 'Player' if no name provided
            const name = playerName || 'Player';
            
            const { error } = await this.supabase
                .from('leaderboard')
                .insert([
                    { 
                        player_name: name, 
                        score: this.score, 
                        level: this.level,
                        csat: this.csatScore,
                        date: new Date().toISOString()
                    }
                ]);
                
            if (error) {
                console.error('Error saving score:', error);
                return false;
            }
            
            // Re-fetch the leaderboard after saving
            return await this.fetchLeaderboard();
        } catch (err) {
            console.error('Failed to save score:', err);
            return false;
        }
    }
    
    // Prompt player for name and save score
    async promptNameAndSaveScore() {
        // Simple prompt for player name (you can replace with a prettier UI if desired)
        const playerName = prompt('Congratulations! Enter your name for the leaderboard:', 'Player');
        
        if (playerName !== null) {
            await this.saveScore(playerName);
        }
    }
    
    // End Game and Show Game Over Screen
    endGame(message) {
        // ... existing code ...
    }
}

// Initialize the game when the window loads
window.addEventListener('load', () => {
    const game = new Game();
});
