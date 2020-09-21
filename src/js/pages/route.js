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
  '/forget': {
    layout: false,
    component: loadable(() => import('~js/pages/Forget.jsx')),
  },
  '/shop': {
    layout: false,
    component: loadable(() => import('~js/pages/Shop/Shop.jsx')),
  },
  '/staffmanage': {
    component: loadable(() => import('~js/pages/Shop/StaffManage.jsx')),
  },
  '/bindbank': {
    component: loadable(() => import('~js/pages/Shop/BindBank.jsx')),
  },
  '/goodsadd': {
    component: loadable(() => import('~js/pages/Goods/GoodsAdd/Index.jsx')),
  },
  '/foodsadd': {
    component: loadable(() => import('~js/pages/Foods/FoodsAdd.jsx')),
  },
  '/goodsedit/:id': {
    component: loadable(() => import('~js/pages/Goods/GoodsEdit.jsx')), //商品编辑
  },
  '/goodssearch': {
    component: loadable(() => import('~js/pages/Goods/GoodsSearch.jsx')), //商品查询
  },
  '/ordermanage': {
    component: loadable(() => import('~js/pages/Purchase/OrderManage.jsx')),
  },
  '/ordermanage/:id': {
    component: loadable(() => import('~js/pages/Purchase/OrderDetails.jsx')),
  },
  '/supplier': {
    component: loadable(() => import('~js/pages/Purchase/Supplier.jsx')),
  },
  '/ordertopay': {
    component: loadable(() => import('~js/pages/Purchase/OrderToPay.jsx')),
  },
  '/vipmanage': {
    component: loadable(() => import('~js/pages/Vip/VipManage.jsx')), //会员管理
  },
  '/cashcenter': {
    component: loadable(() => import('~js/pages/Cash/CashCenter.jsx')), //收银中心
  },
  '/foodscash': {
    component: loadable(() => import('~js/pages/Foods/FoodsCash.jsx')), //收银中心
  },
  '/foodssell': {
    component: loadable(() => import('~js/pages/Foods/FoodsSell.jsx')), //收银中心
  },
  '/sellsearch': {
    component: loadable(() => import('~js/pages/Cash/SellSearch.jsx')), //销售查询
  },
  '/onlineorder': {
    component: loadable(() => import('~js/pages/Cash/OnlineOrder.jsx')), //线上订单查询
  },
  '/confirmticket': {
    component: loadable(() => import('~js/pages/Cash/ConfirmTicket.jsx')),
  },
  '/onlineorder/:id': {
    component: loadable(() => import('~js/pages/Cash/OnlineOrderDetails.jsx')), //订单详情查看
  },
  '/onlineorder/action/:id': {
    component: loadable(() => import('~js/pages/Cash/OrderAction.jsx')), //订单维权查看
  },
  '/sourcecenter': {
    component: loadable(() => import('~js/pages/Upload/Index.jsx')), //素材中心
  },
  '/propertydetails': {
    component: loadable(() => import('~js/pages/Property/PropertyDetails.jsx')),
  },
  '/withdrawrecord': {
    component: loadable(() => import('~js/pages/Property/WithdrawRecord.jsx')),
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
