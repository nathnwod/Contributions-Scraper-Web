import pymupdf
import os
import platform
import re
import pandas as pd
from pdfrw import PdfReader

def get_downloads_folder():
    """
    Returns the path to the user's Downloads folder.
    """
    if platform.system() == "Windows":
        # Uses the well-known folder ID for Downloads in Windows Registry
        import winreg
        try:
            with winreg.OpenKey(winreg.HKEY_CURRENT_USER, r"Software\Microsoft\Windows\CurrentVersion\Explorer\Shell Folders") as key:
                return winreg.QueryValueEx(key, "{374DE290-123F-4565-9164-39C4925E467B}")[0]
        except Exception:
            # Fallback for general cases, often "C:\\Users\\YourUser\\Downloads"
            return os.path.join(os.path.expanduser('~'), 'Downloads')
    elif platform.system() == "Darwin": # macOS
        return os.path.join(os.path.expanduser('~'), 'Downloads')
    elif platform.system() == "Linux":
        # XDG user directories standard for Linux
        try:
            import subprocess
            return subprocess.check_output(['xdg-user-dir', 'DOWNLOAD']).strip().decode('utf-8')
        except (subprocess.CalledProcessError, FileNotFoundError):
            # Fallback for general cases, often "~/Downloads"
            return os.path.join(os.path.expanduser('~'), 'Downloads')
    else:
        # Generic fallback
        return os.path.join(os.path.expanduser('~'), 'Downloads')
    
    
def findContributions(files):
    #ending = "" # Initialize an empty string to store results
    results = []
    dataframeDict = {'Article Name': [], 'DOI': [], 'Detected Zoos/Aquariums': [], 'Seahorse Mentions': []}

    def renameFileToPDFTitle(fileName):
        fullName = fileName
        fallback_name = os.path.basename(fileName)
        # Extract pdf title from pdf file

        try:
            info = PdfReader(fullName).Info
            newName = info.Title if info else None
            if not newName:
                return fallback_name

            newNameSplit = str(newName).split()
        except Exception:
            return fallback_name

        else:
            # Remove surrounding brackets that some pdf titles have, only take first four words
            newName = " ".join(newNameSplit[:4])
            newName = re.sub(r'[^a-zA-Z0-9\' ]', '', newName)
            newName = newName.strip('()')
            if not newName:
                return fallback_name

            newName = newName + '.pdf'

        return newName

    for f in files:
        doc = pymupdf.open(f)
        out = open("output.txt", "wb") # create a text output
        for page in doc: # iterate the document pages
            text = page.get_text().encode("utf8") # get plain text (is in UTF-8)
            out.write(text) # write text of page
            out.write(bytes((12,))) # write page delimiter (form feed 0x0C)
        out.close()
        print(f)
        name = renameFileToPDFTitle(f)

        #zoo_list = []

        # Transform the zoo list from leon's world to an array of names
        with open("zoo_aquarium_list.txt", 'r', encoding='utf8') as zoos:
            # normalize zoo names: lowercase, replace hyphens with spaces, collapse whitespace
            zoo_list = [re.sub(r"\s+", " ", z.strip().lower().replace("-", " ")).strip() for z in zoos]

        # Parse the article txt and search for matches with every zoo name from leon
        file_name = "output.txt"
        with open(file_name, 'r', encoding='utf8') as file:

            # Join lines, fix hyphenation and normalize punctuation/whitespace
            article = " ".join(line.rstrip() for line in file)
            # remove hyphen-newline artifacts from line breaks (word splits)
            article = article.replace("-\n", "")
            # replace remaining hyphens with spaces so names like 'Sea-Life' -> 'sea life'
            article = article.replace("-", " ")
            article = re.sub(r"\s+", " ", article).lower()
            
            # Extract DOI from the PDF text
            text = article
            # Regular expression to find a DOI
            # This pattern is a common way to identify DOIs
            doi_pattern = r'\b(10\.\d{4,}\/[^\s]+)\b'
            match = re.search(doi_pattern, text, re.IGNORECASE)
            if match:
                dataframeDict['DOI'].append(match.group(1))
            else:
                dataframeDict['DOI'].append("DOI not found")
            
            detected_zoos = []
            for zoo in zoo_list:
                if zoo in article:
                    detected_zoos.append(zoo)
            
            # only keep most specific zoo matches so that Ex: 
            # 'oceanarium' is not reported if 'oceanarium of xyz' is found
            pruned = []
            for z in detected_zoos:
                if not any(z != other and z in other for other in detected_zoos):
                    if z not in pruned:
                        pruned.append(z)
            detected_zoos = pruned

            # only look for whole word matches of 'seahorse' or 'seahorses'
            matches = re.findall(r"\bseahorses?\b", article)
            seahorse_mentions = len(matches)
            detected_seahorse = seahorse_mentions > 0
            
            #if detected_seahorse:
            #    print("The word seahorse is mentioned in article", seahorse_mentions, "times")
            #else:
            #    print("The word seahorse is not mentioned in article")               
                
        text_block = []
        #results.append("File Name: " + os.path.basename(f) + "\n")
        if detected_zoos:
            for zoo in detected_zoos:
                text_block.append(f"Zoo/Aquarium detected: {zoo}\n")
        else:
            text_block.append("No Zoo/Aquarium detected\n")

        if detected_seahorse:
            text_block.append(f"Seahorses mentioned {seahorse_mentions} times\n")
        else:
            text_block.append("Seahorses not mentioned\n")

        block = "".join(text_block) + "\n"

        results.append(block)

        #n = renameFileToPDFTitle(f)
        dataframeDict['Article Name'].append(name)
        dataframeDict['Detected Zoos/Aquariums'].append(", ".join(detected_zoos) if detected_zoos else "None")
        dataframeDict['Seahorse Mentions'].append(seahorse_mentions)
    df = pd.DataFrame(dataframeDict)
    df.to_excel(get_downloads_folder() + "\\contribution_results.xlsx", index=False)

    return results

