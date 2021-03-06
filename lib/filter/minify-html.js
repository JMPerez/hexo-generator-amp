
'use strict';

var Promise   = require('bluebird');
var assign    = require('object-assign');
var minify    = require('html-minifier').minify;
var minifyCnt = 0;

//------------------------------------
// html minify (option)
//------------------------------------
module.exports.html_minify = function(result){
  if(result.tempData.isCacheUse)return Promise.resolve(result);
  return new Promise(function(resolve , reject){
    
    var updateObj;
    var htmlData = result.data;
    
    if(typeof result.config.generator_amp.html_minifier !== "undefined"){
      var minified_option = {
        "caseSensitive"                : false,
        "collapseBooleanAttributes"    : true ,
        "collapseInlineTagWhitespace"  : false,
        "collapseWhitespace"           : true ,
        "conservativeCollapse"         : true ,
        "decodeEntities"               : true,
        "html5"                        : true,
        "includeAutoGeneratedTags"     : false,
        "keepClosingSlash"             : false,
        "minifyCSS"                    : true,
        "minifyJS"                     : true,
        "preserveLineBreaks"           : false,
        "preventAttributesEscaping"    : false,
        "processConditionalComments"   : true,
        "processScripts"               : ["text/html" ,"application/ld+json" ,"application/json"],
        "removeAttributeQuotes"        : false,
        "removeComments"               : true,
        "removeEmptyAttributes"        : true,
        "removeEmptyElements"          : false,
        "removeOptionalTags"           : true,
        "removeRedundantAttributes"    : true,
        "removeScriptTypeAttributes"   : true,
        "removeStyleLinkTypeAttributes": true,
        "removeTagWhitespace"          : false,
        "sortAttributes"               : true,
        "sortClassName"                : true,
        "useShortDoctype"              : true
      };
      
      // orverride html_minifier option
      if( result.config.generator_amp.html_minifier && typeof result.config.generator_amp.html_minifier === "object"){
        minified_option = assign( {}, minified_option, result.config.generator_amp.html_minifier);
      }
      var minified_HTML = minify( htmlData, minified_option);
      htmlData = minified_HTML;
      
      minifyCnt++;
      
      updateObj = assign(
        result ,
        {
          data : htmlData
        }
      );
      
      // process.stdout.write('[hexo-generator-amp] HTML Minifying now ... '+minifyCnt+' pages newly minified .\r');
      
    }else{
      updateObj = result;
    }

    resolve( updateObj );
  });
};
