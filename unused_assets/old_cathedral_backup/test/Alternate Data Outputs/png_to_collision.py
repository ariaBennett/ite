import os, sys
import Image
import pdb

class Collision_Data():

    def __init__(self, source_png_path):
        self.source_png_path = source_png_path

    def rip_band_values(self, band, image_size):
        waiting_for_0 = False
        x = 0
        y = 0
        converted_array = []

        for item in band.getdata():
            if (waiting_for_0 == False and item > 0):
                converted_array.append([[x, y]])
                waiting_for_0 = True
            elif (waiting_for_0 == True and item == 0):
                converted_array[-1].append([x, y])
                waiting_for_0 = False
            x = x + 1
            if (x > image_size[0]):
                x = 0
                y = y + 1

        if ((band.getdata())[-1] > 0):
            converted_array[-1].append([image_size[0], image_size[1]])
        return converted_array

    def to_line_array(self):
        for inpath in self.source_png_path:
            try:
                construction_array = []
                im = Image.open(inpath)
                im.load()
                source = im.split()
                R, G, B, A = 0, 1, 2, 3
                mask = source[A].point(lambda i: i > 0 and 255)
                out = source[A].point(lambda i: 1)
                source[A].paste(out, None, mask)
                construction_array = self.rip_band_values(source[A], im.size)
                return construction_array
            except IOError:
                print "cannot do collision conversion"

    def to_square_array(self):
            for inpath in self.source_png_path:
                try:
                    construction_array = []
                    im = Image.open(inpath)
                    im.load()
                    source = im.split()
                    R, G, B, A = 0, 1, 2, 3
                    mask = source[A].point(lambda i: i > 0 and 255)
                    out = source[A].point(lambda i: 1)
                    source[A].paste(out, None, mask)
                    construction_array = self.rip_band_values(source[A], im.size)
                    return construction_array
                except IOError:
                    print "cannot do collision conversion"

"""
Run Dis
"""
collision = Collision_Data(sys.argv[1:])
square = collision.to_square_array()
for i in square:
    print i
