module.exports = function( grunt ) {

	var globalConfig = {
		original: {
			js: 'js',
			sass: 'sass'
		},
		dist: {
			js: 'dist/js',
			css: 'dist/css'
		},
		test: {
			js: 'test/assets/js',
			css: 'test/assets/css'
		}
	};

	grunt.initConfig({
		globalConfig: globalConfig,
		pkg: grunt.file.readJSON('package.json'),

	    sass: {
	    	options: {
	    		outputStyle: 'compressed'
	    	},
	    	dist: {
	    		files: [{
    				expand: true,
    				cwd: '<%= globalConfig.original.sass %>',
    				src: [
					  "**/*.scss",
					  "!**/_*.scss"
					],
    				dest: '<%= globalConfig.dist.css %>',
    				ext: '.css'
    			}]
	    	}
	    },

	    concat: {
			dist: {
				src: '<%= globalConfig.original.js %>/*.js',
				dest: '<%= globalConfig.dist.js %>/<%= pkg.name %>.js'
			}
		},

		uglify : {
			options: {
				mangle : false
			},

			dist: {
				src: '<%= concat.dist.dest %>',
				dest: '<%= globalConfig.dist.js %>/<%= pkg.name %>.min.js'
			}
    	},

    	cssmin: {
			options: {
				shorthandCompacting: false,
				roundingPrecision: -1
			},
			target: {
				files: [{
					expand: true,
					cwd: '<%= globalConfig.dist.css %>',
					src: ['*.css', '!*.min.css'],
					dest: '<%= globalConfig.dist.css %>',
					ext: '.min.css'
			    }]
			}
		},

		copy: {
			main: {
				src: '<%= concat.dist.dest %>',
				dest: '<%= globalConfig.test.js %>/<%= pkg.name %>.js'
			}
	    },

	    watch : {
	    	dist : {
	    		files : [
	    			//'<%= globalConfig.bower_path %>/**/*',
		    		'<%= globalConfig.original.js %>/**/*',
		    		'<%= globalConfig.original.sass %>/**/*',
	    		],

	    		tasks : [ 'concat', 'uglify', 'sass', 'cssmin', 'copy' ]
	    	}
    	}

	});

	// Plugins do Grunt
	grunt.loadNpmTasks( 'grunt-sass' );
	grunt.loadNpmTasks( 'grunt-contrib-concat' );
	grunt.loadNpmTasks( 'grunt-contrib-uglify' );
	grunt.loadNpmTasks( 'grunt-contrib-cssmin' );
	grunt.loadNpmTasks( 'grunt-contrib-copy' );
	grunt.loadNpmTasks( 'grunt-contrib-watch' );

	// Tarefas que serão executadas
	grunt.registerTask( 'default', [ 'concat', 'uglify', 'sass', 'cssmin', 'copy' ] );

	grunt.registerTask( 'deploy', 'Deploy function', function() {
		grunt.task.run([ 'concat', 'uglify', 'sass', 'cssmin', 'copy' ]);
	});

	// Tarefas para Watch
	grunt.registerTask( 'w', [ 'watch' ] );

};