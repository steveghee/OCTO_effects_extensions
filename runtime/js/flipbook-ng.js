if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports) {
  module.exports = 'flipbook-ng';
}
(function() {
  'use strict';
  var flipbookModule = angular.module('flipbook-ng', []);
  flipbookModule.directive('ngFlipbook', ['$interval','$http', '$timeout', ngFlipbook]);
  function ngFlipbook($interval, $http,$timeout) {
    return {
      restrict: 'EA',
      scope: {
        isholoField   : '@',
        framesField   : '@',
        speedField    : '@',
        directionField: '@',
        srcField      : '@',
        affects       : '@',
        intensityField: '@',
        physicalField : '@',
        disableField  : '@'
      },
      template: '<div></div>',
      link: function(scope, element, attr) {
        var lastUpdated = 'unknown';
        scope.data = {
          disable  : false,
          capture  : {} , 
          affects  : {},
          speed    : 0,
          direction: 0,
          frames   : 0,
          src      : '',
          intensity: 1,
          physical : true
        };
        function isbool(v) {
          return (v==='true')||v===true;
        }
        function flipshader(params) {
          var isholo = !twx.app.isPreview() && (scope.isholoField != undefined) ? isbool(scope.isholoField) : false;
          var shader = isholo?"flipper_hl"+params : "flipper_gl"+params;
          return shader;
        }
        function restore(b) {
          if(scope.$parent.view.wdg[b]!=undefined && scope.data.capture[b] != undefined) {
            var wdg = scope.$parent.view.wdg[b];
            for(var a in scope.data.capture[b]) 
              wdg[a] = scope.data.capture[b][a];
          }
        }
        function capture(b) {
          if(scope.$parent.view.wdg[b]!=undefined) {
            var wdg = scope.$parent.view.wdg[b];
            scope.data.capture[b] = {
              shader: wdg.shader, 
              visible: wdg.visible, 
              opacity: wdg.opacity, 
              decal: wdg.decal, 
              texture:wdg.texture };
            return true;
          }
          return false;
        }
        function capturelist(list) {
          var ilist = scope.data[list];
          return function(a) {
            if (capture(a) === true)
              ilist.push(a);
          };
        }
        function against(list,effect) {
          if (list.length > 0) {
            for (var x=0;x<list.length;x++) {
              var a = list[x];
              effect(a.trim());
            }
          }
        }
        var recordlist = function(list) {
          var ilist = scope[list].split(',');
          scope.data[list]=[];
          against(ilist,capturelist(list));
        }
        var resetlist = function(list) {
          against(scope.data[list],restore);
        }
        var updateEffects = function(force) {
        var reset = force!=undefined && force===true || scope.data.disable === true;
            
            
          function setdefault(b) {
            if(scope.$parent.view.wdg[b]!=undefined) {
                  
              /*
                
              //this would be a better appoach, but unassigning the texture does not correctly
              //revert back to the original surface texture. when that bug (in view) is fixed, this can be uncommented
              
              var wdg     = scope.$parent.view.wdg[b];
              wdg.shader  = "Default";
              wdg.decal   = "false";
              wdg.opacity = 1.0;
              wdg.visible = true;
              wdg.texture = "";
              
              */
              
              //force the shader into "disabled" state where it stops playing 
              //and reverts to from 0 (direction=1,rate=-1)
              var frame     = scope.data.frames;
              var direction =  1.0;    
              var rate      = -1.0;
              var src       = scope.data.src ;
              
              var intensity = 1.0;
              var blend     = scope.data.physical ? 0 : 1;
              
              var isholo = !twx.app.isPreview() && (scope.isholoField != undefined) ? isbool(scope.isholoField) : false;
              var shd    = flipshader(";blend f "     + blend + 
                                      ";rate f "      + rate +
                                      ";intensity f "      + intensity + 
                                      ";direction f " + direction +
                                      ";frames f "    + frame);
              var wdg    = scope.$parent.view.wdg[b];
              
              if (wdg.pivot != undefined)
                wdg.src     = src + (isholo ? "#edge=repeat" : "?edge=repeat");
              else
                wdg.texture = src + (isholo ? "#edge=repeat" : "?edge=repeat");
              wdg.shader  = shd;
              wdg.decal   = false;
              
              //force physical into phantom mode; for digital, ue whatever is already set
              if (scope.data.physical) 
                wdg.opacity = 0.9 * intensity;
              //otherwise use whatever was set on entry  
              else
                wdg.opacity = scope.data.capture[b].opacity;
            }
          }
          
          function setflip(b) {
            if(reset) setdefault(b);
            else if (scope.$parent.view.wdg[b]!=undefined) {
              var frame     = scope.data.frames;
              var direction = scope.data.direction;    
              var rate      = scope.data.speed ;
              var src       = scope.data.src ;
              
              var intensity = scope.data.intensity;
              var blend     = scope.data.physical ? 0 : 1;
              
              var isholo = !twx.app.isPreview() && (scope.isholoField != undefined) ? isbool(scope.isholoField) : false;
              var shd    = flipshader(";blend f "     + blend + 
                                      ";rate f "      + rate +
                                      ";intensity f "      + intensity + 
                                      ";direction f " + direction +
                                      ";frames f "    + frame);
              var wdg    = scope.$parent.view.wdg[b];
              
              if (wdg.pivot != undefined)
                wdg.src     = src + (isholo ? "#edge=repeat" : "?edge=repeat");
              else
                wdg.texture = src + (isholo ? "#edge=repeat" : "?edge=repeat");
              wdg.shader  = shd;
              wdg.decal   = false;
              
              //force physical into phantom mode; for digital, ue whatever is already set
              if (scope.data.physical) 
                wdg.opacity = 0.9 * intensity;
              //otherwise use whatever was set on entry  
              else
                wdg.opacity = scope.data.capture[b].opacity;
                
            }
          }
        
          function apply(affectsfn) {
            against(scope.data.affects, affectsfn);
          }
          
          if (scope.disableField == "true") {
            // set default shader when Disable == true
            apply(setdefault);
          }
          else {
            // set reflect shader when Disable == false
            apply(setflip);
          }
        }
        //////////////////////////////////////////////////////////////////////////////////
        //
        // monitor inputs for any CHANGE in data
        //
        if (scope.disableField === "false")
        {
          updateEffects();
        }
        var executeEffects= function(){
          if (scope.data.disable === false) $timeout(function () {
            updateEffects();
          }
                                                     , 1);
        };
        scope.$watch('affects', function () {
          // get the list of names
          processlist('affects');
        });
            
        scope.$watch('disableField', function () {
          scope.data.disable = (scope.disableField != undefined && scope.disableField === 'true') ? true :false ;
          if (scope.data.disable ===true) {
            // reset the affects lists to the original settings  
            //resetlist('affects');
            updateEffects();
          }
          else {
            // recapture this (it may have changed, although binding should have caught that)
            recordlist('affects');
            // and re-apply
            executeEffects();
          }
        });
            
        scope.$watchGroup(['speedField','directionField'], function () {
          scope.data.speed     = parseFloat(scope.speedField) ;
          scope.data.direction = parseFloat(scope.directionField) ;
          executeEffects();
        });
            
        scope.$watchGroup(['framesField','intensityField'], function () {
          scope.data.frames    = parseFloat(scope.framesField) ;
          scope.data.intensity = parseFloat(scope.intensityField) ;
          executeEffects();
        });
            
        scope.$watch('physicalField', function () {
          scope.data.physical = (scope.physicalField != undefined && scope.physicalField === 'true') ? true :false ;
          executeEffects();
        });
            
        scope.$watch('srcField', function () {
          scope.data.src  = (scope.srcField  != undefined) ? scope.srcField : '';
          executeEffects();
        });
            
        function processlist(list) {
          if (scope[list] != undefined) {
            // 1. undo/reset the previous values
            resetlist(list);
            // 2. now read the new one, and capture settings
            recordlist(list);
            // 3. finally, apply new settings to sanitised list
            executeEffects();
          }
        }
      }
      //
      //
    };
  }
}
 ());
