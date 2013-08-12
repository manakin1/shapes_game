/*
 * Simple shape matching game
 * JavaScript & KineticJS
 * @author Eve Andersson
 */

/*
 * Create namespace and settings
 */
var ShapeTest = { 
	shapeSize: 100,
	shapeColumnX: 150,
	silhouetteColumnX: 700,
	verticalSpacing: 40,
	topPadding: 50,
	defaultColor: 'red',
	silhouetteColor: 'black',
	strokeColor: 'black',
	strokeWidth: 4,
	canvasWidth: 960,
	canvasHeight: 800,
	shapes: [],
	silhouettes: [],
	blueprints: [],
	playing: false,
	colors: [ 'red', 'pink', 'orange', 'yellow', 'cyan', 'blue', 'green', 'gray' ],
	highScoreText: 'High score: ',
	lastScoreText: 'Last score: ',
	buttonTextStart: 'Start',
	buttonTextRestart: 'Restart',
	buttonTextStop: 'Stop',
	timerText: 'Time elapsed: ',
	timeElapsedMS: 0,
	score: 0,
	lastScore: 0,
	highScore: 0,
	timerInterval: null,
	startTime: null,
	endTime: null,
	layer: null,
	initialized: false // true if a game has been started
} ;
 
/*
 * Shape properties
 */
  
ShapeTest.RectProperties = {
	name: 'rectangle',
	x: ShapeTest.shapeColumnX,	
	y: 0, // position to be configured later
	width: ShapeTest.shapeSize - 8,
	height: ShapeTest.shapeSize - 8,
	fill: ShapeTest.defaultColor,
	stroke: ShapeTest.strokeColor,
	strokeWidth: ShapeTest.strokeWidth,
	offset: -4
} ;

ShapeTest.CircleProperties = {
	name: 'circle',
	x: ShapeTest.shapeColumnX,	
	y: 0, // position to be configured later
	radius: ShapeTest.shapeSize / 2,
	fill: ShapeTest.defaultColor,
	stroke: ShapeTest.strokeColor,
	strokeWidth: ShapeTest.strokeWidth,
	offset: -( ShapeTest.shapeSize / 2 ) // set anchor in the upper left corner
} ;

ShapeTest.TriangleProperties = {
	name: 'triangle',
	x: ShapeTest.shapeColumnX,	
	y: 0, // position to be configured later
	sides: 3,
	radius: ( ShapeTest.shapeSize / 2 ),
	fill: ShapeTest.defaultColor,
	stroke: ShapeTest.strokeColor,
	strokeWidth: ShapeTest.strokeWidth,
	offset: -( ShapeTest.shapeSize / 2 ) // set anchor in the upper left corner
} ;

ShapeTest.PolygonProperties = {
	name: 'polygon',
	x: ShapeTest.shapeColumnX,	
	y: 0, // position to be configured later
	sides: 8,
	radius: ( ShapeTest.shapeSize / 2 ),
	fill: ShapeTest.defaultColor,
	stroke: ShapeTest.strokeColor,
	strokeWidth: ShapeTest.strokeWidth,
	offset: -( ShapeTest.shapeSize / 2 ) // set anchor in the upper left corner
} ;

ShapeTest.StarProperties = {
	name: 'star',
	x: ShapeTest.shapeColumnX,	
	y: 0, // position to be configured later
	numPoints: 6,
	innerRadius: ( ShapeTest.shapeSize / 3 ),
	outerRadius: ( ShapeTest.shapeSize / 2 ),
	fill: ShapeTest.defaultColor,
	stroke: ShapeTest.strokeColor,
	strokeWidth: ShapeTest.strokeWidth,
	offset: -( ShapeTest.shapeSize / 2 ) // set anchor in the upper left corner
} ;

ShapeTest.getRandom = function( ) {
	return( Math.round( Math.random( ) ) - 0.5 ) ; 
} ;

/*
 * Randomize array
 */
ShapeTest.randomize = function( arr ) {
	return arr.sort( ShapeTest.getRandom ) ;
} ;

/*
 * Button click handler
 */
ShapeTest.startButtonClickHandler = function( ) {
	if( ShapeTest.playing ) { ShapeTest.endGame( ) ; }
	else { 
		// prevent the game from resetting if this is the first time the button is being clicked
		if( ShapeTest.initialized ) { ShapeTest.resetGame( ) ; }
		else { ShapeTest.initialized = true ; }
		ShapeTest.startGame( ) ; 
	}
} ;

/*
 * Start timer
 */
ShapeTest.startTimer = function( ) {
	// store starting time
	ShapeTest.startTime = new Date( ) ;
	ShapeTest.timerInterval = setInterval( ShapeTest.onTimer, 100 ) ;
 } ;
 
 /*
 * Timer event handler
 */
ShapeTest.onTimer = function( ) {
	ShapeTest.endTime = new Date( ) ;
	// calculate difference between now and starting time
	var diff = ShapeTest.endTime.getTime( ) - ShapeTest.startTime.getTime( ) ;
	ShapeTest.timeElapsedMS = diff ;
	ShapeTest.updateTimer( ) ;
} ;
 
 /*
 * Stop timer
 */
ShapeTest.stopTimer = function( ) {
	clearInterval( ShapeTest.timerInterval ) ;
} ;

/*
 * Update timer
 */
ShapeTest.updateTimer = function( ) {
	ShapeTest.score = ShapeTest.timeElapsedMS / 1000 ;
	document.getElementById( 'timer' ).innerHTML = ShapeTest.timerText + ShapeTest.score ;
} ;

/*
 * Update high score
 */
ShapeTest.updateScore = function( ) {
	document.getElementById( 'lastscore' ).innerHTML = ShapeTest.lastScoreText + ( ShapeTest.lastScore || '0' ) ;
	document.getElementById( 'highscore' ).innerHTML = ShapeTest.highScoreText + ( ShapeTest.highScore || '0' ) ;
} ;

/*
 * Start game
 */
ShapeTest.startGame = function( ) {
	document.getElementById( 'start-button' ).innerHTML = ShapeTest.buttonTextStop ;
	
	for( var i = 0 ; i < ShapeTest.shapes.length ; i++ ) {
		// enable dragging
		ShapeTest.shapes[i].setDraggable( true ) ;
	}
	
	ShapeTest.playing = true ;
	ShapeTest.score = 0 ;
	ShapeTest.timeElapsedMS = 0 ;
	ShapeTest.startTimer( ) ;
	ShapeTest.updateScore( ) ;
} ;

/*
 * End game
 */
ShapeTest.endGame = function( ) {
	ShapeTest.disableControls( ) ;
	ShapeTest.stopTimer( ) ;
	ShapeTest.playing = false ;
	document.getElementById( 'start-button' ).innerHTML = ShapeTest.buttonTextRestart ;
	
	// return shapes to their original positions
	for( var i = 0 ; i < ShapeTest.shapes.length ; i++ ) {
		ShapeTest.returnToOriginalPosition( ShapeTest.shapes[i], i ) ;
	}
} ;

/*
 * Clear the stage
 */
ShapeTest.resetGame = function( ) {
	ShapeTest.layer.removeChildren( ) ;
	ShapeTest.stage.clear( ) ;
	
	ShapeTest.shapes = [] ;
	ShapeTest.silhouettes = [] ;
	ShapeTest.blueprints = [] ;
	
	ShapeTest.drawShapes( ) ;
	ShapeTest.updateTimer( ) ;
} ;

/*
 * Save game score
 */
ShapeTest.saveScore = function( ) {
	ShapeTest.lastScore = ShapeTest.score ;
	
	// saving data to local storage on a local filesystem will not work on IE
	var isIE = navigator.appName.toLowerCase( ).indexOf( 'explorer' ) != -1 ;
	if( isIE == false ) { localStorage.setItem( 'lastscore', ShapeTest.lastScore ) ; }
	
	var msg = 'Congratulations! You have completed the game in ' + ShapeTest.score + ' seconds.' ;
	
	// new high score
	if( ShapeTest.score < ShapeTest.highScore || ShapeTest.highScore == null || ShapeTest.highScore == 0 ) {
		ShapeTest.highScore = ShapeTest.score ;
		if( isIE == false ) { localStorage.setItem( 'highscore', ShapeTest.score ) ; }
		msg += ' NEW HIGH SCORE!' ;
	}
	var timeout = setTimeout( function( ) {	alert( msg ) ; }, 550 ) ;
} ;

/*
 * Determine if a shape has been dropped on the corresponding silhouette
 */
ShapeTest.dropHandler = function( shape ) {
	// find corresponding silhouette
	var index = ShapeTest.shapes.indexOf( shape ) ;
	var silhouette = ShapeTest.findShapeByName( ShapeTest.silhouettes, shape.getName( ) ) ;
	
	// calculate distance between shape and silhouette
	var diffX = Math.abs( shape.getX( ) - silhouette.getX( ) ) ;
	var diffY = Math.abs( shape.getY( ) - silhouette.getY( ) ) ;
	
	// snap to silhouette if the match is close enough
	if( diffX < 50 && diffY < 50 ) { ShapeTest.snapToSilhouette( shape, silhouette ) ; }
	else { ShapeTest.returnToOriginalPosition( shape, index ) ; }
} ;

/*
 * Move a shape back into its original position
 */
ShapeTest.returnToOriginalPosition = function( shape, index ) {
	shape.transitionTo( {
		x: ShapeTest.shapeColumnX,
		y: ( index * ShapeTest.shapeSize ) + ( index * ShapeTest.verticalSpacing ) + ShapeTest.topPadding,
		duration: .5,
		easing: 'ease-in-out'
	} ) ;
}

/*
 * Move a shape into its silhouette
 */
ShapeTest.snapToSilhouette = function( shape, silhouette ) {
	shape.transitionTo( {
		x: silhouette.getX( ),
		y: silhouette.getY( ),
		duration: .25,
		easing: 'ease-in-out'
	} ) ;
	
	ShapeTest.disableShape( shape ) ;
	
	// after the transition is finished, check if all shapes have been matched
	var timeout = setTimeout( function( ) {
		var complete = ShapeTest.checkIfComplete( ) ; 
		
		if( complete == true ) {
			ShapeTest.endGame( ) ;
			ShapeTest.saveScore( ) ;
		}
	}, 300 ) ;
}

/*
 * Find a shape in an array by its name
 */
ShapeTest.findShapeByName = function( arr, name ) {
	var item ;

	for( var i = 0 ; i < arr.length ; i++ ) {
		if( arr[i].getName( ) == name ) {
			item = arr[i] ;
			break ;
		}
	}
	
	return item ;
} ;

/*
 * Disable all game controls
 */
ShapeTest.disableControls = function( ) {
	ShapeTest.playing = false ;
	
	// disable all shapes
	for( var i = 0 ; i < ShapeTest.shapes.length ; i++ ) {
		ShapeTest.disableShape( ShapeTest.shapes[i] ) ;
	}
} ;

/*
 * Disable the shape controls
 */
ShapeTest.disableShape = function( shape ) {
	shape.setDraggable( false ) ;
	shape.on( 'mouseover', function( ) {
		document.body.style.cursor = 'default' ;
	} ) ;
} ;

/*
 * Check if all shapes have been matched with their silhouettes
 */
ShapeTest.checkIfComplete = function( ) {
	var matches = 0 ;
	
	for( var i = 0 ; i < ShapeTest.shapes.length ; i++ ) {
		var shape = ShapeTest.shapes[i] ;
		var silhouette = ShapeTest.findShapeByName( ShapeTest.silhouettes, shape.getName( ) ) ;
		// match found if the coordinates of the shape and silhouette are the same
		if( shape.getX( ) == silhouette.getX( ) && shape.getY( ) == silhouette.getY( ) ) {
			matches++ ;
		}
	}
	
	return( matches == ShapeTest.shapes.length ) ;
} ;

/*
 * Draw all shapes
 */
ShapeTest.drawShapes = function( ) {
    ShapeTest.layer = new Kinetic.Layer( ) ;
	
	// draw shapes
    ShapeTest.shapes.push( new Kinetic.Rect( ShapeTest.RectProperties ) ) ;
	ShapeTest.shapes.push( new Kinetic.Circle( ShapeTest.CircleProperties ) ) ;
	ShapeTest.shapes.push( new Kinetic.RegularPolygon( ShapeTest.TriangleProperties ) ) ;
	ShapeTest.shapes.push( new Kinetic.RegularPolygon( ShapeTest.PolygonProperties ) ) ;
	ShapeTest.shapes.push( new Kinetic.Star( ShapeTest.StarProperties ) ) ;

	// draw silhouettes
	ShapeTest.silhouettes.push( new Kinetic.Rect( ShapeTest.RectProperties ) ) ;
	ShapeTest.silhouettes.push( new Kinetic.Circle( ShapeTest.CircleProperties ) ) ;
	ShapeTest.silhouettes.push( new Kinetic.RegularPolygon( ShapeTest.TriangleProperties ) ) ;
	ShapeTest.silhouettes.push( new Kinetic.RegularPolygon( ShapeTest.PolygonProperties ) ) ;
	ShapeTest.silhouettes.push( new Kinetic.Star( ShapeTest.StarProperties ) ) ;
	
	// randomize the order of the shapes and colors
	ShapeTest.shapes = ShapeTest.randomize( ShapeTest.shapes ) ;
	ShapeTest.silhouettes = ShapeTest.randomize( ShapeTest.silhouettes ) ;
	ShapeTest.colors = ShapeTest.randomize( ShapeTest.colors ) ;
	
	// add the shapes to the layer
	for( var i = 0 ; i < ShapeTest.shapes.length ; i++ ) {
		// set colors
		ShapeTest.silhouettes[i].setFill( ShapeTest.silhouetteColor ) ;
		ShapeTest.shapes[i].setFill( ShapeTest.colors[i] ) ;
		
		// draw blueprints
		var blueprint ;
		
		switch( ShapeTest.shapes[i].getName( ) ) {
			case 'rectangle' :
				blueprint = new Kinetic.Rect( ShapeTest.RectProperties ) ;
				break ;
			case 'circle' :
				blueprint = new Kinetic.Circle( ShapeTest.CircleProperties ) ;
				break ;
			case 'triangle' :
				blueprint = new Kinetic.RegularPolygon( ShapeTest.TriangleProperties ) ;
				break ;
			case 'polygon' :
				blueprint = new Kinetic.RegularPolygon( ShapeTest.PolygonProperties ) ;
				break ;
			case 'star' : default :
				blueprint = new Kinetic.Star( ShapeTest.StarProperties ) ;
				break ;
		} ;
		
		blueprint.setOpacity( 0.25 ) ;
		blueprint.setFill( 'white' ) ;
		ShapeTest.blueprints[i] = blueprint ;
		
		// position the shapes
		var y = ( i * ShapeTest.shapeSize ) + ( i * ShapeTest.verticalSpacing ) + ShapeTest.topPadding ;
		ShapeTest.silhouettes[i].setX( ShapeTest.silhouetteColumnX ) ;
		ShapeTest.shapes[i].setY( y ) ;
		ShapeTest.blueprints[i].setY( y ) ;
		ShapeTest.silhouettes[i].setY( y ) ;
		
		// set mouse handlers
		ShapeTest.shapes[i].on( 'mouseover', function( ) {
			document.body.style.cursor = 'pointer' ;
        } ) ;
        ShapeTest.shapes[i].on( 'mouseout', function( ) {
			document.body.style.cursor = 'default' ;
        } ) ;
		// move the shape to the top when selected
		ShapeTest.shapes[i].on( 'mousedown', function( ) {
			this.moveToTop( ) ;
        } ) ;
		ShapeTest.shapes[i].on( 'dragend', function( ) {
			ShapeTest.dropHandler( this ) ;
        } ) ;
		
		ShapeTest.layer.add( ShapeTest.blueprints[i] ) ;
		ShapeTest.layer.add( ShapeTest.shapes[i] ) ;
		ShapeTest.layer.add( ShapeTest.silhouettes[i] ) ;
	}
	
	// add the layer to the stage
    ShapeTest.stage.add( ShapeTest.layer ) ;
} ;
 
window.onload = function( ) {
	// create stage
    ShapeTest.stage = new Kinetic.Stage( {
		container: 'canvas',
        width: ShapeTest.canvasWidth,
        height: ShapeTest.canvasHeight
    } ) ;
	
	document.body.onmousedown = function( ) {
		return false ; } ;
		
	document.getElementById( 'start-button' ).onclick = ShapeTest.startButtonClickHandler ;

	// local storage on local files will not work on IE
	if( navigator.appName.toLowerCase( ).indexOf( 'explorer' ) == -1 ) {
		ShapeTest.highScore = localStorage.getItem( 'highscore' ) || 0 ;
		ShapeTest.lastScore = localStorage.getItem( 'lastscore' ) || 0 ;
	}

	ShapeTest.updateScore( ) ;
	ShapeTest.drawShapes( ) ;
	ShapeTest.updateTimer( ) ;
} ;
