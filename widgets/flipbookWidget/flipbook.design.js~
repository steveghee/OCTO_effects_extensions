function twxFlipbookAnimation() {
  return {
    elementTag: 'twx-flipbook',
    label: 'Flipbook Animation',
    category : 'ar',
    groups    : ['Effects'],  
    properties: [

      {
        name: 'physicaldigital',
        label: 'Physical Model',
        datatype: 'boolean',
        default: true,
        isBindingTarget: true,
        showInput: true
      },
      {
        name: 'affects',
        label: 'Affects',
        datatype: 'string',
        default: '',
        placeholder: 'add modelitem(s), images (, separated)',  
        isBindingTarget: true,
        showInput: true
      },
      {
         name: 'frames',
         label: 'Number of Frames',
         datatype: 'number',
         default: '1',
         isBindingSource: false,
         isBindingTarget: true,
         showInput: true
      },
      {
        name: 'speed',
        label: 'Speed',
        datatype: 'number',
        default: '1',
        isBindingTarget: true,
        showInput: true
      },
      {
            name: 'direction',
           label: 'Direction',
        datatype: 'select',
         default: "1",
 isBindingTarget: false,
          editor: 'select',
         options: [
            {label: 'Forwards' , value:  "1" },
            {label: 'Backwards', value: "-1" }
                  ],
      },
      {
        name: 'intensity',
        label: 'Intensity',
        datatype: 'number',
        default: '1',
        isBindingTarget: true,
        min:0,
        max:1,
        showInput: true
      },
      {
        name: 'src',
        label: 'Image',
        datatype: 'resource_url',
        resource_image: true,
        allowedPatterns: ['.png', '.jpg', '.svg', '.jpeg', '.gif','.bmp'],
        default: '',
        isBindingTarget: true,
        isVisible : true
      },
      {
        name: 'disable',
        label: 'Disabled',
        datatype: 'boolean',
        default: false,
        isBindingTarget: true,
        isVisible : true       
      },

    ],
    events: [
    
    ],
    dependencies: {
      files         : ['js/flipbook-ng.js'],
      angularModules: ['flipbook-ng']
    }
    ,
    designTemplate: function () {
      return ' <twx-dt-image> ';
    }
    ,
    runtimeTemplate: function (props, twxWidgetEl, fullOriginalDoc, $, projectSettings) {
      var forholo = (projectSettings.projectType === 'eyewear');
      var isholo  = forholo ;   
        
      // vertex/pixel shaders for hololens
      //
      var vs0 = '';  // to be completed...
      var ps0 = '';
      
      // vertex/pixel shaders for other devices
      var ps1='<script name="flipper_gl" type="x-shader/x-fragment"> precision mediump float; varying vec2 texCoord; uniform sampler2D texSampler2D; uniform float tick; uniform float intensity; uniform float blend; uniform float rate; uniform float direction; uniform float frames; uniform vec4 surfaceColor; void main(void) { float uwidth = 1. / frames; float vis = intensity; float speed = (direction >= 0.) ? 1.+rate : -1.-rate; float mt = mod(speed * tick,1./uwidth); float lt = uwidth * (floor(mt) + texCoord.x); vec4 tx1 = texture2D(texSampler2D,vec2(lt,texCoord.y)); vec4 flip = vec4(tx1.rgb,tx1.a*vis); vec4 color = mix(surfaceColor,tx1,tx1.a); gl_FragColor = mix(flip,color,blend); if (gl_FragColor.a <= 0.) discard; } </script>';
      var vs1='<script name="flipper_gl" type="x-shader/x-vertex"> attribute vec4 vertexPosition; attribute vec2 vertexTexCoord; varying vec2 texCoord; uniform mat4 modelViewProjectionMatrix; void main() { gl_Position = modelViewProjectionMatrix * vertexPosition; texCoord = vertexTexCoord; } </script>';
     
      // our control defintion, with all parameters 
      var ctrl= '<div ng-flipbook id="'+props.widgetId+'" isholo-field='+isholo+' speed-field={{me.speed}} direction-field={{me.direction}} physical-field={{me.physicaldigital}} intensity-field={{me.intensity}} src-field={{me.src}} frames-field={{me.frames}} disable-field={{me.disable}} affects={{me.affects}}></div>';
      
      // put them together and what have you got ...
      var shaders= forholo ? vs0 + ps0 : vs1 + ps1;
      return shaders + ctrl;
    }
  }
}
twxAppBuilder.widget('twxFlipbookAnimation', twxFlipbookAnimation);