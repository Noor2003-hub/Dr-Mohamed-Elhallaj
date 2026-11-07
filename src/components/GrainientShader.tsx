'use client'

import { useEffect, useRef } from 'react'


/**
 * A slowly warping three-colour gradient with film grain, drawn by a shader.
 *
 * Adapted from React Bits' Grainient (reactbits.dev/backgrounds/grainient),
 * which is published to be copied into a project. The shader is theirs and
 * unchanged. What is not: the original draws through `ogl`, and all it uses
 * it for is one full-screen triangle — so this talks to WebGL2 directly and
 * the project does not take on a renderer library for a single draw call.
 *
 * ## When it draws
 *
 * Only while it is on screen and the tab is visible; otherwise the loop is
 * stopped outright rather than drawing frames nobody sees. Under reduced
 * motion it draws one frame and stops — the gradient, still. Without WebGL2
 * it draws nothing, and whatever colour is behind it shows instead, so the
 * caller should put a fitting base colour there.
 */

export interface GrainientProps {
  timeSpeed?: number
  colorBalance?: number
  warpStrength?: number
  warpFrequency?: number
  warpSpeed?: number
  warpAmplitude?: number
  blendAngle?: number
  blendSoftness?: number
  rotationAmount?: number
  noiseScale?: number
  grainAmount?: number
  grainScale?: number
  grainAnimated?: boolean
  contrast?: number
  gamma?: number
  saturation?: number
  centerX?: number
  centerY?: number
  zoom?: number
  color1?: string
  color2?: string
  color3?: string
  lightMode?: boolean
  className?: string
}

/**
 * The highest pixel ratio drawn at. It fills the screen, and it is soft and
 * grainy by design — past 1.5 a retina display spends a lot of fragment work
 * on detail the grain hides anyway.
 */
const MAX_DPR = 1.5

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return [1, 1, 1]
  return [
    parseInt(result[1]!, 16) / 255,
    parseInt(result[2]!, 16) / 255,
    parseInt(result[3]!, 16) / 255,
  ]
}

const VERTEX = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const FRAGMENT = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uTimeSpeed;
uniform float uColorBalance;
uniform float uWarpStrength;
uniform float uWarpFrequency;
uniform float uWarpSpeed;
uniform float uWarpAmplitude;
uniform float uBlendAngle;
uniform float uBlendSoftness;
uniform float uRotationAmount;
uniform float uNoiseScale;
uniform float uGrainAmount;
uniform float uGrainScale;
uniform float uGrainAnimated;
uniform float uContrast;
uniform float uGamma;
uniform float uSaturation;
uniform vec2 uCenterOffset;
uniform float uZoom;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform float uLightMode;
out vec4 fragColor;
#define S(a,b,t) smoothstep(a,b,t)
mat2 Rot(float a){float s=sin(a),c=cos(a);return mat2(c,-s,s,c);}
vec2 hash(vec2 p){p=vec2(dot(p,vec2(2127.1,81.17)),dot(p,vec2(1269.5,283.37)));return fract(sin(p)*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.0-2.0*f);float n=mix(mix(dot(-1.0+2.0*hash(i+vec2(0.0,0.0)),f-vec2(0.0,0.0)),dot(-1.0+2.0*hash(i+vec2(1.0,0.0)),f-vec2(1.0,0.0)),u.x),mix(dot(-1.0+2.0*hash(i+vec2(0.0,1.0)),f-vec2(0.0,1.0)),dot(-1.0+2.0*hash(i+vec2(1.0,1.0)),f-vec2(1.0,1.0)),u.x),u.y);return 0.5+0.5*n;}
void mainImage(out vec4 o, vec2 C){
  float t=iTime*uTimeSpeed;
  vec2 uv=C/iResolution.xy;
  float ratio=iResolution.x/iResolution.y;
  vec2 tuv=uv-0.5+uCenterOffset;
  tuv/=max(uZoom,0.001);

  float degree=noise(vec2(t*0.1,tuv.x*tuv.y)*uNoiseScale);
  tuv.y*=1.0/ratio;
  tuv*=Rot(radians((degree-0.5)*uRotationAmount+180.0));
  tuv.y*=ratio;

  float frequency=uWarpFrequency;
  float ws=max(uWarpStrength,0.001);
  float amplitude=uWarpAmplitude/ws;
  float warpTime=t*uWarpSpeed;
  tuv.x+=sin(tuv.y*frequency+warpTime)/amplitude;
  tuv.y+=sin(tuv.x*(frequency*1.5)+warpTime)/(amplitude*0.5);

  vec3 colLav=uColor1;
  vec3 colOrg=uColor2;
  vec3 colDark=uColor3;
  float b=uColorBalance;
  float s=max(uBlendSoftness,0.0);
  mat2 blendRot=Rot(radians(uBlendAngle));
  float blendX=(tuv*blendRot).x;
  float edge0=-0.3-b-s;
  float edge1=0.2-b+s;
  float v0=0.5-b+s;
  float v1=-0.3-b-s;
  vec3 layer1=mix(colDark,colOrg,S(edge0,edge1,blendX));
  vec3 layer2=mix(colOrg,colLav,S(edge0,edge1,blendX));
  vec3 col=mix(layer1,layer2,S(v0,v1,tuv.y));

  vec2 grainUv=uv*max(uGrainScale,0.001);
  if(uGrainAnimated>0.5){grainUv+=vec2(iTime*0.05);}
  float grain=fract(sin(dot(grainUv,vec2(12.9898,78.233)))*43758.5453);
  col+=(grain-0.5)*uGrainAmount;

  col=(col-0.5)*uContrast+0.5;
  float luma=dot(col,vec3(0.2126,0.7152,0.0722));
  col=mix(vec3(luma),col,uSaturation);
  col=pow(max(col,0.0),vec3(1.0/max(uGamma,0.001)));
  col=clamp(col,0.0,1.0);
  if(uLightMode>0.5){
    float energy=max(max(col.r,col.g),col.b);
    vec3 hue=col/max(energy,0.001);
    float chroma=length(col-vec3(dot(col,vec3(0.333333))));
    float coverage=clamp(0.12+chroma*1.15+energy*0.18,0.0,0.88);
    col=mix(vec3(1.0),clamp(hue*0.58+col*0.18,0.0,1.0),coverage);
  }

  o=vec4(col,1.0);
}
void main(){
  vec4 o=vec4(0.0);
  mainImage(o,gl_FragCoord.xy);
  fragColor=o;
}
`

function compile(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Grainient: shader failed to compile', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

export default function GrainientShader({
  timeSpeed = 0.25,
  colorBalance = 0.0,
  warpStrength = 1.0,
  warpFrequency = 5.0,
  warpSpeed = 2.0,
  warpAmplitude = 50.0,
  blendAngle = 0.0,
  blendSoftness = 0.05,
  rotationAmount = 500.0,
  noiseScale = 2.0,
  grainAmount = 0.1,
  grainScale = 2.0,
  grainAnimated = false,
  contrast = 1.5,
  gamma = 1.0,
  saturation = 1.0,
  centerX = 0.0,
  centerY = 0.0,
  zoom = 0.9,
  color1 = '#FF9FFC',
  color2 = '#5227FF',
  color3 = '#B497CF',
  lightMode = false,
  className,
}: GrainientProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  /**
   * The latest props, read by the draw loop on every frame. A ref rather than
   * an effect dependency, so changing a colour updates a uniform instead of
   * tearing down and rebuilding the WebGL context.
   */
  const settings = {
    uTimeSpeed: timeSpeed,
    uColorBalance: colorBalance,
    uWarpStrength: warpStrength,
    uWarpFrequency: warpFrequency,
    uWarpSpeed: warpSpeed,
    uWarpAmplitude: warpAmplitude,
    uBlendAngle: blendAngle,
    uBlendSoftness: blendSoftness,
    uRotationAmount: rotationAmount,
    uNoiseScale: noiseScale,
    uGrainAmount: grainAmount,
    uGrainScale: grainScale,
    uGrainAnimated: grainAnimated ? 1 : 0,
    uContrast: contrast,
    uGamma: gamma,
    uSaturation: saturation,
    uZoom: zoom,
    uLightMode: lightMode ? 1 : 0,
  }
  const settingsRef = useRef(settings)
  settingsRef.current = settings
  const vectorsRef = useRef({ center: [centerX, centerY], color1, color2, color3 })
  vectorsRef.current = { center: [centerX, centerY], color1, color2, color3 }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const canvas = document.createElement('canvas')
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.display = 'block'

    const gl = canvas.getContext('webgl2', { alpha: true, antialias: false })
    // No WebGL2: draw nothing, and let the caller's base colour show.
    if (!gl) return
    container.appendChild(canvas)

    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX)
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT)
    const program = gl.createProgram()
    if (!vertex || !fragment || !program) {
      container.removeChild(canvas)
      return
    }
    gl.attachShader(program, vertex)
    gl.attachShader(program, fragment)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Grainient: program failed to link', gl.getProgramInfoLog(program))
      container.removeChild(canvas)
      return
    }
    gl.useProgram(program)

    // One triangle larger than the screen, so every pixel is covered by a
    // single primitive with no diagonal seam.
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const position = gl.getAttribLocation(program, 'position')
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

    const locations = new Map<string, WebGLUniformLocation | null>()
    const at = (name: string) => {
      if (!locations.has(name)) locations.set(name, gl.getUniformLocation(program, name))
      return locations.get(name) ?? null
    }

    const draw = (seconds: number) => {
      gl.uniform2f(at('iResolution'), gl.drawingBufferWidth, gl.drawingBufferHeight)
      gl.uniform1f(at('iTime'), seconds)
      for (const [name, value] of Object.entries(settingsRef.current)) {
        gl.uniform1f(at(name), value)
      }
      const { center, color1, color2, color3 } = vectorsRef.current
      gl.uniform2f(at('uCenterOffset'), center[0]!, center[1]!)
      gl.uniform3f(at('uColor1'), ...hexToRgb(color1))
      gl.uniform3f(at('uColor2'), ...hexToRgb(color2))
      gl.uniform3f(at('uColor3'), ...hexToRgb(color3))
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const t0 = performance.now()
    let raf = 0

    const setSize = () => {
      const rect = container.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      canvas.width = Math.max(1, Math.floor(rect.width * dpr))
      canvas.height = Math.max(1, Math.floor(rect.height * dpr))
      gl.viewport(0, 0, canvas.width, canvas.height)
      draw((performance.now() - t0) * 0.001)
    }

    const resize = new ResizeObserver(setSize)
    resize.observe(container)
    setSize()

    const loop = (t: number) => {
      draw((t - t0) * 0.001)
      raf = requestAnimationFrame(loop)
    }

    let onScreen = true
    let pageVisible = !document.hidden
    const start = () => {
      if (!still && onScreen && pageVisible && raf === 0) raf = requestAnimationFrame(loop)
    }
    const stop = () => {
      if (raf !== 0) {
        cancelAnimationFrame(raf)
        raf = 0
      }
    }

    const intersection = new IntersectionObserver(([entry]) => {
      onScreen = entry?.isIntersecting ?? false
      if (onScreen) start()
      else stop()
    })
    intersection.observe(container)

    const onVisibility = () => {
      pageVisible = !document.hidden
      if (pageVisible) start()
      else stop()
    }
    document.addEventListener('visibilitychange', onVisibility)

    start()

    return () => {
      stop()
      resize.disconnect()
      intersection.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
      gl.deleteShader(vertex)
      gl.deleteShader(fragment)
      canvas.remove()
    }
  }, [])

  return <div ref={containerRef} className={className} />
}
