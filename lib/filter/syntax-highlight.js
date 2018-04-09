
'use strict';

var Promise          = require('bluebird');
var assign           = require('object-assign');
var cheerio          = require('cheerio');
var lg               = require('../log.js');

//------------------------------------
// remove spellcheck attribute from comments in syntax highlighted code
//------------------------------------
module.exports.remove_spellcheck = function(result){
  if(result.tempData.isCacheUse)return Promise.resolve(result);

  lg.setConfig(result.config);

  return new Promise(function(resolve , reject){

    var updateObj;
    var replaceStr     = result.data;
    var $              = cheerio.load(replaceStr);

    $("code .comment").each(function(i) {
      $(this).removeAttr('spellcheck');
    });

    replaceStr = $.html();

    updateObj = assign(
      result ,
      {
        data : replaceStr
      }
    );

    resolve( updateObj );
  });
};
