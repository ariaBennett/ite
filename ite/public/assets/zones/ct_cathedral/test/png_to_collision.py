import os, sys
import Image

for inpath in sys.argv[1:]:
    outpath = os.path.splitext(inpath)[0] + ".collision"
    if inpath != outpath:
        try:
            collision_array = []
            im = Image.open(inpath)
            im.load()
            source = im.split()
            R, G, B, A = 0, 1, 2, 3
            mask = source[A].point(lambda i: i > 0 and 255)
            out = source[A].point(lambda i: 1)
            source[A].paste(out, None, mask)
            outfile = open(outpath, 'w')
            print >>outfile, list(source[A].getdata())
        except IOError:
            print "cannot do collision conversion for", inpath
