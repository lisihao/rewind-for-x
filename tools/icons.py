# Draws icons/*.png: a dark rounded square with a white counter-clockwise
# arrow around a clock hand. Pure stdlib, supersampled.
import math, struct, zlib, os

def png(path, size, px):
    raw = b''.join(b'\0' + bytes(px[y*size*4:(y+1)*size*4]) for y in range(size))
    def chunk(t, d): return struct.pack('>I', len(d)) + t + d + struct.pack('>I', zlib.crc32(t + d) & 0xffffffff)
    with open(path, 'wb') as f:
        f.write(b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', size, size, 8, 6, 0, 0, 0))
                + chunk(b'IDAT', zlib.compress(raw, 9)) + chunk(b'IEND', b''))

def inside_bg(x, y, r=0.22):
    cx = min(max(x, r), 1 - r); cy = min(max(y, r), 1 - r)
    return (x - cx) ** 2 + (y - cy) ** 2 <= r * r

def seg(px, py, ax, ay, bx, by):
    dx, dy = bx - ax, by - ay
    t = max(0, min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
    return math.hypot(px - ax - t * dx, py - ay - t * dy)

def tri(px, py, a, b, c):
    def s(p, q, r): return (p[0]-r[0])*(q[1]-r[1]) - (q[0]-r[0])*(p[1]-r[1])
    d1, d2, d3 = s((px,py),a,b), s((px,py),b,c), s((px,py),c,a)
    return not ((d1 < 0 or d2 < 0 or d3 < 0) and (d1 > 0 or d2 > 0 or d3 > 0))

C, R, W = (0.5, 0.52), 0.27, 0.075
GAP = math.radians(50)  # opening of the arc, top-left
START = math.radians(-90) - GAP  # arc runs clockwise from here, around to the top

def fg(x, y):
    dx, dy = x - C[0], y - C[1]
    ang = math.atan2(dy, dx)
    rel = (ang - math.radians(-90)) % (2 * math.pi)
    if abs(math.hypot(dx, dy) - R) <= W / 2 and rel <= 2 * math.pi - GAP:
        return True
    # arrow head at the arc end (top-left), pointing along the arc backwards
    ex, ey = C[0] + R * math.cos(START), C[1] + R * math.sin(START)
    tx, ty = -math.sin(START), math.cos(START)  # clockwise tangent
    nx, ny = math.cos(START), math.sin(START)
    h = 0.13
    a = (ex - tx * h * 0.9, ey - ty * h * 0.9)
    b = (ex + nx * h * 0.75, ey + ny * h * 0.75)
    c = (ex - nx * h * 0.75, ey - ny * h * 0.75)
    if tri(x, y, a, b, c): return True
    # clock hands
    if seg(x, y, C[0], C[1], C[0], C[1] - 0.14) <= W / 2.4: return True
    if seg(x, y, C[0], C[1], C[0] + 0.1, C[1] + 0.06) <= W / 2.4: return True
    return False

os.makedirs('icons', exist_ok=True)
for size in (16, 32, 48, 128):
    ss = 4; px = []
    for y in range(size):
        for x in range(size):
            bg = f = 0
            for sy in range(ss):
                for sx in range(ss):
                    u, v = (x + (sx + .5) / ss) / size, (y + (sy + .5) / ss) / size
                    if inside_bg(u, v):
                        bg += 1
                        if fg(u, v): f += 1
            n = ss * ss
            a = bg / n
            if bg == 0: px += [0, 0, 0, 0]; continue
            k = f / bg
            col = [round(15 + (255 - 15) * k), round(20 + (255 - 20) * k), round(25 + (255 - 25) * k)]
            px += col + [round(a * 255)]
    png(f'icons/{size}.png', size, px)
print('ok')
