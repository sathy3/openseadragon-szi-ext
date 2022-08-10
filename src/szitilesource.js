/*
 * OpenSeadragon - SziTileSource
 *
 * Copyright (C) 2009 CodePlex Foundation
 * Copyright (C) 2010-2022 OpenSeadragon contributors
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 * - Redistributions of source code must retain the above copyright notice,
 *   this list of conditions and the following disclaimer.
 *
 * - Redistributions in binary form must reproduce the above copyright
 *   notice, this list of conditions and the following disclaimer in the
 *   documentation and/or other materials provided with the distribution.
 *
 * - Neither the name of CodePlex Foundation nor the names of its
 *   contributors may be used to endorse or promote products derived from
 *   this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 * TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */



(function($){

/**
 * @class SziTileSource
 * @memberof OpenSeadragon
 * @extends OpenSeadragon.DziTileSource
 * @param {String | Object} tilesUrl
 * @param {Object} indexObject
 * // The Following parameters are required by the constructor of DziTileSource -> TileSource
 * @param {Number} width
 * @param {Number} height
 * @param {Number} tileSize
 * @param {Number} tileOverlap
 * @param {String} fileFormat
 * @property {String} fileFormat
 * @param {OpenSeadragon.DisplayRect[]} displayRects
 * @property {Object} indexObject
 * @property {OpenSeadragon.DisplayRect[]} displayRects
 * The Following Properties are added by DziTileSource
 * @property {String} fileFormat
 * @property {OpenSeadragon.DisplayRect[]} displayRects
 */
$.SziTileSource = function( tilesUrl, indexObject, height, tileSize, tileOverlap, fileFormat, displayRects, minLevel, maxLevel) {
    var options = {};
    if( $.isPlainObject(tilesUrl)){
        options = tilesUrl;
    }else{
        options = {
            tilesUrl: arguments[ 0 ],
            indexObject: arguments[ 1 ],
            width: arguments[ 2 ],
            height: arguments[ 3 ],
            tileSize: arguments[ 4 ],
            tileOverlap: arguments[ 5 ],
            fileFormat: arguments[ 6 ],
            displayRects: arguments[ 7 ],
            minLevel: arguments[ 8 ],
            maxLevel: arguments[ 9 ]
        };
        //set some safe defaults and build additional calls for Dzitilesource
    }
    options.loadTilesWithAjax = true;
    this.loadTilesWithAjax = true;
    this.ready = false;
    this.indexObject = options.indexObject;
    if(options.trueUrl !== undefined && options.trueUrl !== options.tilesUrl){
        // Url has been modified lower in the chain, revert to default;
        options.tilesUrl = options.trueUrl;
    }
    this.tilesUrl = options.tilesUrl;
    delete options.indexObject;
    $.DziTileSource.apply(this, [options]);
};

        $.extend($.SziTileSource.prototype, $.DziTileSource.prototype, {

            supports: function(data, url){
                try{
                    if(data["zoomInfo"] !== undefined){
                    return true;
                    }
                } catch(e){
                    return false;
                }
                return false;
            },
            configure: function(data, url, postData, skip){
                var options = {};
                // this does not load tiles
                this.loadTilesWithAjax = true;
                if(data.url !== undefined){
                    options = data;
                    options.tilesUrl = options.url;
                } else {
                    options.indexObject = data;
                    options.tilesUrl = url;
                }
                // This is a hacky way to fix the url, use regex later
                options.tilesUrl = options.tilesUrl.slice(0, options.tilesUrl.length - 1);
                options.tilesUrl += "i";
                options.trueUrl = options.tilesUrl;
                var offset = options.indexObject["dziOffset"];
                options.getMoreInfo = {
                    url: options.tilesUrl,
                    headers: {Range: "bytes=" + offset[0].toString() + "-" + offset[1].toString()}
                };
                return options;
            },
            getTileUrl: function() {
                return this.tilesUrl;
            },
            getTileAjaxHeaders: function( level, x, y ) {
                var offset = this.indexObject["zoomInfo"][level.toString()][x.toString()][y.toString()];
                return {Range: "bytes=" + offset[0].toString() + "-" + offset[1].toString() };
            },
            // getImageInfo: function( url ) {
            //     var _this = this,
            //         callbackName,
            //         callback,
            //         callbackback,
            //         readySource,
            //         options,
            //         urlParts,
            //         filename,
            //         lastDot;

            //     if( url ) {
            //         urlParts = url.split( '/' );
            //         filename = urlParts[ urlParts.length - 1 ];
            //         lastDot  = filename.lastIndexOf( '.' );
            //         if ( lastDot > -1 ) {
            //             urlParts[ urlParts.length - 1 ] = filename.slice( 0, lastDot );
            //         }
            //     }
            //     var postData = null;
            //     if (this.splitHashDataForPost) {
            //         var hashIdx = url.indexOf("#");
            //         if (hashIdx !== -1) {
            //             postData = url.substring(hashIdx + 1);
            //             url = url.substr(0, hashIdx);
            //         }
            //     }
            //     callbackback = function(data){
            //         if( typeof (data) === "string" ) {
            //             data = $.parseXml( data );
            //         }
            //         var $TileSource = $.TileSource.determineType( _this, data, url );
            //         if($TileSource === $.DziTileSource){
            //             $.extend(true, options, $TileSource.prototype.configure.apply( _this, [ data, url, postData ]));
            //         } else {
            //             /**
            //              * Raised when an error occurs loading a TileSource.
            //              *
            //              * @event open-failed
            //              * @memberof OpenSeadragon.TileSource
            //              * @type {object}
            //              * @property {OpenSeadragon.TileSource} eventSource - A reference to the TileSource which raised the event.
            //              * @property {String} message
            //              * @property {String} source
            //              * @property {?Object} userData - Arbitrary subscriber-defined object.
            //              */
            //              _this.raiseEvent( 'open-failed', { message: "Unable to load TileSource", source: url } );
            //              return;
            //         }
            //         readySource = new $TileSource( options );
            //         _this.ready = true;
            //         /**
            //          * Raised when a TileSource is opened and initialized.
            //          *
            //          * @event ready
            //          * @memberof OpenSeadragon.TileSource
            //          * @type {object}
            //          * @property {OpenSeadragon.TileSource} eventSource - A reference to the TileSource which raised the event.
            //          * @property {Object} tileSource
            //          * @property {?Object} userData - Arbitrary subscriber-defined object.
            //          */
            //         _this.raiseEvent( 'ready', { tileSource: readySource } );
            //     };
            //     callback = function( data ){
            //         if( typeof (data) === "string" ) {
            //             data = $.parseXml( data );
            //         }
            //         var $TileSource = $.TileSource.determineType( _this, data, url );
            //         if ( !$TileSource ) {
            //             /**
            //              * Raised when an error occurs loading a TileSource.
            //              *
            //              * @event open-failed
            //              * @memberof OpenSeadragon.TileSource
            //              * @type {object}
            //              * @property {OpenSeadragon.TileSource} eventSource - A reference to the TileSource which raised the event.
            //              * @property {String} message
            //              * @property {String} source
            //              * @property {?Object} userData - Arbitrary subscriber-defined object.
            //              */
            //             _this.raiseEvent( 'open-failed', { message: "Unable to load TileSource", source: url } );
            //             return;
            //         }
            //         options = $TileSource.prototype.configure.apply( _this, [ data, url, postData ]);
            //         if (options.ajaxWithCredentials === undefined) {
            //             options.ajaxWithCredentials = _this.ajaxWithCredentials;
            //         }
            //         if($TileSource === $.SziTileSource){
            //             //TODO:
            //             var headers = this.ajaxHeaders === undefined ? {} : this.ajaxHeaders;
            //             var offset = options.indexObject["dziOffset"];
            //             headers = Object.assign(headers, {Range: "bytes" + offset[0].toString() + "-" + offset[1].toString()});
            //             $.makeAjaxRequest( {
            //                 url: url,
            //                 postData: postData,
            //                 withCredentials: this.ajaxWithCredentials,
            //                 headers: headers,
            //                 success: function( xhr ) {
            //                     var data = processResponse( xhr );
            //                     callbackback( data );
            //                 },
            //                 error: function ( xhr, exc ) {
            //                     var msg;

            //                     /*
            //                         IE < 10 will block XHR requests to different origins. Any property access on the request
            //                         object will raise an exception which we'll attempt to handle by formatting the original
            //                         exception rather than the second one raised when we try to access xhr.status
            //                         */
            //                     try {
            //                         msg = "HTTP " + xhr.status + " attempting to load TileSource: " + url;
            //                     } catch ( e ) {
            //                         var formattedExc;
            //                         if ( typeof ( exc ) === "undefined" || !exc.toString ) {
            //                             formattedExc = "Unknown error";
            //                         } else {
            //                             formattedExc = exc.toString();
            //                         }

            //                         msg = formattedExc + " attempting to load TileSource: " + url;
            //                     }

            //                     $.console.error(msg);

            //                     /***
            //                      * Raised when an error occurs loading a TileSource.
            //                      *
            //                      * @event open-failed
            //                      * @memberof OpenSeadragon.TileSource
            //                      * @type {object}
            //                      * @property {OpenSeadragon.TileSource} eventSource - A reference to the TileSource which raised the event.
            //                      * @property {String} message
            //                      * @property {String} source
            //                      * @property {String} postData - HTTP POST data (usually but not necessarily in k=v&k2=v2... form,
            //                      *      see TileSource::getPostData) or null
            //                      * @property {?Object} userData - Arbitrary subscriber-defined object.
            //                      */
            //                     _this.raiseEvent( 'open-failed', {
            //                         message: msg,
            //                         source: url,
            //                         postData: postData
            //                     });
            //                 }
            //             });
            //         } else{
            //             readySource = new $TileSource( options );
            //             _this.ready = true;
            //             /**
            //              * Raised when a TileSource is opened and initialized.
            //              *
            //              * @event ready
            //              * @memberof OpenSeadragon.TileSource
            //              * @type {object}
            //              * @property {OpenSeadragon.TileSource} eventSource - A reference to the TileSource which raised the event.
            //              * @property {Object} tileSource
            //              * @property {?Object} userData - Arbitrary subscriber-defined object.
            //              */
            //             _this.raiseEvent( 'ready', { tileSource: readySource } );
            //         }
            //     };
            //     if( url.match(/\.js$/) ){
            //         //TODO: Its not very flexible to require tile sources to end jsonp
            //         //      request for info  with a url that ends with '.js' but for
            //         //      now it's the only way I see to distinguish uniformly.
            //         callbackName = url.split('/').pop().replace('.js', '');
            //         $.jsonp({
            //             url: url,
            //             async: false,
            //             callbackName: callbackName,
            //             callback: callback
            //         });
            //     } else {
            //         // request info via xhr asynchronously.
            //         $.makeAjaxRequest( {
            //             url: url,
            //             postData: postData,
            //             withCredentials: this.ajaxWithCredentials,
            //             headers: this.ajaxHeaders,
            //             success: function( xhr ) {
            //                 var data = processResponse( xhr );
            //                 callback( data );
            //             },
            //             error: function ( xhr, exc ) {
            //                 var msg;

            //                 /*
            //                     IE < 10 will block XHR requests to different origins. Any property access on the request
            //                     object will raise an exception which we'll attempt to handle by formatting the original
            //                     exception rather than the second one raised when we try to access xhr.status
            //                  */
            //                 try {
            //                     msg = "HTTP " + xhr.status + " attempting to load TileSource: " + url;
            //                 } catch ( e ) {
            //                     var formattedExc;
            //                     if ( typeof ( exc ) === "undefined" || !exc.toString ) {
            //                         formattedExc = "Unknown error";
            //                     } else {
            //                         formattedExc = exc.toString();
            //                     }

            //                     msg = formattedExc + " attempting to load TileSource: " + url;
            //                 }

            //                 $.console.error(msg);

            //                 /***
            //                  * Raised when an error occurs loading a TileSource.
            //                  *
            //                  * @event open-failed
            //                  * @memberof OpenSeadragon.TileSource
            //                  * @type {object}
            //                  * @property {OpenSeadragon.TileSource} eventSource - A reference to the TileSource which raised the event.
            //                  * @property {String} message
            //                  * @property {String} source
            //                  * @property {String} postData - HTTP POST data (usually but not necessarily in k=v&k2=v2... form,
            //                  *      see TileSource::getPostData) or null
            //                  * @property {?Object} userData - Arbitrary subscriber-defined object.
            //                  */
            //                 _this.raiseEvent( 'open-failed', {
            //                     message: msg,
            //                     source: url,
            //                     postData: postData
            //                 });
            //             }
            //         });
            //     }
            // },
        });
/**
 * @private
 * @inner
 * @function
 */
        // function processResponse( xhr ){
        //     var responseText = xhr.responseText,
        //         status       = xhr.status,
        //         statusText,
        //         data;

        //     if ( !xhr ) {
        //         throw new Error( $.getString( "Errors.Security" ) );
        //     } else if ( xhr.status !== 200 && xhr.status !== 0 ) {
        //         status     = xhr.status;
        //         statusText = ( status === 404 ) ?
        //             "Not Found" :
        //             xhr.statusText;
        //         throw new Error( $.getString( "Errors.Status", status, statusText ) );
        //     }

        //     if( responseText.match(/\s*<.*/) ){
        //         try{
        //         data = ( xhr.responseXML && xhr.responseXML.documentElement ) ?
        //             xhr.responseXML :
        //             $.parseXml( responseText );
        //         } catch (e){
        //             data = xhr.responseText;
        //         }
        //     }else if( responseText.match(/\s*[{[].*/) ){
        //         try{
        //           data = $.parseJSON(responseText);
        //         } catch(e){
        //           data =  responseText;
        //         }
        //     }else{
        //         data = responseText;
        //     }
        //     return data;
        // }
/**
 * @private
 * @inner
 * @function
 */
        // function getMoreInfo(_this, url, opt){
        //     var callbackName,
        //     callback,
        //     options = opt,
        //     urlParts,
        //     filename,
        //     lastDot;
        // var start = _this.indexObject["dziOffset"][0],
        // end = opt.indexObject["dziOffset"][1];
        // var headers = _this.headers === undefined ? {} : _this.headers;
        // $.extend(headers, {Range: "bytes=" + start.toString() + "-" + end.toString()});

        // if( url ) {
        //     urlParts = url.split( '/' );
        //     filename = urlParts[ urlParts.length - 1 ];
        //     lastDot  = filename.lastIndexOf( '.' );
        //     if ( lastDot > -1 ) {
        //         urlParts[ urlParts.length - 1 ] = filename.slice( 0, lastDot );
        //     }
        // }
        // var postData = null;
        // if (_this.splitHashDataForPost) {
        //     var hashIdx = url.indexOf("#");
        //     if (hashIdx !== -1) {
        //         postData = url.substring(hashIdx + 1);
        //         url = url.substr(0, hashIdx);
        //     }
        // }
        // callback = function( data ){
        //     if( typeof (data) === "string" ) {
        //         data = $.parseXml( data );
        //     }
        //     if(!$.DziTileSource.prototype.supports(data)){
        //         /***
        //              * Raised when an error occurs loading a TileSource.
        //              *
        //              * @event open-failed
        //              * @memberof OpenSeadragon.TileSource
        //              * @type {object}
        //              * @property {OpenSeadragon.TileSource} eventSource - A reference to the TileSource which raised the event.
        //              * @property {String} message
        //              * @property {String} source
        //              * @property {String} postData - HTTP POST data (usually but not necessarily in k=v&k2=v2... form,
        //              *      see TileSource::getPostData) or null
        //              * @property {?Object} userData - Arbitrary subscriber-defined object.
        //              */
        //         console.log(data);
        //          _this.raiseEvent( 'open-failed', {
        //             message: "given Szd File is not supported, Bad Dzi",
        //             source: url,
        //             postData: postData
        //         });
        //     }
        //     if(options !== undefined){
        //         var opt =  $.DziTileSource.prototype.configure.apply( _this, [ data, url, postData ]);
        //         options = Object.assign(options, opt);
        //     } else{
        //     options = $.DziTileSource.prototype.configure.apply( _this, [ data, url, postData ]);
        //     }
        //     if (options.ajaxWithCredentials === undefined) {
        //         options.ajaxWithCredentials = _this.ajaxWithCredentials;
        //     }
        //     $.DziTileSource.apply(_this, options);
        // };
        // if( url.match(/\.js$/) ){
        //     //TODO: Its not very flexible to require tile sources to end jsonp
        //     //      request for info  with a url that ends with '.js' but for
        //     //      now it's the only way I see to distinguish uniformly.
        //     callbackName = url.split('/').pop().replace('.js', '');
        //     $.jsonp({
        //         url: url,
        //         async: false,
        //         callbackName: callbackName,
        //         callback: callback
        //     });
        // } else {
        //     // request info via xhr asynchronously.
        //     return $.makeAjaxRequest( {
        //         url: url,
        //         postData: postData,
        //         withCredentials: _this.ajaxWithCredentials,
        //         headers: headers,
        //         success: function( xhr ) {
        //             var data = processResponse( xhr );
        //             callback( data );
        //         },
        //         error: function ( xhr, exc ) {
        //             var msg;

        //             /*
        //                 IE < 10 will block XHR requests to different origins. Any property access on the request
        //                 object will raise an exception which we'll attempt to handle by formatting the original
        //                 exception rather than the second one raised when we try to access xhr.status
        //              */
        //             try {
        //                 msg = "HTTP " + xhr.status + " attempting to load TileSource: " + url;
        //             } catch ( e ) {
        //                 var formattedExc;
        //                 if ( typeof ( exc ) === "undefined" || !exc.toString ) {
        //                     formattedExc = "Unknown error";
        //                 } else {
        //                     formattedExc = exc.toString();
        //                 }

        //                 msg = formattedExc + " attempting to load TileSource: " + url;
        //             }

        //             $.console.error(msg);

        //             /***
        //              * Raised when an error occurs loading a TileSource.
        //              *
        //              * @event open-failed
        //              * @memberof OpenSeadragon.TileSource
        //              * @type {object}
        //              * @property {OpenSeadragon.TileSource} eventSource - A reference to the TileSource which raised the event.
        //              * @property {String} message
        //              * @property {String} source
        //              * @property {String} postData - HTTP POST data (usually but not necessarily in k=v&k2=v2... form,
        //              *      see TileSource::getPostData) or null
        //              * @property {?Object} userData - Arbitrary subscriber-defined object.
        //              */
        //             _this.raiseEvent( 'open-failed', {
        //                 message: msg,
        //                 source: url,
        //                 postData: postData
        //             });
        //         }
        //     });
        // }
        // }
/**
 * @private
 * @inner
 * @function
 */
        // function Makesyncrequest(url, headers, callback){
        //     var protocol = $.getUrlProtocol( url );
        //     var request = $.createAjaxRequest()
        //     request.open()
        // }

}( OpenSeadragon ));
