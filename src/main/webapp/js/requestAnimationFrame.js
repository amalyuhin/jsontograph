/**
 * Created with JetBrains WebStorm.
 * User: amalyuhin
 * Date: 23.04.13
 * Time: 12:07
 * To change this template use File | Settings | File Templates.
 */

if ( !window.requestAnimationFrame ) {
    window.requestAnimationFrame = ( function() {

        return window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {

                window.setTimeout( callback, 1000 / 60 );

            };

    })();
}

if ( !window.cancelRequestAnimationFrame ) {
    window.cancelRequestAnimationFrame = ( function() {

        return window.cancelRequestAnimationFrame ||
            window.webkitCancelRequestAnimationFrame ||
            window.mozCancelRequestAnimationFrame ||
            window.oCancelRequestAnimationFrame ||
            window.msCancelRequestAnimationFrame ||
            clearTimeout
    } )();
}
