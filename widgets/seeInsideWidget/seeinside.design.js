function twxSeeInside() {
  return {
    elementTag: 'twx-seeinside',
    label: 'See Inside',
    category : 'ar',
    groups    : ['Effects'],  
    properties: [
      {
        name: 'disable',
        label: 'Disabled',
        datatype: 'boolean',
        default: false,
        isBindingTarget: true
      },
      {
        name: 'physicaldigital',
        label: 'Physical Model',
        datatype: 'boolean',
        default: true,
        isBindingTarget: true,
        showInput: true
      },
      {
        name: 'xray',
        label: 'Xray',
        datatype: 'boolean',
        default: true,
        isBindingTarget: true,
        showInput: true
      },
      {
        name: 'inner',
        label: 'Inner Model / modelItem Id',
        datatype: 'string',
        default: '',
        isBindingTarget: true,
        showInput: true
      },
      {
        name: 'outer',
        label: 'Outer Model / modelItem Id',
        datatype: 'string',
        default: '',
        isBindingTarget: true,
        showInput: true
      },
      {
        name: 'color',
        label: 'Color',
        datatype: 'select',
        default: '[1,1,1,1]',
        isBindingSource: true,   
        isBindingTarget: true,
        editor: 'select',
        options: [
            {label: 'Red'      , value: "[1,0,0,1]"},
            {label: 'Green'    , value: "[0,1,0,1]"},
            {label: 'Blue'     , value: "[0,0,1,1]"},
            {label: 'Yellow'   , value: "[1,1,0,1]"},
            {label: 'Black' ,    value: "[0,0,0,1]"},
            {label: 'White'    , value: "[1,1,1,1]"},
            {label: 'Magenta',   value: "[1,0,1,1]"},
            {label: 'Turquiose', value: "[0,1,1,1]"}
        ],
      },
      {
        name: 'nearfade',
        label: 'Near Fade (m)',
        datatype: 'number',
         default: 0.2,
         isBindingSource: false,
         isBindingTarget: true,
       showInput: true
      },
      {
        name: 'farfade',
        label: 'Far Fade (m)',
        datatype: 'number',
         default: 0,
         isBindingSource: false,
         isBindingTarget: true,
       showInput: true
      },
      {
        name: 'attenuate',
        label: 'Attenuate (between 0..1)',
        datatype: 'number',
         default: 0,
         isBindingSource: false,
         isBindingTarget: true,
        isVisible:false,            
        showInput: true
      },
      {
        name: 'ambient',
        label: 'Ambient Light (between 0..1)',
        datatype: 'number',
         default: 0.2,
         isBindingSource: false,
         isBindingTarget: true,
       showInput: true
      },

    ],
    events: [
    
    ],
    dependencies: {
      files         : ['js/seeinside-ng.js'],
      angularModules: ['seeinside-ng']
    }
    ,
    designTemplate: function () {
      return ' <twx-dt-image> ';
    }
    ,
    runtimeTemplate: function (props, twxWidgetEl, fullOriginalDoc, $, projectSettings) {
      var forholo = (projectSettings.projectType === 'eyewear');
      var isholo = forholo ;   
      //
      // the face / hand and overload indicator
      var vs0 = '<script name="xray2hl" type="x-shader/x-vertex">cbuffer ModelConstantBuffer : register(b0){ float4x4 model; float4x4 inverse;};cbuffer MaterialConstantBuffer : register(b1){ float4 diffuseColor;};cbuffer ViewProjectionConstantBuffer : register(b2){ float4x4 viewProjection[2]; float4x4 viewInverse;};struct VertexShaderInput { half4 pos : POSITION; half4 normal : NORMAL; half2 texcoord: TEXCOORD; uint instId : SV_InstanceID;};struct VertexShaderOutput{ half4 pos : SV_POSITION; half3 I : NORMAL0; half3 N : TEXCOORD0; half3 P : TEXCOORD1; uint rtvId : SV_RenderTargetArrayIndex; };VertexShaderOutput main(VertexShaderInput input){ VertexShaderOutput output; half4 pos = half4(input.pos); int idx = input.instId % 2; pos = mul(pos, model); output.P = pos.xyz; half4 eye = half4(0., 0., 0., 1.); output.I = (pos - mul(eye, viewInverse)).xyz; pos = mul(pos, viewProjection[idx]); output.pos = (half4)pos; output.N = -normalize(mul(input.normal, inverse).xyz); output.rtvId = idx; return output; } </script>';
      var ps0 = '<script name="xray2hl" type="x-shader/x-fragment">cbuffer ShaderConstantBuffer : register(b0){ float4 highlightColor; bool useTexture; bool useLight; float transparency; int pad;};cbuffer RenderConstantBuffer : register(b1){ float tick; float3 ding;};cbuffer TMLDefinedConstants : register(b10){ float farFade; float nearFade; float attenuate; float ambient; float r; float g; float b;};struct PixelShaderInput{ half4 pos : SV_POSITION; half3 I : NORMAL0; half3 N : TEXCOORD0; half3 P : TEXCOORD1;};min16float4 main(PixelShaderInput input) : SV_TARGET{ min16float4 highlightColorFinal = min16float4(0,0,0,0); if (highlightColor.x >= 0.) { highlightColorFinal = min16float4(highlightColor); } const float intensity = 1.0; const float falloff = 1.0; min16float4 color = min16float4(r, g, b, transparency); float opacity = abs(dot(normalize(-input.N), normalize(-input.I))); float xray = ambient + intensity * (1. - pow(opacity, falloff)); min16float4 finalShadedColor = min16float4(saturate(xray * color).xyz, transparency * opacity); min16float4 highlightedOutputColor; highlightedOutputColor.xyz = lerp(finalShadedColor.xyz, highlightColorFinal.xyz, highlightColorFinal.w); highlightedOutputColor.w = min16float(finalShadedColor.w); float dz = length(input.I); float mf = saturate(1. - attenuate); float cd = farFade > 0. ? smoothstep( (farFade * 2.), farFade, dz) : 1. ; float od = smoothstep( (nearFade / 2.), nearFade, dz); float gz = mf * clamp(cd * od, 0., 1.); return highlightedOutputColor * gz;}</script>';
      var vs1 = '<script name="xray2gl" type="x-shader/x-vertex"> attribute vec3 vertexPosition; attribute vec3 vertexNormal; uniform mat4 modelViewProjectionMatrix; uniform mat4 modelViewMatrix; uniform mat4 normalMatrix; varying vec3 I; varying vec3 N; void main() { vec4 vp = vec4(vertexPosition, 1.); gl_Position = modelViewProjectionMatrix * vp; vec4 P = modelViewMatrix * vp; I = P.xyz - vec3(0); N = vec3(normalMatrix * vec4(vertexNormal, 0.)); } </script>';
      var ps1 = '<script name="xray2gl" type="x-shader/x-fragment"> precision mediump float; varying vec3 I; varying vec3 N; uniform float falloff; uniform float ambient; uniform float intensity; uniform float r; uniform float g; uniform float b; uniform float farFade; uniform float nearFade; uniform float attenuate; void main() { float faf = 1. + falloff; float ity = 1. + intensity; float mf  = clamp(1. - attenuate,0., 1.); float dp  = dot(normalize(-N), normalize(-I)); if (dp < 0.) discard; else { float dz = length(I); float cd = (farFade > 0.) ? smoothstep( (farFade * 2.), farFade, dz) : 1. ; float od = smoothstep( (nearFade / 2.), nearFade, dz); float gz = mf * clamp(cd * od, 0., 1.) ; float op = ambient + ity * (1.0 - pow(abs(dp), faf)); gl_FragColor = gz * op * vec4(r, g, b, 1.); } } </script>';
      var ps2 = '<script name="desaturatedhl" type="x-shader/x-fragment"> cbuffer ShaderConstantBuffer : register(b0) {float4  highlightColor; bool    useTexture; bool    useLight; float   transparency; int     pad; }; cbuffer RenderConstantBuffer : register(b1) {float   tick; float3  ding; }; cbuffer MaterialConstantBuffer : register(b2) {float4  diffuseColor; int     twoSided; int     useTextureMap; int     useNormalMap; int     useSpecularMap; }; cbuffer TMLDefinedConstants : register(b10) {float   cutoffDepth; float   cutoutDepth; float blend; }; struct PixelShaderInput {half4   pos : SV_POSITION; half3   I   : NORMAL0; half3   N   : TEXCOORD0; half3   P   : TEXCOORD1; }; half4 luma(half4 inc) { float mc = min(min(inc.x, inc.y), inc.z); float xc = max(max(inc.x, inc.y), inc.z); float dc = (mc + xc) / 2.; return half4(dc, dc, dc, inc.w); } min16float4 main(PixelShaderInput input) : SV_TARGET {min16float4 highlightColorFinal = min16float4(0,0,0,0); if (highlightColor.x >= 0.0) {highlightColorFinal = min16float4(highlightColor); } float4 base = float4(diffuseColor.xyz,transparency); float4 color  = lerp(luma(base),base,blend); float opacity = abs(dot(normalize(-input.N), normalize(-input.I))); min16float4 finalShadedColor = min16float4(color * opacity); float od = length(input.I); float gz=smoothstep(0.5,0.5,od); min16float4 highlightedOutputColor; highlightedOutputColor.xyz = lerp(finalShadedColor.xyz, highlightColorFinal.xyz, highlightColorFinal.w); highlightedOutputColor.w = min16float(finalShadedColor.w); return highlightedOutputColor * gz; } </script> '
      var vs2 = '<script name="desaturatedhl" type="x-shader/x-vertex">cbuffer ModelConstantBuffer : register(b0) { float4x4 model; float4x4 inverse; }; cbuffer MaterialConstantBuffer : register(b1) { float4   diffuseColor; }; cbuffer ViewProjectionConstantBuffer : register(b2) { float4x4 viewProjection[2]; float4x4 viewInverse; }; struct VertexShaderInput { half4 pos     : POSITION; half4 normal  : NORMAL; half2 texcoord: TEXCOORD; uint  instId  : SV_InstanceID; }; struct VertexShaderOutput { half4 pos     : SV_POSITION; half3 I       : NORMAL0; half3 N       : TEXCOORD0; half3 P       : TEXCOORD1; uint  rtvId   : SV_RenderTargetArrayIndex; }; VertexShaderOutput main(VertexShaderInput input) { VertexShaderOutput output; half4 pos = half4(input.pos); int idx = input.instId % 2; pos = mul(pos, model); output.P = pos.xyz; half4 eye = half4(0., 0., 0., 1.); output.I = (pos - mul(eye, viewInverse)).xyz; pos = mul(pos, viewProjection[idx]); output.pos = (half4)pos; output.N = -normalize(mul(input.normal, inverse).xyz); output.rtvId = idx; return output; }</script>' 
      var ps3 = '<script name="desaturatedgl" type="x-shader/x-fragment"> precision mediump float; const float PI=3.1415926; varying vec3 vertex; varying vec3 normal; uniform vec4 surfaceColor; uniform float blend; const vec4 ambientColor = vec4(0.15, 0.15, 0.15, 1.0); const vec4 specColor    = vec4(0.05, 0.05, 0.05, 1.0); vec4 luma(vec4 cin) {float min = min( min(cin.x, cin.y), cin.z ); float max = max( max(cin.x, cin.y), cin.z ); float v = (max+min)/2.; return vec4(v,v,v,cin.w); } void main() {vec4 color = mix(luma(surfaceColor),surfaceColor,blend); vec3 lightPos    = vec3(1.,1.,1.); vec3 lightDir    = -normalize(lightPos); vec3 finalNormal = normalize(normal); float lambertian = dot(lightDir,finalNormal); float specular   = 0.0; vec3 viewDir     = normalize(-vertex); if (lambertian < 0.0) finalNormal = - finalNormal; vec3 reflectDir = reflect(-lightDir, finalNormal); float specAngle = max(dot(reflectDir, viewDir), 0.0); specular = pow(specAngle, 4.0); color = ambientColor * color + color * abs(lambertian)   + specColor * specular; color.a = 1.; gl_FragColor=vec4(color); } </script>'
      var vs3 = '<script name="desaturatedgl" type="x-shader/x-vertex"> attribute vec3 vertexPosition; attribute vec3 vertexNormal; varying   vec3 normal; varying   vec3 vertex; uniform   mat4 modelViewProjectionMatrix; uniform   mat4 normalMatrix; void main() {vec4 vp     = vec4(vertexPosition, 1.0); gl_Position = modelViewProjectionMatrix * vp; normal      = vec3(normalize(normalMatrix * vec4(vertexNormal,0.0))); vertex      = vp.xyz; } </script>'
      var ps4 = '<script name="discardedgl" type="x-shader/x-fragment"> precision mediump float; const float PI=3.1415926; varying vec3 vertex; varying vec3 normal; uniform vec4 surfaceColor; uniform float blend; const vec4 ambientColor = vec4(0.15, 0.15, 0.15, 1.0); const vec4 specColor    = vec4(0.05, 0.05, 0.05, 1.0); vec4 luma(vec4 cin) {float min = min( min(cin.x, cin.y), cin.z ); float max = max( max(cin.x, cin.y), cin.z ); float v = (max+min)/2.; return vec4(v,v,v,cin.w); } void main() { discard; } </script>'
      var vs4 = '<script name="discardedgl" type="x-shader/x-vertex"> attribute vec3 vertexPosition; attribute vec3 vertexNormal; varying   vec3 normal; varying   vec3 vertex; uniform   mat4 modelViewProjectionMatrix; uniform   mat4 normalMatrix; void main() {vec4 vp     = vec4(vertexPosition, 1.0); gl_Position = modelViewProjectionMatrix * vp; normal      = vec3(normalize(normalMatrix * vec4(vertexNormal,0.0))); vertex      = vp.xyz; } </script>'
      var ctrl= '<div ng-seeinside id="'+props.widgetId+'" class="ng-hide seeinsideWidget' + props.class + '" isholo-field='+isholo+'  inner={{me.inner}} outer={{me.outer}} ambient-field={{me.ambient}} color-field={{me.color}} nearfade-field={{me.nearfade}} farfade-field={{me.farfade}} physicaldigital-field={{me.physicaldigital}} xray-field={{me.xray}} attenuate-field={{me.attenuate}} disable-field={{me.disable}}></div>';
      // put them together and what have you got ...
      var shaders= forholo ? vs0 + ps0 + vs1 + ps1 + ps2 + vs2 + vs3 + ps3 + vs4 + ps4 : 
                                         vs1 + ps1 + vs3 + ps3 + vs4 + ps4;
      return shaders + ctrl;

    }
  }
}
twxAppBuilder.widget('twxSeeInside', twxSeeInside);
