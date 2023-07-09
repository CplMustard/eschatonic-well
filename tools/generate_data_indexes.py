import os

directory = os.walk('./src/data')
dirnames = next(directory)[1]
for folder in dirnames:
    datapackname = folder + 'Data'
    filenames = os.listdir('./src/data/' + folder)
    filenames.remove("index.js")
    f = open('./src/data/' + folder + '/index.js', 'w', encoding="utf-8")
    for filename in filenames:
        stem = filename.split('.')[0]
        f.write('import ' + stem + ' from \"./' + filename + '\";\n')
    
    f.write('\nconst ' + datapackname + ' = {')
    for i in range(len(filenames)):
        stem = filenames[i].split('.')[0]
        f.write('\n\t' + stem + ': ' + stem)
        if(i != len(filenames)-1):
            f.write(",")
        
    f.write("\n}")
    f.write('\nexport default ' + datapackname)
    f.close()