"""
Team project for court calender data.
"""

import csv

FIELDNAMES = ['CourtDate', 'CourtTime', 'CourtRoom', 'No',
              'FileNumber', 'DefendantName', 'Complaintant', 'Attorney', 'Cont',
              'Needs Fingerprinted', 'Bond', 'Charge', 'Plea', 'Ver',
              'CLS', 'P', 'L', 'JUDGMENT','ADA']
END_HEADER = '*' * 20



def is_summary_header(line):
    return line[0] == "1" and "RUN DATE:" in line 


def is_page_header(line):
    return line[0] == "1" and "RUN DATE:" not in line 

def process_page_header(line, infile):
    while True: 
        line = infile.readline()
        if line == "" or END_HEADER in line:
            break

def is_report_header(line):
    return line[0] != "1" and "RUN DATE:"  in line 

def process_report_header(line, infile):
    data = {}

    # data['RunDate'] = line[12:20]
    #col -1 
    while True: 
        line = infile.readline()
        if line == "" or END_HEADER in line:
            break
        elif "COURT DATE:" in line:
            data['CourtDate'] = line[22:30]
            data['CourtTime'] = line[44:52]
            data['CourtRoom'] = line[78:].strip()
            #end of line protocal
    return data


def is_defendant_line(line):
    try:
        int(line[0:6])
        return True 
    except ValueError: 
        return False

def process_defendant_line(line):
    data = {}

    data['No'] = line[5:7].strip()
    data['FileNumber'] = line[8:20].strip()
    data['DefendantName'] = line[20:42].strip()
    data['Complaintant'] = line[42:57].strip()
    data['Attorney'] = line[57:84].strip()
    data['Cont'] = line[82:85].strip()

    data['Needs Fingerprinted'] = ''
    data['Bond'] = ''
    data['JUDGMENT'] = ''
    return data

def is_NeedsFingerprinted_line(line):
    return "FINGERPRINTED" in line

def process_NeedsFingerprinted_line(line):
    data = {}

    data['Needs Fingerprinted'] = line[29:64].strip()

    return data


def is_bond_line(line):
    return "BOND:" in line

def process_bond_line(line):
    data = {}
    data['Bond'] = line[25:].strip()
    return data


def is_charge_line(line):
    return "PLEA:" in line

def process_charge_line(line):
    data = {}
    data['Charge'] = line[8:43].strip()
    data['Plea'] = line[49:65].strip()
    data['Ver'] = line[69:83].strip()
    return data


def is_JUDGMENT_line(line):
    return 'JUDGMENT' in line

def process_JUDGMENT_line(line):
    data = {}
    data['CLS'] = line[12:15].strip()
    data['P'] = line[17:20].strip()
    data['L'] = line[22:28].strip()
    data['JUDGMENT'] = line[69:76].strip()
    data['ADA'] = line[80:84].strip()
    return data



def write_rec(writer, rpt_data, defend_data, offense_data):
    rec = dict(rpt_data)
    rec.update(defend_data)
    rec.update(offense_data)
    writer.writerow(rec)


def main():
    rpt_data = {}
    defend_data = {}
    offense_data = {}

    #filename = "DISTRICT.DISTRICT_COURT_.04.11.23.AM.9999.CAL.txt"
    filename = input("Enter filename to process: ")
    infile = open(filename, 'r')

    output_filename = "output.csv"
    outfile = open(output_filename, 'w' , newline = '')
    writer = csv.DictWriter(outfile, fieldnames = FIELDNAMES)
    writer.writeheader()

    while True:
            line = infile.readline()
            if line == "" or is_summary_header(line):
                break
            elif line == "\n":
                continue
            elif is_page_header(line):
                process_page_header(line, infile)
            elif is_report_header(line):
                rpt_data = process_report_header(line, infile)
            elif is_defendant_line(line):
                if len(defend_data) > 0:
                    write_rec(writer,rpt_data,defend_data,offense_data)
                    defend_data = {}
                    offense_data = {}
                defend_data = process_defendant_line(line)
            elif is_bond_line(line):
                data = process_bond_line(line)
                defend_data.update(data)
            elif is_NeedsFingerprinted_line(line):
                data = process_NeedsFingerprinted_line(line)
                defend_data.update(data)
            elif is_charge_line(line):
                if len(offense_data) > 0:
                    write_rec(writer,rpt_data,defend_data,offense_data)
                    offense_data = {}
                offense_data = process_charge_line(line)
            elif is_JUDGMENT_line(line):
                JUDGMENT_data = process_JUDGMENT_line(line)
                offense_data.update(JUDGMENT_data)
            else:
                print(line, end="")
    write_rec(writer,rpt_data,defend_data,offense_data)


if __name__=="__main__":
    main()
