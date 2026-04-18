import pymupdf
import os
import re
import pandas as pd
from pdfrw import PdfReader
import io

    
    
def findContributions(files):
    results = []

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
                text_block.append(zoo)
        else:
            text_block.append("None Found")


        block = ", ".join(text_block)

        results.append({
            "title": name,
            "doi": match.group(1) if match else "DOI not found",
            "detected zoos/aquariums": block,
            "seahorseMentions": seahorse_mentions if detected_seahorse else 0
        })

    return results


def exportExcel(results):
    # i think i should handle both buttons in one function. 
    # if is one button add this, else add this, idk how to do keywords yet
    # if(shit = button 1 then)
    df = pd.DataFrame({
        'Title': [r['title'] for r in results],
        'DOI': [r['doi'] for r in results],
        'Detected Zoos/Aquariums': [r['detected zoos/aquariums'] for r in results],
        'Seahorse Mentions': [r['seahorseMentions'] for r in results]
        })
    # elif(shit = button 2 then)
    #     df = pd.DataFrame({
    #         'Title': [r['title'] for r in results],
    #         'DOI': [r['doi'] for r in results],
    #         'Detected Zoos/Aquariums': [r['detected zoos/aquariums'] for r in results],
    #         'Seahorse Mentions': [r['seahorseMentions'] for r in results]
    #     })

    #if(keyqords)
        #search for keywords....
    
    buffer = io.BytesIO()
    df.to_excel(buffer, index=False)
    buffer.seek(0)
    return buffer