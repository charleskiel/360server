interface GroupFields {
  visible?: boolean;
  opacity?: number;
  translation?: { x: number; y: number };
  rotation?: number;
  scale?: { x: number; y: number };
  scaleRotateCenter?: { x: number; y: number };
  childRenderOrder?: "renderFirst" | "renderLast";
  inheritParentTransform?: boolean;
  inheritParentOpacity?: boolean;
  clippingRect?: { x: number; y: number; width: number; height: number };
  renderPass?: number;
  muteAudioGuide?: boolean;
  enableRenderTracking?: boolean;
  renderTracking?: "disabled" | "none" | "partial" | "full";
}

class Group extends Node {
  constructor(fields?: GroupFields) {
    super();

    if (fields) {
      const {
        visible,
        opacity,
        translation,
        rotation,
        scale,
        scaleRotateCenter,
        childRenderOrder,
        inheritParentTransform,
        inheritParentOpacity,
        clippingRect,
        renderPass,
        muteAudioGuide,
        enableRenderTracking,
        renderTracking,
      } = fields;

      if (visible !== undefined) { this.visible = visible; }
      if (opacity !== undefined) { this.opacity = opacity; }
      if (translation !== undefined) { this.translation = translation; }
      if (rotation !== undefined) { this.rotation = rotation; }
      if (scale !== undefined) { this.scale = scale; }
      if (scaleRotateCenter !== undefined) { this.scaleRotateCenter = scaleRotateCenter; }
      if (childRenderOrder !== undefined) { this.childRenderOrder = childRenderOrder; }
      if (inheritParentTransform !== undefined) { this.inheritParentTransform = inheritParentTransform; }
      if (inheritParentOpacity !== undefined) { this.inheritParentOpacity = inheritParentOpacity; }
      if (clippingRect !== undefined) { this.clippingRect = clippingRect; }
      if (renderPass !== undefined) { this.renderPass = renderPass; }
      if (muteAudioGuide !== undefined) { this.muteAudioGuide = muteAudioGuide; }
      if (enableRenderTracking !== undefined) { this.enableRenderTracking = enableRenderTracking; }
      if (renderTracking !== undefined) { this.renderTracking = renderTracking; }
    }
  }

  visible: boolean = true;
  opacity: number = 1.0;
  translation: { x: number; y: number } = { x: 0.0, y: 0.0 };
  rotation: number = 0.0;
  scale: { x: number; y: number } = { x: 1.0, y: 1.0 };
  scaleRotateCenter: { x: number; y: number } = { x: 0.0, y: 0.0 };
  childRenderOrder: "renderFirst" | "renderLast" = "renderLast";
  inheritParentTransform: boolean = true;
  inheritParentOpacity: boolean = true;
  clippingRect: { x: number; y: number; width: number; height: number } = {
    x: 0.0,
    y: 0.0,
    width: 0.0,
    height: 0.0,
  };
  renderPass: number = 0;
  muteAudioGuide: boolean = false;
  enableRenderTracking: boolean = false;
  renderTracking:
