function twxSeeFlow() {
  return {
    elementTag: 'twx-seeflow',
    label: 'Directional Flow',
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
        placeholder: 'add modelitem(s) (, separated)',  
        isBindingTarget: true,
        showInput: true
      },
      {
         name: 'du',
         label: 'U Velocity',
         datatype: 'number',
         default: '1',
         isBindingSource: false,
         isBindingTarget: true,
         showInput: true
      },
      {
        name: 'dv',
        label: 'V Velocity',
        datatype: 'number',
        default: '1',
        isBindingTarget: true,
        showInput: true
      },
      {
         name: 'deltau',
         label: 'U delta',
         datatype: 'number',
         default: '0',
         isBindingTarget: true,
         isVisible: false
      },
      {
        name: 'deltav',
        label: 'V delta',
        datatype: 'number',
        default: '0',
        isBindingTarget: true,
        isVisible: false
      },
      {
        name: 'sc1',
        label: 'Repeats (U)',
        datatype: 'number',
        default: '1',
        isBindingTarget: true,
        decimalLimit:0,
        min:1,
        step:1,
        showInput: true
      },
      {
        name: 'sc2',
        label: 'Repeats (V)',
        datatype: 'number',
        default: '1',
        isBindingTarget: true,
        decimalLimit:0,
        min:1,
        step:1,
        showInput: true
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
      {
        name: 'env',
        label: 'World Image',
        datatype: 'resource_url',
        resource_image: true,
        allowedPatterns: ['.png', '.jpg', '.svg', '.jpeg', '.gif','.bmp'],
        default: '',
        isBindingTarget: true,
        isVisible : true
      },
      {
        name: 'envrotate',
        label: 'World Rotate (degrees)',
        datatype: 'number',
        default: '0',
        isBindingTarget: true,
        isVisible: false
      },
      {
        name: 'shine',
        label: 'Shine',
        datatype: 'number',
        default: '0.5',
        isBindingTarget: true,
        min:0,
        max:1,
        showInput: true,
        isVisible: true
      },

    ],
    events: [
    
    ],
    dependencies: {
      files         : ['js/seeflow-ng.js'],
      angularModules: ['seeflow-ng']
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
      var vs0 = '<script name="flow_onedir_scale_hl" type="x-shader/x-vertex"> cbuffer ModelConstantBuffer : register(b0) { float4x4 model; float4x4 inverse; }; cbuffer MaterialConstantBuffer : register(b1) { float4 diffuseColor; bool twoSided; }; cbuffer ViewProjectionConstantBuffer : register(b2) { float4x4 viewProjection[2]; float4x4 viewInverse; }; struct VertexShaderInput { half4 pos : POSITION; half4 normal : NORMAL; half2 texcoord: TEXCOORD; uint instId : SV_InstanceID; }; struct VertexShaderOutput { half4 pos : SV_POSITION; half4 color : COLOR0; half3 I : NORMAL0; half3 N : NORMAL1; half2 tcoord : TEXCOORD0; uint rtvId : SV_RenderTargetArrayIndex; }; VertexShaderOutput main(VertexShaderInput input) { VertexShaderOutput output; half4 pos = half4(input.pos); int idx = input.instId % 2; pos = mul(pos, model); half4 eye = half4(0., 0., 0., 1.); output.I = (pos - mul(eye, viewInverse)).xyz; output.N = -normalize(mul(input.normal, inverse).xyz); pos = mul(pos, viewProjection[idx]); output.pos = (half4)pos; output.tcoord = input.texcoord; output.color = diffuseColor; output.rtvId = idx; return output; } </script>';
      var ps0 = '<script name="flow_onedir_scale_hl" type="x-shader/x-fragment"> Texture2D Texture : register(t0); sampler Sampler : register(s0); cbuffer ShaderConstantBuffer : register(b0) { float4 highlightColor; bool useTexture; bool useLight; float transparency; int pad; }; cbuffer RenderConstantBuffer : register(b1) { float tick; float3 ding; }; cbuffer TMLDefinedConstants : register(b10) { float du; float dv; float sc1; float sc2; float blend; float intensity; }; struct PixelShaderInput { half4 pos : SV_POSITION; half4 color : COLOR0; half3 I : NORMAL0; half3 N : NORMAL1; half2 tcoord: TEXCOORD0; }; min16float4 main(PixelShaderInput input) : SV_TARGET { half osc1 = 1./sc1; half osc2 = 1./sc2; half dudt = fmod(-du * tick, osc1); half dvdt = fmod(-dv * tick, osc2); half2 st = half2( (sc1*(input.tcoord.x + dudt)),(sc2*(input.tcoord.y + dvdt))); min16float4 textureColor = min16float4(Texture.Sample(Sampler, st)); textureColor.a=textureColor.a*intensity; float4 color = float4(input.color.xyz,1.); float opacity = abs(dot(normalize(-input.N), normalize(-input.I))); min16float4 fsc = min16float4(color*abs(opacity));fsc.a=1.; min16float4 mixed = lerp(fsc,textureColor,textureColor.a);mixed.a=textureColor.a*transparency; min16float4 final = lerp(textureColor,mixed,blend); if (final.a <=0.) discard; return final; } </script>';
      // vertex/pixel shaders for other devices
      var vs1 = '<script name="flow_onedir_scale_gl" type="x-shader/x-vertex"> attribute vec4 vertexPosition; attribute vec3 vertexNormal; attribute vec2 vertexTexCoord; varying vec3 normal; varying vec3 vertex; varying vec2 texcoord;  uniform float uoff; uniform float voff; uniform mat4 modelViewProjectionMatrix; uniform mat4 normalMatrix; void main() { gl_Position = modelViewProjectionMatrix * vertexPosition; normal = vec3(normalize(normalMatrix * vec4(vertexNormal,0.0))); vertex = vertexPosition.xyz; vec2 toff = vec2(uoff,voff); texcoord = vertexTexCoord + toff; } </script> ';
      var ps1 = '<script name="flow_onedir_scale_gl" type="x-shader/x-fragment"> precision mediump float; varying vec3 vertex; varying vec3 normal; varying vec2 texcoord; uniform float du; uniform float dv; uniform float sc1; uniform float sc2; uniform float blend; uniform float intensity; uniform vec4 surfaceColor; uniform float transparency; uniform sampler2D texSampler2D; uniform float tick; const vec4 ambientColor = vec4(0.15, 0.15, 0.15, 1.0); const vec4 specColor = vec4(0.05, 0.05, 0.05, 1.0); void main() { float dudt = mod(-du*tick, 1./sc1); float dvdt = mod(-dv*tick, 1./sc2); vec2 st = vec2((sc1*(texcoord.x+dudt)),(sc2*(texcoord.y+dvdt))); vec4 flowColor = texture2D(texSampler2D, st); flowColor.a = flowColor.a * intensity; vec4 color = surfaceColor; vec3 lightPos = vec3(1.,1.,1.); vec3 lightDir = -normalize(lightPos); vec3 finalNormal = normalize(normal); float lambertian = dot(lightDir,finalNormal); float specular = 0.0; vec3 viewDir = normalize(vertex); if (lambertian < 0.0) finalNormal = - finalNormal; vec3 reflectDir = reflect(-lightDir, finalNormal); float specAngle = max(dot(reflectDir, viewDir), 0.0); specular = pow(specAngle, 4.0); color = ambientColor * color + color * abs(lambertian) + specColor * specular;color.a = 1.; vec4 mixed = mix(color,flowColor,flowColor.a); mixed.a = mix(surfaceColor.a,1.,flowColor.a) * transparency; gl_FragColor = mix(flowColor,mixed,blend); if (gl_FragColor.a <= 0.) discard; } </script>';
      
      var vs2 = '<script name="reflectoflow_gl" type="x-shader/x-vertex"> attribute vec3 vertexPosition; attribute vec3 vertexNormal; attribute vec2 vertexTexCoord; varying vec3 N; varying vec3 I; varying vec2 T; uniform mat4 modelViewProjectionMatrix; uniform mat4 normalMatrix; uniform mat4 modelViewMatrix;  uniform float uoff; uniform float voff; void main() {  vec2 toff = vec2(uoff,voff); vec4 vp = vec4(vertexPosition, 1.0); gl_Position = modelViewProjectionMatrix * vp; vec3 vertex = vec3(modelViewMatrix * vp); N = vec3(normalize(normalMatrix * vec4(vertexNormal,0.0))); I = vertex.xyz - vec3(0); T = vertexTexCoord + toff; } </script>';
      var ps2 = '<script name="reflectoflow_gl" type="x-shader/x-fragment"> precision mediump float; varying vec3 I; varying vec3 N; varying vec2 T; const float PI = 3.1415; uniform mat4 inverseViewMatrix; uniform sampler2D texSampler2D; uniform sampler2D envSampler2D; uniform vec4 surfaceColor; uniform float intensity; uniform float tick; uniform float shine; uniform float blend; uniform float envrotate; uniform float du; uniform float dv; uniform float sc1; uniform float sc2; const vec4 ambientColor = vec4(0.15, 0.15, 0.15, 1.0); const vec4 specColor = vec4(2.5, 2.5, 2.5, 1.); void main() { vec3 NN = normalize(N); vec3 II = normalize(I); vec3 R = normalize(reflect(II, NN)); vec3 RR = vec3(inverseViewMatrix*vec4(R,0.)); float tx = envrotate-atan(RR.x, RR.z) / (2.0 * PI); float ty = .5+(asin(-RR.y) / PI); vec2 tex = vec2(tx,ty); vec3 LP = vec3(1.,1.,1.); vec3 LL = normalize(LP); float lambertian = dot(LL,NN); float specular = 0.0; if (lambertian < 0.0) NN = - NN; vec3 reflectDir = reflect(-LL, NN); float specAngle = max(dot(reflectDir, II), 0.0); specular = pow(specAngle, 10.0); vec4 speccol = specColor * specular * specular; speccol.a = 1.; vec4 surfcol = (surfaceColor * lambertian) + (speccol * shine); surfcol.a = 1.; float dudt = mod(-du*tick, 1./sc1); float dvdt = mod(-dv*tick, 1./sc2); vec2 st = vec2((sc1*(T.x+dudt)),(sc2*(T.y+dvdt))); vec4 flowcol = texture2D(texSampler2D,st); vec4 glascol = texture2D(envSampler2D,tex) + (speccol * shine); gl_FragColor = mix(mix(surfcol,flowcol,intensity),glascol,shine); } </script>';

      // our control defintion, with all parameters 
      var ctrl= '<div ng-seeflow id="'+props.widgetId+'" isholo-field='+isholo+' shine-field={{me.shine}} deltau-field={{me.deltau}} deltav-field={{me.deltavv}} physical-field={{me.physicaldigital}} intensity-field={{me.intensity}} src-field={{me.src}} du-field={{me.du}} dv-field={{me.dv}} sc1-field={{me.sc1}} sc2-field={{me.sc2}} disable-field={{me.disable}} affects={{me.affects}} env-field={{me.env}} envrotate-field={{me.envrotate}} ></div>';
      // put them together and what have you got ...
      var shaders= forholo ? vs0 + ps0 : vs1 + ps1 + vs2 + ps2;
      return shaders + ctrl;
    }
  }
}
twxAppBuilder.widget('twxSeeFlow', twxSeeFlow);