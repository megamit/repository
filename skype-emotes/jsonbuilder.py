import json
import os, os.path
from PIL import Image

data = {}
for root, _, files in os.walk("C:\\Dev\\Dump\\repo\\repository\\skype-emotes"):
    for f in files:
        fullpath = os.path.join(root, f)
        if os.path.isfile(fullpath):
            if fullpath[-4:]==".bmp":
                i = Image.open(fullpath)
                data[f[:-4]] = {"url":"https://megamit.github.io/repository/skype-emotes/"+f,"type":"sprite","steps": int(i.height/i.width)}
    file = open("skypeemotedata.json","w")
    file.write(json.dumps(data));
    file.close();
    
            
