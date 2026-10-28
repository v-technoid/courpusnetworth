"""Title Case for headings, navigation and tab labels.
Rules: abbreviations always in capitals (PPF, EPF, SIP, XIRR...), both parts of
hyphenated words capitalised (Pre-Filing, Step-Up), short joining words in
lower case unless first or last (and, or, of, vs, to...), the brand untouched.
Sentences (ending in a full stop) and questions are left in sentence case."""
import re

ACRONYMS = {w.lower(): w for w in ['PPF','EPF','EPFO','NPS','FD','FDs','RD','RDs','SIP','SIPs','SWP','XIRR','CAGR','EMI','EMIs','HRA','TDS','TCS','GST','ITR','PAN','UAN','LTA','CAS','AIS','FIRE','NAV','ELSS','LRS','KYC','ESI','CTC','DA','SSY','SCSS','APY','EV','EVs','FAQ','AI','PDF','CSV','UPI','LTCG','STCG','PMJJBY','PMSBY','PMJAY','NSC','KVP','SGB','ETF','ETFs','IRDAI','SEBI','RBI','CMS','NRI','HUF','OCR','LIC','PF','VPF','EPS','CA','RIA','INR','USD','US','UK','UPSC','JEE','NEET','CBSE','AICTE','UGC','ITI','SC','ST','OBC','EWS','BPL','PMAY','PMSBY','NPCI','IFSC']}
SMALL = {'a','an','the','and','but','or','nor','for','so','yet','as','at','by','in','of','on','per','to','via','vs','vs.','with','from','into','than'}

def _word(w, first, last):
    if not w or not re.search(r'[A-Za-z]', w) or re.match(r'^&[a-z#0-9]+;$', w): return w
    lead = re.match(r'^[^A-Za-z0-9₹$]*', w).group(0); tail = re.search(r'[^A-Za-z0-9₹$]*$', w).group(0)
    core = w[len(lead):len(w) - len(tail)] if tail else w[len(lead):]
    if not core: return w
    if '-' in core and not core.startswith('-'):
        parts = core.split('-')
        return lead + '-'.join(_word(p, first and i == 0, last and i == len(parts) - 1) for i, p in enumerate(parts)) + tail
    low = core.lower()
    if low in ACRONYMS: return lead + ACRONYMS[low] + tail
    if '₹' in core or '$' in core or re.search(r'[a-z][A-Z]', core) or re.match(r'^\d', core) or core.isupper() and len(core) > 1:
        return w  # brand, iPhone-like, 80CCD(1B), already capitals
    if low in SMALL and not first and not last and not lead.endswith((':', '(')):
        return lead + low + tail
    return lead + core[0].upper() + core[1:] + tail

def title_case(text):
    t = text.strip()
    if not t or t.endswith('.') or '?' in t: return text
    words = t.split(' ')
    out = []
    after_colon = False
    for i, w in enumerate(words):
        out.append(_word(w, i == 0 or after_colon, i == len(words) - 1))
        after_colon = w.endswith(':')
    return text.replace(t, ' '.join(out))

HEADING = re.compile(r'(<h([123])(\s[^>]*)?>)([^<>]+)(</h\2>)')
def headings(html):
    return HEADING.sub(lambda m: m.group(1) + title_case(m.group(4)) + m.group(5), html)

if __name__ == '__main__':
    for s in ['Pre-filing audit', 'Reports &amp; advice', 'Income tax: old vs new regime', 'PPF year by year projection', 'Step 1: what will it really cost?',
              'What to pay off first', 'Gain or loss on each holding', 'NPS saving under Section 80CCD(1B)', 'About CO₹PU$', 'Step-up SIP', 'SWP (withdrawals)',
              'Freelancer and consultant tax calculator', 'Income tax calculator, old vs new regime', 'Open your ledger.', 'Where you might be losing money', 'Needs, wants and savings', 'Rent or home EMI']:
        print(f'{s!r:50} -> {title_case(s)}')
