angular.module( "yourAppName.loading" )
    .provider( 'loading', function () {
        this.$get = [ '$document', '$injector', '$timeout',
            function ( $document, $injector, $timeout ) {
                var $animate,
                    incTimeout,
                    completeTimeout,
                    started = false,
                    status = 0,
                    autoIncrement = true,
                    includeBar = true,
                    startSize = 0.02;

                var loadingBarContainer = angular.element( '<div id="loading-bar" style="pointer-events: none;-webkit-pointer-events: none;-webkit-transition: 350ms linear all;-moz-transition: 350ms linear all;-o-transition: 350ms linear all;transition: 350ms linear all;">' +
                    '<div class="bar" style="-webkit-transition: width 350ms; -moz-transition: width 350ms; -o-transition: width 350ms;transition: width 350ms;background: #29d;z-index: 10002;height: 10px;"></div></div>' );
                var loadingBar = loadingBarContainer.find( 'div' ).eq( 0 );
                var maskLayer = angular.element( '<div  id="my-app-loading" class="my-app-loading" style="position: fixed;background: rgba(0, 0, 0, 0.4);z-index: 99999;top: 0;right: 0;bottom: 0;left: 0;"></div>' );
                var $parentSelector = angular.element( '<div id="loadingbar-wrapper" class="loadingbar-wrapper" style="width: 400px;position: absolute;left: 50%;top: 50%;margin-left: -200px;border-radius: 5px;background-color: #6D6D6D;"></div>' );
                var loadText = angular.element( '<span class="load-text" style="position: absolute;left: 50%;top: 10px;font-size: 50px;margin-left: -35px;color: #272727;">1%</span>' );
                maskLayer.append( $parentSelector );
                $parentSelector.append( loadText );

                function _start() {
                    if ( !$animate ) {
                        $animate = $injector.get( '$animate' );
                    }

                    $timeout.cancel( completeTimeout );

                    if ( started ) {
                        return;
                    }

                    started = true;

                    if ( includeBar ) {
                        $animate.enter( loadingBarContainer, $parentSelector.eq( 0 ) );//, angular.element( $parent[ 0 ] )
                        $animate.enter( loadText, $parentSelector.eq( 0 ) );
                    }

                    _set( startSize );
                }

                function _set( n ) {
                    if ( !started ) {
                        return;
                    }
                    var pct = (n * 100) + '%';
                    loadingBar.css( 'width', pct );
                    var tmpText = parseInt( (n * 100) ) + "%";
                    loadText.text( tmpText );
                    status = n;

                    if ( autoIncrement ) {
                        $timeout.cancel( incTimeout );
                        incTimeout = $timeout( function () {
                            _inc();
                        }, 250 );
                    }
                }

                function _inc() {
                    if ( _status() >= 1 ) {
                        return;
                    }

                    var rnd = 0;

                    // TODO: do this mathmatically instead of through conditions

                    var stat = _status();
                    if ( stat >= 0 && stat < 0.25 ) {
                        // Start out between 3 - 6% increments
                        rnd = (Math.random() * (5 - 3 + 1) + 3) / 100;
                    } else if ( stat >= 0.25 && stat < 0.65 ) {
                        // increment between 0 - 3%
                        rnd = (Math.random() * 3) / 100;
                    } else if ( stat >= 0.65 && stat < 0.75 ) {
                        // increment between 0 - 2%
                        rnd = (Math.random() * 2) / 100;
                    } else if ( stat >= 0.75 && stat < 0.99 ) {
                        // finally, increment it .5 %
                        rnd = 0.005;
                    } else {
                        // after 99%, don't increment:
                        rnd = 0;
                    }

                    var pct = _status() + rnd;
                    _set( pct );
                }

                function _status() {
                    return status;
                }

                function _completeAnimation() {
                    status = 0;
                    started = false;
                    angular.element( document.querySelectorAll("#my-app-loading") ).remove();
                }

                function _complete() {
                    if ( !$animate ) {
                        $animate = $injector.get( '$animate' );
                    }
                    _set( 1 );

                    $timeout.cancel( completeTimeout );
                    completeTimeout = $timeout( function () {
                        var promise = $animate.leave( loadingBarContainer, _completeAnimation );
                        if ( promise && promise.then ) {
                            promise.then( _completeAnimation );
                        }
                    }, 500 );
                }

                var show = function () {
                    if ( document.querySelectorAll("#my-app-loading").length == 0 ) {
                        angular.element( $document[ 0 ].body ).append( maskLayer );
                        _start();
                        _inc();
                        _set( 0.05 )
                    }
                };

                var hide = function () {
                    if ( document.querySelectorAll("#my-app-loading").length > 0 ) {
                        _complete();
                    }
                };

                var methods = {
                    show: show,
                    hide: hide
                };

                return methods;
            } ];
    } );
