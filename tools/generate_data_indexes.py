#Generates data index files for the specified dataset

import os
import argparse

parser = argparse.ArgumentParser("simple_example")
parser.add_argument("dataset", help="Data set directory name to generate index files for", type=str)
args = parser.parse_args()

dataset = args.dataset + '/'

directory = os.walk('./src/data/' + dataset)
dirnames = next(directory)[1]
for folder in dirnames:
    datapackname = folder + 'Data'
    filenames = os.listdir('./src/data/' + dataset + folder)
    if "index.js" in filenames: filenames.remove("index.js")
    f = open('./src/data/' + dataset + folder + '/index.js', 'w', encoding="utf-8")
    for filename in filenames:
        stem = filename.split('.')[0]
        f.write('import ' + stem + ' from \"./' + filename + '\";\n')
    
    f.write('\nconst ' + datapackname + ' = {')
    for i in range(len(filenames)):
        stem = filenames[i].split('.')[0]
        f.write('\n\t' + stem + ': ' + stem)
        if(i != len(filenames)-1):
            f.write(",")
        
    f.write("\n};")
    f.write('\nexport default ' + datapackname + ';')
    f.close()