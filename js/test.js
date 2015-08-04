/* jshint moz: true */
$( document ).ready( function () {
    const API_ROOT = "https://en.wikipedia.org/w/api.php",
          API_SUFFIX = "&format=json&callback=?&continue=",
          TEST_PAGE = "Wikipedia:Wikipediholism test";

    var score = 0;
    var revision = "0";

    $.getJSON( API_ROOT + "?action=query&prop=revisions&rvprop=content|ids&format=jsonfm&titles=" + TEST_PAGE + API_SUFFIX, function ( data ) {
        var pageId = Object.getOwnPropertyNames( data.query.pages )[0];
        if ( data.query.pages[ pageId ].hasOwnProperty( "missing" ) ) {
            $( "#test" ).append( $( "<div>" )
                                 .addClass( "errorbox" )
                                 .text( "Mysteriously, I couldn't find the test onwiki at " + TEST_PAGE ) );
            return;
        }
        revision = data.query.pages[ pageId ].revisions[ 0 ].revid;
        var testPageText = JSON.stringify( data.query.pages[ pageId ].revisions[ 0 ][ "*" ] );
        var testText = testPageText.match( /==The test==[\s\S]+==Interpreting your score==/ )[0];
        testText = testText.replace( /==The test==/, "" ).replace( /==Interpreting your score==/, "" ).replace( /\\n/, "" );
        var questions = testText.match( /\\n#.+?\s\(-?\d+.*?\)/g );
        $( "#loaded" ).text( "I just loaded " + questions.length + " questions. Let's go!" );
        $( "#test" )
            .append( $( "<div>" ).addClass( "score" ).text( "Current score: 0" ) )
            .append( $( "<button>" )
                     .addClass( "mw-ui-button mw-ui-destructive mw-ui-quiet" )
                     .text( "Reset" )
                     .click( function () {
                         $( ".mw-ui-checkbox" ).prop( "checked", false );
                         score = 0;
                         updateScore( 0, false ); // trigger refresh
                     } ) );
        questions.forEach( function ( question ) {
            var questionText = question
                .replace( /\\n#/, "" )
                .replace( /\([\s\S]+?\)/, "" )
                .replace( /\[\[([\s\S]+?\|)?/g, "" ).replace( /\]\]/g, "" )
                .trim();
            var questionValue = parseInt( question.match( /\(-?\d+/ )[0].replace( /\(/, "" ) );
            $( "#test" ).append( $( "<div>" )
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
    } );

    var updateScore = function ( questionScore, checked ) {
        if ( checked ) {
            score += questionScore;
        } else {
            score -= questionScore;
        }
        $( ".score" ).text( "Current score: " + score );
        $( "#after p" ).html( "Your score was " + score + " point" + ( score == 1 ? "" : "s" ) +
                              "! You can display your score on your user page with this code for a" +
                              " userbox: <tt>{{User Wikipediholic|" + score + "|" + revision + "}}</tt>." );
    };
} );
