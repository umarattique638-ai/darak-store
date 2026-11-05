import sys, math, os, time
import bpy
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *

OUT = "/home/claude/darak/frontend/public/images"
os.makedirs(OUT + "/products", exist_ok=True); os.makedirs(OUT + "/scenes", exist_ok=True)
PW, PH = 760, 950  # 4:5 product shots

def frame(W, D, H, az=-32, el=14, pad=1.3, lens=55, cz=None):
    fov = 2 * math.atan(36 / 2 / lens)          # vertical (portrait: sensor fits height)
    t = math.tan(fov / 2); asp = PW / PH
    # horizontal footprint of the object seen at this azimuth
    a0 = math.radians(abs(az)); foot = W * math.cos(a0) + D * math.sin(a0)
    dist = max((foot / 2) / (t * asp), (H * 1.2 / 2) / t) * pad
    a = math.radians(az); e = math.radians(el)
    cz = cz if cz is not None else H * 0.45
    loc = (math.sin(a) * dist * math.cos(e), -math.cos(a) * dist * math.cos(e), cz + math.sin(e) * dist)
    camera(loc, (0, 0, cz), lens=lens)

def product_scene(build, W, D, H, wall="#e9dfd1", extras=None):
    reset(); studio(wall=wall, window=True)
    build()
    if extras: extras()

# name -> (builder, dims, wall, list of shots [(az, el, pad)])
def P():
    return {
        "sof-velvet-3": (lambda: sofa(2.14, 0.92, 0.84, fabric("#1f5c4d", velvet=True), arm="square", pillow=fabric("#b8925a", boucle=True)), (2.14, 0.92, 0.84), "#e9dfd1"),
        "sof-velvet-3-midnight": (lambda: sofa(2.14, 0.92, 0.84, fabric("#1d2336", velvet=True), arm="square", pillow=fabric("#e9dfd1", boucle=True)), (2.14, 0.92, 0.84), "#ece4d8"),
        "sof-leather-3": (lambda: sofa(2.26, 0.95, 0.82, leather("#9a5b32"), arm="round", tufted=False, leg_mat=blackmetal()), (2.26, 0.95, 0.82), "#e6ddd0"),
        "sof-sectional-l": (lambda: sectional(3.0, 2.1, 0.95, 0.8, fabric("#2e2f33"), leg_mat=blackmetal()), (3.0, 2.1, 0.8), "#ebe3d7"),
        "sof-terra-2": (lambda: sofa(1.68, 0.88, 0.8, fabric("#c2552f", boucle=True), seats=2, arm="round", pillow=fabric("#efe8dc")), (1.68, 0.88, 0.8), "#efe6da"),
        "sof-espresso-3": (lambda: sofa(2.4, 1.0, 0.74, fabric("#5a3d2b"), seats=3, arm="low", low=True, leg_h=0.08, pillow=fabric("#d6c9b5", boucle=True)), (2.4, 1.0, 0.74), "#e9dfd1"),
        "arm-sunny": (lambda: armchair("sculpted", "#d9a321", 0.78, 0.8, 0.86, "boucle"), (0.78, 0.8, 0.86), "#ece2d4"),
        "arm-tufted-w": (lambda: armchair("tufted", "#efe8dc", 0.7, 0.72, 0.92), (0.7, 0.72, 0.92), "#ddd0c0"),
        "arm-cloud-g": (lambda: armchair("cloud", "#b9b6ae", 0.96, 0.92, 0.84, "boucle"), (0.96, 0.92, 0.84), "#e9dfd1"),
        "arm-powder-b": (lambda: armchair("wingback", "#9db8d6", 0.76, 0.8, 0.98), (0.76, 0.8, 0.98), "#ede5d9"),
        "arm-oak-lounge": (lambda: armchair("oak", "#c49a6c", 0.68, 0.78, 0.76), (0.68, 0.78, 0.76), "#e6dccd"),
        "din-shell-b": (lambda: dining_chair("shell", "#1f1f1f"), (0.48, 0.52, 0.82), "#e9dfd1"),
        "din-padded-g": (lambda: dining_chair("padded", "#a7a6a2"), (0.52, 0.56, 0.86), "#ebe2d5"),
        "din-set-6": (lambda: (dining_table(), [ (lambda x, y, r: None) ]), (2.0, 1.0, 0.76), "#e9dfd1"),
        "bed-king-tuft": (lambda: bed("tufted", "#d6c9b5"), (2.1, 2.2, 1.3), "#e6dccd"),
        "bed-queen-noir": (lambda: bed("noir", "#222222"), (2.0, 2.1, 0.85), "#ece4d8"),
        "tab-console-oak": (lambda: console(), (1.2, 0.35, 1.0), "#e9dfd1"),
        "sto-sideboard-r": (lambda: sideboard(), (1.6, 0.45, 1.3), "#e6ddd0"),
        "stl-counter-w": (lambda: stool("counter", "#e8e4dc"), (0.4, 0.4, 0.66), "#e9dfd1"),
        "stl-bar-blk": (lambda: stool("bar", "#1f1f1f"), (0.46, 0.46, 1.2), "#ece4d8"),
    }

def dining_set():
    dining_table()
    import bpy
    for i, (x, y, rz) in enumerate([(-0.55, -0.66, 180), (0.55, -0.66, 180), (-0.55, 0.66, 0), (0.55, 0.66, 0)]):
        before = set(bpy.data.objects)
        dining_chair("padded", "#a7a6a2")
        for o in set(bpy.data.objects) - before:
            o.rotation_euler.z += math.radians(rz)
            o.location.rotate(__import__("mathutils").Euler((0, 0, math.radians(rz))))
            o.location.x += x; o.location.y += y

def shoot_product(name, build, dims, wall, idx, az, el, pad, zoom_detail=False):
    W, D, H = dims
    reset(); studio(wall=wall)
    before = set(bpy.data.objects)
    build()
    if name == "sof-sectional-l":   # centre the L footprint in frame
        for o in set(bpy.data.objects) - before: o.location.x -= 0.35; o.location.y += 0.45
    if zoom_detail:
        frame(W, D, H, az=az, el=el, pad=pad, lens=85, cz=H * 0.55)
    else:
        frame(W, D, H, az=az, el=el, pad=pad)
    render(f"{OUT}/products/{name}-{idx}.jpg", PW, PH, samples=28)

def run_products(only=None):
    jobs = P()
    jobs["din-set-6"] = (dining_set, (2.0, 1.6, 0.86), "#e9dfd1")
    jobs["sof-sectional-l"] = (jobs["sof-sectional-l"][0], (3.4, 2.4, 0.8), jobs["sof-sectional-l"][2])
    for name, (b, dims, wall) in jobs.items():
        if only and name not in only: continue
        if name == "sof-velvet-3-midnight":
            shoot_product("sof-velvet-3", b, dims, wall, 2, 24, 18, 1.12); continue
        if not os.path.exists(f"{OUT}/products/{name}-1.jpg"):
            shoot_product(name, b, dims, wall, 1, -30, 12, 1.12)
        if name in ("sof-velvet-3",): continue
        if not os.path.exists(f"{OUT}/products/{name}-2.jpg"):
            shoot_product(name, b, dims, wall, 2, 24, 24, 1.12)
        print("done", name, flush=True)

# ───────── lifestyle scenes ─────────
def scene_living(path, w, h, cam, target, lens, warm=1.0):
    reset(); studio(arch=0.9, warm=warm)
    sofa(2.4, 1.0, 0.8, fabric("#d6c9b5", boucle=True), seats=3, arm="round", pillow=fabric("#8a1538", velvet=True))
    rug(3.4, 2.4, x=0, y=-0.7)
    coffee_table(0.1, -1.35)
    import bpy
    before = set(bpy.data.objects)
    armchair("sculpted", "#d9a321", 0.78, 0.8, 0.86, "boucle")
    for o in set(bpy.data.objects) - before:
        o.location.rotate(__import__("mathutils").Euler((0, 0, math.radians(-60)))); o.rotation_euler.z += math.radians(-60)
        o.location.x += 1.85; o.location.y -= 1.2
    plant(-1.75, 0.9, 1.2)
    camera(cam, target, lens=lens)
    render(path, w, h, samples=40)

def scene_chair(path):
    reset(); studio(wall="#e3d6c4", arch=0.0)
    armchair("wingback", "#8a1538", 0.76, 0.8, 0.98, "velvet")
    plant(0.85, 0.7, 0.9)
    camera((-1.2, -3.0, 1.1), (0, 0, 0.55), lens=50)
    render(path, 700, 700, samples=36)

def scene_detail(path):
    reset(); studio(wall="#e9dfd1", arch=False)
    sofa(2.14, 0.92, 0.84, fabric("#1f5c4d", velvet=True), arm="square", pillow=fabric("#b8925a", boucle=True))
    camera((-0.9, -1.6, 0.95), (-0.55, 0.1, 0.55), lens=60)
    render(path, 700, 700, samples=36)

def scene_bedroom(path, w, h):
    reset(); studio(wall="#e2d5c3", arch=0.0)
    bed("tufted", "#d6c9b5")
    import bpy
    for s in (-1, 1):
        box("ns", (0.5, 0.42, 0.5), (s * 1.38, -0.12, 0.25), wood("#8a6242"), bevel=0.01)
        cyl("lamp", 0.07, 0.3, (s * 1.38, -0.12, 0.65), mat("ceramic2", "#b8925a", rough=0.3), verts=40, r2=0.05)
        cyl("shade", 0.15, 0.2, (s * 1.38, -0.12, 0.88), mat("shade", "#f3ece0", rough=0.9), verts=40, r2=0.11)
    rug(2.8, 1.6, x=0, y=-1.6)
    camera((-1.5, -5.3, 1.75), (0.05, -0.7, 0.6), lens=38)
    render(path, w, h, samples=40)

def scene_dining(path, w, h):
    reset(); studio(wall="#e6dccd", arch=0.0)
    dining_set()
    sideboard_obj = None
    import bpy
    before = set(bpy.data.objects); sideboard()
    for o in set(bpy.data.objects) - before: o.location.y += 1.15; o.location.x += 0.0
    plant(-1.6, 1.0, 1.1)
    camera((-2.4, -3.4, 1.9), (0, 0.1, 0.55), lens=35)
    render(path, w, h, samples=40)

def run_scenes(only=None):
    S = OUT + "/scenes/"
    jobs = {
        "hero-living": lambda: scene_living(S + "hero-living.jpg", 1000, 1250, (-0.9, -4.9, 1.35), (0.35, -0.6, 0.62), 42),
        "hero-chair": lambda: scene_chair(S + "hero-chair.jpg"),
        "hero-detail": lambda: scene_detail(S + "hero-detail.jpg"),
        "living-wide": lambda: scene_living(S + "living-wide.jpg", 1800, 900, (-0.3, -5.3, 1.35), (0.15, -0.5, 0.75), 30, warm=0.9),
        "bedroom": lambda: scene_bedroom(S + "bedroom.jpg", 1100, 1300),
        "dining": lambda: scene_dining(S + "dining.jpg", 1400, 1050),
    }
    for k, f in jobs.items():
        if only and k not in only: continue
        if os.path.exists(S + k + ".jpg") and not only: continue
        t = time.time(); f(); print("scene", k, round(time.time() - t), flush=True)

if __name__ == "__main__":
    what = sys.argv[1]; only = sys.argv[2:] or None
    if what == "products": run_products(only)
    else: run_scenes(only)
