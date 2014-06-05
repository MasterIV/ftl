function tile( x, y, room ) {
	this.name = x+'-'+y;
	this. x = x;
	this.y = y;

	this.transitions = {};
	this.neighbors = [];
	this.room = room;
	this.doors = [];

	this.addNeighbor = function( tile, door ) {
		if( tile.name == this.name ) return;

		this.transitions[tile.name] = {
			next: tile,
			door: door,
			dist: 1
		};

		if( tile ) this.neighbors.push( { tile: tile, door: door } );
	}

	this.addTransition = function( tile, destination, dist, door ) {
		// I won't be informed by myself or about the way to myself
		if( tile.name == this.name || destination == this.name ) return;
		// I already know a faster way
		if( this.transitions[destination] && this.transitions[destination].dist <= dist ) return;

		this.transitions[destination] = {
			next: tile,
			door: door,
			dist: dist
		}

		for( var i in this.neighbors )
			this.neighbors[i].tile.addTransition( this, destination, dist+1, this.neighbors[i].door );
	}
}

var grid = {
	data: [],

	rooms: [
		{"x":8,"y":5,"w":2,"h":2},
		{"x":9,"y":7,"w":2,"h":1},
		{"x":8,"y":8,"w":2,"h":2},
		{"x":10,"y":5,"w":2,"h":1},
		{"x":10,"y":9,"w":2,"h":1},
		{"x":12,"y":8,"w":2,"h":2},
		{"x":12,"y":5,"w":2,"h":2},
		{"x":13,"y":7,"w":2,"h":1},
		{"x":14,"y":8,"w":2,"h":1},
		{"x":14,"y":6,"w":2,"h":1},
		{"x":7,"y":4,"w":1,"h":2},
		{"x":7,"y":9,"w":1,"h":2},
		{"x":5,"y":8,"w":2,"h":2},
		{"x":5,"y":5,"w":2,"h":2}
	],

	doors: [
		{"p1":{"x":5,"y":6},"p2":{"x":5,"y":7}},
		{"p1":{"x":5,"y":8},"p2":{"x":5,"y":9}},
		{"p1":{"x":7,"y":4},"p2":{"x":8,"y":4}},
		{"p1":{"x":7,"y":11},"p2":{"x":8,"y":11}},
		{"p1":{"x":16,"y":8},"p2":{"x":16,"y":9}},
		{"p1":{"x":16,"y":6},"p2":{"x":16,"y":7}},
		{"p1":{"x":14,"y":6},"p2":{"x":14,"y":7}},
		{"p1":{"x":13,"y":7},"p2":{"x":14,"y":7}},
		{"p1":{"x":13,"y":8},"p2":{"x":14,"y":8}},
		{"p1":{"x":14,"y":8},"p2":{"x":14,"y":9}},
		{"p1":{"x":12,"y":9},"p2":{"x":12,"y":10}},
		{"p1":{"x":10,"y":9},"p2":{"x":10,"y":10}},
		{"p1":{"x":8,"y":9},"p2":{"x":8,"y":10}},
		{"p1":{"x":7,"y":9},"p2":{"x":7,"y":10}},
		{"p1":{"x":7,"y":5},"p2":{"x":7,"y":6}},
		{"p1":{"x":8,"y":5},"p2":{"x":8,"y":6}},
		{"p1":{"x":10,"y":5},"p2":{"x":10,"y":6}},
		{"p1":{"x":12,"y":5},"p2":{"x":12,"y":6}},
		{"p1":{"x":9,"y":7},"p2":{"x":10,"y":7}},
		{"p1":{"x":9,"y":8},"p2":{"x":10,"y":8}}
	],

	w: 20,
	h: 15,

	tile: {
		w: 30,
		h: 30
	},

	init: function() {
		var tiles = [];

		for( var x = 0; x < this.w; x++ ) {
			this.data[x] = [];
			for( var y = 0; y < this.h; y++ )
				this.data[x][y] = false;
		}

		for( var i = 0; i < this.rooms.length; i++ ) {
			var r = this.rooms[i];
			r.tiles = [];

			for( var x = 0; x < r.w; x++ )
				for( var y = 0; y < r.h; y++ ) {
					var t = new tile( x+r.x, y+r.y, r );
					this.data[t.x][t.y] = t;
					r.tiles.push( t );
					tiles.push( t );
				}

			for( var j in r.tiles )
				for( var k in r.tiles )
					r.tiles[j].addNeighbor(r.tiles[k]);
		}

		for( var i = 0; i < this.doors.length; i++ ) {
			var d = this.doors[i];
			d.tiles = [];

			var t1 = this.data[d.p1.x][d.p1.y];
			var t2 = d.p1.x == d.p2.x ? this.data[d.p1.x-1][d.p1.y] : this.data[d.p1.x][d.p1.y-1];

			if( t1 ) {
				d.tiles.push( t1 );
				t1.doors.push( d );
				t1.addNeighbor(t2, d);
			}

			if( t2 ) {
				d.tiles.push( t2 );
				t2.doors.push( d );
				t2.addNeighbor(t1, d);
			}
		}

		// bäm build routing graph
		for( var i in tiles ) {
			var t = tiles[i];

			for( var j in t.neighbors )
				for( var k in t.neighbors )
					t.neighbors[j].tile.addTransition( t, t.neighbors[k].tile.name, 2, t.neighbors[j].door );
		}

		// draw background image
		this.buffer = document.createElement('canvas');
		this.buffer.width = grid.w * grid.tile.w;
		this.buffer.height = grid.h * grid.tile.h;

		var ctx = this.buffer.getContext('2d');

		ctx.fillStyle = '#444499';
		ctx.fillRect( 0, 0, this.buffer.width, this.buffer.height );

		for( var i = 0; i < grid.rooms.length; i++ ) {
			var r = grid.rooms[i];

			ctx.clearRect(
					r.x * grid.tile.w,
					r.y * grid.tile.h,
					r.w * grid.tile.w,
					r.h * grid.tile.h );

			ctx.lineWidth = 1;
			ctx.strokeStyle = '#cccccc';

			for( var x = 0; x < r.w; x++ )
				for( var y = 0; y < r.h; y++ )
					ctx.strokeRect(
							(x+r.x) * grid.tile.w,
							(y+r.y) * grid.tile.h,
							grid.tile.w, grid.tile.h );

			ctx.lineWidth = 3;
			ctx.strokeStyle = '#000000';

			ctx.strokeRect(
					r.x * grid.tile.w,
					r.y * grid.tile.h,
					r.w * grid.tile.w,
					r.h * grid.tile.h );
		}
	},

	draw: function( ctx ) {
		ctx.drawImage( this.buffer, 0, 0);

		for( var i = 0; i < grid.doors.length; i++ ) {
			var d = grid.doors[i];
			ctx.fillStyle = d.open ?  '#CCEEFF' : '#FF9900';

			if( d.p1.x == d.p2.x )
				ctx.fillRect(
						d.p1.x * grid.tile.w -3,
						d.p1.y * grid.tile.h +5,
						6,  20 );
			else
				ctx.fillRect(
						d.p1.x * grid.tile.w+5,
						d.p1.y * grid.tile.h-3,
						20, 6);
		}
	}
};
