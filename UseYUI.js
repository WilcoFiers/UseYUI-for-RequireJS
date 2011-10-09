/*global define: false, YUI: false */
/**
 * UseYUI is a plugin for RequireJS, that let's you load YUI 3 into 
 * requireJS application.
 * 
 * By coma seperating the module names you want YUI to preload
 * you can chain multiple YUI dependencies to a single instance of YUI.
 * Example: require(['UseYUI!node,anim'], function (Y) {
 *    // Do stuff with Y.anim and YUI node 
 * }
 * 
 * If you only want to load the core simply request UseYUI!YUI.
 * 
 * You can either load YUI before requiring modules, or use the config
 * options in RequireJS to load YUI for you. The same RequireJS config
 * property also allows you to pass a config option to YUI. Use either
 * one of the following methods:
 * require({YUI : 'yui-min.js', ...); OR:
 * require({YUI : { src : 'yui-min.js', more_yui_config: 'here'} ... );
 * 
 * @version   0.1
 * @author    Wilco Fiers <wilco@wilcofiers.com>
 * @license   New BSD License
 * @copyright Wilco Fiers, 2011
 */
define(
/**
 * Module pattern - we need a place to keep the YUI instance
 */
(function () {
    "use strict";
    // because it's easier then typeof, and undefined isn't allowed in ES5
    var notDefined, Y,
        defaultSrc = 'yui-min.js';
        
    function loadModule(name, load) {
        // split the name into an array, with modules that YUI.use
        // needs to load.
        var useParams = name.split(',');
        
        // If it's just trying to load YUI, return that
        if (name === 'yui') {
            return load(Y);
        }
        
        // Add a callback for Y.use as the end of useParams
        useParams.push(function (Y) {
            // tell RequireJS Y has been loaded
            load(Y);
        });
        
        // apply useParams to Y.use
        Y.use.apply(Y, useParams);
    }
    
    return {
        load: function (name, req, load, config) {
            var src,
                configYUI = config.YUI;
                        
            // YUI is loaded, load the module
            if (Y) {
                loadModule(name, load);
                
            // YUI isn't loaded, load it from the config.
            } else if (typeof YUI === 'undefined') {
                if (typeof configYUI === 'string') {
                    src = configYUI;
                    configYUI = notDefined;
                } else if (typeof configYUI === 'object') {
                    src = configYUI.src;
                } else {
                    src = defaultSrc;
                    configYUI = notDefined;
                }
                
                req([src], function () {
                    // Create a YUI instance, for modules using this plugin
                    Y = YUI(configYUI);
                    loadModule(name, load);
                });
                
            // YUI is loaded and Y isn't assigned yet
            } else if (Y === notDefined) {
                // create a new YUI instance
               Y = YUI(configYUI);
               loadModule(name, load);
            
            // YUI wasn't found, throw an error
            } else {
                throw 'YUI could not be located';
            }
        }
    };
}()) );