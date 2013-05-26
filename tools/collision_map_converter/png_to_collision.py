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


                def find_difference(a, b):
                    return [ [a[0][0] - b[0][0], a[0][1] - b[0][1] ], 
                             [a[1][0] - b[1][0], a[1][1] - b[1][1] ] ]

                test_array = []
                for item_a in construction_array:
                    for item_b in construction_array:
                        test_array.append(find_difference(item_a, item_b))
                
                return test_array
            except IOError:
                print "cannot do collision conversion"

    def print_to_js_file(self, item):
      outfile = open("collision.js", 'w')
      print >>outfile, "var collisionData = " + str(item) + ";"
        
        

"""
Run Dis
"""
# Create a collision data object.
# Collision data objects take a source
# png file and manipulate it with their 
# various methods, typically resulting
# in a collection of data that represents
# collision areas in some way.

collision = Collision_Data(sys.argv[1:])
#print collision.to_line_array()
collision.print_to_js_file(collision.to_line_array())



'''
collision = Collision_Data(sys.argv[1:])
square = collision.to_square_array()
for i in square:
    print i
'''
