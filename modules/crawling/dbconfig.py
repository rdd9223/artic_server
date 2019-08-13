import pymysql
import requests
from bs4 import BeautifulSoup
from datetime import datetime
import sys
import io
import tldextract

sys.stdout = io.TextIOWrapper(sys.stdout.detach(), encoding = 'utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.detach(), encoding = 'utf-8')

# 403에러시 헤더처리 하기
headers = {'User-Agent': 'Mozilla/5.0'}  
res = requests.get(sys.argv[1] , headers=headers)
link = sys.argv[1]
soup = BeautifulSoup(res.content, 'html.parser')
title = str(soup.find('title').get_text()).strip()
thumnail = soup.find('meta', {'property': 'og:image'})
try:
    output = thumnail['content']
except TypeError:
    output = "https://hyeongbucket.s3.ap-northeast-2.amazonaws.com/artic/articledefault.png"

# YYYY/mm/dd HH:MM:SS 형태의 시간 출력
date = datetime.today().strftime("%Y/%m/%d %H:%M:%S")

#tmp = link.split('/')
#domain = tmp[2]
extracted = tldextract.extract(link)
domain = "{}.{}".format(extracted.domain, extracted.suffix)

print(title)
print(output)
print(link)
print(date)
print(domain)
# Connect to the database
conn = pymysql.connect(host='artic.cvvhkxkqobt2.ap-northeast-2.rds.amazonaws.com',
                       user='rdd9223',
                       password='artic1234',
                       db='artic',
                       charset='utf8')
try:
    with conn.cursor() as cursor:
        sql = 'INSERT INTO article (article_title, thumnail, link, domain, date) VALUES (%s, %s, %s, %s, %s)'
        cursor.execute(sql, (title, output, link, domain, date))
    conn.commit()
    print(cursor.lastrowid)
finally:
    conn.close()
