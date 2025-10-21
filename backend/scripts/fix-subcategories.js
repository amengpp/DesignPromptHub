const fs = require('fs');
const path = require('path');

// 读取子分类数据
const subcategoriesPath = path.join(__dirname, '../../data/mobile-app-subcategories.json');
const subcategories = JSON.parse(fs.readFileSync(subcategoriesPath, 'utf8'));

// 读取提示词数据
const promptsPath = path.join(__dirname, '../../data/mobile-app-prompts.json');
const prompts = JSON.parse(fs.readFileSync(promptsPath, 'utf8'));

// 建立子分类ID到名称的映射，用于日志显示
const subcategoryMap = {};
subcategories.forEach(sub => {
  subcategoryMap[sub.id] = sub.name;
});

// 定义每个子分类的关键词，用于匹配
const subcategoryKeywords = {
  'social-communication': ['社交', '通讯', '聊天', '通话', '即时通讯', '社交动态', '语音聊天', '视频通话', '匿名社交'],
  'e-commerce-shopping': ['电商', '购物', '综合电商', '时尚购物', '生鲜电商', '购物车', '商品', '促销'],
  'finance-investment': ['金融', '理财', '银行', '投资', '数字钱包', '股票', '基金', '账户'],
  'health-medical': ['健康', '医疗', '健康监测', '在线问诊', '用药提醒', '医疗健康', '体检', '医院'],
  'education-learning': ['教育', '学习', '在线学习', '语言学习', '儿童教育', '课程', '培训', '考试'],
  'lifestyle-services': ['生活', '服务', '外卖', '打车', '出行', '酒店预订', '生活服务', '家政'],
  'entertainment-leisure': ['娱乐', '休闲', '短视频', '音乐', '游戏', '娱乐休闲', '影视', '直播'],
  'productivity-tools': ['工具', '效率', '笔记', '日历', '任务管理', '效率工具', '办公', '待办'],
  'news-information': ['新闻', '资讯', '新闻阅读', '财经资讯', '体育资讯', '时事', '热点']
};

// 统计修复情况
const stats = {
  total: prompts.length,
  fixed: 0,
  byCategory: {}
};

// 初始化统计
Object.keys(subcategoryKeywords).forEach(key => {
  stats.byCategory[key] = { count: 0, name: subcategoryMap[key] };
});

// 修复subcategory字段
prompts.forEach(prompt => {
  const originalSubcategory = prompt.subcategory;
  let bestMatch = originalSubcategory;
  let bestScore = 0;
  
  // 组合标题和内容用于匹配
  const textToMatch = (prompt.title + ' ' + prompt.content).toLowerCase();
  
  // 遍历所有子分类关键词，寻找最佳匹配
  Object.entries(subcategoryKeywords).forEach(([category, keywords]) => {
    let score = 0;
    keywords.forEach(keyword => {
      if (textToMatch.includes(keyword)) {
        score++;
      }
    });
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = category;
    }
  });
  
  // 如果找到更好的匹配，则更新
  if (bestMatch !== originalSubcategory) {
    prompt.subcategory = bestMatch;
    stats.fixed++;
    console.log(`修复提示词 ${prompt.id}: ${prompt.title}`);
    console.log(`  从 ${originalSubcategory} (${subcategoryMap[originalSubcategory] || '未知'})`);
    console.log(`  改为 ${bestMatch} (${subcategoryMap[bestMatch] || '未知'})`);
    console.log('---');
  }
  
  // 更新统计
  stats.byCategory[bestMatch].count++;
});

// 保存修复后的数据
fs.writeFileSync(promptsPath, JSON.stringify(prompts, null, 2), 'utf8');

// 输出统计信息
console.log('\n=== 修复统计 ===');
console.log(`总共处理: ${stats.total} 个提示词`);
console.log(`修复数量: ${stats.fixed} 个提示词`);
console.log('\n各子分类统计:');
Object.entries(stats.byCategory).forEach(([id, data]) => {
  console.log(`- ${data.name} (${id}): ${data.count} 个`);
});
console.log('\n修复完成！');