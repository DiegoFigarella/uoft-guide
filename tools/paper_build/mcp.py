import json,sys,urllib.request
def call(name,args):
    body=json.dumps({'jsonrpc':'2.0','id':1,'method':'tools/call','params':{'name':name,'arguments':args}}).encode()
    req=urllib.request.Request('http://127.0.0.1:29979/mcp',body,{'Content-Type':'application/json','Accept':'application/json, text/event-stream'})
    raw=urllib.request.urlopen(req).read().decode()
    r=json.loads([l[6:] for l in raw.splitlines() if l.startswith('data: ')][0])
    return r.get('error') or ''.join(x.get('text','') for x in r['result']['content'])
if __name__=='__main__':
    print(call(sys.argv[1], json.loads(sys.argv[2]) if len(sys.argv)>2 else {}))
