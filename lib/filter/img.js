
'use strict';

var Promise          = require('bluebird');
var assign           = require('object-assign');
var gs               = require('../imageSize.js');
var lg               = require('../log.js');


//------------------------------------
// <img> to <amp-img>
//------------------------------------
module.exports.filter_img = function(result){

  if(result.tempData.isCacheUse)return Promise.resolve(result);
  
  lg.setConfig(result.config);
  gs.setConfig(result.config);
  
  var updateObj;
  var replaceStr      = result.data;
  var post            = result.post;
  var imgMatch        = replaceStr.match(/\<img\s[^>]*?>/g);
  
  if(!imgMatch)return Promise.resolve(result);
  
  
  return new Promise.all( imgMatch.map(function(imm){
    return new Promise(function(resolve , reject){
      
      var imgSrc    = "";
      var imgWidth  = "";
      var imgHeight = "";
      var replaceImgSrc = "";
      
      var imgDataMatch = imm.match(/data\-original\=\".*?\"/g);
      if(imgDataMatch && imgDataMatch.length > 0){
          imgSrc = imgDataMatch[0].replace("data-original=","src=");
      }else{
        imgDataMatch = imm.match(/src\=\".*?\"/g);
        if(imgDataMatch){
          imgSrc = imgDataMatch[0];
        }
      }
      
      imgDataMatch = imm.match(/width\=\".*?\"/g);
      if(imgDataMatch){
        imgWidth = imgDataMatch[0];
      }
      
      imgDataMatch = imm.match(/(height|data\-height)\=\".*?\"/g);
      if(imgDataMatch){
        imgHeight = imgDataMatch[0].replace("data-height","height");
      }
      
      if(imgSrc == "" || imgSrc =='src=""'){
        lg.log("error", "<img> should contain image src attribute." , post.source);
        resolve(result);
      }else{
        if(imgWidth == "" || imgHeight == ""){
          var imgPath = imgSrc.replace(/^src\=\"/,"").replace(/\"$/,"");
          //Local image files and External url
          gs.getSizeInfo(imgPath , post , function(gsSizeInfo){
            if(gsSizeInfo){
              imgWidth   = 'width="' + gsSizeInfo.w + '"';
              imgHeight  = 'height="' + gsSizeInfo.h + '"';
              replaceImgSrc = 'src="' + gsSizeInfo.src + '"';
              replaceStr = imgTagReplacer( replaceImgSrc , imgWidth , imgHeight , imm , imgPath , replaceStr , post , lg );
            }else{
              //coment out img
              replaceStr = imgTagReplacer( imgSrc , imgWidth , imgHeight , imm , imgPath , replaceStr , post , lg );
            }
            updateObj = assign(
              result ,
              {
                data : replaceStr
              }
            );
            resolve(result);
          });
          
        }else{
          replaceStr = imgTagReplacer( imgSrc , imgWidth , imgHeight , imm , imgPath , replaceStr , post , lg );
          
          updateObj = assign(
            result ,
            {
              data : replaceStr
            }
          );
          resolve(result);
        }
      }
    });
    
  }))
  .then(function(values){
    return new Promise(function(resolve , reject){
      resolve(result);
    });
  });
};



function imgTagReplacer( imgSrc , imgWidth , imgHeight , imm , imgPath , inStr , post , inLg ){
  var replaceStr = inStr;
  if(imgSrc != "" && imgWidth != "" && imgHeight != ""){
    replaceStr = replaceStr.replace(imm, '<p><div class="amp-img-wrapper"><amp-img '+ imgSrc +' '+ imgWidth +' '+ imgHeight +' layout="responsive"></amp-img></div></p>');
  }else{
    //coment out img
    inLg.log("error", "This plugin can not acquire the width and height of such url images. Please change the URL to HTTP or HTTPS, or add height and width. \nimg path: "+imgPath , post.source);
    replaceStr = replaceStr.replace(imm, "<!-- This img tag couldn't replace. src: "+ imm +"-->");
  }
  return replaceStr;
}