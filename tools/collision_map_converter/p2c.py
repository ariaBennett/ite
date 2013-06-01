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
                        row = ""
                        for x in range(im.size[0]):
                            row = row + str((source[A].getdata())[(im.size[0] * y) + x])
                        constructor.append(row)

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

        # resize arrays to be correct length

        tmp_array = []
        for row in data:
            x = 0
            while (x * width < im_width):
                if (im_width - (x * width) < width):
                    remaining = im_width - (x * width)
                    tmp_array.append((row[x*width:x*width - remaining]) + ("1" * remaining))
                else:
                    tmp_array.append(row[x*width:x*width + width])
                x = x + 1


        sections = []
        counter = 0
        tmp_rows_len = len(tmp_array)
        tmp_len = 0


        for i in tmp_array:
            # print i
            tmp_len = tmp_len + len(i)
            #print tmp_len
        #print tmp_len
        test = 0
        for r in range(rows):
            sections.append([])
            for i in range(columns):
                sections[r].append("")
            for h in range(height):
                for w in range(width):
                    for c in range(columns):
                        counter = counter + 1
                        if (counter < (tmp_rows_len)):
                            sections[r][c] = sections[r][c] + tmp_array[counter]
                        else:
                          #print tmp_rows_len
                            #print tmp_rows_len - counter
                            sections[r][c] = sections[r][c] + "1"
        tmp_slen = 0
        for i in sections:
            for j in i:
                tmp_slen = tmp_slen + len(j)
            
        return sections 
        

    def adjust_characters(self, data, zero_replacement, one_replacement):
        zero = zero_replacement
        one = one_replacement
        
        i = 0
        while i < len(data):
            j = 0
            while j < len(data[i]):
                data[i][j] = data[i][j].replace("0", zero)
                data[i][j] = data[i][j].replace("1", one)
                j = j + 1
            i = i + 1
        return data

        """
        x = 0
        for row in data:
            y = 0
            for column in row:
                data[x][y].replace("0", zero)
                data[x][y].replace("1", one)
                y = y + 1
                print column
            x = x + 1
        """
        """
        new_data = []
        x = 0
        for segment in data:
            new_data.append([])
            y = 0
            for subsegment in segment:
                new_data[x].append("")
                z = 0
                for char in segment:
                    if char == "0":
                        new_data[x][y][z] = new_data[x][y][z] + replacement
                    if char == "1":
                        new_data[x][y][z] = new_data[x][y][z] + replacement
                    z = z + 1
                y = y + 1
            x = x + 1

        print new_data[0][0]
        return new_data
        """

    def get_columns_rows(self, width, height, section_width, section_height):
        columns = int(math.ceil(float(width)/float(section_width)))
        rows = int(math.ceil(float(height)/float(section_height)))
        return (columns, rows)

    def write_js(self, item):
        outfile = open("collision.js", 'w')
        print >>outfile, "var p2c = " + str(item) + ";"
        
    def write_py(self, item):
        outfile = open("collision.py", 'w')
        print >>outfile, "p2c = " + str(item)

    def write_pretty(self, item, reduction):
        outfile = open("collision_pretty.txt", 'w')
        tmp_str = ""
        for row in item:
            for column in row:
                if reduction == 0:
                    tmp_str = tmp_str + str(column)
                else:
                    count = 1
                    for i in column:
                        if count < reduction:
                            count = count + 1
                        else:
                            tmp_str = tmp_str + str(i)
                            count = 0
            tmp_str = tmp_str + "\n"
        print >>outfile, str(tmp_str),
                        
        
        

"""
Run Dis
"""
# Create a collision data object.
# Collision data objects take a source
# png file and manipulate it with their 
# various methods, typically resulting
# in a collection of data that represents
# collision areas in some way.

#collision = Collision_Data(sys.argv[1:])
#print collision.to_line_array()
#collision.write_js(collision.rip_raw_data("string", True))
#collision.write_js(collision.to_sections(32))
#rect_data = collision.to_rects(32, 32)
#collision.write_py(collision.adjust_characters(rect_data, ".", "#"))
#collision.write_pretty(collision.adjust_characters(rect_data, ".", "#"), 256)
#collision.write_py(rect_data)
#collision.write_js(collision.rip_raw_data("row_array", False))
#collision.write_py(collision.rip_raw_data("row_array", False))


'''
collision = Collision_Data(sys.argv[1:])
square = collision.to_square_array()
for i in square:
    print i
'''
