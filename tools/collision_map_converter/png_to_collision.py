#TODO You were working on converting the row array data into
# rectangles for the area sections.

import os, sys
import Image
import pdb
import math

class Collision_Data():

    def __init__(self, source_png_path):
        self.source_png_path = source_png_path

    def rip_raw_data(self, data_type, include_helper_data):
        for inpath in self.source_png_path:
            try:
                im = Image.open(inpath)
                im.load()
                source = im.split()
                R, G, B, A = 0, 1, 2, 3
                mask = source[A].point(lambda i: i > 0 and 255)
                out = source[A].point(lambda i: 1)
                source[A].paste(out, None, mask)

                if data_type == "array":
                    constructor = []
                    for item in source[A].getdata():
                        constructor.append(item)

                if data_type == "row_array":
                    constructor = []
                    for y in range(im.size[1]):
                        constructor.append([])
                        row = ""
                        for x in range(im.size[0]):
                            row = row + str((source[A].getdata())[(im.size[0] * y) + x])
                        constructor[y] = [row]

                elif data_type == "string":
                    constructor = ""
                    for item in source[A].getdata():
                        constructor = constructor + str(item)

                if include_helper_data == False:
                    return constructor
                if include_helper_data == True:
                    return (constructor, im.size)
            except IOError:
                print "cannot do collision conversion"

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

    def to_rects(self, width, height):
        constructor = []

        data = self.rip_raw_data("row_array", True)
        im_width = data[1][0]
        im_height = data[1][1]
        data = data[0]

        columns_rows = self.get_columns_rows(im_width, im_height, width, height)
        columns = columns_rows[0]
        rows = columns_rows[1]

        for row in data:
            for i in range(columns):
                sec_row = ""
                for j in range(width):
                    pass
                    #sec_row = sec_row + row[(i * width) + j]
                #print sec_row



        """
        columns_rows = self.get_columns_rows(data[1][0], data[1][1], width, height)

        for row in range(columns_rows[1]):
            constructor.append([])

            for column in range(columns_rows[0]):
                constructor[row].append([])

                for i in range(height):
                    for j in range(width):
                        constructor[row][column] = constructor[row][column] + 1 


        return constructor 
        """

    def get_columns_rows(self, width, height, section_width, section_height):
        columns = int(math.ceil(float(width)/float(section_width)))
        rows = int(math.ceil(float(height)/float(section_height)))
        return (columns, rows)

    def write_js(self, item):
        outfile = open("collision.js", 'w')
        print >>outfile, "var collisionData = " + str(item) + ";"
        
    def write_py(self, item):
        outfile = open("collision.py", 'w')
        print >>outfile, "collision_data = " + str(item)
        

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
#collision.write_js(collision.rip_raw_data("string", True))
#collision.write_js(collision.to_sections(32))
#collision.write_py(collision.to_rects(32, 32))
#collision.write_js(collision.rip_raw_data("row_array", False))
collision.write_py(collision.rip_raw_data("row_array", True))


'''
collision = Collision_Data(sys.argv[1:])
square = collision.to_square_array()
for i in square:
    print i
'''
