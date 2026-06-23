import os
from PIL import Image

def is_teal(r, g, b):
    # Teal is roughly (0, 128, 128) to (100, 200, 200). Basically G and B are high, R is low.
    return b > r + 30 and g > r + 30

def find_teal():
    logos_dir = "public/logos"
    for filename in os.listdir(logos_dir):
        if filename.endswith(".png"):
            filepath = os.path.join(logos_dir, filename)
            try:
                img = Image.open(filepath).convert("RGBA")
                width, height = img.size
                
                teal_pixels = 0
                total_colored_pixels = 0
                
                for r, g, b, a in img.getdata():
                    if a > 50: # ignore transparent
                        # Ignore pure white/black
                        if not (r > 240 and g > 240 and b > 240) and not (r < 15 and g < 15 and b < 15):
                            total_colored_pixels += 1
                            if is_teal(r, g, b):
                                teal_pixels += 1
                
                if total_colored_pixels > 0:
                    percent_teal = teal_pixels / total_colored_pixels
                    print(f"{filename}: {percent_teal:.2%} teal pixels")
            except Exception as e:
                pass

find_teal()
