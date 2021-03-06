export default function (shoptype) {
  return [
    {
      key: 8,
      title: '收银',
      children:
        shoptype == 1
          ? [
              {
                key: 801,
                title: '收银中心',
                src: '/foodscash',
              },
              {
                key: 802,
                title: '订单查询',
                src: '/onlineorder',
              },
            ]
          : [
              {
                key: 801,
                title: '收银中心',
                src: '/cashcenter',
              },
              {
                key: 802,
                title: '订单查询',
                src: '/onlineorderretail',
              },
            ],
    },

    {
      key: 4,
      title: '商品',
      children: [
        {
          key: 401,
          title: '商品查询',
          src: '/goodssearch',
        },
        {
          key: 403,
          title: '商品添加',
          src: '/goodsadd',
        },
        {
          key: 403,
          title: '商品分组',
          src: '/groupsort',
        },
      ],
    },
    {
      key: 5,
      title: '会员',
      children: [
        {
          key: 501,
          title: '会员管理',
          src: '/vipmanage',
        },
      ],
    },
    {
      key: 7,
      title: '数据',
      children: [
        {
          key: 701,
          title: '销售统计',
          src: '/selldata',
        },
        {
          key: 702,
          title: '商品排行',
          src: '/sellrank',
        },
        {
          key: 703,
          title: '经营分析',
          src: '/sellanalysis',
        },
        {
          key: 704,
          title: '单品查询',
          src: '/singlegoods',
        },
        {
          key: 705,
          title: '业绩分析',
          src: '/guiderecord',
        },
      ],
    },
    {
      key: 1,
      title: '门店',
      children: [
        {
          key: 101,
          title: '店员管理',
          src: '/staffmanage',
        },
        {
          key: 102,
          title: '小程序店面编辑',
          src: '/wxManage',
        },
      ],
    },
    {
      key: 2,
      title: '素材',
      children: [
        {
          key: 201,
          title: '素材中心',
          src: '/sourcecenter',
        },
      ],
    },
    {
      key: 6,
      title: '设置',
      children: [
        {
          key: 601,
          title: '打印机设置',
          src: '/printsettings',
        },
        {
          key: 602,
          title: '经营信息',
          src: '/businessinfo',
        },
      ],
    },
  ];
}
