"""Reproduce favicon sizes from the existing embedded brand image, without redrawing it."""
import base64
import io
from pathlib import Path
import re
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parents[1]
public = root / 'public'
encoded = re.search(r'base64,([^"\s]+)', (public / 'logo.svg').read_text()).group(1)
source = Image.open(io.BytesIO(base64.b64decode(encoded))).convert('RGBA')
source = source.crop(source.getbbox())

def square(size):
    canvas = Image.new('RGBA', (size, size), 'white')
    mark = source.copy()
    mark.thumbnail((round(size * .86), round(size * .86)), Image.Resampling.LANCZOS)
    canvas.alpha_composite(mark, ((size-mark.width)//2, (size-mark.height)//2))
    return canvas

for size, name in [(96, 'favicon-96x96.png'), (180, 'apple-touch-icon.png'), (192, 'logo192.png'), (512, 'logo512.png')]:
    square(size).save(public / name)
square(64).save(public / 'favicon.ico', sizes=[(16,16), (32,32), (48,48), (64,64)])
preview = Image.new('RGB', (1200, 630), '#f0f5fc')
mark = square(280)
preview.paste(mark, (80,175), mark)
draw = ImageDraw.Draw(preview)
fonts = Path('C:/Windows/Fonts')
title = ImageFont.truetype(str(fonts / 'arialbd.ttf'), 60)
body = ImageFont.truetype(str(fonts / 'arial.ttf'), 32)
draw.text((410,220), 'Tib Technology', fill='#074089', font=title)
draw.text((410,310), 'Медицинское оборудование', fill='#233b57', font=body)
draw.text((410,365), 'Душанбе · medtech.tj', fill='#233b57', font=body)
preview.save(public / 'og-image.png')
print('Generated 6 brand assets from existing logo')
