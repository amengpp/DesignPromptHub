const http = require('http');

// 发送HTTP请求的简单函数
function httpGet(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve(data);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// 检查每个分类的提示词数量
async function checkCategoryCounts() {
  try {
    console.log('🔍 检查分类提示词数量...');
    
    // 获取所有分类
    const categoriesResponse = await httpGet('http://localhost:3002/api/v1/categories');
    const categories = JSON.parse(categoriesResponse).data;
    
    console.log('📊 分类统计结果:');
    console.log(JSON.stringify(categories, null, 2));
    
    // 分别检查每个分类的详情
    for (const category of categories) {
      console.log(`\n🔍 检查分类: ${category.name} (${category.id})...`);
      try {
        const detailResponse = await httpGet(`http://localhost:3002/api/v1/categories/${category.id}`);
        const detail = JSON.parse(detailResponse);
        
        if (detail.data && detail.data.prompts) {
          console.log(`✅ ${category.name} 分类下有 ${detail.data.prompts.length} 个提示词`);
        } else {
          console.log(`⚠️ ${category.name} 分类未返回提示词列表`);
        }
      } catch (err) {
        console.error(`❌ 获取 ${category.name} 分类详情失败:`, err.message);
      }
    }
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  }
}

// 执行检查
checkCategoryCounts();