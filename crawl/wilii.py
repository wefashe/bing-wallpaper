import json
import requests
from faker import Factory
fc = Factory.create()

# https://bing.wilii.cn 网站爬虫

def get_image_listByPage(pageIndex=1, pageSize=16):
    '''
      按分页爬取列表
      pageIndex 页码
      pageSize 每页个数
    '''
    headers = {
      'User-Agent': fc.user_agent(),
      'Referer': 'https://bing.wilii.cn'
    }
    # https://api.wilii.cn/api/bing?page=1&pageSize=16
    url = f'https://api.wilii.cn/api/bing?page={pageIndex}&pageSize={pageSize}'
    resp = requests.get(url, headers=headers)
    resp.encoding = resp.apparent_encoding
    return resp.json()

def get_image_listByDate(year=2024, month=1):
    '''
      按年月爬取列表
      year 年份
      month 月份
    '''
    headers = {
      'User-Agent': fc.user_agent(),
      'Referer': 'https://bing.wilii.cn'
    }
    # https://api.wilii.cn/api/Bing/Timeline?year=2024&month=1
    url = f'https://api.wilii.cn/api/Bing/Timeline?year={year}&month={month}'
    resp = requests.get(url, headers=headers)
    resp.encoding = resp.apparent_encoding
    return resp.json()

def get_image_detail(guid='31f161609e'):
    '''
      按guid获取明细
      guid 明细id, 从列表中获取
    '''
    headers = {
      'User-Agent': fc.user_agent(),
      'Referer': 'https://bing.wilii.cn'
    }
    # https://api.wilii.cn/api/Bing/31f161609e
    url = f'https://api.wilii.cn/api/Bing/{guid}'
    resp = requests.get(url, headers=headers)
    resp.encoding = resp.apparent_encoding
    return resp.json()

if __name__ == '__main__':
    list = get_image_listByPage(2,2)
    print(json.dumps(list, ensure_ascii=False, indent=2))
    list = get_image_listByDate(2014,3)
    print(json.dumps(list, ensure_ascii=False, indent=2))
    detail = get_image_detail(list['response']['data'][0]['guid'])
    print(json.dumps(detail, ensure_ascii=False, indent=2))
