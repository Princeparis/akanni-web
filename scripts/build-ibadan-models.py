"""Build the Ibadan sculptural heads from CC0 graphical data, without MakeHuman code.

Usage: python scripts/build-ibadan-models.py /path/to/downloaded-graphical-data
The exact upstream files and SHA256 digests are in docs/research/ibadan-model-sources.json.
Only facial/neck geometry is exported. Clothing and objects are original runtime models.
These are artistic character studies, not scans or authenticated historical portraits.
"""

import hashlib
import json
import math
from pathlib import Path
import struct
import sys


ROOT = Path(__file__).resolve().parent.parent
source = Path(sys.argv[1])
manifest = json.loads((ROOT / 'docs/research/ibadan-model-sources.json').read_text())
for item in manifest['files']:
    file = source / Path(item['path']).name
    assert hashlib.sha256(file.read_bytes()).hexdigest() == item['sha256'], file

vertices, faces = [], []
group = ''
for line in (source / 'base.obj').read_text().splitlines():
    fields = line.split()
    if not fields:
        continue
    if fields[0] == 'v':
        vertices.append(tuple(float(v) for v in fields[1:4]))
    elif fields[0] == 'g':
        group = fields[1]
    elif fields[0] == 'f' and group == 'body':
        faces.append([int(v.split('/')[0]) - 1 for v in fields[1:]])


def target(name):
    result = {}
    for line in (source / name).read_text().splitlines():
        fields = line.split()
        if fields and not fields[0].startswith('#'):
            result[int(fields[0])] = tuple(float(v) for v in fields[1:4])
    return result


def mean(points):
    return tuple(sum(p[d] for p in points) / len(points) for d in range(3))


def subdivide(points, quads):
    """One standard Catmull–Clark subdivision, including open neck boundary rules."""
    centers = [mean([points[i] for i in f]) for f in quads]
    edges, neighbors, incident = {}, [set() for _ in points], [[] for _ in points]
    for fi, face in enumerate(quads):
        for j, a in enumerate(face):
            b = face[(j + 1) % len(face)]
            key = tuple(sorted((a, b)))
            edges.setdefault(key, []).append(fi)
            neighbors[a].add(b)
            neighbors[b].add(a)
            incident[a].append(fi)
    boundary = [[] for _ in points]
    for (a, b), fs in edges.items():
        if len(fs) == 1:
            boundary[a].append(b)
            boundary[b].append(a)
    refined = []
    for i, p in enumerate(points):
        if len(boundary[i]) == 2:
            refined.append(tuple((6 * p[d] + sum(points[j][d] for j in boundary[i])) / 8 for d in range(3)))
        elif not incident[i]:
            refined.append(p)
        else:
            n = len(incident[i])
            f = mean([centers[j] for j in incident[i]])
            r = mean([mean([p, points[j]]) for j in neighbors[i]])
            refined.append(tuple((f[d] + 2 * r[d] + (n - 3) * p[d]) / n for d in range(3)))
    edge_ids = {}
    for (a, b), fs in edges.items():
        edge_ids[(a, b)] = len(refined)
        refined.append(mean([points[a], points[b]] + ([centers[j] for j in fs] if len(fs) == 2 else [])))
    face_offset = len(refined)
    refined.extend(centers)
    output = []
    for fi, face in enumerate(quads):
        for j, a in enumerate(face):
            b, c = face[(j + 1) % len(face)], face[j - 1]
            output.append([a, edge_ids[tuple(sorted((a, b)))], face_offset + fi, edge_ids[tuple(sorted((c, a)))]])
    return refined, output


def export(sex, name):
    young, old = target(f'african-{sex}-young.target'), target(f'african-{sex}-old.target')
    # Original portrait studies: intentionally no specific person's likeness claim.
    aged = .48 if sex == 'female' else .38
    points = [tuple(p[d] + (1 - aged) * young.get(i, (0, 0, 0))[d] + aged * old.get(i, (0, 0, 0))[d] for d in range(3)) for i, p in enumerate(vertices)]
    offset = .935246 if sex == 'male' else 0
    cutoff = 5.83 + offset / .65
    selected = [f for f in faces if all(points[i][1] > cutoff for i in f)]
    used = sorted({i for f in selected for i in f})
    remap = {old: i for i, old in enumerate(used)}
    cropped = [(points[i][0] * .65, (points[i][1] - 5.35) * .65 + 1.15 - offset, points[i][2] * .65) for i in used]
    points, quads = subdivide(cropped, [[remap[i] for i in f] for f in selected])
    indices = []
    for f in quads:
        for j in range(1, len(f) - 1):
            indices.extend([f[0], f[j], f[j + 1]])
    normals = [[0., 0., 0.] for _ in points]
    for i in range(0, len(indices), 3):
        a, b, c = indices[i:i + 3]
        u = [points[b][d] - points[a][d] for d in range(3)]
        v = [points[c][d] - points[a][d] for d in range(3)]
        n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]]
        for j in (a, b, c):
            for d in range(3):
                normals[j][d] += n[d]
    normals = [tuple(v / max(math.sqrt(sum(k * k for k in n)), 1e-10) for v in n) for n in normals]
    packed_positions = struct.pack('<' + 'f' * len(points) * 3, *(v for p in points for v in p))
    packed_normals = struct.pack('<' + 'f' * len(points) * 3, *(v for p in normals for v in p))
    packed_indices = struct.pack('<' + 'I' * len(indices), *indices)
    binary = packed_positions + packed_normals + packed_indices
    document = {
        'asset': {'version': '2.0', 'generator': 'Ibadan portrait studies; CC0 MakeHuman graphical data; original build script', 'copyright': 'CC0 graphical base; interpretive artwork, not an authenticated likeness'},
        'scene': 0, 'scenes': [{'nodes': [0]}], 'nodes': [{'mesh': 0, 'name': name}],
        'meshes': [{'primitives': [{'attributes': {'POSITION': 0, 'NORMAL': 1}, 'indices': 2}]}],
        'buffers': [{'byteLength': len(binary)}],
        'bufferViews': [
            {'buffer': 0, 'byteOffset': 0, 'byteLength': len(packed_positions), 'target': 34962},
            {'buffer': 0, 'byteOffset': len(packed_positions), 'byteLength': len(packed_normals), 'target': 34962},
            {'buffer': 0, 'byteOffset': len(packed_positions) + len(packed_normals), 'byteLength': len(packed_indices), 'target': 34963},
        ],
        'accessors': [
            {'bufferView': 0, 'componentType': 5126, 'count': len(points), 'type': 'VEC3', 'min': [min(p[d] for p in points) for d in range(3)], 'max': [max(p[d] for p in points) for d in range(3)]},
            {'bufferView': 1, 'componentType': 5126, 'count': len(points), 'type': 'VEC3'},
            {'bufferView': 2, 'componentType': 5125, 'count': len(indices), 'type': 'SCALAR'},
        ],
    }
    js = json.dumps(document, separators=(',', ':')).encode()
    js += b' ' * (-len(js) % 4)
    binary += b'\x00' * (-len(binary) % 4)
    glb = struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(binary)) + struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(binary), 0x004E4942) + binary
    path = ROOT / 'public/ibadan/models' / f'{name}.glb'
    path.write_bytes(glb)
    print(path.name, len(points), 'vertices', len(indices) // 3, 'triangles', len(glb), 'bytes')


export('female', 'iyalode-study')
export('male', 'commander-study')
