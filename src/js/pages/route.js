import loadable from '~js/utils/loadable';

/**
 * @namespace routes
 */
export default {
  // 逻辑页
  '/': {
    component: loadable(() => import('~js/pages/Home.jsx')),
  },
  '/:type(login|register)': {
    layout: false,
    component: loadable(() => import('~js/pages/Login.jsx')),
  },
  '/auth': {
    component: loadable(() => import('~js/pages/auth.jsx')),
  },
  '/forget': {
    layout: false,
    component: loadable(() => import('~js/pages/Forget.jsx')),
  },
  '/cashcenter': {
    component: loadable(() => import('~js/pages/Cash/CashCenter.jsx')), //收银中心
  },
  '/foodsCash': {
    component: loadable(() => import('~js/pages/Foods/FoodsCash.jsx')), //收银中心
  },
  '/onlineorder': {
    component: loadable(() => import('~js/pages/Cash/OnlineOrder.jsx')), //线上订单查询
  },
  '/onlineorder/:id': {
    component: loadable(() => import('~js/pages/Cash/OnlineOrderDetails.jsx')), //订单详情查看
  },
  '/onlineorder/action/:id': {
    component: loadable(() => import('~js/pages/Cash/OrderAction.jsx')), //订单维权查看
  },
  '/onlineorderretail': {
    component: loadable(() => import('~js/pages/Cash/OnlineOrderRetail.jsx')), //线上订单查询
  },
  '/onlineorderretail/:id': {
    component: loadable(() => import('~js/pages/Cash/OnlineOrderRetailDetails.jsx')), //订单详情查看
  },
  '/sourcecenter': {
    component: loadable(() => import('~js/pages/Upload/Index.jsx')), //素材中心
  },
  '/goodsadd': {
    component: loadable(() => import('~js/pages/Goods/GoodsAdd/Index.jsx')),
  },
  '/goodsedit': {
    component: loadable(() => import('~js/pages/Goods/GoodsEdit.jsx')),
  },
  '/groupsort': {
    component: loadable(() => import('~js/pages/Goods/GroupSort.jsx')),
  },
  '/goodsedit/:id': {
    component: loadable(() => import('~js/pages/Goods/GoodsEdit.jsx')), //商品编辑
  },
  '/goodssearch': {
    component: loadable(() => import('~js/pages/Goods/GoodsSearch.jsx')), //商品查询
  },
  '/vipmanage': {
    component: loadable(() => import('~js/pages/Vip/VipManage.jsx')), //会员管理
  },
  '/selldata': {
    component: loadable(() => import('~js/pages/Data/SellData.jsx')),
  },
  '/sellrank': {
    component: loadable(() => import('~js/pages/Data/SellRank.jsx')),
  },
  '/sellanalysis': {
    component: loadable(() => import('~js/pages/Data/SellAnalysis.jsx')),
  },
  '/singlegoods': {
    component: loadable(() => import('~js/pages/Data/SingleGoods.jsx')),
  },
  '/guiderecord': {
    component: loadable(() => import('~js/pages/Data/GuideRecord.jsx')),
  },
  '/staffmanage': {
    component: loadable(() => import('~js/pages/Shop/StaffManage.jsx')),
  },
  '/sourcecenter': {
    component: loadable(() => import('~js/pages/Upload/Index.jsx')), //素材中心
  },
  '/printsettings': {
    component: loadable(() => import('~js/pages/Settings/PrintSettings.jsx')),
  },
  '/businessinfo': {
    component: loadable(() => import('~js/pages/Settings/BusinessInfo.jsx')),
  },
  '/businessinfoadd': {
    component: loadable(() => import('~js/pages/Settings/BusinessInfoAdd.jsx')),
  },
  '/businessinfoedit': {
    component: loadable(() => import('~js/pages/Settings/BusinessInfoEdit.jsx')),
  },
  // 错误页
  '/403': {
    layout: false,
    component: loadable(() => import('~js/pages/403.jsx')),
  },
  '/404': {
    layout: false,
    component: loadable(() => import('~js/pages/404.jsx')),
  },
  '/500': {
    layout: false,
    component: loadable(() => import('~js/pages/500.jsx')),
  },
};
