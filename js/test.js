// By APerson241
// Localization by Arian Ar
/* jshint moz: true */
$( document ).ready( function () {
    const API_ROOT = "https://fa.wikipedia.org/w/api.php",
          API_SUFFIX = "&format=json&callback=?&continue=",
          TEST_PAGE = "ویکی‌پدیا:سنجش اعتیاد به ویکی‌پدیا";

    var score = 0;
    var revision = "0";
    var scoreTable = {};

    var callback = function ( data ) {
        var pageId = Object.getOwnPropertyNames( data.query.pages )[0];
        if ( data.query.pages[ pageId ].hasOwnProperty( "missing" ) ) {
            $( "#test" ).append( $( "<div>" )
                                 .addClass( "errorbox" )
                                 .text( "عجیب است, من نتوانستم آزمون را در  " + TEST_PAGE + "پیدا کنم" ) );
            return;
        }
        revision = data.query.pages[ pageId ].revisions[ 0 ].revid;
        var pageText = data.query.pages[ pageId ].revisions[ 0 ][ "*" ]
            .replace( /{{[\s\S]+?}}/g, "" );
        var questions = pageText.match( /==آزمون==[\s\S]+==بررسی امتیاز شما==/ )[ 0 ]
            .replace( /==آزمون==/, "" ).replace( /==بررسی امتیاز شما==/, "" )
            .match( /\n#.+?\s\(-?\d+.*?\)/g );
        $( "#loaded" ).text( "من الان " + questions.length + "سوال را بارگیری کردم, بزن بریم!" );

        // Initialize the "Interpret your score" table
        var scoreLines = pageText.match( /==بررسی امتیاز شما==[\s\S]+==سوالات امتیازی==/ )[ 0 ]
            .replace( /==بررسی امتیاز شما==/, "" ).replace( /==سوالات امتیازی==/, "" )
            .match( /\| \d+ –|- \d+ \|\| [\S ]+/g );
        scoreLines.forEach( function ( line ) {
            var score = parseInt( line.match( /\d+/g )[1] ) + 1;
            var text = line.replace( /\|[\s\S]+?\|\|/, "" );
            scoreTable[ score ] = text;
        } );

        // Display the score and refresh button
        $( "#test" )
            .append( $( "<div>" ).addClass( "score" ).text( "امتیاز فعلی : ۰" ) )
            .append( $( "<button>" )
                     .addClass( "mw-ui-button mw-ui-destructive mw-ui-quiet" )
                     .text( "بازنشانی" )
                     .click( function () {
                         $( ".mw-ui-checkbox" ).prop( "checked", false );
                         score = 0;
                         updateScore( 0, false ); // trigger refresh
                     } ) );

        // Display the questions
        questions.forEach( function ( question ) {
            var questionText = question
                .replace( /\n#/, "" )
                .replace( /\(-?\d[\s\S]*?\)/, "" )
                .replace( /\[\[([\s\S]+?\|)?/g, "" ).replace( /\]\]/g, "" )
                .trim();
            var questionValue = parseInt( question.match( /\(-?\d+/ )[0].replace( /\(/, "" ) );
            $( "#test" ).append( $( "<div>" )
                                 .addClass( "question" )
                                 .append( $( "<input>" )
                                          .attr( "type", "checkbox" )
                                          .attr( "value", questionValue )
                                          .addClass( "mw-ui-checkbox" )
                                          .attr( "id", question )
                                          .change( function () { updateScore( questionValue, this.checked ); } ) )
                                 .append( $( "<label>" )
                                          .attr( "for", question )
                                          .html( questionText + " <small>(" + questionValue + "&nbsp;point" + ( questionValue == 1 ? "" : "s" ) + ")</small>" ) ) );
        } );
        $( "#test" ).append( $( "<div>" ).addClass( "score" ).text( "Current score: 0" ) );
        updateScore( 0, false ); // Just to refresh the bottom display
    }; // end callback()
    $.getJSON( API_ROOT + "?action=query&prop=revisions&rvprop=content|ids&format=jsonfm&titles=" + TEST_PAGE + API_SUFFIX, callback );

    var updateScore = function ( questionScore, checked ) {
        if ( checked ) {
            score += questionScore;
        } else {
            score -= questionScore;
        }
        $( ".score" ).text( "امتیاز فعلی: " + score );

        for ( cutoffScore in scoreTable ) {
            if ( score < cutoffScore ) {
                $( "#after p#diagnosis" ).html( "<b><a href='https://fa.wikipedia.org/wiki/%D9%88%DB%8C%DA%A9%DB%8C%E2%80%8C%D9%BE%D8%AF%DB%8C%D8%A7:%D8%B3%D9%86%D8%AC%D8%B4_%D8%A7%D8%B9%D8%AA%DB%8C%D8%A7%D8%AF_%D8%A8%D9%87_%D9%88%DB%8C%DA%A9%DB%8C%E2%80%8C%D9%BE%D8%AF%DB%8C%D8%A7#.D8.A8.D8.B1.D8.B1.D8.B3.DB.8C_.D8.A7.D9.85.D8.AA.DB.8C.D8.A7.D8.B2_.D8.B4.D9.85.D8.A7'>بررسی امتیاز شما</a></b>: " + scoreTable[ cutoffScore ] );
                break;
            }
        }

        $( "#after p#description" ).html( "امتیاز شما " + score + " است" + ( score == 1 ? "" : "s" ) +
                                          "! شما می‌توانید امتیازتان را در <a href='https://fa.wikipedia.org/wiki/Special:MyPage'>صفحه کاربری‌تان</a> با این کد درون یک جعبه کاربری نمایش دهید" +
                                          " userbox: <tt>{{User Wikipediholic|" + score + "|" + revision + "}}</tt>." );
    };
} );
