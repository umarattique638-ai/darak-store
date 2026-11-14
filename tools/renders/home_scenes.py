"""Home-page category scenes for Al Sharq Exhibition (Blender bpy, Cycles CPU).

Usage:  python3 home_scenes.py            -> renders every scene
        python3 home_scenes.py office doors -> renders only the named scenes
Output: frontend/public/images/home/<name>.jpg  (convert to .webp afterwards)
"""
import sys, math, os, random

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import bpy
from mathutils import Euler
from lib import *

OUT = os.path.abspath(os.path.join(HERE, "..", "..", "frontend", "public", "images", "home"))
os.makedirs(OUT, exist_ok=True)
W, H = 1400, 900
SAMPLES = 36


def emit(c, strength=6.0):
    m = bpy.data.materials.new("emit")
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = hexc(c)
    em.inputs["Strength"].default_value = strength
    nt.links.new(em.outputs[0], out.inputs[0])
    return m


def wd(c):
    return mat("wd" + c, c, rough=0.5)


def plane(name, w, h, loc, material, rot=(math.pi / 2, 0, 0)):
    bpy.ops.mesh.primitive_plane_add(size=1, location=loc, rotation=rot)
    o = bpy.context.object
    o.name = name
    o.scale = (w, h, 1)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    o.data.materials.append(material)
    return o


def window(z0=0.9, z1=2.8, half_w=1.1):
    """Bright glass plane on the back wall (wall face is at y=1.5)."""
    plane("glass", 2 * half_w, z1 - z0, (0, 1.495, (z0 + z1) / 2), emit("#cfe3f2", 2.2))
    box("sill", (2 * half_w + 0.12, 0.12, 0.05), (0, 1.44, z0 - 0.02), mat("sillm", "#f4efe6", rough=0.5), bevel=0.01)


def place_chair(x, y, rz, color="#2b2b2b"):
    before = set(bpy.data.objects)
    dining_chair("shell", color)
    for o in set(bpy.data.objects) - before:
        o.location.rotate(Euler((0, 0, math.radians(rz))))
        o.rotation_euler.z += math.radians(rz)
        o.location.x += x
        o.location.y += y


# ───────── scenes ─────────

def s_office():
    reset(); studio(wall="#e7e0d4", window=True, arch=False)
    window(0.5, 2.7, 1.2)
    top = wd("#d8c09a")
    box("desk_top", (2.4, 1.1, 0.05), (0, 0, 0.745), top, bevel=0.01)
    for x in (-1.08, 1.08):
        for y in (-0.44, 0.44):
            leg(x, y, 0.72, blackmetal())
    for x in (-0.6, 0.6):
        box("mon_body", (0.5, 0.03, 0.3), (x, -0.22, 0.99), blackmetal(), bevel=0.005)
        plane("mon_screen", 0.46, 0.26, (x, -0.2, 0.99), emit("#9fc3e8", 1.6), rot=(math.pi / 2, 0, 0))
        box("mon_stand", (0.05, 0.05, 0.12), (x, -0.22, 0.82), blackmetal(), bevel=0.002)
    for x in (-0.8, 0.0, 0.8):
        place_chair(x, 0.9, 0)
        place_chair(x, -0.9, 180)
    camera((0.0, -4.4, 1.9), (0, 0.1, 0.9), lens=35)


def s_curtains():
    reset(); studio(wall="#e9dfcf", window=True, arch=False)
    window(0.9, 2.8, 1.1)
    cur = fabric("#d8c2a0")
    rail = brass()
    cyl("rail", 0.012, 3.4, (0, 1.36, 2.85), rail, rot=(0, math.pi / 2, 0))
    for sx in (-1, 1):
        cx = sx * 1.45
        box("curtain", (0.62, 0.06, 2.55), (cx, 1.40, 1.5), cur, bevel=0.01)
        for k in range(8):
            x = cx + (k - 3.5) * 0.075
            cyl("fold", 0.03, 2.5, (x, 1.44, 1.5), cur, verts=14)
    camera((0.0, -4.4, 1.6), (0, 1.4, 1.6), lens=35)


def s_blinds():
    reset(); studio(wall="#ece4d6", window=True, arch=False)
    window(0.9, 2.8, 1.1)
    box("roller", (2.4, 0.09, 0.12), (0, 1.43, 2.9), mat("rollerm", "#f4efe6", rough=0.5), bevel=0.015)
    box("blind", (2.2, 0.015, 1.9), (0, 1.47, 1.85), fabric("#efe6d4"), bevel=0.002)
    for x in (-1.1, 1.1):
        box("chain", (0.01, 0.01, 1.8), (x - 0.12 * (1 if x > 0 else -1), 1.46, 1.0), brass(), bevel=0)
    camera((0.0, -4.4, 1.7), (0, 1.4, 1.7), lens=35)


def s_wallpaper():
    reset(); studio(wall="#efe6d6", arch=False)
    dark = mat("stripe", "#c9b08a", rough=0.9)
    for i in range(-22, 23):
        x = i * 0.13
        box("stripe", (0.035, 0.012, 3.2), (x, 1.5 - 0.006, 1.6), dark, bevel=0)
    arch_panel(-1.3, "#efe6d6", w=1.1, h=2.2)
    arch_panel(1.3, "#efe6d6", w=1.1, h=2.2)
    sofa(1.9, 0.9, 0.8, fabric("#2f5d55", velvet=True), seats=2, pillow=fabric("#d9b98a", boucle=True))
    camera((0.0, -4.2, 1.3), (0, 0.9, 1.1), lens=35)


def s_panel():
    reset(); studio(wall="#e8dccb", arch=False)
    slat = wd("#a77a4d")
    for i in range(-12, 13):
        box("slat", (0.07, 0.05, 2.5), (i * 0.14, 1.5 - 0.025, 1.35), slat, bevel=0.008)
    sofa(1.9, 0.9, 0.8, fabric("#6b4f3a", velvet=True), seats=2, pillow=fabric("#e9dfd1", boucle=True))
    rug(2.4, 1.6, "#cdbba2", 0, 0.9)
    camera((0.0, -4.4, 1.4), (0, 0.6, 1.1), lens=35)


def s_floor():
    reset(); studio(wall="#ece4d7", floor="#d8ccba", arch=False)
    tones = ["#b98b5e", "#a87850", "#c59a6c", "#9a6a43"]
    rng = random.Random(7)
    for row in range(-14, 14):
        y = row * 0.19
        x = -4.0 + (row % 3) * 0.4
        while x < 4.0:
            L = rng.uniform(1.2, 1.9)
            box("plank", (L, 0.185, 0.012), (x + L / 2, y, 0.006), mat(f"pl{rng.randrange(4)}", tones[rng.randrange(4)], rough=0.4), bevel=0)
            x += L
    coffee_table(0, 0.35)
    camera((2.0, -2.9, 1.5), (0, 0.2, 0.25), lens=35)


def s_lights():
    reset(); studio(wall="#e9e0d1", warm=0.9, arch=False)
    dining_table()
    shade_m = mat("shade", "#efe7d8", rough=0.9)
    for x in (-0.75, 0.75):
        cyl("cord", 0.004, 1.4, (x, 0, 2.6), blackmetal(), verts=6)
        cyl("shade", 0.2, 0.2, (x, 0, 1.62), shade_m, r2=0.09, verts=48)
        cyl("bulb", 0.05, 0.05, (x, 0, 1.56), emit("#fff1d6", 25), verts=16)
        bpy.ops.object.light_add(type="POINT", location=(x, 0, 1.5))
        bpy.context.object.data.energy = 60
        bpy.context.object.data.color = (1.0, 0.85, 0.65)
    camera((0.0, -4.6, 1.9), (0, 0.0, 1.5), lens=35)


def s_doors():
    reset(); studio(wall="#ece4d6", window=False, arch=False)
    jamb = wd("#e6dccb")
    box("jamb_l", (0.08, 0.12, 2.3), (-0.54, 1.44, 1.15), jamb, bevel=0.005)
    box("jamb_r", (0.08, 0.12, 2.3), (0.54, 1.44, 1.15), jamb, bevel=0.005)
    box("head", (1.16, 0.12, 0.08), (0, 1.44, 2.27), jamb, bevel=0.005)
    leaf = wd("#8c5b36")
    box("leaf", (1.0, 0.05, 2.2), (0, 1.47, 1.1), leaf, bevel=0.004)
    panel = wd("#6e4426")
    box("panel_top", (0.62, 0.02, 0.84), (0, 1.435, 1.72), panel, bevel=0.005)
    box("panel_bot", (0.62, 0.02, 0.98), (0, 1.435, 0.6), panel, bevel=0.005)
    cyl("rose", 0.022, 0.012, (0.36, 1.43, 1.0), brass(), rot=(math.pi / 2, 0, 0), verts=24)
    cyl("handle", 0.011, 0.14, (0.36, 1.39, 1.0), brass(), rot=(math.pi / 2, 0, 0), verts=16)
    camera((0.0, -4.0, 1.3), (0, 1.5, 1.15), lens=35)


def s_kitchen():
    reset(); studio(wall="#f2eee7", window=False, arch=False)
    lac = mat("lacq", "#e8e2d6", rough=0.35)
    wdm = wd("#9a6b43")
    box("base", (2.9, 0.6, 0.84), (0, 1.2, 0.42), lac, bevel=0.005)
    box("counter", (3.0, 0.66, 0.04), (0, 1.2, 0.86), marble("#ece8e2"), bevel=0.005)
    box("splash", (3.0, 0.02, 0.7), (0, 1.49, 1.2), marble("#ece8e2"), bevel=0)
    for x in (-0.95, -0.32, 0.32, 0.95):
        box("door_b", (0.6, 0.02, 0.72), (x, 0.905, 0.42), wdm, bevel=0.004)
        box("h_b", (0.12, 0.02, 0.015), (x, 0.93, 0.74), brass(), bevel=0.002)
    box("upper", (2.9, 0.34, 0.7), (0, 1.33, 1.9), lac, bevel=0.005)
    for x in (-0.95, -0.32, 0.32, 0.95):
        box("door_u", (0.6, 0.02, 0.64), (x, 1.165, 1.9), wdm, bevel=0.004)
        box("h_u", (0.02, 0.02, 0.1), (x + (0.2 if x < 0 else -0.2), 1.18, 1.62), brass(), bevel=0.002)
    camera((0.6, -3.9, 1.5), (0, 1.1, 1.2), lens=35)


def s_shelves():
    reset(); studio(wall="#e9e1d4", window=False, arch=False)
    rng = random.Random(3)
    bc = wd("#b08256")
    box("bc_back", (1.25, 0.02, 2.1), (1.0, 1.49, 1.05), bc, bevel=0)
    box("bc_l", (0.03, 0.35, 2.1), (1.0 - 0.61, 1.31, 1.05), bc, bevel=0.002)
    box("bc_r", (0.03, 0.35, 2.1), (1.0 + 0.61, 1.31, 1.05), bc, bevel=0.002)
    for i in range(6):
        z = 0.02 + i * 0.4
        box("bc_shelf", (1.2, 0.35, 0.025), (1.0, 1.31, z), bc, bevel=0.003)
    books = [mat(f"book{i}", c, rough=0.7) for i, c in enumerate(["#2f5d55", "#c2552f", "#e9dfd1", "#1d2336", "#c9a45c", "#8a5a36"])]
    for i in range(5):
        x = 0.42
        base = 0.02 + i * 0.4 + 0.025
        while x < 1.55:
            w = rng.uniform(0.03, 0.05)
            h = rng.uniform(0.22, 0.31)
            if rng.random() < 0.12:
                x += 0.08
                continue
            box("book", (w, 0.24, h), (x + w / 2, 1.36, base + h / 2), books[rng.randrange(len(books))], bevel=0.002)
            x += w + 0.004
    wz = wd("#b68a5e")
    box("wardrobe", (1.3, 0.6, 2.2), (-1.0, 1.2, 1.1), wz, bevel=0.006)
    for x in (-1.0 - 0.33, -1.0 + 0.33):
        box("wz_door", (0.62, 0.02, 2.0), (x, 0.895, 1.1), wd("#9c7048"), bevel=0.004)
        box("wz_h", (0.02, 0.03, 0.12), (x + (0.25 if x < -1 else -0.25), 0.92, 1.1), brass(), bevel=0.002)
    camera((0.2, -5.0, 1.6), (0, 1.1, 1.1), lens=35)


def s_refurb():  # not rendered; card uses an existing product photo
    pass


SCENES = {
    "office": s_office,
    "curtains": s_curtains,
    "blinds": s_blinds,
    "wallpaper": s_wallpaper,
    "panel": s_panel,
    "floor": s_floor,
    "lights": s_lights,
    "doors": s_doors,
    "kitchen": s_kitchen,
    "shelves": s_shelves,
}


if __name__ == "__main__":
    import time
    names = sys.argv[1:] or list(SCENES)
    for n in names:
        t0 = time.time()
        SCENES[n]()
        render(f"{OUT}/{n}.jpg", W, H, samples=SAMPLES)
        print(f"[{n}] {time.time() - t0:.1f}s", flush=True)
