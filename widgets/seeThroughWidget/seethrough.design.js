function twxSeeThrough() {
  return {
    elementTag: 'twx-seethrough',
    label: 'See Through',
    category : 'ar',
    groups    : ['Effects'],  
    properties: [
 
      {
        name: 'affects',
        label: 'Affects',
        datatype: 'string',
        default: '',
        placeholder: 'add modelitem(s) (comma separated)',  
        isBindingTarget: true,
        showInput: true
      },
                        {
        name: 'transmissive',
        label: 'Transmissive % ',
        datatype: 'number',
         default: 30,
         isBindingSource: false,
         isBindingTarget: true,
       showInput: true
      },
       {
        name: 'reflective',
        label: 'Reflective %',
        datatype: 'number',
        default: '50',
        isBindingTarget: true,
        showInput: true
      },
       {
        name: 'envrotate',
        label: 'World Rotate (degrees)',
        datatype: 'number',
        default: '50',
        isBindingTarget: true,
        showInput: true
      },

       {
        name: 'src',
        label: 'World Image',
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
        isVisible : false       
      },

    ],
    events: [
    
    ],
    dependencies: {
      files         : ['js/seethrough-ng.js'],
      angularModules: ['seethrough-ng']
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
      var vs0 = '<script name="glasshl" type="x-shader/x-fragment"> Texture2D Texture : register(t0); sampler Sampler : register(s0); cbuffer ShaderConstantBuffer : register(b0) { float4 highlightColor; bool useTexture; bool useLight; float transparency; int pad; }; cbuffer RenderConstantBuffer : register(b1) { float tick; float3 ding; }; cbuffer TMLDefinedConstants : register(b10) { float envrotate; float refindex; }; cbuffer MaterialConstantBuffer : register(b2) { float4 diffuseColor; int twoSided; int useTextureMap; int useNormalMap; int useSpecularMap; }; cbuffer ModelConstantBuffer : register(b3) { float4x4 model; float4x4 inverse; }; struct PixelShaderInput { half4 pos : SV_POSITION; half3 I : NORMAL0; half3 N : TEXCOORD0; }; min16float4 main(PixelShaderInput input) : SV_TARGET { min16float4 highlightColorFinal = min16float4(0,0,0,0); if (highlightColor.x >= 0.0) { highlightColorFinal = min16float4(highlightColor); } const float PI = 3.1415; float4 RR = float4(normalize(reflect(normalize(input.I), normalize(input.N))), 0.); float tx = envrotate - (atan2(RR.x, RR.z) / (2.0 * PI)); float ty = .5 + (asin(RR.y) / PI); float2 tex = float2(tx,ty); float NdotV = dot(normalize(input.I), normalize(input.N)); float ndv2 = NdotV * NdotV; float pdv = refindex + (1. - ndv2); min16float4 textureColor = min16float4(Texture.Sample(Sampler, tex)); min16float4 color = pdv * textureColor * (diffuseColor + 0.2); min16float4 highlightedOutputColor = saturate(color + highlightColorFinal) ; highlightedOutputColor.a = highlightedOutputColor .a * transparency; return highlightedOutputColor * pdv; } </script><script name="glasshl" type="x-shader/x-vertex"> cbuffer ModelConstantBuffer : register(b0) { float4x4 model; float4x4 inverse; }; cbuffer MaterialConstantBuffer : register(b1) { float4 diffuseColor; }; cbuffer ViewProjectionConstantBuffer : register(b2) { float4x4 viewProjection[2]; float4x4 viewInverse; }; struct VertexShaderInput { half4 pos : POSITION; half4 normal : NORMAL; uint instId : SV_InstanceID; }; struct VertexShaderOutput { half4 pos : SV_POSITION; half3 I : NORMAL0; half3 N : TEXCOORD0; uint rtvId : SV_RenderTargetArrayIndex; }; VertexShaderOutput main(VertexShaderInput input) { VertexShaderOutput output; half4 pos = half4(input.pos); int idx = input.instId % 2; pos = mul(pos, model); half4 eye = half4(0., 0., 0., 1.); output.I = normalize(pos - mul(eye, viewInverse)).xyz; pos = mul(pos, viewProjection[idx]); output.pos = (half4)pos; output.N = - normalize(mul(input.normal, inverse).xyz); output.rtvId = idx; return output; } </script>';
        
      var ps0 = '<script name="glassgl" type="x-shader/x-fragment"> precision mediump float; varying vec3 I; varying vec3 N; const float PI = 3.1415; uniform mat4 inverseViewMatrix; uniform vec4 surfaceColor; uniform float transparency; uniform sampler2D tex0; uniform float refindex; uniform float envrotate; void main() { vec3 NN = normalize(N); vec3 II = normalize(I); vec3 viewDir = vec3(0.0, 0.0, -1.0); float nDotv = dot(NN, viewDir); vec3 R = normalize(reflect(II, NN)); vec3 RR = vec3(inverseViewMatrix * vec4(R,0.)); float tx = envrotate-atan(RR.x, RR.z) / (2.0 * PI); float ty = .5+(asin(-RR.y) / PI); vec2 tex = vec2(tx,ty); vec4 color = texture2D(tex0, tex) * (surfaceColor + 0.2); float pdv = refindex + (1. - (nDotv * nDotv)); color.a = color.a * transparency; gl_FragColor = pdv * color; } </script> <script name="glassgl" type="x-shader/x-vertex"> attribute vec3 vertexPosition; attribute vec3 vertexNormal; varying vec3 N; varying vec3 I; uniform mat4 modelViewProjectionMatrix; uniform mat4 normalMatrix; uniform mat4 modelViewMatrix; void main() { vec4 vp = vec4(vertexPosition, 1.0); gl_Position = modelViewProjectionMatrix * vp; vec3 vertex = vec3(modelViewMatrix * vp); N = vec3(normalize(normalMatrix * vec4(vertexNormal,0.0))); I = vertex.xyz - vec3(0); } </script>';
      var ctrl= '<div ng-seethrough id="'+props.widgetId+'" class="ng-hide seethroughWidget' + props.class + '" isholo-field='+isholo+' src-field={{me.src}} envrotate-field={{me.envrotate}} transmissive-field={{me.transmissive}} reflective-field={{me.reflective}} disable-field={{me.disable}} affects={{me.affects}}></div>';
      // put them together and what have you got ...
      var shaders= forholo ? vs0 + ps0   :  ps0 ;
      return shaders + ctrl;

    }
  }
}
twxAppBuilder.widget('twxSeeThrough', twxSeeThrough);
