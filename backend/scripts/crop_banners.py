import os
import glob
from PIL import Image, ImageOps

images_dir = 'frontend/public/images'
pattern = os.path.join(images_dir, '*.png')
image_paths = glob.glob(pattern)

print(f"Found {len(image_paths)} PNG/JPEG images to check.")

for path in image_paths:
    try:
        img = Image.open(path)
        w, h = img.size
        
        # Convert to grayscale
        gray = img.convert('L')
        
        # Threshold: pixels with brightness < 248 are foreground (255), >= 248 are background (0)
        # We use 248 to handle compression artifacts on off-white borders
        thresholded = gray.point(lambda p: 255 if p < 248 else 0)
        
        bbox = thresholded.getbbox()
        
        if bbox:
            left, top, right, bottom = bbox
            bbox_w = right - left
            bbox_h = bottom - top
            
            # If the bounding box is smaller than the image, we crop it
            # We add a small tolerance (e.g. if it's within 5 pixels of the border, don't crop)
            if left > 5 or top > 5 or right < w - 5 or bottom < h - 5:
                print(f"✂️ Cropping {os.path.basename(path)}: Original {w}x{h} -> BBox {bbox_w}x{bbox_h} (coords: {bbox})")
                cropped_img = img.crop(bbox)
                cropped_img.save(path)
            else:
                print(f"✅ {os.path.basename(path)} is already full frame ({w}x{h})")
        else:
            print(f"⚠️ {os.path.basename(path)} seems to be entirely white/blank")
            
    except Exception as e:
        print(f"❌ Error processing {path}: {e}")

print("Done processing images.")
