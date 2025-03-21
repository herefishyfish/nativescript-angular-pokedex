import {
  Canvas,
  ImageAsset,
  GPUCanvasContext,
  GPUDevice,
  GPUTexture,
  GPUBindGroup,
  GPUBufferUsage,
  GPURenderBundleEncoder,
  GPURenderPassEncoder,
  GPUTextureUsage,
} from '@nativescript/canvas';
import { Screen } from '@nativescript/core';
import { mat4, vec3 } from 'wgpu-matrix';
import { createSphereMesh, SphereLayout } from './meshes/sphere';
import { signal } from '@angular/core';

/**
 * Control Settings
 */
export const exampleSettings = {
  open: signal(false),
  changing: signal(false),
  rotationSpeed: signal(0.05),
  rotationOffset: signal(0),
  rotationNowOffset: signal(0),
  zoom: signal(-4),
  tilt: signal(0.1),
  asteroidCount: signal(4000),
};

function currentRotationOffset() {
  const now = (Date.now() - exampleSettings.rotationNowOffset()) / 1000;
  return (
    exampleSettings.rotationOffset() + now * exampleSettings.rotationSpeed()
  );
}
export function changeSpeed(newSpeed: number) {
  const currentOffset = currentRotationOffset();
  const now = Date.now();
  exampleSettings.rotationNowOffset.set(now);
  exampleSettings.rotationOffset.set(currentOffset);
  exampleSettings.rotationSpeed.set(newSpeed);
}

export const meshWGSL = /*wgsl*/ `struct Uniforms {
    viewProjectionMatrix : mat4x4f
  }
  @group(0) @binding(0) var<uniform> uniforms : Uniforms;
  
  @group(1) @binding(0) var<uniform> modelMatrix : mat4x4f;
  
  struct VertexInput {
    @location(0) position : vec4f,
    @location(1) normal : vec3f,
    @location(2) uv : vec2f
  }
  
  struct VertexOutput {
    @builtin(position) position : vec4f,
    @location(0) normal: vec3f,
    @location(1) uv : vec2f,
  }
  
  @vertex
  fn vertexMain(input: VertexInput) -> VertexOutput {
    var output : VertexOutput;
    output.position = uniforms.viewProjectionMatrix * modelMatrix * input.position;
    output.normal = normalize((modelMatrix * vec4(input.normal, 0)).xyz);
    output.uv = input.uv;
    return output;
  }
  
  @group(1) @binding(1) var meshSampler: sampler;
  @group(1) @binding(2) var meshTexture: texture_2d<f32>;
  
  // Static directional lighting
  const lightDir = vec3f(1, 1, 1);
  const dirColor = vec3f(1);
  const ambientColor = vec3f(0.05);
  
  @fragment
  fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
    let textureColor = textureSample(meshTexture, meshSampler, input.uv);
  
    // Very simplified lighting algorithm.
    let lightColor = saturate(ambientColor + max(dot(input.normal, lightDir), 0.0) * dirColor);
  
    return vec4f(textureColor.rgb * lightColor, textureColor.a);
  }
  `;

export async function run(canvas: Canvas) {
  const adapter = await (navigator as any).gpu?.requestAdapter();
  const device: GPUDevice = (await adapter?.requestDevice()) as never;

  const devicePixelRatio = Screen.mainScreen.scale;
  canvas.width = canvas.clientWidth * devicePixelRatio;
  canvas.height = canvas.clientHeight * devicePixelRatio;

  const context = canvas.getContext('webgpu') as never as GPUCanvasContext;
  const presentationFormat = (navigator as any).gpu.getPreferredCanvasFormat();

  context.configure({
    device,
    format: presentationFormat,
  });

  const shaderModule = device.createShaderModule({
    code: meshWGSL,
  });

  const pipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: {
      module: shaderModule,
      buffers: [
        {
          arrayStride: SphereLayout.vertexStride,
          attributes: [
            {
              // position
              shaderLocation: 0,
              offset: SphereLayout.positionsOffset,
              format: 'float32x3',
            },
            {
              // normal
              shaderLocation: 1,
              offset: SphereLayout.normalOffset,
              format: 'float32x3',
            },
            {
              // uv
              shaderLocation: 2,
              offset: SphereLayout.uvOffset,
              format: 'float32x2',
            },
          ],
        },
      ],
    },
    fragment: {
      module: shaderModule,
      targets: [
        {
          format: presentationFormat,
        },
      ],
    },
    primitive: {
      topology: 'triangle-list',

      // Backface culling since the sphere is solid piece of geometry.
      // Faces pointing away from the camera will be occluded by faces
      // pointing toward the camera.
      cullMode: 'back',
    },

    // Enable depth testing so that the fragment closest to the camera
    // is rendered in front.
    depthStencil: {
      depthWriteEnabled: true,
      depthCompare: 'less',
      format: 'depth24plus',
    },
  });

  const depthTexture = device.createTexture({
    size: [canvas.width, canvas.height],
    format: 'depth24plus',
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  });

  const uniformBufferSize = 4 * 16; // 4x4 matrix
  const uniformBuffer = device.createBuffer({
    size: uniformBufferSize,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  // Fetch the images and upload them into a GPUTexture.
  let planetTexture: GPUTexture;
  {
    const imageBitmap = new ImageAsset();

    await imageBitmap.fromFile('~/assets/ball.png');

    planetTexture = device.createTexture({
      size: [imageBitmap.width, imageBitmap.height, 1],
      format: 'rgba8unorm',
      usage:
        GPUTextureUsage.TEXTURE_BINDING |
        GPUTextureUsage.COPY_DST |
        GPUTextureUsage.RENDER_ATTACHMENT,
    }) as never;

    device.queue.copyExternalImageToTexture(
      { source: imageBitmap },
      {
        texture: planetTexture,
      },
      { width: imageBitmap.width, height: imageBitmap.height }
    );
  }

  let moonTexture: GPUTexture;
  {
    const imageBitmap = new ImageAsset();
    await imageBitmap.fromFile('~/assets/moon.png');

    moonTexture = device.createTexture({
      size: [imageBitmap.width, imageBitmap.height, 1],
      format: 'rgba8unorm',
      usage:
        GPUTextureUsage.TEXTURE_BINDING |
        GPUTextureUsage.COPY_DST |
        GPUTextureUsage.RENDER_ATTACHMENT,
    });
    device.queue.copyExternalImageToTexture(
      { source: imageBitmap },
      {
        texture: moonTexture,
      },
      { width: imageBitmap.width, height: imageBitmap.height }
    );
  }

  const sampler = device.createSampler({
    magFilter: 'linear',
    minFilter: 'linear',
  });

  // Helper functions to create the required meshes and bind groups for each sphere.
  function createSphereRenderable(
    radius: number,
    widthSegments = 32,
    heightSegments = 16,
    randomness = 0
  ) {
    const sphereMesh = createSphereMesh(
      radius,
      widthSegments,
      heightSegments,
      randomness
    );

    // Create a vertex buffer from the sphere data.
    const vertices = device.createBuffer({
      size: sphereMesh.vertices.byteLength,
      usage: GPUBufferUsage.VERTEX,
      mappedAtCreation: true,
    });
    new Float32Array(vertices.getMappedRange()).set(sphereMesh.vertices);
    vertices.unmap();

    const indices = device.createBuffer({
      size: sphereMesh.indices.byteLength,
      usage: GPUBufferUsage.INDEX,
      mappedAtCreation: true,
    });
    new Uint16Array(indices.getMappedRange()).set(sphereMesh.indices);
    indices.unmap();

    return {
      vertices,
      indices,
      indexCount: sphereMesh.indices.length,
      bindGroup: null as null | GPUBindGroup,
    };
  }

  function createSphereBindGroup(texture: GPUTexture, transform: Float32Array) {
    const uniformBufferSize = 4 * 16; // 4x4 matrix
    const uniformBuffer = device.createBuffer({
      size: uniformBufferSize,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true,
    });
    new Float32Array(uniformBuffer.getMappedRange()).set(transform);
    uniformBuffer.unmap();

    const bindGroup = device.createBindGroup({
      layout: pipeline.getBindGroupLayout(1),
      entries: [
        {
          binding: 0,
          resource: {
            buffer: uniformBuffer,
          },
        },
        {
          binding: 1,
          resource: sampler,
        },
        {
          binding: 2,
          resource: texture.createView(),
        },
      ],
    });

    return bindGroup;
  }

  const transform = mat4.create();
  mat4.identity(transform);

  // Create one large central planet surrounded by a large ring of asteroids
  const planet = createSphereRenderable(1.0);
  planet.bindGroup = createSphereBindGroup(planetTexture, transform);

  const asteroids = [
    createSphereRenderable(0.01, 8, 6, 0.15),
    createSphereRenderable(0.013, 8, 6, 0.15),
    createSphereRenderable(0.017, 8, 6, 0.15),
    createSphereRenderable(0.02, 8, 6, 0.15),
    createSphereRenderable(0.03, 16, 8, 0.15),
  ];

  let renderables = [planet];

  function ensureEnoughAsteroids() {
    for (
      let i = renderables.length;
      i <= exampleSettings.asteroidCount();
      ++i
    ) {
      // Place copies of the asteroid in a ring.
      const radius = Math.random() * 1.7 + 1.25;
      const angle = Math.random() * Math.PI * 2;
      const x = Math.sin(angle) * radius;
      const y = (Math.random() - 0.5) * 0.015;
      const z = Math.cos(angle) * radius;

      mat4.identity(transform);
      mat4.translate(transform, [x, y, z], transform);
      mat4.rotateX(transform, Math.random() * Math.PI, transform);
      mat4.rotateY(transform, Math.random() * Math.PI, transform);
      renderables.push({
        ...asteroids[i % asteroids.length],
        bindGroup: createSphereBindGroup(moonTexture, transform),
      });
    }
  }
  ensureEnoughAsteroids();

  // @ts-ignore
  const renderPassDescriptor: GPURenderPassDescriptor = {
    colorAttachments: [
      {
        view: undefined, // Assigned later

        clearValue: [0, 0, 0, 1],
        loadOp: 'clear',
        storeOp: 'store',
      },
    ],
    depthStencilAttachment: {
      view: depthTexture.createView(),

      depthClearValue: 1.0,
      depthLoadOp: 'clear',
      depthStoreOp: 'store',
    },
  };

  const aspect = canvas.width / canvas.height;
  const projectionMatrix = mat4.perspective(
    (2 * Math.PI) / 5,
    aspect,
    1,
    100.0
  );
  const modelViewProjectionMatrix = mat4.create();

  const frameBindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      {
        binding: 0,
        resource: {
          buffer: uniformBuffer,
        },
      },
    ],
  });

  function getTransformationMatrix() {
    const viewMatrix = mat4.identity();
    mat4.translate(
      viewMatrix,
      vec3.fromValues(0, 0, exampleSettings.zoom()),
      viewMatrix
    );
    // Tilt the view matrix so the planet looks like it's off-axis.
    mat4.rotateZ(viewMatrix, Math.PI * exampleSettings.tilt(), viewMatrix);
    mat4.rotateX(viewMatrix, Math.PI * 0.1, viewMatrix);
    // Rotate the view matrix slowly so the planet appears to spin.
    mat4.rotateY(viewMatrix, currentRotationOffset(), viewMatrix);

    mat4.multiply(projectionMatrix, viewMatrix, modelViewProjectionMatrix);

    return modelViewProjectionMatrix;
  }

  // Render bundles function as partial, limited render passes, so we can use the
  // same code both to render the scene normally and to build the render bundle.
  function renderScene(
    passEncoder: GPURenderPassEncoder | GPURenderBundleEncoder
  ) {
    passEncoder.setPipeline(pipeline);
    passEncoder.setBindGroup(0, frameBindGroup);

    // Loop through every renderable object and draw them individually.
    // (Because many of these meshes are repeated, with only the transforms
    // differing, instancing would be highly effective here. This sample
    // intentionally avoids using instancing in order to emulate a more complex
    // scene, which helps demonstrate the potential time savings a render bundle
    // can provide.)
    let count = 0;
    for (const renderable of renderables) {
      passEncoder.setBindGroup(1, renderable.bindGroup!);
      passEncoder.setVertexBuffer(0, renderable.vertices);
      passEncoder.setIndexBuffer(renderable.indices, 'uint16');
      passEncoder.drawIndexed(renderable.indexCount);

      if (++count > exampleSettings.asteroidCount()) {
        break;
      }
    }
  }

  // The render bundle can be encoded once and re-used as many times as needed.
  // Because it encodes all of the commands needed to render at the GPU level,
  // those commands will not need to execute the associated JavaScript code upon
  // execution or be re-validated, which can represent a significant time savings.
  //
  // However, because render bundles are immutable once created, they are only
  // appropriate for rendering content where the same commands will be executed
  // every time, with the only changes being the contents of the buffers and
  // textures used. Cases where the executed commands differ from frame-to-frame,
  // such as when using frustrum or occlusion culling, will not benefit from
  // using render bundles as much.
  const renderBundleEncoder = device.createRenderBundleEncoder({
    colorFormats: [presentationFormat],
    depthStencilFormat: 'depth24plus',
  });

  renderScene(renderBundleEncoder as any);
  const renderBundle = renderBundleEncoder.finish();

  function frame() {
    if (!exampleSettings.changing() || true) {
      if (currentAsteroidCount !== exampleSettings.asteroidCount()) {
        currentAsteroidCount = exampleSettings.asteroidCount();
        renderables = [planet];
        ensureEnoughAsteroids();
        renderScene(renderBundleEncoder as any);
      }
      const transformationMatrix = getTransformationMatrix();
      device.queue.writeBuffer(
        uniformBuffer,
        0,
        // @ts-ignore
        transformationMatrix.buffer,
        transformationMatrix.byteOffset,
        transformationMatrix.byteLength
      );
      const texture = context.getCurrentTexture();

      renderPassDescriptor.colorAttachments[0].view = texture.createView();

      const commandEncoder = device.createCommandEncoder();
      const passEncoder = commandEncoder.beginRenderPass(
        renderPassDescriptor as never
      );
      passEncoder.executeBundles([renderBundle as never]);
      passEncoder.end();
      device.queue.submit([commandEncoder.finish()]);

      context.presentSurface();
    }

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

let currentAsteroidCount = exampleSettings.asteroidCount();
