from time import gmtime, strftime
# A simple script that takes a console dump of numbers and
# returns their average.

def get_averages(infile):
    results = {}
    for line in infile:
        source_line = line.split(' ')[1].split('\n')[0]
        time = line.split(' ')[0]
        
        if source_line in results:
            results[source_line]['total'] += float(time)
            results[source_line]['count'] += 1
        else:
            results[source_line] = {'total': float(time), 'count': 1}

    current_time = strftime("%Y-%m-%d %H:%M:%S", gmtime())
    for item in results:
        entry = results[item]
        entry['average'] = entry['total']/entry['count']
        entry['time'] = current_time 
    return results
def print_js_formatted(d):
    for key in d:
        item = d[key]
        print "// <DEBUG/> #ttc: %fms #end: %s #Date: %s" % (item['average'], key, item['time'])
        print "// </DEBUG> #ttc: %fms #end: %s #Date: %s" % (item['average'], key, item['time'])


results = get_averages(open('datadump', 'r'))
print_js_formatted(results)
