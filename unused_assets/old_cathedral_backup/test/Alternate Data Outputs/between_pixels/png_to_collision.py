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
            counter = 0
            waiting_for_0 = False
            for item in list(source[A].getdata()):
                if (waiting_for_0 == False and item == 1):
                    print >>outfile, str(counter)
                    waiting_for_0 = True
                if (waiting_for_0 == True and item == 0):
                    waiting_for_0 = False
                counter = counter + 1
            if (source[A].getdata())[-1] == 1:
                print >> outfile, str(counter)
                    
        except IOError:
            print "cannot do collision conversion for", inpath
