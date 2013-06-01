import os, sys
import p2c
import pdb

class Test():
    def __init__(self):
        self.col = p2c.Collision_Data(sys.argv[1:])
        self.rects_32 = self.col.to_rects(32, 32)
    def compare(self, data, rows, columns, width, height):
        print self.get_size(data)
        print (rows * columns) * (width * height)

    def get_size(self, data):
        size = 0
        for row in data:
            for column in row:
                for item in column:
                    size = size + 1
        print data[18]
        return size
    def find_bottom(self, data):
        count = 0
        length = 0
        for thing in data:
            if type(thing) == type([]):
                self.find_bottom(thing)
            else:
                count = count + 1
                length = length + len(thing)
                print thing
    def find_len(self, data):
        more = 1

     
test = Test()
test.compare(test.rects_32, 19, 20, 32, 32)
#test.find_bottom(test.rects_32)
            
