import pymupdf
import os
import re
import unicodedata
import pandas as pd
from pdfrw import PdfReader
import io


#bare entries that are too generic to safely match. They can cause false
# positives any time the common word appears in an article, and they're
# already covered by their specific city/location versions elsewhere in
# the list anyways
_GENERIC_DENYLIST = {
    "aquarium",
    "zoo",
    "sea life",
    "sea world",
    "marine world",
    "marineland",
    "oceanarium",
    "atlantis",
}


def _normalize(text):
    text = text.lower()
    text = text.replace("\u2019", "'").replace("\u2018", "'")
    text = text.replace("\u201c", '"').replace("\u201d", '"')
    text = text.replace("'", "")
    # Strip diacritics so "Cabárceno" and "Cabarceno" normalize to the
    # same string. NFD decomposes accented letters into base + combining
    # mark; we then drop the combining marks (Unicode category Mn).
    text = unicodedata.normalize("NFD", text)
    text = "".join(c for c in text if unicodedata.category(c) != "Mn")
    text = re.sub(r"[^a-z0-9]+", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def _renameFileToPDFTitle(fileName):
    fallback = os.path.basename(fileName)
    try:
        info = PdfReader(fileName).Info
        title = info.Title if info else None
        if not title:
            return fallback
        words = str(title).split()
        new = " ".join(words[:4])
        new = re.sub(r"[^a-zA-Z0-9' ]", "", new).strip("()").strip()
        return (new + ".pdf") if new else fallback
    except Exception:
        return fallback


def _extractRawText(pdfPath):
    """Lowercased, hyphenation fixed. Preserves newlines so cross-line
    false matches can be avoided downstream. Spaces and tabs are still
    collapsed within each line."""
    doc = pymupdf.open(pdfPath)
    parts = [page.get_text() for page in doc]
    doc.close()
    raw = "\n".join(parts)
    raw = re.sub(r"-\s*\n\s*", "", raw)  # rejoin hyphenated line breaks
    raw = re.sub(r"[ \t]+", " ", raw)    # collapse spaces/tabs only
    raw = re.sub(r"\n+", "\n", raw)      # collapse blank lines
    return raw.lower()


def _loadZooList(path):
    seen = set()
    out = []
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            n = _normalize(line)
            if not n or n in seen:
                continue
            if n in _GENERIC_DENYLIST:
                continue
            seen.add(n)
            out.append(n)
    return out


def _findMatches(rawText, zooList):
    """Match per-line. Each line of the extracted PDF is normalized and
    searched independently, so a name can never match across a line
    break (e.g. 'Duisburg Zoo' followed by 'Miami Seaquarium' will not
    falsely match 'Zoo Miami'). Trailing s? allows possessives/plurals.
    Output preserves zooList order."""
    lines = [_normalize(line) for line in rawText.split("\n")]
    lines = [l for l in lines if l]
    matches = []
    for zoo in zooList:
        pattern = r"\b" + re.escape(zoo) + r"s?\b"
        for line in lines:
            if re.search(pattern, line):
                matches.append(zoo)
                break
    return matches


def _pruneSubphrases(matches):
    kept = []
    for m in matches:
        m_padded = " " + m + " "
        is_subphrase = any(
            other != m and m_padded in (" " + other + " ")
            for other in matches
        )
        if not is_subphrase:
            kept.append(m)
    return kept


def findContributions(files, listPath="zoo_aquarium_list.txt"):
    zooList = _loadZooList(listPath)
    doiPattern = r"\b(10\.\d{4,}/[^\s]+)\b"
    results = []

    for f in files:
        rawText = _extractRawText(f)         # newlines preserved
        article = _normalize(rawText)        # flattened, used for keyword counts
        name = _renameFileToPDFTitle(f)

        doiMatch = re.search(doiPattern, rawText, re.IGNORECASE)
        doi = doiMatch.group(1) if doiMatch else "DOI not found"

        detected = _pruneSubphrases(_findMatches(rawText, zooList))
        block = ", ".join(detected) if detected else "None Found"

        results.append({
            "title": name,
            "doi": doi,
            "detected zoos/aquariums": block,
            "article": article,
        })

    return results


MODE_DEFAULT = "default"
MODE_EXPANDED = "expanded"


def exportExcel(results, mode="default", keywords=None):
    if keywords is None:
        keywords = []

    def countKeyword(article, kw):
        return len(re.findall(rf"\b{re.escape(kw.lower())}\b", article))

    if mode == MODE_DEFAULT:
        data = {
            "Title": [r["title"] for r in results],
            "DOI": [r["doi"] for r in results],
            "Detected Zoos/Aquariums": [r["detected zoos/aquariums"] for r in results],
        }
        for kw in keywords:
            data[f"{kw} mentions"] = [countKeyword(r["article"], kw) for r in results]
        df = pd.DataFrame(data)

    elif mode == MODE_EXPANDED:
        rows = []
        for r in results:
            zoos = r["detected zoos/aquariums"].split(", ")
            for zoo in zoos:
                row = {
                    "Title": r["title"],
                    "DOI": r["doi"],
                    "Detected Zoo/Aquarium": zoo,
                }
                for kw in keywords:
                    row[f"{kw} mentions"] = countKeyword(r["article"], kw)
                rows.append(row)
        df = pd.DataFrame(rows)

    else:
        raise ValueError(f"Unknown mode: {mode}")

    buffer = io.BytesIO()
    df.to_excel(buffer, index=False)
    buffer.seek(0)
    return buffer


if __name__ == "__main__":
    results = findContributions(
        ["/mnt/user-data/outputs/algorithm_test.pdf"],
        listPath="/mnt/user-data/uploads/zoo_aquarium_list_default.txt",
    )
    for r in results:
        print("TITLE:", r["title"])
        print("DOI:", r["doi"])
        print("DETECTED:", r["detected zoos/aquariums"])