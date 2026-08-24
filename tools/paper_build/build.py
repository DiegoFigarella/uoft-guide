import sys, json
sys.path.insert(0, __import__('os').path.dirname(__import__('os').path.abspath(__file__)))
from mcp import call

LABEL = "letter-spacing:-0.01em;font-weight:500;color:#FFFFFF;font-size:36px;line-height:40px"
TITLE = "font-weight:500;color:#FFFFFF;font-size:24px;line-height:31px"
DESC  = "color:#FFFFFFB8;font-size:18px;line-height:25px"

def item(t, d):
    return ('<div style="display:flex;flex-direction:column;gap:2px">'
            f'<div style="{TITLE}">{t}</div><div style="{DESC}">{d}</div></div>')

def section(label, items, top):
    cols = [items] if len(items) < 4 else [items[:(len(items)+1)//2], items[(len(items)+1)//2:]]
    colhtml = "".join(
        '<div style="flex-grow:1;flex-basis:0%;display:flex;flex-direction:column;gap:16px">'
        + "".join(item(*i) for i in c) + '</div>' for c in cols)
    return (f'<div layer-name="{label}" style="position:absolute;left:417.5px;top:{top}px;width:1367px;'
            'height:fit-content;display:flex;padding:38px 46px;gap:36px;align-items:center;'
            "outline:5px solid #FFFFFF;font-family:'DM Sans',system-ui,sans-serif\">"
            f'<div style="width:250px;flex-shrink:0;display:flex;flex-direction:column;gap:10px;height:fit-content">'
            f'<div style="{LABEL}">{label}</div></div>'
            f'<div style="flex-grow:1;flex-basis:0%;display:flex;gap:40px;height:fit-content">{colhtml}</div></div>')

def build(artboard, name, sections, kill=()):
    call('rename_nodes', {'updates': [{'nodeId': artboard, 'name': name}]})
    if kill:
        call('delete_nodes', {'nodeIds': list(kill)})
    top = 343
    for label, items in sections:
        r = json.loads(call('write_html', {'html': section(label, items, top),
                                           'targetNodeId': artboard, 'mode': 'insert-children'}))
        nid = (r.get('createdNodes') or r.get('nodes'))[0]
        nid = nid['id'] if isinstance(nid, dict) else nid
        h = json.loads(call('get_node_info', {'nodeId': nid}))
        hh = h.get('height') or h.get('styles', {}).get('height')
        hh = float(str(hh).replace('px', ''))
        print(label, hh)
        top += hh
    call('update_styles', {'updates': [{'nodeIds': [artboard], 'styles': {'height': f'{int(top)+100}px'}}]})
    print('total', top)
