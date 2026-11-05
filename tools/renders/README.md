# Furniture renders
All product and scene images in `frontend/public/images` are 3D renders made with Blender (Cycles) from these scripts — no stock photos.

```bash
pip install bpy          # Blender as a Python module
python jobs.py products  # → frontend/public/images/products/*.jpg
python jobs.py scenes    # → frontend/public/images/scenes/*.jpg
```
Convert to WebP afterwards (the site uses .webp). Real product photos can replace any of them from the dashboard (Cloudinary upload).
