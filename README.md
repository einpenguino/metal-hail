This simple game is developed using the JS Canvas API, which renders simple shapes defined in JS and drawn within the canvas object itself.
By varying the position of objects rendered per frame, we can simulate movement of objects. Since we know the position and size of each object, we can use math & JS to enhance interactivity and implement collision physics!

Handy References include: 
Canvas API - Web APIs | MDN (mozilla.org)
HTML Canvas Reference (w3schools.com)
Symbolab Math Solver - Step by Step calculator (For simplifying tough trigonometric functions!)

Game Objective: To prevent the destruction of green boxes by falling orange projectiles for as long as possible! Game Ends when all green boxes have been destroyed! Shots can destroy orange projectiles but not the other way round!
Difficulties:
1.	Easy – Infinite shots, orange projectiles spawn every 4 seconds, 4 green boxes to defend
2.	Regular-Shots consume 5 score, shots will not fire if score is insufficient. orange projectiles spawn every 2 seconds, 6 green boxes to defend
3.	Insane-Infinite shots (you’ll need it), orange projectiles spawn every 0.5 seconds, 10 green boxes to defend

To begin, you can imagine the canvas object as a literal canvas which can be drawn and erased really quickly! The actual mechanism of refreshing frames is done by window.requestAnimationFrame(mainLoop), where mainLoop includes all your critical game conditions and object instances! 
Each type of interactive object within the canvas is appended into respective JS objects at the point of creation. During each mainLoop call, these JS objects will be iterated through to draw and update the status of all items within the game (e.g When a Orange Projectile is spawned, it is appended to a projectiles Object, which will be repeatedly updated with each Animation Frame)

For purposes of this game, each type of rendered object of this game (projectiles / green box / game difficulty etc.) is actually a JS class that contains handy info on how each type of object will behave.
1.	Projectiles Class (Shots you shoot)
a.	Each projectile is a class instance that starts from the canon location to the coordinates of the mouse click. Within each class instance holds important info such as:
i.	The ‘unique name’ of the projectile
1.	Appended to ‘projectiles’ JS  object in the mainLoop when projectile is created and deleted from ‘projectiles’ JS  object when destroyed
ii.	 Start coordinates (Cannon Location)
iii.	Current coordinates (Shot location)
iv.	End Coordinates (Coordinates of mouseclick)
v.	Speed of travel
vi.	Size of Projectile
vii.	Trajectory (One can implement complex trajectories using wave functions, but so far only straight trajectory has been implemented)
b.	Each projectile class comes with methods to 
i.	Draw the actual projectile on the canvas
ii.	Update the current location of projectile based on trajectory (Called within the draw method to draw the projectile at a new position on the canvas based on trajectory calculations)
iii.	Explode the projectile, if the projectile has reached its intended destination

2.	Enemy Projectiles class, extension of Projectiles Class (Orange Hail)
a.	Each projectile is a class instance that has a randomly generated start from the top of the canvas object to a random available green box target. Within each class instance holds important info such as:
i.	The ‘unique name’ of the projectile
1.	Appended to an object in the mainLoop when projectile is created
ii.	 Start coordinates (random point along top of canvas object)
iii.	Current Coordinates
iv.	End Coordinates (Random green box)
v.	Speed of travel
vi.	Size of Projectile
vii.	Trajectory (One can implement complex trajectories using wave functions, but so far only straight trajectory has been implemented)
b.	Each projectile class comes with methods to 
i.	Draw the actual projectile on the canvas
ii.	Update the current location of projectile based on trajectory (Called within the draw method to draw the projectile at a new position on the canvas based on trajectory calculations)
iii.	Explode the projectile, if the projectile has reached its intended destination OR when its boundary is in contact with an explosion

3.	Assets class (Green boxes)
a.	At game initialization and based on the selected difficulty, an even number of green boxes are positioned equidistantly based on the size of the browser
b.	Each Asset contains a checkProximity() method, which will check if the current Asset is in contact with another explosion. If it is, it will remove the Asset from the game. Clicking GMODE disables this checking, so the boxes will never be removed when they are hit