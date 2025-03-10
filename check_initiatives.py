#!/usr/bin/env python3

import os
from bs4 import BeautifulSoup
import glob

def check_and_delete_html_files():
    # Find all HTML files in the current directory and subdirectories
    html_files = glob.glob('**/*.html', recursive=True)
    
    for html_file in html_files:
        with open(html_file, 'r', encoding='utf-8') as f:
            soup = BeautifulSoup(f.read(), 'html.parser')
            
            # Find all div elements with class 'initiative'
            initiatives = soup.find_all('div', class_='initiative')
            
            if len(initiatives) == 0:
                print(f"No initiatives found in {html_file}. Deleting file...")
                os.remove(html_file)
                print(f"Deleted {html_file}")
            else:
                print(f"Found {len(initiatives)} initiatives in {html_file}. Keeping file.")

if __name__ == "__main__":
    check_and_delete_html_files() 