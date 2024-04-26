const fs = require('fs');
const path = require('path');
const logger = require('./logger');
const { isArray } = require('lodash');
const { getMeta } = require('./utils');

const RESULT_PATH = path.join(process.cwd(), 'public/pubcloud/js/product_news.json');
const PUB_CLOUD_HOST = 'https://docsv4.qingcloud.com';
const PUB_CLOUD_ROOT_PATH = path.join(process.cwd(), 'content/@pubCloud/user_guide');
const result = [];

/*
  url：查看相关文档
  title: 内容标题
  content: 内容描述
  href：产品动态地址
  time：产品动态时间（排序）
  tags: 新产品新规格
  zone: 适用范围：北京 3 区-B
  产品类别： 计算/云服务器

  对应内容：https://docsv4.qingcloud.com/user_guide/storage/object_storage/news/history/ 产品动态
*/
function loop(dir = PUB_CLOUD_ROOT_PATH) {
  fs.readdirSync(dir).forEach((fileName) => {
    const file = path.join(dir, fileName);
    if (fs.statSync(file).isDirectory()) {
      loop(file);
      return;
    }

    if (!fs.statSync(file).isFile() || !file.endsWith('.adoc')) {
      return;
    }

    const meta = getMeta(file);
    if (!meta || !isArray(meta.product) || meta.draft || meta.not_show) {
      return;
    }

    const newsList = meta.product.map((item) => {
      let realURL = item.url || null;
      if (item.url && !/^https?:\/\//i.test(item.url)) {
        if (item.url.startsWith('/')) {
          realURL = `${PUB_CLOUD_HOST}${item.url}`;
        } else {
          const urlPath = path.join(file.replace(/\.adoc$/i, ''), item.url);
          realURL = `${PUB_CLOUD_HOST}${urlPath.replace(path.join(PUB_CLOUD_ROOT_PATH, '..'), '')}`;
        }
      }

      const categories = file.replace(PUB_CLOUD_ROOT_PATH, '').split('/').filter(Boolean);
      const parentCategoryPath = path.join(PUB_CLOUD_ROOT_PATH, `${categories[0]}/_index.adoc`);
      const currentCategoryPath = path.join(PUB_CLOUD_ROOT_PATH, `${categories[0]}/${categories[1]}/_index.adoc`);
      const parentCategory = getMeta(parentCategoryPath).title;
      const currentCategory = getMeta(currentCategoryPath).title;

      return {
        title: item.title,
        time: item.time,
        tags: item.tags || null,
        zone: item.zone || null,
        content: item.content || null,
        qingCloudZhiUrl: null,
        videoUrl: null,
        url: realURL,
        href: `${PUB_CLOUD_HOST}${file.replace(path.join(PUB_CLOUD_ROOT_PATH, '..'), '').replace(/\.adoc$/i, '/')}`,
        category: [parentCategory, currentCategory],
      };
    });

    result.push(...newsList);
  });
}

function pubCloudProductNews() {
  loop();

  fs.writeFileSync(RESULT_PATH, JSON.stringify(result.sort((a, b) => new Date(b.time) - new Date(a.time))));

  logger.success(`${RESULT_PATH} 写入成功!`);
}

module.exports = pubCloudProductNews;
