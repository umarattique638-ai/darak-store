"""Procedural furniture + studio for Darak renders (Blender bpy, Cycles CPU)."""
import bpy, math, bmesh
from mathutils import Vector

def hexc(h, a=1.0):
    h = h.lstrip("#"); r, g, b = (int(h[i:i+2], 16) / 255 for i in (0, 2, 4))
    lin = lambda c: c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    return (lin(r), lin(g), lin(b), a)

def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    _mats.clear()
    s = bpy.context.scene
    s.render.engine = "CYCLES"
    s.cycles.device = "CPU"
    s.cycles.samples = 40
    s.cycles.use_denoising = True
    s.cycles.denoiser = "OPENIMAGEDENOISE"
    s.cycles.max_bounces = 6
    s.cycles.diffuse_bounces = 3
    s.cycles.glossy_bounces = 2
    s.cycles.transmission_bounces = 2
    s.cycles.caustics_reflective = False
    s.cycles.caustics_refractive = False
    s.render.film_transparent = False
    try: s.view_settings.view_transform = "AgX"
    except Exception: s.view_settings.view_transform = "Filmic"
    try: s.view_settings.look = "AgX - Medium High Contrast"
    except Exception: pass
    s.view_settings.exposure = -0.5
    s.render.image_settings.file_format = "JPEG"
    s.render.image_settings.quality = 90
    w = bpy.data.worlds.new("W"); s.world = w; w.use_nodes = True
    bg = w.node_tree.nodes["Background"]; bg.inputs[0].default_value = hexc("#f3ebe0"); bg.inputs[1].default_value = 0.22
    return s

# ───────── materials ─────────
_mats = {}
def mat(name, color, rough=0.6, sheen=0.0, metal=0.0, bump=0.0, bump_scale=60.0, kind=None, coat=0.0):
    key = (name, color, rough, sheen, metal, bump, kind)
    if key in _mats: return _mats[key]
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree; N = nt.nodes; L = nt.links
    p = N["Principled BSDF"]
    p.inputs["Base Color"].default_value = hexc(color) if isinstance(color, str) else color
    p.inputs["Roughness"].default_value = rough
    p.inputs["Metallic"].default_value = metal
    if sheen:
        p.inputs["Sheen Weight"].default_value = sheen
        p.inputs["Sheen Roughness"].default_value = 0.45
        if isinstance(color, str):
            c = hexc(color); p.inputs["Sheen Tint"].default_value = (min(1, c[0] * 1.6 + 0.05), min(1, c[1] * 1.6 + 0.05), min(1, c[2] * 1.6 + 0.05), 1)
    if coat: p.inputs["Coat Weight"].default_value = coat
    tc = N.new("ShaderNodeTexCoord")
    if kind == "wood":
        wv = N.new("ShaderNodeTexWave"); wv.inputs["Scale"].default_value = 3.0; wv.inputs["Distortion"].default_value = 6; wv.inputs["Detail"].default_value = 3
        wv.wave_type = "RINGS"
        mp = N.new("ShaderNodeMapping"); mp.inputs["Scale"].default_value = (1, 1, 14)
        L.new(tc.outputs["Object"], mp.inputs[0]); L.new(mp.outputs[0], wv.inputs[0])
        ramp = N.new("ShaderNodeValToRGB")
        base = hexc(color); dark = tuple(c * 0.62 for c in base[:3]) + (1,)
        ramp.color_ramp.elements[0].color = dark; ramp.color_ramp.elements[1].color = base
        L.new(wv.outputs["Fac"], ramp.inputs[0]); L.new(ramp.outputs[0], p.inputs["Base Color"])
    elif kind == "tile":
        br = N.new("ShaderNodeTexBrick"); br.inputs["Scale"].default_value = 0.6; br.inputs["Mortar Size"].default_value = 0.004
        br.offset = 0.0; br.inputs["Row Height"].default_value = 0.5; br.inputs["Brick Width"].default_value = 0.5
        base = hexc(color); br.inputs["Color1"].default_value = base; br.inputs["Color2"].default_value = tuple(c * 0.95 for c in base[:3]) + (1,)
        br.inputs["Mortar"].default_value = tuple(c * 0.75 for c in base[:3]) + (1,)
        L.new(tc.outputs["Object"], br.inputs[0])
        nz = N.new("ShaderNodeTexNoise"); nz.inputs["Scale"].default_value = 3; nz.inputs["Detail"].default_value = 8
        L.new(tc.outputs["Object"], nz.inputs[0])
        mix = N.new("ShaderNodeMix"); mix.data_type = "RGBA"; mix.inputs["Factor"].default_value = 0.08
        L.new(br.outputs["Color"], mix.inputs[6]); L.new(nz.outputs["Color"], mix.inputs[7]); L.new(mix.outputs[2], p.inputs["Base Color"])
    elif kind == "marble":
        nz = N.new("ShaderNodeTexNoise"); nz.inputs["Scale"].default_value = 2.2; nz.inputs["Detail"].default_value = 12; nz.inputs["Distortion"].default_value = 3.5
        wv = N.new("ShaderNodeTexWave"); wv.inputs["Scale"].default_value = 1.2; wv.inputs["Distortion"].default_value = 6; wv.inputs["Detail"].default_value = 6
        L.new(tc.outputs["Object"], wv.inputs[0])
        ramp = N.new("ShaderNodeValToRGB"); ramp.color_ramp.elements[0].position = 0.0; ramp.color_ramp.elements[0].color = hexc("#b9b4ad")
        ramp.color_ramp.elements[1].position = 0.06; ramp.color_ramp.elements[1].color = hexc(color)
        L.new(wv.outputs["Fac"], ramp.inputs[0]); L.new(ramp.outputs[0], p.inputs["Base Color"])
    elif kind == "rattan":
        ch = N.new("ShaderNodeTexBrick"); ch.inputs["Scale"].default_value = 40; ch.inputs["Mortar Size"].default_value = 0.03
        ch.inputs["Color1"].default_value = hexc(color); ch.inputs["Color2"].default_value = tuple(c * 0.7 for c in hexc(color)[:3]) + (1,)
        ch.inputs["Mortar"].default_value = tuple(c * 0.35 for c in hexc(color)[:3]) + (1,)
        L.new(tc.outputs["Object"], ch.inputs[0]); L.new(ch.outputs["Color"], p.inputs["Base Color"])
        bp = N.new("ShaderNodeBump"); bp.inputs["Strength"].default_value = 0.6
        L.new(ch.outputs["Fac"], bp.inputs["Height"]); L.new(bp.outputs[0], p.inputs["Normal"])
    if bump:
        nz = N.new("ShaderNodeTexNoise"); nz.inputs["Scale"].default_value = bump_scale; nz.inputs["Detail"].default_value = 6
        L.new(tc.outputs["Object"], nz.inputs[0])
        bp = N.new("ShaderNodeBump"); bp.inputs["Strength"].default_value = bump; bp.inputs["Distance"].default_value = 0.02
        L.new(nz.outputs["Fac"], bp.inputs["Height"]); L.new(bp.outputs[0], p.inputs["Normal"])
    _mats[key] = m
    return m

def fabric(c, velvet=False, boucle=False):
    if velvet: return mat("velvet", c, rough=0.8, sheen=0.6, bump=0.06, bump_scale=200)
    if boucle: return mat("boucle", c, rough=0.95, sheen=0.4, bump=0.45, bump_scale=140)
    return mat("fabric", c, rough=0.9, sheen=0.15, bump=0.18, bump_scale=260)
def leather(c): return mat("leather", c, rough=0.42, bump=0.06, bump_scale=90, coat=0.15)
def wood(c="#a8774a"): return mat("wood", c, rough=0.45, kind="wood", coat=0.2)
def brass(): return mat("brass", "#c9a45c", rough=0.25, metal=1.0)
def blackmetal(): return mat("blackmetal", "#1b1b1b", rough=0.35, metal=0.9)
def marble(c="#ece8e2"): return mat("marble", c, rough=0.18, kind="marble", coat=0.4)
def rattan(c="#c9a165"): return mat("rattan", c, rough=0.7, kind="rattan")
def plastic(c): return mat("plastic", c, rough=0.4)

# ───────── primitives ─────────
def box(name, size, loc, material, bevel=0.02, segs=4, subsurf=0, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    o = bpy.context.object; o.name = name; o.scale = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        b = o.modifiers.new("bev", "BEVEL"); b.width = min(bevel, min(size) * 0.49); b.segments = segs; b.limit_method = "NONE"
    if subsurf:
        s = o.modifiers.new("sub", "SUBSURF"); s.levels = subsurf; s.render_levels = subsurf
    o.data.materials.append(material)
    bpy.ops.object.shade_smooth()
    return o

def cushion(name, size, loc, material, puff=0.6, rot=(0, 0, 0)):
    """Soft cushion: bevelled box + subdivision + slight inflation via cast."""
    o = box(name, size, loc, material, bevel=min(size) * 0.42, segs=3, subsurf=2, rot=rot)
    c = o.modifiers.new("cast", "CAST"); c.factor = 0.08 * puff; c.cast_type = "SPHERE"
    return o

def cyl(name, r, h, loc, material, rot=(0, 0, 0), verts=40, bevel=0.0, r2=None):
    if r2 is None:
        bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=h, location=loc, rotation=rot, vertices=verts)
    else:
        bpy.ops.mesh.primitive_cone_add(radius1=r, radius2=r2, depth=h, location=loc, rotation=rot, vertices=verts)
    o = bpy.context.object; o.name = name
    if bevel:
        b = o.modifiers.new("bev", "BEVEL"); b.width = bevel; b.segments = 3; b.limit_method = "ANGLE"
    o.data.materials.append(material); bpy.ops.object.shade_smooth()
    try: o.data.shade_auto_smooth = True
    except Exception: pass
    return o

def leg(x, y, h, material, r=0.022, taper=0.6, angle=0.0, z0=0.0):
    rot = (math.radians(angle) * (1 if y > 0 else -1) * 0, 0, 0)
    return cyl("leg", r, h, (x, y, z0 + h / 2), material, verts=24, r2=r * taper) if taper != 1 else cyl("leg", r, h, (x, y, z0 + h / 2), material, verts=24)

def button_tufts(parent_x0, parent_x1, z0, z1, y, material, cols=6, rows=3):
    for i in range(cols):
        for j in range(rows):
            x = parent_x0 + (parent_x1 - parent_x0) * (i + 0.5 + (0.5 if j % 2 else 0) * 0) / cols
            z = z0 + (z1 - z0) * (j + 0.5) / rows
            bpy.ops.mesh.primitive_uv_sphere_add(radius=0.011, location=(x + ((parent_x1 - parent_x0) / cols / 2 if j % 2 else 0) * 0, y, z), segments=12, ring_count=8)
            o = bpy.context.object; o.data.materials.append(material); o.scale = (1, 0.5, 1)

# ───────── furniture (units: metres, origin at floor centre, front faces −Y) ─────────
def sofa(W, D, H, cover, seats=3, leg_mat=None, arm="square", leg_h=0.14, back_cushions=True, tufted=False, low=False, pillow=None):
    leg_mat = leg_mat or wood("#6b4a2f")
    arm_w = 0.16 if arm == "square" else 0.13
    base_h = 0.2 if not low else 0.16
    z_base = leg_h
    seat_h = 0.17
    box("base", (W - 0.06, D - 0.04, base_h), (0, 0, z_base + base_h / 2), cover, bevel=0.03)
    back_t = 0.18
    back_h = H - z_base - base_h
    box("backframe", (W - 0.02, back_t, back_h), (0, D / 2 - back_t / 2, z_base + base_h + back_h / 2), cover, bevel=0.06 if arm != "round" else 0.09)
    arm_h = (H * 0.72 if arm != "low" else H * 0.6) - z_base
    for s in (-1, 1):
        if arm == "round":
            o = box("arm", (arm_w, D, arm_h), (s * (W / 2 - arm_w / 2), 0, z_base + arm_h / 2), cover, bevel=arm_w * 0.48, segs=6)
        else:
            box("arm", (arm_w, D, arm_h), (s * (W / 2 - arm_w / 2), 0, z_base + arm_h / 2), cover, bevel=0.035)
    inner = W - 2 * arm_w
    sw = inner / seats
    seat_d = D - back_t - 0.02
    for i in range(seats):
        x = -inner / 2 + sw * (i + 0.5)
        cushion("seat", (sw - 0.012, seat_d, seat_h), (x, -back_t / 2 + 0.0, z_base + base_h + seat_h / 2 - 0.01), cover)
        if back_cushions:
            bh = back_h - seat_h + 0.06
            cushion("backc", (sw - 0.02, 0.17, bh), (x, D / 2 - back_t - 0.07, z_base + base_h + seat_h + bh / 2 - 0.03), cover, rot=(math.radians(-8), 0, 0))
    if tufted:
        button_tufts(-inner / 2 + 0.05, inner / 2 - 0.05, z_base + base_h + seat_h + 0.08, H - 0.06, D / 2 - back_t - 0.16, cover, cols=seats * 3, rows=2)
    for sx in (-1, 1):
        for sy in (-1, 1):
            cyl("leg", 0.024, leg_h, (sx * (W / 2 - 0.08), sy * (D / 2 - 0.08), leg_h / 2), leg_mat, verts=24, r2=0.016)
    if pillow:
        for s in (-1, 1):
            cushion("pillow", (0.42, 0.13, 0.4), (s * (inner / 2 - 0.26), D / 2 - back_t - 0.22, z_base + base_h + seat_h + 0.2), pillow, puff=1.2, rot=(math.radians(-14), 0, math.radians(s * 8)))

def sectional(W, D2, D, H, cover, leg_mat=None):
    """L-shape: main sofa along X plus chaise extending toward −Y on the right side."""
    sofa(W, D, H, cover, seats=3, leg_mat=leg_mat, arm="square")
    ch_w = 0.95
    # chaise
    x = W / 2 - ch_w / 2
    ext = D2 - D
    box("chbase", (ch_w, ext + 0.02, 0.2), (x, -D / 2 - ext / 2 + 0.01, 0.14 + 0.1), cover, bevel=0.03)
    cushion("chseat", (ch_w - 0.18, ext + 0.15, 0.17), (x - 0.0, -D / 2 - ext / 2 + 0.06, 0.14 + 0.2 + 0.075), cover)
    box("charm", (0.16, ext, 0.44), (W / 2 - 0.08, -D / 2 - ext / 2, 0.14 + 0.22), cover, bevel=0.035)
    for sx in (W / 2 - 0.08, W / 2 - ch_w + 0.08):
        cyl("leg", 0.024, 0.14, (sx, -D2 + D / 2 + 0.08, 0.07), leg_mat or blackmetal(), verts=24)

def armchair(style, color, W, D, H, cover_kind="fabric"):
    cover = {"velvet": fabric(color, velvet=True), "boucle": fabric(color, boucle=True), "leather": leather(color)}.get(cover_kind, fabric(color))
    if style == "sculpted":   # mustard boucle, round, brass base
        box("seat", (W * 0.9, D * 0.85, 0.2), (0, -0.02, 0.36), cover, bevel=0.09, segs=6, subsurf=1)
        o = box("shell", (W, 0.2, H - 0.3), (0, D / 2 - 0.1, 0.3 + (H - 0.3) / 2), cover, bevel=0.09, segs=6, subsurf=1)
        c = o.modifiers.new("bend", "SIMPLE_DEFORM"); c.deform_method = "BEND"; c.deform_axis = "Z"; c.angle = math.radians(-70)
        for s in (-1, 1):
            box("arm", (0.14, D * 0.8, 0.32), (s * (W / 2 - 0.07), -0.0, 0.48), cover, bevel=0.065, segs=6, subsurf=1)
        cyl("base", W * 0.34, 0.03, (0, 0, 0.13), brass(), verts=48, bevel=0.01)
        cyl("stem", 0.03, 0.12, (0, 0, 0.21), brass(), verts=24)
        cyl("plate", W * 0.3, 0.18, (0, 0, 0.09), brass(), verts=48, r2=W * 0.18)
    elif style == "tufted":
        box("seatb", (W, D, 0.14), (0, 0, 0.36), cover, bevel=0.03)
        cushion("seat", (W - 0.06, D - 0.12, 0.12), (0, -0.04, 0.48), cover)
        box("back", (W, 0.14, H - 0.43), (0, D / 2 - 0.07, 0.43 + (H - 0.43) / 2), cover, bevel=0.06, segs=5)
        button_tufts(-W / 2 + 0.08, W / 2 - 0.08, 0.6, H - 0.07, D / 2 - 0.145, cover, cols=4, rows=3)
        for s in (-1, 1):
            box("arm", (0.1, D - 0.1, 0.26), (s * (W / 2 - 0.05), -0.02, 0.56), cover, bevel=0.045)
        for sx in (-1, 1):
            for sy in (-1, 1):
                cyl("leg", 0.024, 0.3, (sx * (W / 2 - 0.06), sy * (D / 2 - 0.06), 0.15), wood("#efe6d6"), verts=24, r2=0.014)
    elif style == "cloud":
        sofa(W, D, H, cover, seats=1, arm="round", leg_h=0.05, back_cushions=True)
    elif style == "wingback":
        box("seatb", (W, D, 0.16), (0, 0, 0.32), cover, bevel=0.03)
        cushion("seat", (W - 0.2, D - 0.16, 0.13), (0, -0.05, 0.46), cover)
        box("back", (W - 0.06, 0.16, H - 0.4), (0, D / 2 - 0.08, 0.4 + (H - 0.4) / 2), cover, bevel=0.06, segs=5)
        for s in (-1, 1):
            o = box("wing", (0.1, D * 0.5, H - 0.45), (s * (W / 2 - 0.05), D * 0.22, 0.45 + (H - 0.45) / 2), cover, bevel=0.045)
            box("arm", (0.112, D * 0.62, 0.22), (s * (W / 2 - 0.056), -D * 0.17, 0.5), cover, bevel=0.05)
        for sx in (-1, 1):
            for sy in (-1, 1):
                cyl("leg", 0.022, 0.24, (sx * (W / 2 - 0.06), sy * (D / 2 - 0.06), 0.12), wood("#5c3d26"), verts=24, r2=0.014)
    elif style == "oak":
        wd = wood("#c49a6c"); lt = leather("#7a4a2a")
        for s in (-1, 1):
            box("side", (0.045, D, 0.05), (s * (W / 2 - 0.022), 0, 0.56), wd, bevel=0.012)
            for y in (-D / 2 + 0.05, D / 2 - 0.08):
                box("post", (0.045, 0.045, 0.56), (s * (W / 2 - 0.022), y, 0.28), wd, bevel=0.012)
            box("rail", (0.04, D, 0.04), (s * (W / 2 - 0.022), 0, 0.18), wd, bevel=0.01)
        box("seatframe", (W - 0.09, D - 0.1, 0.04), (0, 0, 0.22), wd, bevel=0.01)
        cushion("seat", (W - 0.12, D - 0.14, 0.12), (0, -0.03, 0.3), lt)
        cushion("back", (W - 0.14, 0.12, 0.42), (0, D / 2 - 0.12, 0.56), lt, rot=(math.radians(-14), 0, 0))
        box("backrail", (W - 0.09, 0.04, 0.04), (0, D / 2 - 0.06, 0.74), wd, bevel=0.01)

def dining_chair(style, color):
    if style == "shell":
        c = plastic(color) if color != "#1f1f1f" else mat("mattblack", "#1f1f1f", rough=0.55)
        o = box("seat", (0.46, 0.44, 0.04), (0, 0, 0.45), c, bevel=0.018)
        o = box("back", (0.46, 0.04, 0.34), (0, 0.22, 0.63), c, bevel=0.018, rot=(math.radians(-10), 0, 0))
        b = o.modifiers.new("bend", "SIMPLE_DEFORM"); b.deform_method = "BEND"; b.deform_axis = "Z"; b.angle = math.radians(-50)
        for sx in (-1, 1):
            for sy in (-1, 1):
                o = cyl("leg", 0.017, 0.44, (sx * 0.18, sy * 0.17, 0.215), wood("#d8b98f"), verts=20, rot=(math.radians(-sy * 4), math.radians(sx * 4), 0))
        box("wire", (0.36, 0.008, 0.008), (0, 0.17, 0.2), blackmetal(), bevel=0)
        box("wire2", (0.36, 0.008, 0.008), (0, -0.17, 0.2), blackmetal(), bevel=0)
    else:
        cv = fabric(color)
        cushion("seat", (0.48, 0.46, 0.09), (0, -0.01, 0.48), cv)
        o = box("back", (0.48, 0.07, 0.36), (0, 0.23, 0.72), cv, bevel=0.03, segs=4, rot=(math.radians(-8), 0, 0))
        b = o.modifiers.new("bend", "SIMPLE_DEFORM"); b.deform_method = "BEND"; b.deform_axis = "Z"; b.angle = math.radians(-40)
        for sx in (-1, 1):
            for sy in (-1, 1):
                cyl("leg", 0.02, 0.44, (sx * 0.2, sy * 0.19, 0.22), wood("#b98f60"), verts=20, r2=0.014)

def dining_table(top_c="#ece8e2"):
    cyl("top", 1.0, 0.035, (0, 0, 0.755), marble(top_c), verts=96, bevel=0.01)
    o = bpy.context.object; o.scale = (1.0, 0.5, 1); bpy.ops.object.transform_apply(scale=True)
    for s in (-1, 1):
        cyl("ped", 0.17, 0.72, (s * 0.5, 0, 0.36), wood("#5a3a24"), verts=48, r2=0.1)

def bed(kind, color):
    if kind == "tufted":
        cv = fabric(color); W, L = 2.0, 2.2
        box("frame", (W, L, 0.3), (0, -L / 2 + 0.1, 0.15 + 0.08), cv, bevel=0.04)
        o = box("head", (W + 0.1, 0.14, 1.25), (0, 0.15, 0.68), cv, bevel=0.08, segs=6)
        button_tufts(-W / 2 + 0.1, W / 2 - 0.1, 0.75, 1.2, 0.075, cv, cols=10, rows=3)
        for sx in (-1, 1):
            for sy in (0.0, -L + 0.2):
                cyl("leg", 0.03, 0.08, (sx * (W / 2 - 0.08), sy - 0.02, 0.04), wood("#6b4a2f"), verts=20)
    else:
        W, L = 1.7, 2.1; cv = mat("noir", "#222222", rough=0.5)
        box("frame", (W, L, 0.22), (0, -L / 2 + 0.05, 0.19), cv, bevel=0.015)
        box("head", (W + 0.3, 0.06, 0.75), (0, 0.06, 0.45), wood("#6a4429"), bevel=0.012)
        for sx in (-1, 1):
            box("nightstand", (0.0001, 0.0001, 0.0001), (0, 0, -5), cv)
    # mattress, duvet, pillows
    mw = W - 0.08; ml = L - 0.12
    cushion("mattress", (mw, ml, 0.24), (0, -ml / 2 + 0.0, 0.5 if kind == "tufted" else 0.42), mat("sheet", "#f4f1ea", rough=0.85, sheen=0.3), puff=0.3)
    zt = 0.62 if kind == "tufted" else 0.54
    o = cushion("duvet", (mw + 0.06, ml * 0.62, 0.08), (0, -ml + ml * 0.31 + 0.02, zt + 0.02), fabric("#e2d6c3" if kind == "tufted" else "#cfc8bc"), puff=0.6)
    box("throw", (mw + 0.1, 0.45, 0.03), (0, -ml + 0.35, zt + 0.07), fabric("#8a1538" if kind == "tufted" else "#b8925a"), bevel=0.015, subsurf=1)
    for s in (-1, 1):
        cushion("pillow", (mw / 2 - 0.1, 0.42, 0.16), (s * (mw / 4), -0.28, zt + 0.06), mat("pillow", "#fbf8f2", rough=0.85, sheen=0.3), puff=1.4, rot=(math.radians(-20), 0, 0))

def console():
    w = wood("#c49a6c")
    box("top", (1.2, 0.35, 0.035), (0, 0, 0.78), w, bevel=0.006)
    box("shelf", (1.12, 0.3, 0.025), (0, 0, 0.18), w, bevel=0.005)
    for sx in (-1, 1):
        for sy in (-1, 1):
            box("leg", (0.035, 0.035, 0.76), (sx * 0.56, sy * 0.13, 0.38), w, bevel=0.006)
    # decor
    cyl("vase", 0.07, 0.26, (-0.35, 0, 0.93), mat("ceramic", "#e9dfd1", rough=0.35), verts=48, r2=0.045)
    for i, (h, c) in enumerate([(0.03, "#8a1538"), (0.025, "#b8925a"), (0.028, "#2e2f33")]):
        box("book", (0.26, 0.19, h), (0.3, 0, 0.8 + h / 2 + sum([0.03, 0.025, 0.028][:i])), mat("book", c, rough=0.7), bevel=0.003)

def sideboard():
    w = wood("#a8774a"); r = rattan("#c9a165")
    box("body", (1.6, 0.45, 0.66), (0, 0, 0.47), w, bevel=0.01)
    for i in range(4):
        x = -0.6 + i * 0.4
        box("door", (0.37, 0.012, 0.58), (x, -0.226, 0.47), r, bevel=0.003)
        box("frame", (0.38, 0.016, 0.03), (x, -0.226, 0.76), w, bevel=0.003)
        box("frame", (0.38, 0.016, 0.03), (x, -0.226, 0.18), w, bevel=0.003)
        cyl("knob", 0.012, 0.03, (x + (0.15 if i % 2 == 0 else -0.15), -0.245, 0.47), brass(), rot=(math.radians(90), 0, 0), verts=16)
    for sx in (-1, 1):
        for sy in (-1, 1):
            cyl("leg", 0.02, 0.14, (sx * 0.74, sy * 0.18, 0.07), w, verts=20, r2=0.014)
    cyl("lampbase", 0.08, 0.3, (0.5, 0.02, 0.95), mat("ceramic2", "#8a1538", rough=0.3), verts=48, r2=0.05)
    cyl("lampshade", 0.17, 0.22, (0.5, 0.02, 1.2), mat("shade", "#f3ece0", rough=0.9), verts=48, r2=0.13)

def stool(kind, color):
    if kind == "counter":
        w = wood("#e8e4dc")
        cyl("seat", 0.19, 0.035, (0, 0, 0.65), w, verts=64, bevel=0.01)
        for a in range(4):
            ang = math.pi / 4 + a * math.pi / 2
            x, y = math.cos(ang) * 0.15, math.sin(ang) * 0.15
            cyl("leg", 0.017, 0.66, (x * 1.05, y * 1.05, 0.32), w, verts=20, rot=(-math.sin(ang) * 0.08, math.cos(ang) * 0.08, 0))
        cyl("ring", 0.17, 0.02, (0, 0, 0.23), w, verts=48)
    else:
        m = blackmetal()
        cushion("seat", (0.4, 0.38, 0.07), (0, 0, 1.03), leather("#1f1f1f"))
        o = box("back", (0.4, 0.04, 0.16), (0, 0.17, 1.15), leather("#1f1f1f"), bevel=0.015)
        for sx in (-1, 1):
            for sy in (-1, 1):
                cyl("leg", 0.013, 1.0, (sx * 0.16, sy * 0.15, 0.5), m, verts=16)
        box("foot", (0.34, 0.012, 0.012), (0, -0.15, 0.32), m, bevel=0)
        box("foot", (0.34, 0.012, 0.012), (0, 0.15, 0.32), m, bevel=0)

def coffee_table(x, y, rz=0):
    cyl("ct", 0.45, 0.04, (x, y, 0.4), wood("#7a5233"), verts=72, bevel=0.01)
    cyl("ctb", 0.32, 0.36, (x, y, 0.19), wood("#7a5233"), verts=72, r2=0.22)
    cyl("tray", 0.16, 0.02, (x + 0.1, y, 0.43), brass(), verts=48)
    cyl("cup", 0.04, 0.08, (x + 0.12, y + 0.02, 0.48), mat("ceramic", "#e9dfd1", rough=0.35), verts=32)

def plant(x, y, scale=1.0):
    pot = cyl("pot", 0.18 * scale, 0.4 * scale, (x, y, 0.2 * scale), mat("terracotta", "#b86a4b", rough=0.8), verts=48, r2=0.14 * scale)
    lm = mat("leaf", "#4d6b3c", rough=0.5)
    import random; random.seed(int(x * 100 + y * 10))
    for i in range(14):
        a = random.uniform(0, math.tau); t = random.uniform(0.35, 0.8)
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.16 * scale, location=(x + math.cos(a) * 0.18 * scale, y + math.sin(a) * 0.18 * scale, (0.4 + t * 0.8) * scale), segments=10, ring_count=6)
        o = bpy.context.object; o.scale = (1.0, 0.25, 0.55); o.rotation_euler = (random.uniform(-0.6, 0.6), random.uniform(-0.6, 0.6), a)
        o.data.materials.append(lm); bpy.ops.object.shade_smooth()
        lx, ly, lz = x + math.cos(a) * 0.18 * scale, y + math.sin(a) * 0.18 * scale, (0.4 + t * 0.8) * scale
        mx, my, mz = (x + lx) / 2, (y + ly) / 2, (0.38 * scale + lz) / 2
        d = Vector((lx - x, ly - y, lz - 0.38 * scale))
        bpy.ops.mesh.primitive_cylinder_add(radius=0.006 * scale, depth=d.length, location=(mx, my, mz), vertices=8)
        st = bpy.context.object; st.rotation_euler = d.to_track_quat("Z", "Y").to_euler(); st.data.materials.append(mat("stem", "#5b4a2e", rough=0.7))

def arch_panel(x=0.0, wall="#e9dfd1", w=1.7, h=2.6, depth=0.06):
    """Recessed Qatari-style arch: one closed mesh (rectangle + semicircle) set slightly into the wall."""
    me = bpy.data.meshes.new("arch"); bm = bmesh.new()
    r = w / 2; pts = [(-r, 0.0), (r, 0.0)]
    for i in range(1, 32):
        a = math.pi * i / 32
        pts.insert(-1 if False else len(pts), (r * math.cos(a), h - r + r * math.sin(a)))
    pts = [(-r, 0.0), (r, 0.0)] + [(r * math.cos(math.pi * i / 32), h - r + r * math.sin(math.pi * i / 32)) for i in range(0, 33)]
    vs = [bm.verts.new((px, 0, pz)) for px, pz in pts[2:]] + [bm.verts.new((-r, 0, 0)), bm.verts.new((r, 0, 0))]
    face = bm.faces.new(vs)
    ext = bmesh.ops.extrude_face_region(bm, geom=[face])
    for v in [e for e in ext["geom"] if isinstance(e, bmesh.types.BMVert)]: v.co.y += depth
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new("arch", me); bpy.context.collection.objects.link(o)
    o.location = (x, 1.5 - depth - 0.001 + 0.0, 0)
    c = hexc(wall); shade = "#%02x%02x%02x" % tuple(int(max(0, min(255, v))) for v in (int(wall[1:3], 16) * 0.9, int(wall[3:5], 16) * 0.88, int(wall[5:7], 16) * 0.85))
    o.data.materials.append(mat("niche", shade, rough=0.95))
    return o

def rug(w, d, color="#9c8162", x=0, y=0):
    box("rug", (w, d, 0.012), (x, y, 0.006), mat("rug", color, rough=0.95, bump=0.3, bump_scale=300), bevel=0.004)
    box("rugborder", (w - 0.16, d - 0.16, 0.013), (x, y, 0.0065), mat("rugin", "#d9c9b1", rough=0.95, bump=0.3, bump_scale=300), bevel=0.004)

# ───────── studio ─────────
def studio(wall="#e9dfd1", floor="#d8ccba", arch=True, warm=1.0, window=True, dark=False):
    wm = mat("wall", wall, rough=0.92, bump=0.05, bump_scale=30)
    fm = mat("floor", floor, rough=0.32, kind="tile")
    # floor
    bpy.ops.mesh.primitive_plane_add(size=30, location=(0, 0, 0)); f = bpy.context.object; f.data.materials.append(fm)
    # back wall
    box("wall", (14, 0.2, 6), (0, 1.6, 3), wm, bevel=0)
    # skirting
    box("skirt", (14, 0.03, 0.08), (0, 1.49, 0.04), mat("skirtm", wall, rough=0.6), bevel=0.002)
    if arch:
        arch_panel(arch if isinstance(arch, (int, float)) and not isinstance(arch, bool) else 0.0, wall)
    # lights
    def area(name, loc, rot, size, energy, color=(1.0, 0.93, 0.84)):
        bpy.ops.object.light_add(type="AREA", location=loc, rotation=rot)
        l = bpy.context.object; l.data.size = size; l.data.energy = energy * warm; l.data.color = color
        return l
    area("key", (-3.2, -2.6, 3.4), (math.radians(55), 0, math.radians(-50)), 3.0, 600)
    area("fill", (3.5, -3.0, 2.0), (math.radians(70), 0, math.radians(50)), 4.0, 60, (0.9, 0.93, 1.0))
    area("top", (0, -0.5, 4.5), (0, 0, 0), 4.0, 50)
    if window:
        # warm sun shaft from the side
        bpy.ops.object.light_add(type="SUN", location=(0, 0, 5), rotation=(math.radians(50), math.radians(-25), math.radians(-35)))
        s = bpy.context.object; s.data.energy = 1.6 * warm; s.data.color = (1.0, 0.86, 0.68); s.data.angle = math.radians(3)

def camera(loc, target, lens=50, shift_y=0.0):
    bpy.ops.object.camera_add(location=loc)
    c = bpy.context.object; c.data.lens = lens; c.data.shift_y = shift_y
    d = Vector(target) - Vector(loc)
    c.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
    bpy.context.scene.camera = c
    return c

def render(path, w, h, samples=None):
    s = bpy.context.scene
    s.render.resolution_x = w; s.render.resolution_y = h; s.render.resolution_percentage = 100
    if samples: s.cycles.samples = samples
    s.render.filepath = path
    bpy.ops.render.render(write_still=True)
